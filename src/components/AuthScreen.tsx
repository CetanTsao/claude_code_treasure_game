import { useState } from 'react';
import { Button } from './ui/button';

interface Props {
  onAuth: (token: string, username: string) => void;
  onGuest: () => void;
}

export default function AuthScreen({ onAuth, onGuest }: Props) {
  const [mode, setMode] = useState<'menu' | 'signin' | 'signup'>('menu');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    const base = import.meta.env.VITE_API_BASE ?? '';
    const endpoint = mode === 'signup' ? `${base}/api/signup` : `${base}/api/signin`;
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      onAuth(data.token, data.username);
    } catch {
      setError('Cannot reach server. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center gap-6 p-8">
        <h1 className="text-4xl text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-700">Sign in to save your scores or play as a guest.</p>
        <div className="flex flex-col gap-3 w-64">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => setMode('signin')}>
            Sign In
          </Button>
          <Button variant="outline" className="border-amber-600 text-amber-800" onClick={() => setMode('signup')}>
            Sign Up
          </Button>
          <Button variant="ghost" className="text-amber-600" onClick={onGuest}>
            Play as Guest
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl text-amber-900">{mode === 'signup' ? 'Create Account' : 'Sign In'}</h1>
      <div className="flex flex-col gap-3 w-72 bg-amber-200/80 p-6 rounded-xl border-2 border-amber-400 shadow-lg">
        <input
          className="px-3 py-2 rounded-lg border border-amber-300 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="px-3 py-2 rounded-lg border border-amber-300 bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={submit} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>
        <Button variant="ghost" className="text-amber-600 text-sm" onClick={() => { setMode('menu'); setError(''); }}>
          ← Back
        </Button>
      </div>
    </div>
  );
}
