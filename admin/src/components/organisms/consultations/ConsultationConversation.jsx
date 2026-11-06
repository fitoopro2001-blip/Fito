import { useEffect, useRef, useState } from 'react';
import { Input, Button, Avatar } from 'antd';
import { SendOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons';

export default function ConsultationConversation({ messages, onSend }) {
    const bottomRef = useRef(null);
    const [draft, setDraft] = useState('');

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        const text = draft.trim();
        if (!text) return;
        onSend(text);
        setDraft('');
    };

    return (
        <div>
            <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
                {(messages || []).map((msg) => {
                    const isAdmin = msg.sender === 'dietitian';
                    return (
                        <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                            <Avatar
                                icon={isAdmin ? <MedicineBoxOutlined /> : <UserOutlined />}
                                className={isAdmin ? '!bg-primary-light !text-primary shrink-0' : '!bg-gray-100 !text-gray-600 shrink-0'}
                            />
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2 ${isAdmin ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                <p className="text-sm mb-1 whitespace-pre-wrap">{msg.text}</p>
                                <p className={`text-xs ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <div className="flex gap-2 mt-4">
                <Input
                    placeholder="Reply to the user..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onPressEnter={handleSend}
                />
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
                    Send
                </Button>
            </div>
        </div>
    );
}
