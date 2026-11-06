import { Card } from 'antd';
import Skeleton from '../atoms/Skeleton';
import { BRAND } from '../../constants/theme';

export default function SummaryCard({ icon, label, value, accent = BRAND.primary, loading = false }) {
    return (
        <Card
            className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            styles={{ body: { padding: '20px' } }}
        >
            <div className="flex items-center gap-4">
                {loading ? (
                    <Skeleton className="w-11 h-11 shrink-0" rounded="rounded-xl" />
                ) : (
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0"
                        style={{ background: `${accent}1A`, color: accent }}
                    >
                        {icon}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    {loading ? (
                        <>
                            <Skeleton className="w-16 h-3.5 mb-2" />
                            <Skeleton className="w-20 h-5" />
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-500 truncate">{label}</p>
                            <p className="text-xl font-semibold text-gray-900">{value}</p>
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
}
