import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Typography, Tag, Divider, Row, Col, Image, Card, Spin, message, Result } from 'antd';
import { ArrowLeftOutlined, FilePdfOutlined } from '@ant-design/icons';
import KeyValueGrid from '../../components/molecules/KeyValueGrid';
import ConsultationConversation from '../../components/organisms/consultations/ConsultationConversation';
import { CONSULTATION_GOALS, STATUS_COLORS } from '../../constants/consultationGoals';
import { ROUTES } from '../../constants/routes';
import { fetchConsultation, sendAdminMessage } from '../../api/consultations.api';

const { Title, Text } = Typography;

// The admin panel's ConsultationConversation component uses
// sender: 'dietitian' | 'user'; the real API returns authorType: 'admin' |
// 'user'. This bridges the two so the UI stays untouched either way.
const toConversationView = (conversation) =>
    (conversation || []).map((m) => ({
        id: m.id,
        sender: m.authorType === 'admin' ? 'dietitian' : 'user',
        text: m.message,
        timestamp: m.createdAt,
    }));

const isPdfUrl = (url) => /\.pdf(\?|$)/i.test(url || '');

// Cloudinary flag that makes the response Content-Disposition: attachment,
// so clicking downloads the file instead of navigating to Cloudinary's bare
// PDF URL.
const toDownloadUrl = (url) =>
    url?.includes('/upload/') ? url.replace('/upload/', '/upload/fl_attachment/') : url;

function UploadGallery({ title, images }) {
    const files = images || [];
    // PDFs can't render through <Image> (it's an <img> under the hood, and
    // application/pdf isn't image data) — show them as a download link instead.
    const photos = files.filter((src) => !isPdfUrl(src));
    const pdfs = files.filter(isPdfUrl);

    return (
        <div className="mb-4">
            <Text className="!text-gray-400 text-xs block mb-2">
                {title} ({files.length})
            </Text>
            {files.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                    {photos.length > 0 && (
                        <Image.PreviewGroup>
                            {photos.map((src, idx) => (
                                <Image key={idx} src={src} width={88} height={88} className="rounded-lg object-cover" />
                            ))}
                        </Image.PreviewGroup>
                    )}
                    {pdfs.map((src, idx) => (
                        <a
                            key={idx}
                            href={toDownloadUrl(src)}
                            className="w-[88px] h-[88px] flex flex-col items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:border-red-400 hover:text-red-500 text-xs"
                        >
                            <FilePdfOutlined className="text-2xl" />
                            <span>PDF</span>
                        </a>
                    ))}
                </div>
            ) : (
                <Text type="secondary">No files uploaded</Text>
            )}
        </div>
    );
}

export default function ConsultationDetailPage() {
    const { id } = useParams();
    // Remounts (resetting all local state) whenever the id changes, instead
    // of syncing that reset through an effect.
    return <ConsultationDetailPageInner key={id} id={id} />;
}

function ConsultationDetailPageInner({ id }) {
    const navigate = useNavigate();
    const [consultation, setConsultation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        fetchConsultation(id)
            .then((data) => {
                if (!cancelled) setConsultation(data);
            })
            .catch(() => {
                if (!cancelled) message.error('Failed to load consultation');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Spin />
            </div>
        );
    }

    if (!consultation) {
        return (
            <Result
                status="404"
                title="Consultation not found"
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTES.CONSULTATIONS)}>
                        Back to Consultations
                    </Button>
                }
            />
        );
    }

    const goalConfig = CONSULTATION_GOALS.find((g) => g.id === consultation.goal);
    const uploads = consultation.uploads || {};

    const handleSendMessage = async (text) => {
        try {
            const updated = await sendAdminMessage(consultation.id, text);
            setConsultation(updated);
            message.success('Reply sent to user');
        } catch {
            message.error('Failed to send reply');
        }
    };

    return (
        <div>
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(ROUTES.CONSULTATIONS)}
                className="!px-0 !mb-4"
            >
                Back to Consultations
            </Button>

            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{goalConfig?.icon ?? '📋'}</span>
                        <div>
                            <Title level={4} className="!mb-0">
                                {goalConfig?.title ?? 'Consultation'} · {consultation.id}
                            </Title>
                            <Text type="secondary" className="text-sm">
                                Submitted{' '}
                                {consultation.submittedAt ? new Date(consultation.submittedAt).toLocaleString() : '—'}
                            </Text>
                        </div>
                    </div>
                    <Tag color={STATUS_COLORS[consultation.status] ?? 'gold'} className="capitalize !text-sm !px-3 !py-1">
                        {consultation.status?.replace('_', ' ')}
                    </Tag>
                </div>

                {consultation.plan && (
                    <>
                        <Divider className="!my-3" />
                        <Row gutter={[16, 12]}>
                            <Col xs={12} sm={8}>
                                <Text className="!text-gray-400 text-xs block mb-1">Plan</Text>
                                <Text>{consultation.plan.label}</Text>
                            </Col>
                            <Col xs={12} sm={8}>
                                <Text className="!text-gray-400 text-xs block mb-1">Duration</Text>
                                <Text>{consultation.plan.durationMonths} month(s)</Text>
                            </Col>
                            <Col xs={12} sm={8}>
                                <Text className="!text-gray-400 text-xs block mb-1">Price</Text>
                                {/* Older consultations (booked before multi-currency pricing) have no
                                    `plan.currency` — they were always PKR. */}
                                <Text>
                                    {consultation.plan.currency ?? 'PKR'} {consultation.plan.price?.toLocaleString('en-US')}
                                </Text>
                            </Col>
                        </Row>
                    </>
                )}

                <Divider className="!my-3" />
                <Title level={5} className="!mb-3">Personal Information</Title>
                <KeyValueGrid data={consultation.personalInfo || {}} />

                {consultation.goalData && Object.keys(consultation.goalData).length > 0 && (
                    <>
                        <Divider className="!my-3" />
                        <Title level={5} className="!mb-3">Goal Details</Title>
                        <KeyValueGrid data={consultation.goalData} />
                    </>
                )}

                <Divider className="!my-3" />
                <Title level={5} className="!mb-3">Uploads</Title>
                <UploadGallery title="Body Photos" images={uploads.bodyPhotos} />
                <UploadGallery title="Medical Reports" images={uploads.reports} />
                <UploadGallery title="Payment Screenshot" images={uploads.paymentScreenshot} />

                {consultation.transactionId && (
                    <>
                        <Divider className="!my-3" />
                        <Text className="!text-gray-400 text-xs block mb-1">Transaction ID</Text>
                        <Text>{consultation.transactionId}</Text>
                    </>
                )}
            </Card>

            <Card className="rounded-2xl border border-gray-100 shadow-sm mt-6!">
                <Title level={5} className="!mb-3">Conversation with {consultation.personalInfo?.fullName || 'User'}</Title>
                <ConsultationConversation
                    messages={toConversationView(consultation.conversation)}
                    onSend={handleSendMessage}
                />
            </Card>
        </div>
    );
}
