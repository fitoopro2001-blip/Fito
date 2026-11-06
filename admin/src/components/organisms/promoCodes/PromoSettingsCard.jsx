import { useEffect, useState } from 'react';
import { Card, Form, InputNumber, Switch, Button, Skeleton, Alert, message } from 'antd';
import { fetchPromoSettings, updatePromoSettings } from '../../../api/adminPromoCodes.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

// Programme-wide rules for referral promo codes. Each code snapshots the
// percent/minimum it was issued under, so saving here only affects codes
// issued from now on — codes already in customers' inboxes keep their terms.
export default function PromoSettingsCard({ onSaved }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        fetchPromoSettings()
            .then((settings) => {
                if (!cancelled) form.setFieldsValue(settings);
            })
            .catch((err) => message.error(apiError(err, 'Failed to load promo settings')))
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [form]);

    const handleSave = async () => {
        const values = await form.validateFields();
        setSaving(true);
        try {
            await updatePromoSettings(values);
            message.success('Promo settings saved');
            onSaved?.();
        } catch (err) {
            message.error(apiError(err, 'Failed to save promo settings'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card
            title="Promo Code Settings"
            className="rounded-2xl border border-gray-100 shadow-sm mb-6!"
        >
            {loading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
                <Form form={form} layout="vertical">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4">
                        <Form.Item
                            name="discountPercent"
                            label="Discount Percent"
                            rules={[{ required: true, message: 'Required' }]}
                            extra="Applied to the order subtotal."
                        >
                            <InputNumber className="w-full" min={0} max={100} addonAfter="%" />
                        </Form.Item>
                        <Form.Item
                            name="validityDays"
                            label="Valid For"
                            rules={[{ required: true, message: 'Required' }]}
                            extra="How long a new code stays redeemable."
                        >
                            <InputNumber className="w-full" min={1} addonAfter="days" />
                        </Form.Item>
                        <Form.Item
                            name="minOrderTotal"
                            label="Minimum Order"
                            extra="0 for no minimum."
                        >
                            <InputNumber className="w-full" min={0} addonBefore="PKR" />
                        </Form.Item>
                        <div className="flex flex-col gap-2">
                            <Form.Item name="enabled" label="Issue New Codes" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                            <Form.Item
                                name="shareable"
                                label="Allow Sharing"
                                valuePropName="checked"
                                extra="Off: only the account a code was sent to can redeem it."
                            >
                                <Switch />
                            </Form.Item>
                        </div>
                    </div>

                    <Alert
                        type="info"
                        showIcon
                        className="mb-4"
                        message="Codes already issued keep the percent, minimum and expiry they were issued with. These settings apply to codes issued from now on."
                    />

                    <Button className='mt-4!' type="primary" loading={saving} onClick={handleSave}>
                        Save Settings
                    </Button>
                </Form>
            )}
        </Card>
    );
}
