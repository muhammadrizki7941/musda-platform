import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { apiCall } from '../../config/api';

export function AdminLogin({ onLogin }: { onLogin?: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })  // Kirim username
      });
      
      if (result.token) {
        localStorage.setItem('token', result.token);
        // Simpan data user ke localStorage jika tersedia
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        if (onLogin) onLogin();
        window.location.href = '/admin';
      } else {
        setError(result.error || 'Login gagal.');
      }
    } catch (err) {
      setError('Terjadi error jaringan.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-900/80 border-yellow-500/40 shadow-2xl backdrop-blur-lg">
          <CardHeader className="flex flex-col items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center rounded-full shadow-lg mb-2"
              style={{ clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)' }}
            >
              <img src="/images/logo-himperra.png" alt="Logo HIMPERRA" className="w-10 h-10 object-contain" />
            </motion.div>
            <CardTitle className="text-yellow-300 text-2xl font-bold">Admin Login</CardTitle>
            <span className="text-gray-400 text-sm">HIMPERRA Lampung</span>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="username" className="text-yellow-400">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="mt-2 bg-gray-800 text-yellow-100 border-yellow-500/30 focus:border-yellow-400"
                  required
                  autoFocus
                  placeholder="admin"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-yellow-400">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="mt-2 bg-gray-800 text-yellow-100 border-yellow-500/30 focus:border-yellow-400"
                  required
                />
              </div>
              {error && <div className="text-red-400 text-sm text-center">{error}</div>}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-bold py-3 mt-2 shadow-lg hover:from-yellow-400 hover:to-yellow-500"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
