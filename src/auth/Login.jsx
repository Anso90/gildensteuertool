import { useState } from 'react';
import { supabase } from '../auth/supabaseClient';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    const email = `${username}@guild.local`; // automatisch ergänzt
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Falscher Benutzername oder Passwort.');
    } else {
      onLogin(data.user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="bg-gray-900 p-8 rounded shadow-md w-96 border border-obsRed">
        <h2 className="text-xl font-bold mb-6 text-white">Einloggen</h2>

        <input
          type="text"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700"
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-700"
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          onClick={handleLogin}
          className="bg-obsRed hover:bg-red-800 w-full py-2 rounded text-white font-bold"
        >
          Login
        </button>
      </div>
    </div>
  );
}
