import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { audioManager } from './AudioManager';
import { AuthService } from '../utils/authService';

interface ScoreEntry {
  id: string;
  username: string;
  score: number;
  table: number;
  date: string;
  total_time: number;
}

interface ScoreBoardProps {
  onBack: () => void;
}

export function ScoreBoard({ onBack }: ScoreBoardProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Updated difficulty categories: 2,5,10=Easy, 3,4,6=Medium, 7,8,9=Hard
  const getTablesByCategory = (category: 'easy' | 'medium' | 'hard') => {
    switch (category) {
      case 'easy': return [2, 5, 10];
      case 'medium': return [3, 4, 6];
      case 'hard': return [7, 8, 9];
      default: return [];
    }
  };

  const loadScores = async (category: 'all' | 'easy' | 'medium' | 'hard' = 'all') => {
    setLoading(true);
    setError(null);
    
    try {
      const scores = await AuthService.getScores(category);
      setScores(scores || []);
    } catch (err: any) {
      console.error('Error loading scores:', err);
      setError('Skorlar yüklenirken hata oluştu');
      setScores([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadScores(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (category: 'all' | 'easy' | 'medium' | 'hard') => {
    setSelectedCategory(category);
    loadScores(category);
  };

  const getTableColor = (table: number) => {
    // Updated for new difficulty system: 2,5,10=Easy, 3,4,6=Medium, 7,8,9=Hard
    if ([2, 5, 10].includes(table)) return 'bg-green-100 text-green-800';
    if ([3, 4, 6].includes(table)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreColor = (score: number) => {
    if (score === 10) return 'text-yellow-600';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getMedal = (index: number, score: number) => {
    if (score === 10) {
      if (index === 0) return '🥇';
      if (index === 1) return '🥈';
      if (index === 2) return '🥉';
    }
    return '';
  };

  const getCategoryTitle = (category: 'all' | 'easy' | 'medium' | 'hard') => {
    switch (category) {
      case 'all': return 'Tüm Kategoriler';
      case 'easy': return 'Kolay (2,5,10 Tabloları)';
      case 'medium': return 'Orta (3,4,6 Tabloları)';
      case 'hard': return 'Zor (7,8,9 Tabloları)';
      default: return '';
    }
  };

  const getCategoryIcon = (category: 'all' | 'easy' | 'medium' | 'hard') => {
    switch (category) {
      case 'all': return '🌟';
      case 'easy': return '🌱';
      case 'medium': return '⚡';
      case 'hard': return '🔥';
      default: return '📊';
    }
  };

  const ScoreList = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Skorlar yükleniyor...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">❌</div>
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => loadScores(selectedCategory)}
            className="mt-4"
            variant="outline"
          >
            🔄 Tekrar Dene
          </Button>
        </div>
      );
    }

    if (scores.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-600">Bu kategoride henüz skor yok!</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Başlık (sadece masaüstü) */}
        <div className="hidden md:grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-600">
          <div>Sıra</div>
          <div>Oyuncu</div>
          <div>Skor</div>
          <div>Tablo</div>
          <div>Süre</div>
          <div>Tarih</div>
        </div>

        {/* Skorlar */}
        {scores.map((score, index) => (
          <div
            key={score.id}
            className={`grid grid-cols-2 md:grid-cols-6 gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              index < 3 && score.score === 10
                ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300'
                : score.score === 10
                ? 'bg-yellow-50 border-yellow-200'
                : score.score >= 8
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* Sıra */}
            <div className="flex items-center gap-2">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-orange-500' :
                'bg-blue-500'
              }`}>
                {index + 1}
              </span>
              <span className="text-lg">{getMedal(index, score.score)}</span>
            </div>

            {/* Oyuncu */}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">
                {score.username}
              </span>
              <span className="text-xs text-gray-500 md:hidden">
                {new Date(score.date).toLocaleDateString('tr-TR')}
              </span>
            </div>

            {/* Skor */}
            <div className="flex items-center">
              <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                {score.score}/10
              </span>
            </div>

            {/* Tablo */}
            <div className="flex items-center">
              <Badge className={getTableColor(score.table)}>
                {score.table} Tablosu
              </Badge>
            </div>

            {/* Süre */}
            <div className="flex items-center">
              <span className="text-gray-600">
                {Math.floor(score.total_time / 60)}:{(score.total_time % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Tarih (sadece masaüstü) */}
            <div className="hidden md:flex items-center">
              <span className="text-sm text-gray-500">
                {new Date(score.date).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="size-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10 max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">
            🏆 Skor Tablosu
          </CardTitle>
          <p className="text-center text-amber-100 mt-2">
            Çarpım tablosu kategorilerine göre en iyi performanslar
          </p>
        </CardHeader>
        <CardContent className="p-6 bg-white rounded-b-lg overflow-y-auto">
          <div className="w-full">
            {/* Category Selector */}
            <div className="grid grid-cols-4 gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
              {[
                { value: 'all', icon: '🌟', label: 'Tümü' },
                { value: 'easy', icon: '🌱', label: 'Kolay' },
                { value: 'medium', icon: '⚡', label: 'Orta' },
                { value: 'hard', icon: '🔥', label: 'Zor' }
              ].map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value as 'all' | 'easy' | 'medium' | 'hard')}
                  className={`py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    selectedCategory === category.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              ))}
            </div>

            {/* Category Content */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedCategory === 'all' && '🌟 Tüm Kategoriler'}
                  {selectedCategory === 'easy' && '🌱 Kolay Seviye'}
                  {selectedCategory === 'medium' && '⚡ Orta Seviye'}
                  {selectedCategory === 'hard' && '🔥 Zor Seviye'}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedCategory === 'all' && 'Tüm çarpım tablosu kategorilerinden en iyi skorlar'}
                  {selectedCategory === 'easy' && '2, 5, 10 çarpım tabloları'}
                  {selectedCategory === 'medium' && '3, 4, 6 çarpım tabloları'}
                  {selectedCategory === 'hard' && '7, 8, 9 çarpım tabloları'}
                </p>
              </div>
              <ScoreList />
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex gap-3 mt-6 pt-4 border-t-2">
            <Button
              onClick={() => {
                audioManager.playClick();
                onBack();
              }}
              className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 text-lg font-semibold"
            >
              🏠 Ana Menü
            </Button>
            
            <Button
              onClick={() => loadScores(selectedCategory)}
              variant="outline"
              className="px-6 py-3 text-blue-600 border-blue-300 hover:bg-blue-50 border-2"
            >
              🔄 Yenile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}