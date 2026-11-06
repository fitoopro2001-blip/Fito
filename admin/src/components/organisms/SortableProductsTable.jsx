import { createContext, useContext, useMemo } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';
import { Image, Table } from 'antd';
import StatusTag from '../atoms/StatusTag';
import imageUrl from '../../utils/imageUrl';

// Passes the dragged row's dnd-kit handle down to its handle-cell renderer,
// following antd's own drag-sortable-table recipe (Table body row + a
// context so only the handle cell, not the whole row, starts a drag).
const RowContext = createContext({});

function DragHandle() {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);
    return (
        <span
            ref={setActivatorNodeRef}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 px-2"
        >
            <HolderOutlined />
        </span>
    );
}

function DraggableRow(props) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });

    const style = {
        ...props.style,
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { position: 'relative', zIndex: 10, background: '#fafafa' } : {}),
    };

    const contextValue = useMemo(() => ({ setActivatorNodeRef, listeners }), [setActivatorNodeRef, listeners]);

    return (
        <RowContext.Provider value={contextValue}>
            <tr {...props} ref={setNodeRef} style={style} {...attributes} />
        </RowContext.Provider>
    );
}

// Read-only, unpaginated table for reorder mode: search/filters/column sort
// don't make sense against a manual order, so this intentionally only shows
// the columns that help identify a row while dragging.
export default function SortableProductsTable({ items, onReorder, loading, categoryName }) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        onReorder(arrayMove(items, oldIndex, newIndex));
    };

    const columns = [
        { key: 'sort', width: 40, render: () => <DragHandle /> },
        {
            title: 'Image',
            dataIndex: 'image',
            render: (image) => (
                <Image src={imageUrl(image)} width={40} height={40} className="rounded-lg object-cover" fallback="" />
            ),
        },
        { title: 'Name', dataIndex: 'name' },
        { title: 'Category', dataIndex: 'category', render: (category) => categoryName(category) },
        { title: 'Status', dataIndex: 'status', render: (status) => <StatusTag status={status} /> },
    ];

    return (
        <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={items}
                    loading={loading}
                    pagination={false}
                    scroll={{ x: 'max-content', y: 480 }}
                    components={{ body: { row: DraggableRow } }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                />
            </SortableContext>
        </DndContext>
    );
}
