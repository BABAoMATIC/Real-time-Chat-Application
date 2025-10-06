import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useChat } from '../store/chat';

export default function NewChat() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ id: string; username: string }[]>([]);
  const { openChat } = useChat();

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) return setResults([]);
      const res = await api.get('/users/search', { params: { username: q } });
      setResults(res.data);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function startChat(userId: string) {
    const res = await api.post('/chats/direct', { userId });
    await openChat(res.data.id);
  }

  return (
    <div style={{ padding: 8, borderBottom: '1px solid #eee' }}>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..." style={{ width: '100%' }} />
      {results.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 6, marginTop: 8 }}>
          {results.map((u) => (
            <div key={u.id} onClick={() => startChat(u.id)} style={{ padding: 8, cursor: 'pointer' }}>
              {u.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
