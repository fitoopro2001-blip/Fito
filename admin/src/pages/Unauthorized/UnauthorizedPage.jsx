import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function UnauthorizedPage() {
    const navigate = useNavigate();
    return (
        <Result
            status="403"
            title="403"
            subTitle="Sorry, you don't have permission to access this page."
            extra={
                <Button type="primary" onClick={() => navigate(ROUTES.DASHBOARD)}>
                    Back to Dashboard
                </Button>
            }
        />
    );
}
