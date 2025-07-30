import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface PlayerNameProps {
  onNameSet: (name: string) => void;
  onBack: () => void;
}

export function PlayerName({ onNameSet, onBack }: PlayerNameProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSet(name.trim());
    }
  };

  return (
    <div className="size-full bg-gradient-to-b from-purple-400 via-pink-300 to-orange-200 flex items-center justify-center">
      <Card className="w-96 shadow-2xl border-4 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">
            👤 Oyuncu Adı
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adınızı girin:
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Oyuncu adı..."
                className="w-full text-center text-lg"
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                En fazla 20 karakter
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg font-semibold"
              >
                Devam Et
              </Button>
              
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="w-full py-3 text-lg font-semibold"
              >
                Geri Dön
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}