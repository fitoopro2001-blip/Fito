import { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Button, Card, Col, Input, Row, Typography, message } from 'antd';
import { DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { QRCode } from 'antd';
import PageHeading from '../../components/atoms/PageHeading';

const QR_SIZE = 1024;
const LABEL_STORAGE_KEY = 'fitoo.qr-referral-labels.v1';
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_TITLE_LENGTH = 60;
const MAX_DETAILS_LENGTH = 180;
const REFERRALS = ['logo1', 'logo2', 'logo3', 'logo4', 'logo5'].map((referralId) => ({
    referralId,
    name: `Logo ${referralId.slice(-1)}`,
    url: `https://www.fitoo.pro/consultation?ref=${referralId}`,
}));

const getLabelLines = (context, text, maxWidth) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';

    words.forEach((word) => {
        let remainingWord = word;
        while (remainingWord && context.measureText(remainingWord).width > maxWidth) {
            const characters = Array.from(remainingWord);
            let chunk = '';
            while (characters.length && context.measureText(`${chunk}${characters[0]}`).width <= maxWidth) {
                chunk += characters.shift();
            }
            if (!chunk) chunk = characters.shift();
            if (line) {
                lines.push(line);
                line = '';
            }
            lines.push(chunk);
            remainingWord = characters.join('');
        }

        if (!remainingWord) return;
        const nextLine = line ? `${line} ${remainingWord}` : remainingWord;
        if (context.measureText(nextLine).width > maxWidth && line) {
            lines.push(line);
            line = remainingWord;
        } else {
            line = nextLine;
        }
    });

    if (line) lines.push(line);
    return lines;
};

const readStoredLabels = () => {
    try {
        const storedLabels = localStorage.getItem(LABEL_STORAGE_KEY);
        if (!storedLabels) return { labels: {}, error: null };

        const parsedLabels = JSON.parse(storedLabels);
        if (!parsedLabels || typeof parsedLabels !== 'object' || Array.isArray(parsedLabels)) {
            throw new Error('Saved QR labels have an invalid format');
        }

        const validReferralIds = new Set(REFERRALS.map(({ referralId }) => referralId));
        const labels = {};
        Object.entries(parsedLabels).forEach(([referralId, label]) => {
            if (
                validReferralIds.has(referralId) &&
                label &&
                typeof label.title === 'string' &&
                typeof label.details === 'string'
            ) {
                labels[referralId] = {
                    title: label.title.slice(0, MAX_TITLE_LENGTH),
                    details: label.details.slice(0, MAX_DETAILS_LENGTH),
                };
            }
        });
        return { labels, error: null };
    } catch (error) {
        console.error('Unable to load saved QR labels:', error);
        return { labels: {}, error };
    }
};

const saveBlob = (blob, filename) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export default function QrCodeGeneratorPage() {
    const qrContainers = useRef({});
    const logoInputs = useRef({});
    const [logos, setLogos] = useState({});
    const [initialLabelState] = useState(readStoredLabels);
    const [labels, setLabels] = useState(initialLabelState.labels);
    const [downloading, setDownloading] = useState(null);

    useEffect(() => {
        if (initialLabelState.error) {
            message.error('Unable to load saved QR labels; default titles are shown');
        }
    }, [initialLabelState.error]);

    useEffect(() => {
        try {
            localStorage.setItem(LABEL_STORAGE_KEY, JSON.stringify(labels));
        } catch (error) {
            console.error('Unable to save QR labels:', error);
            message.error('Unable to save QR labels in this browser');
        }
    }, [labels]);

    const handleLogoChange = (referralId, event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
            message.error('Choose a PNG, JPEG, or WebP logo');
            return;
        }
        if (file.size > MAX_LOGO_SIZE) {
            message.error('Logo files must be 5 MB or smaller');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                message.error('Unable to read this logo file');
                return;
            }
            setLogos((current) => ({
                ...current,
                [referralId]: { dataUrl: reader.result, filename: file.name },
            }));
        };
        reader.onerror = () => message.error('Unable to read this logo file');
        reader.readAsDataURL(file);
    };

    const handleLabelChange = (referralId, field, value) => {
        setLabels((current) => ({
            ...current,
            [referralId]: {
                title: current[referralId]?.title ?? REFERRALS.find((item) => item.referralId === referralId).name,
                details: current[referralId]?.details ?? '',
                [field]: value,
            },
        }));
    };

    const getPngBlob = async (referralId, title, details) => {
        const container = qrContainers.current[referralId];
        const canvas = container?.querySelector('canvas');
        if (!canvas) throw new Error(`QR code for ${referralId} is not ready`);

        const image = container.querySelector('img[alt="QR-Code"]');
        if (image && !image.complete) {
            await new Promise((resolve, reject) => {
                image.addEventListener('load', resolve, { once: true });
                image.addEventListener('error', () => reject(new Error('Unable to load a center logo')), { once: true });
            });
        }
        if (image && image.naturalWidth === 0) {
            throw new Error('Unable to load a center logo');
        }
        if (image) await new Promise((resolve) => window.setTimeout(resolve, 0));

        const labelCanvas = document.createElement('canvas');
        const labelContext = labelCanvas.getContext('2d');
        if (!labelContext) throw new Error('Unable to prepare QR code labels');
        labelContext.font = 'bold 48px Arial, sans-serif';
        const titleLines = getLabelLines(labelContext, title, 880);
        labelContext.font = '32px Arial, sans-serif';
        const detailLines = getLabelLines(labelContext, details, 880);
        const titleHeight = titleLines.length * 60;
        const detailHeight = detailLines.length ? 24 + detailLines.length * 42 : 0;
        const labelPadding = 48;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = QR_SIZE;
        exportCanvas.height = QR_SIZE + labelPadding + titleHeight + detailHeight + labelPadding;
        const context = exportCanvas.getContext('2d');
        if (!context) throw new Error('Unable to prepare a QR code PNG');
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        context.imageSmoothingEnabled = false;
        context.drawImage(canvas, 0, 0, QR_SIZE, QR_SIZE);

        let textY = QR_SIZE + labelPadding;
        context.fillStyle = '#000000';
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = 'bold 48px Arial, sans-serif';
        titleLines.forEach((line) => {
            context.fillText(line, QR_SIZE / 2, textY);
            textY += 60;
        });
        if (detailLines.length) {
            textY += 24;
            context.font = '32px Arial, sans-serif';
            detailLines.forEach((line) => {
                context.fillText(line, QR_SIZE / 2, textY);
                textY += 42;
            });
        }

        return new Promise((resolve, reject) => {
            exportCanvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Unable to export a QR code as PNG'));
            }, 'image/png');
        });
    };

    const handleDownload = async (referralId) => {
        setDownloading(referralId);
        try {
            const referral = REFERRALS.find((item) => item.referralId === referralId);
            const title = labels[referralId]?.title ?? referral.name;
            const details = labels[referralId]?.details ?? '';
            const blob = await getPngBlob(referralId, title, details);
            saveBlob(blob, `${referralId}-qr-code.png`);
            message.success(`${referralId} QR code downloaded`);
        } catch (error) {
            console.error('Unable to download QR code:', error);
            message.error(error.message || 'Unable to download QR code');
        } finally {
            setDownloading(null);
        }
    };

    const handleDownloadAll = async () => {
        setDownloading('all');
        try {
            const archive = new JSZip();
            for (const { referralId, name } of REFERRALS) {
                const title = labels[referralId]?.title ?? name;
                const details = labels[referralId]?.details ?? '';
                archive.file(`${referralId}-qr-code.png`, await getPngBlob(referralId, title, details));
            }
            const blob = await archive.generateAsync({ type: 'blob' });
            saveBlob(blob, 'fitoo-qr-referral-codes.zip');
            message.success('All five QR codes downloaded');
        } catch (error) {
            console.error('Unable to create QR code archive:', error);
            message.error(error.message || 'Unable to download QR code archive');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div>
            <PageHeading
                title="QR Code Generator"
                subtitle="Customize print labels for your five tracked referral links"
                actions={
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        loading={downloading === 'all'}
                        disabled={downloading !== null && downloading !== 'all'}
                        onClick={handleDownloadAll}
                    >
                        Download all as ZIP
                    </Button>
                }
            />
            <p className="mb-5 text-sm text-gray-500">
                QR codes are rendered at {QR_SIZE} × {QR_SIZE} pixels with high error correction. Center logos are
                optional; the QR code leaves a clear area behind them to help scanners read the code. Titles and details
                are saved in this browser and included below the QR in downloaded PNGs. The tracked referral URLs stay
                unchanged.
            </p>

            <Row gutter={[16, 16]}>
                {REFERRALS.map(({ referralId, name, url }) => (
                    <Col xs={24} md={12} xl={8} key={referralId}>
                        <Card className="h-full rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex flex-col items-center">
                                <div
                                    ref={(element) => {
                                        qrContainers.current[referralId] = element;
                                    }}
                                    className="mb-4 flex h-60 w-60 max-w-full items-center justify-center overflow-hidden"
                                >
                                    <QRCode
                                        aria-label={`${labels[referralId]?.title ?? name} referral QR code`}
                                        value={url}
                                        type="canvas"
                                        size={QR_SIZE}
                                        errorLevel="H"
                                        marginSize={4}
                                        bgColor="#FFFFFF"
                                        color="#000000"
                                        icon={logos[referralId]?.dataUrl}
                                        iconSize={144}
                                        bordered={false}
                                        style={{ width: 240, height: 240 }}
                                    />
                                </div>
                                {(labels[referralId]?.title ?? name) && (
                                    <Typography.Title level={4} className="!mb-1 text-center">
                                        {labels[referralId]?.title ?? name}
                                    </Typography.Title>
                                )}
                                {labels[referralId]?.details && (
                                    <Typography.Paragraph className="mb-3 max-w-full text-center text-sm">
                                        {labels[referralId].details}
                                    </Typography.Paragraph>
                                )}
                                <Typography.Text
                                    className="mb-4 break-all text-center text-sm"
                                    copyable={{ text: url }}
                                >
                                    {url}
                                </Typography.Text>
                                <div className="mb-4 w-full space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Print title
                                        <Input
                                            className="mt-1"
                                            maxLength={MAX_TITLE_LENGTH}
                                            showCount
                                            value={labels[referralId]?.title ?? name}
                                            aria-label={`Print title for ${name}`}
                                            onChange={(event) =>
                                                handleLabelChange(referralId, 'title', event.target.value)
                                            }
                                        />
                                    </label>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Details
                                        <Input.TextArea
                                            className="mt-1"
                                            rows={2}
                                            maxLength={MAX_DETAILS_LENGTH}
                                            showCount
                                            value={labels[referralId]?.details ?? ''}
                                            aria-label={`Print details for ${name}`}
                                            onChange={(event) =>
                                                handleLabelChange(referralId, 'details', event.target.value)
                                            }
                                        />
                                    </label>
                                </div>
                                {logos[referralId] && (
                                    <Typography.Text className="mb-3 max-w-full truncate text-xs text-gray-500">
                                        Center logo: {logos[referralId].filename}
                                    </Typography.Text>
                                )}
                                <div className="flex flex-wrap justify-center gap-2">
                                    <input
                                        ref={(element) => {
                                            logoInputs.current[referralId] = element;
                                        }}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        className="hidden"
                                        aria-label={`Upload center logo for ${name}`}
                                        onChange={(event) => handleLogoChange(referralId, event)}
                                    />
                                    <Button
                                        icon={<UploadOutlined />}
                                        onClick={() => logoInputs.current[referralId]?.click()}
                                    >
                                        Upload logo
                                    </Button>
                                    {logos[referralId] && (
                                        <Button
                                            icon={<DeleteOutlined />}
                                            aria-label={`Remove center logo for ${name}`}
                                            onClick={() => {
                                                setLogos((current) => {
                                                    const next = { ...current };
                                                    delete next[referralId];
                                                    return next;
                                                });
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                    <Button
                                        icon={<DownloadOutlined />}
                                        loading={downloading === referralId}
                                        disabled={downloading !== null && downloading !== referralId}
                                        onClick={() => handleDownload(referralId)}
                                    >
                                        Download PNG
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}
