import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../store/auth';
import { useChat } from '../store/chat';
import { createSocket } from '../lib/socket';
import NewChat from './NewChat';

export default function Chat() {
  const { user, token, logout } = useAuth();
  const { chats, activeChatId, messages, loadChats, openChat, sendMessage, setSocket, addIncomingMessage, setTyping, typing } = useChat();
  const [input, setInput] = useState('');

  const socket = useMemo(() => {
    if (!token) return null;
    const s = createSocket(token);
    s.on('connect', () => console.log('socket connected'));
    s.on('message:new', (msg) => addIncomingMessage(msg));
    s.on('chat:updated', () => loadChats());
    s.on('typing', ({ chatId, userId, typing }) => setTyping(chatId, userId, typing));
    setSocket(s);
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    loadChats();
    return () => { socket?.disconnect(); };
  }, [loadChats, socket]);

  if (!user) return null;

  const currentMessages = activeChatId ? messages[activeChatId] || [] : [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh' }}>
      <aside style={{ borderRight: '1px solid #eee', padding: 12, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <strong>{user.username}</strong>
          <button onClick={logout}>Logout</button>
        </div>
        <NewChat />
        <div>
          {chats.map((chat) => {
            const title = chat.isGroup
              ? chat.name || 'Group Chat'
              : chat.members.find((m) => m.user.id !== user.id)?.user.username || 'Direct Chat';
            const latest = chat.messages[0]?.content || '';
            const isActive = chat.id === activeChatId;
            return (
              <div key={chat.id} style={{ padding: 8, borderRadius: 6, background: isActive ? '#f0f7ff' : undefined, cursor: 'pointer' }}
                   onClick={() => openChat(chat.id)}>
                <div style={{ fontWeight: 600 }}>{title}</div>
                <div style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{latest}</div>
              </div>
            );
          })}
        </div>
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>
          {activeChatId ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {currentMessages.map((m) => (
                <div key={m.id} style={{ alignSelf: m.sender.id === user.id ? 'flex-end' : 'flex-start', background: '#f5f5f5', padding: 8, borderRadius: 8, maxWidth: '70%' }}>
                  <div style={{ fontSize: 11, color: '#888' }}>{m.sender.username}</div>
                  <div>{m.content}</div>
                </div>
              ))}
              {typing[activeChatId] && typing[activeChatId].size > 0 && (
                <div style={{ fontSize: 12, color: '#888' }}>typing...</div>
              )}
            </div>
          ) : (
            <div style={{ color: '#888' }}>Select a chat to start messaging</div>
          )}
        </div>
        {activeChatId && (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            sendMessage(activeChatId, input.trim());
            setInput('');
          }} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid #eee' }}>
            <input value={input} onChange={(e) => {
              setInput(e.target.value);
              if (activeChatId) {
                if (e.target.value) socket?.emit('typing:start', activeChatId);
                else socket?.emit('typing:stop', activeChatId);
              }
            }} placeholder="Type a message" style={{ flex: 1 }} />
            <button type="submit">Send</button>
          </form>
        )}
      </main>
    </div>
  );
}
