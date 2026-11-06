import { Button, Tooltip, Space } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import ConfirmDeleteButton from './ConfirmDeleteButton';

export default function RowActions({ onView, onEdit, onDelete }) {
    return (
        <Space size={4}>
            {onView && (
                <Tooltip title="View">
                    <Button type="text" icon={<EyeOutlined />} onClick={onView} />
                </Tooltip>
            )}
            {onEdit && (
                <Tooltip title="Edit">
                    <Button type="text" icon={<EditOutlined />} onClick={onEdit} />
                </Tooltip>
            )}
            {onDelete && <ConfirmDeleteButton onConfirm={onDelete} />}
        </Space>
    );
}
