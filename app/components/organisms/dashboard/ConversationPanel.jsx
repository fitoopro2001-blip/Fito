'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, Typography, Input, Button, Avatar, message as antdMessage } from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from '@ant-design/icons';

import { sendConsultationMessage } from '@/services/consultation.service';

const { Title, Text, Paragraph } = Typography;

// The real API's conversation entries use authorType: 'admin' | 'user'; this
// panel only ever dealt with sender: 'dietitian' | 'user', so bridge the two.
const toView = (entry) => ({
  id: entry.id,
  sender: entry.authorType === 'admin' ? 'dietitian' : 'user',
  text: entry.message,
  timestamp: entry.createdAt,
});

export default function ConversationPanel({ consultation }) {
  const [messages, setMessages] = useState(() =>
    (consultation.conversation || []).map(toView)
  );
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text) return;

    setSending(true);
    try {
      const updated = await sendConsultationMessage(consultation.id, text);
      setMessages((updated.conversation || []).map(toView));
      setDraft('');
    } catch {
      antdMessage.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10 rounded-3xl mt-8">

      <Title level={5} className="!text-white !mb-4">
        Conversation with your Dietitian
      </Title>

      <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
        {(messages || []).map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <Avatar
                icon={isUser ? <UserOutlined /> : <MedicineBoxOutlined />}
                className={
                  isUser
                    ? '!bg-yellow-400 !text-black shrink-0'
                    : '!bg-white/10 !text-white shrink-0'
                }
              />

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isUser ? 'bg-yellow-400' : 'bg-white/10'
                }`}
              >
                <Paragraph
                  className={`!mb-1 ${isUser ? '!text-black' : '!text-white'}`}
                >
                  {msg.text}
                </Paragraph>
                <Text
                  className={`!text-xs ${
                    isUser ? '!text-black/60' : '!text-gray-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleString()}
                </Text>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3 mt-6">
        <Input
          placeholder="Type a message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onPressEnter={sendMessage}
          disabled={sending}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={sendMessage} loading={sending}>
          Send
        </Button>
      </div>

    </Card>
  );
}
