import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { Button, Card, Col, Row, Typography, message } from 'antd';
import { DeleteOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import { QRCode } from 'antd';
import PageHeading from '../../components/atoms/PageHeading';

const QR_SIZE = 1024;
const MAX_LOGO_SIZE = 5 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const REFERRALS = ['logo1', 'logo2', 'logo3', 'logo4', 'logo5'].map((referralId) => ({
    referralId,
    name: `Logo ${referralId.slice(-1)}`,
    url: `https://www.fitoo.pro/consultation?ref=${referralId}`,
}));

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
    const [downloading, setDownloading] = useState(null);

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

    const getPngBlob = async (referralId) => {
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
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = QR_SIZE;
        exportCanvas.height = QR_SIZE;
        const context = exportCanvas.getContext('2d');
        if (!context) throw new Error('Unable to prepare a QR code PNG');
        context.imageSmoothingEnabled = false;
        context.drawImage(canvas, 0, 0, QR_SIZE, QR_SIZE);
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
            const blob = await getPngBlob(referralId);
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
            for (const { referralId } of REFERRALS) {
                archive.file(`${referralId}-qr-code.png`, await getPngBlob(referralId));
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
                subtitle="Create print-ready QR codes for your five tracked referral links"
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
                PNGs are exported at {QR_SIZE} × {QR_SIZE} pixels with high error correction. Center logos are optional;
                the QR code leaves a clear area behind them to help scanners read the code.
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
                                <Typography.Title level={4} className="!mb-1">
                                    {name}
                                </Typography.Title>
                                <Typography.Text
                                    className="mb-4 break-all text-center text-sm"
                                    copyable={{ text: url }}
                                >
                                    {url}
                                </Typography.Text>
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
