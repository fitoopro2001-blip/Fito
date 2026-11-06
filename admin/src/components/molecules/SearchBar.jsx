import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
    return (
        <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full sm:max-w-xs"
        />
    );
}
