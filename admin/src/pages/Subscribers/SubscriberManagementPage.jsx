import { useState } from 'react';
import { Button, Input, message } from 'antd';
import Modal from '../../components/atoms/AppModal';
import { MailOutlined } from '@ant-design/icons';
import PageHeading from '../../components/atoms/PageHeading';
import SearchBar from '../../components/molecules/SearchBar';
import ConfirmDeleteButton from '../../components/molecules/ConfirmDeleteButton';
import DataTable from '../../components/organisms/DataTable';
import RichTextEditor from '../../components/molecules/RichTextEditor';
import useServerTableQuery from '../../hooks/useServerTableQuery';
import {
    fetchSubscribers,
    sendBroadcast as sendBroadcastApi,
    deleteSubscriber as deleteSubscriberApi,
} from '../../api/adminSubscribers.api';

const apiError = (err, fallback) => err?.response?.data?.message || fallback;

export default function SubscriberManagementPage() {
    const serverQuery = useServerTableQuery(fetchSubscribers);

    const subscribers = serverQuery.items;
    const searchText = serverQuery.searchInput;
    const setSearchText = serverQuery.setSearchInput;
    const loading = serverQuery.loading;
    const subscriberCount = serverQuery.total;

    const [composeOpen, setComposeOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);

    const closeCompose = () => {
        setComposeOpen(false);
        setSubject('');
        setBody('');
    };

    const handleSend = async () => {
        if (!subject.trim() || !body.trim()) {
            message.warning('Write a subject and message first');
            return;
        }

        setSending(true);
        try {
            const { sent, failed } = await sendBroadcastApi({ subject, message: body });
            message[failed ? 'warning' : 'success'](
                failed ? `Sent to ${sent}, failed for ${failed}` : `Sent to ${sent} subscriber(s)`
            );
            closeCompose();
        } catch (err) {
            message.error(apiError(err, 'Failed to send email'));
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteSubscriberApi(id);
            serverQuery.refetch();
            message.success('Subscriber removed');
        } catch (err) {
            message.error(apiError(err, 'Failed to remove subscriber'));
        }
    };

    const columns = [
        { title: 'Email', dataIndex: 'email' },
        {
            title: 'Subscribed On',
            dataIndex: 'createdAt',
            render: (date) => (date ? new Date(date).toLocaleDateString() : '—'),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <ConfirmDeleteButton onConfirm={() => handleDelete(record.id)} title="Remove this subscriber?" />
            ),
        },
    ];

    return (
        <div>
            <PageHeading
                title="Newsletter Subscribers"
                subtitle="Everyone who signed up for the newsletter on the site"
                actions={
                    <>
                        <SearchBar value={searchText} onChange={setSearchText} placeholder="Search subscribers..." />
                        <Button
                            type="primary"
                            icon={<MailOutlined />}
                            disabled={!subscriberCount}
                            onClick={() => setComposeOpen(true)}
                        >
                            Send Email
                        </Button>
                    </>
                }
            />

            <DataTable
                columns={columns}
                data={subscribers}
                loading={loading}
                pagination={{ ...serverQuery.pagination, total: serverQuery.total }}
                onChange={serverQuery.handleTableChange}
            />

            <Modal
                open={composeOpen}
                title={`Email ${subscriberCount} Subscriber${subscriberCount === 1 ? '' : 's'}`}
                onCancel={closeCompose}
                onOk={handleSend}
                okText="Send"
                okButtonProps={{ loading: sending }}
                width={640}
                centered
            >
                <Input
                    placeholder="Subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mb-3!"
                />
                <RichTextEditor value={body} onChange={setBody} placeholder="Write your email..." />
            </Modal>
        </div>
    );
}
