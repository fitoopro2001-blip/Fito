import { Tabs, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { DollarOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import ConsultationTable from '../../components/organisms/consultations/ConsultationTable';
import { CONSULTATION_GOALS } from '../../constants/consultationGoals';
import { consultationPricingPath } from '../../constants/routes';

export default function ConsultationManagementPage() {
    const navigate = useNavigate();

    return (
        <div>
            <PageHeading title="Consultation Management" subtitle="Review and manage consultations by goal category" />
            <Tabs
                defaultActiveKey="all"
                // Real mode fetches per-tab (each tab scopes its own paginated
                // query by goal), so only the active tab needs to be mounted.
                destroyInactiveTabPane
                items={[
                    {
                        key: 'all',
                        label: <span>🗂 All</span>,
                        children: <ConsultationTable showGoal />,
                    },
                    ...CONSULTATION_GOALS.map((goal) => ({
                        key: goal.id,
                        label: (
                            <span>
                                {goal.icon} {goal.title}
                            </span>
                        ),
                        children: (
                            <div>
                                <div className="flex justify-end mb-4">
                                    <Button icon={<DollarOutlined />} onClick={() => navigate(consultationPricingPath(goal.id))}>
                                        Manage Pricing
                                    </Button>
                                </div>
                                <ConsultationTable goal={goal.id} />
                            </div>
                        ),
                    })),
                ]}
            />
        </div>
    );
}
