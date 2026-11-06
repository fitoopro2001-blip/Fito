import { Row, Col, Typography } from 'antd';

const { Text } = Typography;

const formatLabel = (key) =>
    key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (char) => char.toUpperCase());

const formatValue = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    if (Array.isArray(value)) return value.length ? value.join(', ') : '—';
    return String(value);
};

export default function KeyValueGrid({ data }) {
    return (
        <Row gutter={[16, 12]}>
            {Object.entries(data).map(([key, value]) => (
                <Col xs={24} sm={12} key={key}>
                    <Text className="!text-gray-400 text-xs block mb-1">{formatLabel(key)}</Text>
                    <Text className="!text-gray-800">{formatValue(value)}</Text>
                </Col>
            ))}
        </Row>
    );
}
