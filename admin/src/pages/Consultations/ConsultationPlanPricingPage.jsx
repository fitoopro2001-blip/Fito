import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, InputNumber, Card, Tag, Spin, message, Empty, Result } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, CloseOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import ConfirmDeleteButton from '../../components/molecules/ConfirmDeleteButton';
import { CONSULTATION_GOALS } from '../../constants/consultationGoals';
import { ROUTES } from '../../constants/routes';
import {
    fetchConsultationPlans,
    createConsultationPlan,
    updateConsultationPlan,
    deleteConsultationPlan,
} from '../../api/adminConsultationPlans.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

const emptyPlan = () => ({
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    isNew: true,
    label: '',
    durationMonths: 1,
    price: 0,
    priceSAR: 0,
    priceUSD: 0,
    discountPercent: 0,
    features: [''],
    isPaused: false,
});

const finalPrice = (plan) =>
    plan.discountPercent > 0 ? Math.round(plan.price * (1 - plan.discountPercent / 100)) : plan.price;

export default function ConsultationPlanPricingPage() {
    const navigate = useNavigate();
    const { goalId } = useParams();
    const goal = CONSULTATION_GOALS.find((g) => g.id === goalId);

    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!goal) return undefined;

        let cancelled = false;
        setLoading(true);
        fetchConsultationPlans(goal.id)
            .then((data) => {
                if (!cancelled) setPlans(data.map((p) => ({ ...p, key: p.id })));
            })
            .catch((err) => {
                if (!cancelled) message.error(apiError(err, 'Failed to load plan pricing'));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [goal]);

    if (!goal) {
        return (
            <Result
                status="404"
                title="Unknown goal"
                subTitle="This consultation category doesn't exist."
                extra={
                    <Button type="primary" onClick={() => navigate(ROUTES.CONSULTATIONS)}>
                        Back to Consultations
                    </Button>
                }
            />
        );
    }

    const updatePlan = (key, patch) => {
        setPlans((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
    };

    const updateFeature = (key, index, value) => {
        setPlans((prev) =>
            prev.map((p) =>
                p.key === key ? { ...p, features: p.features.map((f, i) => (i === index ? value : f)) } : p
            )
        );
    };

    const addFeature = (key) => {
        setPlans((prev) =>
            prev.map((p) => (p.key === key ? { ...p, features: [...p.features, ''] } : p))
        );
    };

    const removeFeature = (key, index) => {
        setPlans((prev) =>
            prev.map((p) => (p.key === key ? { ...p, features: p.features.filter((_, i) => i !== index) } : p))
        );
    };

    const addProgram = () => setPlans((prev) => [...prev, emptyPlan()]);

    const togglePause = async (plan) => {
        const isPaused = !plan.isPaused;
        if (plan.isNew) {
            updatePlan(plan.key, { isPaused });
            return;
        }
        try {
            await updateConsultationPlan(plan.id, { isPaused });
            updatePlan(plan.key, { isPaused });
            message.success(isPaused ? 'Program paused' : 'Program resumed');
        } catch (err) {
            message.error(apiError(err, 'Failed to update program status'));
        }
    };

    const removePlan = async (plan) => {
        if (plan.isNew) {
            setPlans((prev) => prev.filter((p) => p.key !== plan.key));
            return;
        }
        try {
            await deleteConsultationPlan(plan.id);
            setPlans((prev) => prev.filter((p) => p.key !== plan.key));
            message.success('Program removed');
        } catch (err) {
            message.error(apiError(err, 'Failed to remove program'));
        }
    };

    const validate = () => {
        for (const p of plans) {
            if (!p.label.trim()) return 'Every program needs a name';
            if (!p.durationMonths || p.durationMonths < 1) return 'Duration must be at least 1 month';
            if (p.price === null || p.price === undefined || p.price < 0) return 'PKR price must be a non-negative number';
            if (p.priceSAR === null || p.priceSAR === undefined || p.priceSAR < 0) return 'SAR price must be a non-negative number';
            if (p.priceUSD === null || p.priceUSD === undefined || p.priceUSD < 0) return 'USD price must be a non-negative number';
            if (p.discountPercent < 0 || p.discountPercent > 100) return 'Discount must be between 0 and 100';
        }
        return null;
    };

    const handleSaveAll = async () => {
        const error = validate();
        if (error) {
            message.error(error);
            return;
        }

        const cleaned = plans.map((p) => ({ ...p, features: p.features.map((f) => f.trim()).filter(Boolean) }));

        setSaving(true);
        try {
            const saved = await Promise.all(
                cleaned.map((p) => {
                    const payload = {
                        label: p.label.trim(),
                        durationMonths: p.durationMonths,
                        price: p.price,
                        priceSAR: p.priceSAR ?? 0,
                        priceUSD: p.priceUSD ?? 0,
                        discountPercent: p.discountPercent,
                        features: p.features,
                        isPaused: p.isPaused ?? false,
                    };
                    return p.isNew ? createConsultationPlan(goal.id, payload) : updateConsultationPlan(p.id, payload);
                })
            );
            setPlans(saved.map((p) => ({ ...p, key: p.id })));
            message.success('Pricing saved');
        } catch (err) {
            message.error(apiError(err, 'Failed to save pricing'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-1">
                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTES.CONSULTATIONS)} />
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 m-0">
                        {goal.icon} {goal.title} — Pricing
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 mb-0">
                        Manage the programs offered for this goal — pricing, discounts and what's included.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-2 my-4">
                <Button icon={<PlusOutlined />} onClick={addProgram}>
                    Add Program
                </Button>
                <Button type="primary" loading={saving} onClick={handleSaveAll}>
                    Save Changes
                </Button>
            </div>

            <Spin spinning={loading}>
                {plans.length === 0 && !loading ? (
                    <Empty description="No programs yet — add one to get started" />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {plans.map((plan) => (
                            <Card
                                key={plan.key}
                                title={
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={plan.label}
                                            onChange={(e) => updatePlan(plan.key, { label: e.target.value })}
                                            placeholder="Program name, e.g. Basic"
                                            variant="borderless"
                                            className="!px-0 font-semibold"
                                        />
                                        {plan.isPaused && <Tag color="orange">Paused</Tag>}
                                    </div>
                                }
                                extra={
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="text"
                                            icon={plan.isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                                            onClick={() => togglePause(plan)}
                                            title={plan.isPaused ? 'Resume program' : 'Pause program'}
                                        >
                                            {plan.isPaused ? 'Resume' : 'Pause'}
                                        </Button>
                                        <ConfirmDeleteButton title="Remove this program?" onConfirm={() => removePlan(plan)} />
                                    </div>
                                }
                            >
                                {plan.isPaused && (
                                    <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded px-2 py-1 mb-3">
                                        Paused — shown as &quot;Coming Soon&quot; and blurred on the app; customers can&apos;t select or buy it.
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Duration (months)</div>
                                        <InputNumber
                                            min={1}
                                            value={plan.durationMonths}
                                            onChange={(v) => updatePlan(plan.key, { durationMonths: v })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Discount (%)</div>
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            value={plan.discountPercent}
                                            onChange={(v) => updatePlan(plan.key, { discountPercent: v ?? 0 })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500 mb-1">
                                    Pricing — entered manually per currency, no automatic conversion
                                </div>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Price (PKR)</div>
                                        <InputNumber
                                            min={0}
                                            value={plan.price}
                                            onChange={(v) => updatePlan(plan.key, { price: v ?? 0 })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Price (SAR)</div>
                                        <InputNumber
                                            min={0}
                                            value={plan.priceSAR}
                                            onChange={(v) => updatePlan(plan.key, { priceSAR: v ?? 0 })}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Price (USD)</div>
                                        <InputNumber
                                            min={0}
                                            value={plan.priceUSD}
                                            onChange={(v) => updatePlan(plan.key, { priceUSD: v ?? 0 })}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="text-sm text-gray-500 mb-4">
                                    Final price:{' '}
                                    <span className="font-semibold text-gray-800">
                                        Rs. {finalPrice(plan).toLocaleString('en-US')}
                                    </span>
                                    {plan.discountPercent > 0 && (
                                        <Tag color="green" className="ml-2">
                                            {plan.discountPercent}% off
                                        </Tag>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 mb-2">What's included</div>
                                {plan.features.map((feature, fi) => (
                                    <div key={fi} className="flex items-center gap-2 mb-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => updateFeature(plan.key, fi, e.target.value)}
                                            placeholder={`Point ${fi + 1}`}
                                        />
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<CloseOutlined />}
                                            onClick={() => removeFeature(plan.key, fi)}
                                        />
                                    </div>
                                ))}
                                <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => addFeature(plan.key)}>
                                    Add point
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </Spin>
        </div>
    );
}
