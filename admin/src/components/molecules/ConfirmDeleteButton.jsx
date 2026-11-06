import { Popconfirm, Button, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

export default function ConfirmDeleteButton({ onConfirm, title = 'Delete this item?' }) {
    return (
        <Popconfirm
            title={title}
            description="This action cannot be undone."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={onConfirm}
        >
            <Tooltip title="Delete">
                <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
        </Popconfirm>
    );
}
