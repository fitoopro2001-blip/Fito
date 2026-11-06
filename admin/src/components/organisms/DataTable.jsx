import { Table, Empty } from 'antd';
import Skeleton from '../atoms/Skeleton';

const PAGINATION_DEFAULTS = {
    showSizeChanger: true,
    pageSizeOptions: [5, 8, 10, 20],
    showTotal: (total) => `${total} items`,
};

// Cell width cycles through these so a skeleton row reads like varied text
// instead of a uniform grid of identical bars.
const SKELETON_CELL_WIDTHS = ['w-24', 'w-14', 'w-20', 'w-10'];

// `pagination` + `onChange`: pass the object/handler from useServerTableQuery
// for backend-driven paging (page/pageSize/filters all trigger a refetch).
// Omit them to keep the old client-side behaviour (antd paginates `data` —
// which must already hold every row — in the browser).
export default function DataTable({
    columns,
    data,
    loading,
    rowKey = 'id',
    pageSize = 8,
    rowClassName,
    pagination,
    onChange,
}) {
    // While loading, real column renderers (image thumbnails, tags, sorters
    // reading into `record`) have nothing to render yet — swap in shimmering
    // placeholder rows instead of letting antd fall through to "No records
    // found" under its spinner.
    const displayColumns = loading
        ? columns.map((col, i) => ({
              ...col,
              render: () => <Skeleton className={`h-4 ${SKELETON_CELL_WIDTHS[i % SKELETON_CELL_WIDTHS.length]}`} />,
              sorter: undefined,
              filters: undefined,
              onFilter: undefined,
          }))
        : columns;

    const displayData = loading
        ? Array.from({ length: pageSize }, (_, i) => ({ [rowKey]: `skeleton-${i}` }))
        : data;

    return (
        <Table
            rowKey={rowKey}
            columns={displayColumns}
            dataSource={displayData}
            loading={false}
            scroll={{ x: 'max-content' }}
            rowClassName={loading ? undefined : rowClassName}
            locale={{ emptyText: <Empty description="No records found" /> }}
            pagination={
                loading
                    ? false
                    : pagination
                      ? { ...PAGINATION_DEFAULTS, ...pagination }
                      : { ...PAGINATION_DEFAULTS, pageSize }
            }
            onChange={loading ? undefined : onChange}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        />
    );
}
