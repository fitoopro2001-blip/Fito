import { Card, List } from 'antd';
import Skeleton from '../atoms/Skeleton';

const SKELETON_ROWS = Array.from({ length: 4 }, (_, i) => i);

export default function RecentListCard({ title, dataSource, renderItem, loading = false }) {
    return (
        <Card className="rounded-2xl border border-gray-100 shadow-sm" title={title}>
            {loading ? (
                <div className="flex flex-col gap-4">
                    {SKELETON_ROWS.map((i) => (
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 shrink-0" rounded="rounded-full" />
                            <div className="flex-1 min-w-0">
                                <Skeleton className="w-1/2 h-4 mb-2" />
                                <Skeleton className="w-3/4 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <List
                    size="small"
                    dataSource={dataSource}
                    locale={{ emptyText: 'No data yet' }}
                    renderItem={renderItem}
                />
            )}
        </Card>
    );
}
