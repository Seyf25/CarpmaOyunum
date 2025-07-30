import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { audioManager } from './AudioManager';
import { DIFFICULTY_LEVELS, getAllTables, getDifficultyByTable, getTableColor, getDifficultyName } from '../utils/difficultyLevels';

interface MultiplicationTableSelectorProps {
  playerName: string;
  onTableSelect: (table: number) => void;
  onBack: () => void;
}

export function MultiplicationTableSelector({ 
  playerName, 
  onTableSelect, 
  onBack 
}: MultiplicationTableSelectorProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const allTables = getAllTables();

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber);
    audioManager.playLevelSelect();
  };

  const handleStartGame = () => {
    if (selectedTable) {
      audioManager.playGameStart();
      onTableSelect(selectedTable);
    }
  };

  return (
    <div className="size-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-400 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-4 border-white/20 backdrop-blur-sm bg-white/10">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">
            🔢 Çarpım Tablosu Seçin
          </CardTitle>
          <p className="text-center text-emerald-100 mt-2">
            Merhaba {playerName}! Hangi çarpım tablosunu öğrenmek istiyorsunuz?
          </p>
        </CardHeader>
        <CardContent className="p-8 bg-white rounded-b-lg">
          <div className="space-y-6">
            {/* Yeni Zorluk Açıklaması */}
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">
                🏅 Yeni Zorluk Seviyeleri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                  <div className="text-center">
                    <Badge className="bg-green-100 text-green-800 mb-2">🌱 Kolay</Badge>
                    <p className="text-sm font-semibold text-green-800">2, 5, 10 Tabloları</p>
                    <p className="text-xs text-green-600 mt-1">Başlangıç seviyesi</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
                  <div className="text-center">
                    <Badge className="bg-yellow-100 text-yellow-800 mb-2">⚡ Orta</Badge>
                    <p className="text-sm font-semibold text-yellow-800">3, 4, 6 Tabloları</p>
                    <p className="text-xs text-yellow-600 mt-1">Orta seviye</p>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border-2 border-red-200">
                  <div className="text-center">
                    <Badge className="bg-red-100 text-red-800 mb-2">🔥 Zor</Badge>
                    <p className="text-sm font-semibold text-red-800">7, 8, 9 Tabloları</p>
                    <p className="text-xs text-red-600 mt-1">İleri seviye</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Çarpım Tablosu Grid */}
            <div className="grid grid-cols-3 gap-4">
              {allTables.map((table) => {
                const difficulty = getDifficultyByTable(table);
                const difficultyConfig = DIFFICULTY_LEVELS[difficulty];
                
                return (
                  <button
                    key={table}
                    onClick={() => handleTableSelect(table)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      selectedTable === table
                        ? difficultyConfig.color + ' shadow-lg ring-4 ring-blue-300'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="text-3xl font-bold mb-2">
                        {table}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {table} Tablosu
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${selectedTable === table ? 'bg-white/50' : ''}`}
                      >
                        {difficultyConfig.icon} {difficultyConfig.name}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Seçilen Tablo Örneği */}
            {selectedTable && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                <h4 className="text-lg font-semibold text-center text-gray-800 mb-4">
                  📋 {selectedTable} Tablosu Örneği
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[1, 2, 3, 4, 5].map(num => (
                    <div key={num} className="text-center py-2 bg-white rounded font-medium">
                      {selectedTable} × {num} = {selectedTable * num}
                    </div>
                  ))}
                  <div className="text-center py-2 bg-gray-100 rounded text-gray-600 col-span-2">
                    ... ve daha fazlası
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <Badge className={getTableColor(selectedTable)}>
                    {getDifficultyName(selectedTable)} Seviye
                  </Badge>
                </div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  audioManager.playClick();
                  onBack();
                }}
                variant="outline"
                className="flex-1 py-3 text-lg font-semibold border-2"
              >
                ⬅️ Geri Dön
              </Button>
              
              <Button
                onClick={handleStartGame}
                disabled={!selectedTable}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
              >
                🚀 Oyuna Başla!
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}