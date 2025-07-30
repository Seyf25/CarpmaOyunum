import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { audioManager } from './AudioManager';
import { UserManager } from './UserManager';

interface PlayerNameInputProps {
  onNameSubmit: (name: string) => void;
  onBack: () => void;
}

export function PlayerNameInput({ onNameSubmit, onBack }: PlayerNameInputProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<string[]>([]);

  useEffect(() => {
    // Kayıtlı kullanıcıları yükle
    const users = UserManager.getRegisteredUsers();
    setRegisteredUsers(users);
    
    // Mevcut kullanıcıyı kontrol et
    const currentUser = UserManager.getCurrentUser();
    if (currentUser) {
      setName(currentUser);
      setIsReturningUser(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name.trim().length < 2) {
      setError('İsim en az 2 karakter olmalıdır');
      audioManager.playWrongAnswer();
      return;
    }
    
    if (name.trim().length > 15) {
      setError('İsim en fazla 15 karakter olabilir');
      audioManager.playWrongAnswer();
      return;
    }

    const trimmedName = name.trim();

    // Eğer mevcut kullanıcı değilse ve kullanıcı adı alınmışsa
    if (!isReturningUser && UserManager.isUsernameTaken(trimmedName)) {
      setError('Bu kullanıcı adı zaten alınmış! Lütfen farklı bir ad seçin.');
      audioManager.playWrongAnswer();
      return;
    }

    // Yeni kullanıcı kaydı
    if (!isReturningUser) {
      const registered = UserManager.registerUser(trimmedName);
      if (!registered) {
        setError('Kullanıcı kayıt edilemedi. Lütfen tekrar deneyin.');
        audioManager.playWrongAnswer();
        return;
      }
    } else {
      // Mevcut kullanıcı girişi
      UserManager.setCurrentUser(trimmedName);
    }

    audioManager.playCorrectAnswer();
    onNameSubmit(trimmedName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setError('');
    
    // Kullanıcı adı değiştiğinde mevcut kullanıcı durumunu kontrol et
    const currentUser = UserManager.getCurrentUser();
    setIsReturningUser(currentUser === newName.trim());
  };

  const handleUserSelect = (username: string) => {
    setName(username);
    setIsReturningUser(true);
    audioManager.playClick();
  };

  const handleNewUser = () => {
    setName('');
    setIsReturningUser(false);
    audioManager.playClick();
  };

  const handleLogout = () => {
    UserManager.logout();
    setName('');
    setIsReturningUser(false);
    setRegisteredUsers(UserManager.getRegisteredUsers());
    audioManager.playClick();
  };

  return (
    <div className="size-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">
            📊 Çarpım Tablosu Oyunu
          </CardTitle>
          <p className="text-center text-indigo-100 mt-2">
            Matematik macerası başlıyor!
          </p>
        </CardHeader>
        <CardContent className="p-8 bg-white rounded-b-lg">
          {/* Kayıtlı Kullanıcılar */}
          {registeredUsers.length > 0 && !isReturningUser && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                🔁 Kayıtlı Kullanıcılar
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {registeredUsers.slice(0, 6).map((user, index) => (
                  <Button
                    key={index}
                    onClick={() => handleUserSelect(user)}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-purple-200 hover:bg-purple-50"
                  >
                    {user}
                  </Button>
                ))}
              </div>
              {registeredUsers.length > 6 && (
                <p className="text-xs text-gray-500 text-center">
                  ve {registeredUsers.length - 6} kullanıcı daha...
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isReturningUser ? '👋 Tekrar Hoş Geldiniz!' : '🆕 Yeni Kullanıcı'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {isReturningUser 
                  ? 'Devam etmek için adınızı onaylayın' 
                  : 'Skor tablosuna kaydedilmek için yeni bir ad seçin'
                }
              </p>
              
              {isReturningUser && (
                <Badge className="bg-green-100 text-green-800 mb-4">
                  Kayıtlı Kullanıcı
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <Input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder={isReturningUser ? "Kullanıcı adınız..." : "Yeni kullanıcı adı..."}
                className="text-center text-lg py-6"
                maxLength={15}
                autoFocus
              />
              
              {error && (
                <p className="text-red-500 text-sm text-center animate-pulse">
                  {error}
                </p>
              )}
              
              <p className="text-xs text-gray-500 text-center">
                2-15 karakter arası
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={name.trim().length < 2}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
              >
                {isReturningUser ? 'Devam Et ➡️' : 'Kayıt Ol ➡️'}
              </Button>
              
              {isReturningUser && (
                <Button
                  type="button"
                  onClick={handleNewUser}
                  variant="outline"
                  className="w-full py-3 text-lg font-semibold border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  🆕 Yeni Kullanıcı
                </Button>
              )}
              
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="w-full py-3 text-lg font-semibold border-2"
              >
                ⬅️ Geri Dön
              </Button>
            </div>
          </form>

          {/* Çıkış Yapma */}
          {isReturningUser && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="w-full text-red-600 hover:bg-red-50"
              >
                🚪 Çıkış Yap
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}