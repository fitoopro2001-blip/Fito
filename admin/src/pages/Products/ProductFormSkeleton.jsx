import { Card, Row, Col } from 'antd';
import Skeleton from '../../components/atoms/Skeleton';

// Mirrors ProductFormPage's card layout (details + images + nutrition facts)
// so the page doesn't jump once the real form mounts.
export default function ProductFormSkeleton() {
    return (
        <Row gutter={24}>
            <Col xs={24} lg={14}>
                <Card title="Product Details" className="mb-6">
                    <div className="flex flex-col gap-6">
                        <Skeleton className="w-full h-10" />
                        <Skeleton className="w-full h-10" />
                        <div className="flex gap-4">
                            <Skeleton className="flex-1 h-10" />
                            <Skeleton className="flex-1 h-10" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="flex-1 h-10" />
                            <Skeleton className="flex-1 h-10" />
                        </div>
                        <Skeleton className="w-full h-24" />
                    </div>
                </Card>
            </Col>

            <Col xs={24} lg={10}>
                <Card title="Images" className="mb-6">
                    <div className="flex gap-2">
                        <Skeleton className="w-20 h-20" />
                        <Skeleton className="w-20 h-20" />
                        <Skeleton className="w-20 h-20" />
                    </div>
                </Card>

                <Card title="Nutrition Facts" className="mt-6!">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="w-full h-9" />
                        <Skeleton className="w-full h-9" />
                    </div>
                </Card>
            </Col>
        </Row>
    );
}
