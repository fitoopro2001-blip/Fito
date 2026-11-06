import { Empty } from 'antd';

export default function EmptyState({ description = 'No data found' }) {
    return (
        <div className="py-10">
            <Empty description={description} />
        </div>
    );
}
