import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Operation = 'multiplication' | 'addition' | 'subtraction';

interface GameSettingsProps {
  playerName: string;
  onStartGame: (difficulty: Difficulty, operation: Operation) => void;
  onBack: () => void;
}

export function GameSettings({ playerName, onStartGame, onBack }: GameSettingsProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedOperation, setSelectedOperation] = useState<Operation>('multiplication');

  const difficulties = [
    {
      id: 'easy' as Difficulty,
      name: 'Kolay',
      description: 'Küçük sayılar, fazla süre',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: '🌱'
    },
    {
      id: 'medium' as Difficulty,
      name: 'Orta',
      description: 'Orta sayılar, normal süre',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: '⚡'
    },
    {
      id: 'hard' as Difficulty,
      name: 'Zor',
      description: 'Büyük sayılar, az süre',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: '🔥'
    }
  ];

  const operations = [
    {
      id: 'multiplication' as Operation,
      name: 'Çarpma',
      symbol: '×',
      description: 'Sayıları çarpın',
      color: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    {
      id: 'addition' as Operation,
      name: 'Toplama',
      symbol: '+',
      description: 'Sayıları toplayın',
      color: 'bg-purple-100 text-purple-800 border-purple-300'
    },
    {
      id: 'subtraction' as Operation,
      name: 'Çıkarma',
      symbol: '−',
      description: 'Sayıları çıkarın',
      color: 'bg-pink-100 text-pink-800 border-pink-300'
    }
  ];

  return (
    <div className="size-full bg-gradient-to-b from-purple-400 via-pink-300 to-orange-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-4 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">
            ⚙️ Oyun Ayarları
          </CardTitle>
          <p className="text-center text-purple-100 mt-2">
            Merhaba, {playerName}! 👋
          </p>
        </CardHeader>
        <CardContent className="p-6 bg-white">
          <div className="space-y-8">
            {/* Zorluk Seviyesi */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Zorluk Seviyesi Seçin:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.id}
                    onClick={() => setSelectedDifficulty(difficulty.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedDifficulty === difficulty.id
                        ? difficulty.color + ' border-current shadow-lg'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{difficulty.icon}</div>
                      <div className="font-bold text-lg">{difficulty.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {difficulty.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* İşlem Türü */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                İşlem Türü Seçin:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {operations.map((operation) => (
                  <button
                    key={operation.id}
                    onClick={() => setSelectedOperation(operation.id)}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedOperation === operation.id
                        ? operation.color + ' border-current shadow-lg'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">{operation.symbol}</div>
                      <div className="font-bold text-lg">{operation.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {operation.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Seçilen Ayarlar Özeti */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">Seçilen Ayarlar:</h4>
              <div className="flex gap-2">
                <Badge className={difficulties.find(d => d.id === selectedDifficulty)?.color}>
                  {difficulties.find(d => d.id === selectedDifficulty)?.name}
                </Badge>
                <Badge className={operations.find(o => o.id === selectedOperation)?.color}>
                  {operations.find(o => o.id === selectedOperation)?.name}
                </Badge>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex gap-3">
              <Button
                onClick={onBack}
                variant="outline"
                className="flex-1 py-3 text-lg font-semibold"
              >
                Geri Dön
              </Button>
              
              <Button
                onClick={() => onStartGame(selectedDifficulty, selectedOperation)}
                className="flex-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg font-semibold"
              >
                Oyunu Başlat! 🚀
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}