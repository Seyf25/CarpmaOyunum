import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface Score {
  id: string;
  playerName: string;
  score: number;
  difficulty: 'easy' | 'medium' | 'hard';
  operation: 'multiplication' | 'addition' | 'subtraction';
  date: string;
}

interface HighScoresProps {
  onBack: () => void;
}

export function HighScores({ onBack }: HighScoresProps) {
  const getScores = (): Score[] => {
    const saved = localStorage.getItem('multiplicationGameScores');
    return saved ? JSON.parse(saved) : [];
  };

  const scores = getScores()
    .sort((a, b) => b.score - a.score || new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'multiplication': return '×';
      case 'addition': return '+';
      case 'subtraction': return '−';
      default: return '×';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Kolay';
      case 'medium': return 'Orta';
      case 'hard': return 'Zor';
      default: return 'Kolay';
    }
  };

  const clearScores = () => {
    if (confirm('Tüm skorları silmek istediğinize emin misiniz?')) {
      localStorage.removeItem('multiplicationGameScores');
      window.location.reload();
    }
  };

  return (
    <div className="size-full bg-gradient-to-b from-purple-400 via-pink-300 to-orange-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-4 border-purple-300">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">
            🏆 En Yüksek Skorlar 🏆
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-white max-h-96 overflow-y-auto">
          {scores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">
                Henüz kayıtlı skor yok.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                İlk oyununuzu oynayın!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    index === 0 ? 'bg-yellow-50 border-yellow-300' :
                    index === 1 ? 'bg-gray-50 border-gray-300' :
                    index === 2 ? 'bg-orange-50 border-orange-300' :
                    'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-500 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-blue-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{score.playerName}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getDifficultyColor(score.difficulty)}>
                          {getDifficultyText(score.difficulty)}
                        </Badge>
                        <Badge variant="outline">
                          {getOperationIcon(score.operation)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {score.score}/10
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(score.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              onClick={onBack}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg font-semibold"
            >
              Ana Menü
            </Button>
            
            {scores.length > 0 && (
              <Button
                onClick={clearScores}
                variant="outline"
                className="px-4 py-3 text-red-600 border-red-300 hover:bg-red-50"
              >
                Skorları Sil
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}