'use client';

import { Card, Tag, Typography, Row, Col, Divider } from 'antd';
import { CONSULTATION_GOALS } from '@/utils/consultationConfig';

const { Title, Text } = Typography;

const STATUS_COLORS = {
  pending: 'gold',
  in_review: 'blue',
  completed: 'green',
};

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
  return String(value);
};

// Uploads are file-URL arrays from the real API, but a plain count in the
// testing-mode local record (which never has real files to reference).
const fileCount = (value) => (Array.isArray(value) ? value.length : value ?? 0);

const KeyValueGrid = ({ data }) => (
  <Row gutter={[16, 16]}>
    {Object.entries(data).map(([key, value]) => (
      <Col xs={24} sm={12} key={key}>
        <Text className="!text-gray-400 text-xs block mb-1">
          {formatLabel(key)}
        </Text>
        <Text className="!text-white">{formatValue(value)}</Text>
      </Col>
    ))}
  </Row>
);

export default function ConsultationSummaryCard({ consultation }) {
  const goalConfig = CONSULTATION_GOALS.find(
    (goal) => goal.id === consultation.goal
  );

  const personalInfo = consultation.personalInfo || {};
  const goalData = consultation.goalData || {};
  const uploads = consultation.uploads || {};

  return (
    <Card className="bg-white/5 border-white/10 rounded-3xl">

      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">

        <div className="flex items-center gap-3">
          <span className="text-3xl">{goalConfig?.icon ?? '📋'}</span>
          <div>
            <Title level={4} className="!text-white !mb-0">
              {goalConfig?.title ?? 'Consultation'}
            </Title>
            <Text className="!text-gray-400 text-sm">
              Submitted{' '}
              {consultation.submittedAt
                ? new Date(consultation.submittedAt).toLocaleString()
                : '—'}
            </Text>
          </div>
        </div>

        <Tag
          color={STATUS_COLORS[consultation.status] ?? 'gold'}
          className="capitalize !text-sm !px-3 !py-1"
        >
          {consultation.status}
        </Tag>

      </div>

      <Divider className="!border-white/10" />

      <Title level={5} className="!text-white !mb-4">
        Personal Information
      </Title>
      <KeyValueGrid data={personalInfo} />

      {Object.keys(goalData).length > 0 && (
        <>
          <Divider className="!border-white/10" />
          <Title level={5} className="!text-white !mb-4">
            Goal Details
          </Title>
          <KeyValueGrid data={goalData} />
        </>
      )}

      <Divider className="!border-white/10" />

      <Title level={5} className="!text-white !mb-4">
        Uploads
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8}>
          <Text className="!text-gray-400 text-xs block mb-1">
            Body Photos
          </Text>
          <Text className="!text-white">
            {fileCount(uploads.bodyPhotos)} file(s)
          </Text>
        </Col>
        <Col xs={12} sm={8}>
          <Text className="!text-gray-400 text-xs block mb-1">
            Medical Reports
          </Text>
          <Text className="!text-white">
            {fileCount(uploads.reports)} file(s)
          </Text>
        </Col>
        <Col xs={12} sm={8}>
          <Text className="!text-gray-400 text-xs block mb-1">
            Payment Screenshot
          </Text>
          <Text className="!text-white">
            {fileCount(uploads.paymentScreenshot)} file(s)
          </Text>
        </Col>
      </Row>

      {consultation.transactionId && (
        <>
          <Divider className="!border-white/10" />
          <Text className="!text-gray-400 text-xs block mb-1">
            Transaction ID
          </Text>
          <Text className="!text-white">{consultation.transactionId}</Text>
        </>
      )}

    </Card>
  );
}
