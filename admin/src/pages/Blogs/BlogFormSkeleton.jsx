import { Card, Row, Col } from 'antd';
import Skeleton from '../../components/atoms/Skeleton';

// Mirrors BlogFormPage's card layout (details + cover image + body) so the
// page doesn't jump once the real form mounts.
export default function BlogFormSkeleton() {
    return (
        <>
            <Row gutter={24}>
                <Col xs={24} lg={14}>
                    <Card title="Post Details" className="mb-6">
                        <div className="flex flex-col gap-6">
                            <Skeleton className="w-full h-10" />
                            <Skeleton className="w-full h-10" />
                            <Skeleton className="w-full h-10" />
                            <div className="flex gap-4">
                                <Skeleton className="flex-1 h-10" />
                                <Skeleton className="flex-1 h-10" />
                            </div>
                            <Skeleton className="w-full h-10" />
                            <Skeleton className="w-full h-20" />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card title="Cover Image" className="mb-6">
                        <Skeleton className="w-20 h-20" />
                    </Card>
                </Col>
            </Row>

            <Card title="Body" className="mb-6">
                <Skeleton className="w-full h-40" />
            </Card>
        </>
    );
}
