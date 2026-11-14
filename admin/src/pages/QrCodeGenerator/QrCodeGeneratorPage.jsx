import { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import { Button, Card, Col, Input, Modal, Row, Spin, Typography, message } from 'antd';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { QRCode } from 'antd';
import PageHeading from '../../components/atoms/PageHeading';
import {
    createQrReferral,
    fetchQrReferralScanCounts,
    updateQrReferral,
} from '../../api/adminQrReferralScans.api';

const QR_SIZE = 1024;
const LEGACY_LABEL_STORAGE_KEY = 'fitoo.qr-referral-labels.v1';
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_TITLE_LENGTH = 60;
const MAX_DETAILS_LENGTH = 180;
const DEFAULT_REFERRAL_IDS = ['logo1', 'logo2', 'logo3', 'logo4', 'logo5'];

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

const readLegacyLabels = () => {
    try {
        const storedLabels = localStorage.getItem(LEGACY_LABEL_STORAGE_KEY);
        if (!storedLabels) return { labels: {}, error: null };

        const parsedLabels = JSON.parse(storedLabels);
        if (!parsedLabels || typeof parsedLabels !== 'object' || Array.isArray(parsedLabels)) {
            throw new Error('Saved QR labels have an invalid format');
        }

        const validReferralIds = new Set(DEFAULT_REFERRAL_IDS);
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
        console.error('Unable to read previously saved QR labels:', error);
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
    const [qrReferrals, setQrReferrals] = useState([]);
    const [loadingReferrals, setLoadingReferrals] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const [savingReferralId, setSavingReferralId] = useState(null);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDetails, setNewDetails] = useState('');

    useEffect(() => {
        let cancelled = false;
        const loadReferrals = async () => {
            try {
                let items = await fetchQrReferralScanCounts();
                const legacyState = readLegacyLabels();
                if (legacyState.error) {
                    message.error('Previously saved QR titles could not be read');
                } else if (Object.keys(legacyState.labels).length > 0) {
                    try {
                        for (const referralId of DEFAULT_REFERRAL_IDS) {
                            const legacyLabel = legacyState.labels[referralId];
                            const referral = items.find((item) => item.referralId === referralId);
                            if (!legacyLabel || !referral) continue;

                            const name = legacyLabel.title.trim() || referral.name;
                            const details = legacyLabel.details;
                            if (name === referral.name && details === referral.details) continue;

                            const saved = await updateQrReferral(referralId, { name, details });
                            items = items.map((item) =>
                                item.referralId === referralId ? { ...item, ...saved } : item
                            );
                        }
                        localStorage.removeItem(LEGACY_LABEL_STORAGE_KEY);
                    } catch (error) {
                        console.error('Unable to migrate saved QR titles:', error);
                        message.error(error.response?.data?.message || 'Unable to sync saved QR titles');
                    }
                }

                if (!cancelled) setQrReferrals(items);
            } catch (error) {
                console.error('Unable to load QR referrals:', error);
                if (!cancelled) {
                    message.error(error.response?.data?.message || 'Failed to load QR referrals');
                }
            } finally {
                if (!cancelled) setLoadingReferrals(false);
            }
        };
        loadReferrals();
        return () => {
            cancelled = true;
        };
    }, []);

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

    const handleReferralChange = (referralId, field, value) => {
        setQrReferrals((current) =>
            current.map((referral) =>
                referral.referralId === referralId ? { ...referral, [field]: value } : referral
            )
        );
    };

    const handleCreateReferral = async () => {
        if (!newName.trim()) {
            message.error('Enter a name for this QR code');
            return;
        }

        setCreating(true);
        try {
            const referral = await createQrReferral({ name: newName.trim(), details: newDetails.trim() });
            setQrReferrals((current) => [...current, referral]);
            setNewName('');
            setNewDetails('');
            setAddModalOpen(false);
            message.success('Tracked QR code added');
        } catch (error) {
            console.error('Unable to create QR referral:', error);
            message.error(error.response?.data?.message || 'Unable to create QR code');
        } finally {
            setCreating(false);
        }
    };

    const handleSaveReferral = async (referralId) => {
        const referral = qrReferrals.find((item) => item.referralId === referralId);
        if (!referral || !referral.name.trim()) {
            message.error('Enter a name for this QR code');
            return;
        }

        setSavingReferralId(referralId);
        try {
            const saved = await updateQrReferral(referralId, {
                name: referral.name.trim(),
                details: referral.details.trim(),
            });
            setQrReferrals((current) =>
                current.map((item) => (item.referralId === referralId ? { ...item, ...saved } : item))
            );
            message.success('QR name and details saved');
        } catch (error) {
            console.error('Unable to save QR referral:', error);
            message.error(error.response?.data?.message || 'Unable to save QR name and details');
        } finally {
            setSavingReferralId(null);
        }
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
            const referral = qrReferrals.find((item) => item.referralId === referralId);
            if (!referral) throw new Error('QR referral not found');
            const blob = await getPngBlob(referralId, referral.name, referral.details || '');
            saveBlob(blob, `${referralId}-qr-code.png`);
            message.success(`${referral.name} QR code downloaded`);
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
            for (const { referralId, name, details } of qrReferrals) {
                archive.file(`${referralId}-qr-code.png`, await getPngBlob(referralId, name, details || ''));
            }
            const blob = await archive.generateAsync({ type: 'blob' });
            saveBlob(blob, 'fitoo-qr-referral-codes.zip');
            message.success(`All ${qrReferrals.length} QR codes downloaded`);
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
                subtitle="Add and manage tracked QR codes with custom names"
                actions={
                    <div className="flex flex-wrap gap-2">
                        <Button icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
                            Add QR code
                        </Button>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            loading={downloading === 'all'}
                            disabled={downloading !== null && downloading !== 'all'}
                            onClick={handleDownloadAll}
                        >
                            Download all as ZIP
                        </Button>
                    </div>
                }
            />
            <p className="mb-5 text-sm text-gray-500">
                QR codes are rendered at {QR_SIZE} × {QR_SIZE} pixels with high error correction. Center logos are
                optional; the QR code leaves a clear area behind them to help scanners read the code. Each code opens
                the consultation page with its own tracked referral ID. Saved names and details appear on the dashboard
                and below the QR in downloaded PNGs.
            </p>

            {loadingReferrals ? (
                <div className="flex justify-center py-12">
                    <Spin size="large" />
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {qrReferrals.map((referral) => {
                        const { referralId, name, details } = referral;
                        const url = `https://www.fitoo.pro/consultation?ref=${referralId}`;
                        return (
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
                                                aria-label={`${name} referral QR code`}
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
                                        <Typography.Title level={4} className="!mb-1 text-center">
                                            {name}
                                        </Typography.Title>
                                        {details && (
                                            <Typography.Paragraph className="mb-3 max-w-full text-center text-sm">
                                                {details}
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
                                                QR name (shown on dashboard)
                                                <Input
                                                    className="mt-1"
                                                    maxLength={MAX_TITLE_LENGTH}
                                                    showCount
                                                    value={name}
                                                    aria-label={`QR name for ${name}`}
                                                    disabled={savingReferralId !== null}
                                                    onChange={(event) =>
                                                        handleReferralChange(referralId, 'name', event.target.value)
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
                                                    value={details || ''}
                                                    aria-label={`Details for ${name}`}
                                                    disabled={savingReferralId !== null}
                                                    onChange={(event) =>
                                                        handleReferralChange(referralId, 'details', event.target.value)
                                                    }
                                                />
                                            </label>
                                            <Button
                                                icon={<SaveOutlined />}
                                                loading={savingReferralId === referralId}
                                                disabled={savingReferralId !== null && savingReferralId !== referralId}
                                                onClick={() => handleSaveReferral(referralId)}
                                            >
                                                Save name and details
                                            </Button>
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
                        );
                    })}
                </Row>
            )}

            <Modal
                title="Add tracked QR code"
                open={addModalOpen}
                onCancel={() => setAddModalOpen(false)}
                onOk={handleCreateReferral}
                okText="Create QR code"
                confirmLoading={creating}
                destroyOnHidden
            >
                <p className="mb-4 text-sm text-gray-500">
                    This QR code opens the consultation page and gets its own scan count on the dashboard.
                </p>
                <label className="mb-4 block text-sm font-medium text-gray-700">
                    QR name
                    <Input
                        className="mt-1"
                        maxLength={MAX_TITLE_LENGTH}
                        showCount
                        value={newName}
                        aria-label="New QR name"
                        onChange={(event) => setNewName(event.target.value)}
                    />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                    Details
                    <Input.TextArea
                        className="mt-1"
                        rows={3}
                        maxLength={MAX_DETAILS_LENGTH}
                        showCount
                        value={newDetails}
                        aria-label="New QR details"
                        onChange={(event) => setNewDetails(event.target.value)}
                    />
                </label>
            </Modal>
        </div>
    );
}
