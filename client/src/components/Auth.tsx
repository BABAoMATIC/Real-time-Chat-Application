import { useEffect, useState } from 'react';
import { useAuth } from '../store/auth';

export default function Auth() {
  const { login, register, hydrate, user } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error');
    }
  }

  if (user) return null;

  return (
    <div style={{ maxWidth: 360, margin: '48px auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2 style={{ marginBottom: 12 }}>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div style={{ color: 'red', fontSize: 12 }}>{error}</div>}
          <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Switch to Register' : 'Switch to Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
