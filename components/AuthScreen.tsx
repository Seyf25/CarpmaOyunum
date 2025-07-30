import { useState } from 'react';

interface AuthScreenProps {
  onAuthSuccess: (username: string) => void;
  onBack: () => void;
}

export function AuthScreen({ onAuthSuccess, onBack }: AuthScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    if (username.trim().length >= 2 && password.trim().length >= 6) {
      onAuthSuccess(username.trim());
    }
  };

  return (
    <div className="size-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">🔐 Kullanıcı Girişi</h1>
        
        <div className="space-y-4">
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adı (en az 2 karakter)"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifre (en az 6 karakter)"
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
          
          <button 
            onClick={handleSubmit}
            disabled={username.length < 2 || password.length < 6}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            🚀 Giriş Yap
          </button>
          
          <button 
            onClick={onBack}
            className="w-full bg-gray-300 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-400"
          >
            ⬅️ Ana Menü
          </button>
        </div>
      </div>
    </div>
  );
}