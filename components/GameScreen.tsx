import { useState, useEffect, useCallback } from 'react';
import { Bird } from './Bird';
import { Timer } from './Timer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { audioManager } from './AudioManager';
import { AuthService } from '../utils/authService';
import { getTableColor, getDifficultyName } from '../utils/difficultyLevels';

interface Question {
  multiplier: number;
  multiplicand: number;
  correctAnswer: number;
  options: number[];
}

interface GameScreenProps {
  playerName: string;
  multiplicationTable: number;
  onGameEnd: (score: number, totalTime: number) => void;
  onBackToMenu: () => void;
}

export function GameScreen({ 
  playerName, 
  multiplicationTable, 
  onGameEnd, 
  onBackToMenu 
}: GameScreenProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [totalGameTime, setTotalGameTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(true);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Çarpım tablosundaki tüm sayıları kullanmak için karışık liste
  const generateQuestionNumbers = useCallback(() => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return [...numbers].sort(() => Math.random() - 0.5); // Karıştır
  }, []);

  const [questionNumbers] = useState(() => generateQuestionNumbers());

  const generateQuestion = useCallback((): Question => {
    const multiplicand = questionNumbers[questionNumber - 1] || Math.floor(Math.random() * 10) + 1;
    const correctAnswer = multiplicationTable * multiplicand;
    
    // Yanlış cevaplar oluştur
    const options = [correctAnswer];
    const used = new Set([correctAnswer]);
    
    while (options.length < 4) {
      let wrongAnswer;
      const variation = Math.floor(Math.random() * 15) + 1;
      
      if (Math.random() > 0.5) {
        wrongAnswer = correctAnswer + variation;
      } else {
        wrongAnswer = Math.max(1, correctAnswer - variation);
      }
      
      // Çarpım tablosundan başka bir doğru cevap olmasın
      if (!used.has(wrongAnswer) && wrongAnswer !== multiplicationTable * (multiplicand + 1) && 
          wrongAnswer !== multiplicationTable * (multiplicand - 1)) {
        options.push(wrongAnswer);
        used.add(wrongAnswer);
      }
    }
    
    // Seçenekleri karıştır
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    return {
      multiplier: multiplicationTable,
      multiplicand,
      correctAnswer,
      options: shuffledOptions
    };
  }, [multiplicationTable, questionNumber, questionNumbers]);

  const getTimeForQuestion = (qNum: number) => {
    // İlk sorular daha uzun süre
    if (qNum <= 3) return 25;
    if (qNum <= 6) return 20;
    if (qNum <= 8) return 18;
    return 15;
  };

  useEffect(() => {
    if (isGameActive) {
      const newQuestion = generateQuestion();
      setCurrentQuestion(newQuestion);
      setTimeLeft(getTimeForQuestion(questionNumber));
      setShowFeedback(null);
    }
  }, [questionNumber, isGameActive, generateQuestion]);

  // Toplam oyun süresini takip et
  useEffect(() => {
    if (isGameActive) {
      const timer = setInterval(() => {
        setTotalGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameActive]);

  // Müziği başlat
  useEffect(() => {
    audioManager.startBackgroundMusic();
    return () => audioManager.stopBackgroundMusic();
  }, []);

  const saveScore = async (finalScore: number) => {
    if (isSaving) return; // Çift kaydetme önleme
    
    setIsSaving(true);
    
    try {
      const success = await AuthService.saveScore({
        score: finalScore,
        table: multiplicationTable,
        totalTime: totalGameTime
      });
      
      if (success) {
        console.log('Score saved successfully');
      } else {
        console.error('Failed to save score');
      }
    } catch (error) {
      console.error('Error saving score:', error);
      // Hata olsa da oyunu devam ettirebiliriz
    }
    
    setIsSaving(false);
  };

  const handleAnswer = (answer: number) => {
    if (!currentQuestion || !isGameActive) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setShowFeedback('correct');
      audioManager.playCorrectAnswer();
    } else {
      setShowFeedback('wrong');
      audioManager.playWrongAnswer();
    }

    // Feedback göster ve sonra devam et
    setTimeout(async () => {
      if (questionNumber >= 10) {
        setIsGameActive(false);
        audioManager.stopBackgroundMusic();
        
        const finalScore = score + (isCorrect ? 1 : 0);
        
        // Skoru veritabanına kaydet
        await saveScore(finalScore);
        
        if (finalScore === 10) {
          audioManager.playPerfectScore();
        } else {
          audioManager.playGameOver();
        }
        
        onGameEnd(finalScore, totalGameTime);
      } else {
        setQuestionNumber(questionNumber + 1);
      }
    }, 1500);
  };

  const handleTimeUp = async () => {
    setIsGameActive(false);
    audioManager.stopBackgroundMusic();
    
    // Skoru veritabanına kaydet
    await saveScore(score);
    
    audioManager.playGameOver();
    onGameEnd(score, totalGameTime);
  };

  if (!currentQuestion) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-2xl font-semibold">Sorular hazırlanıyor...</p>
          {isSaving && (
            <p className="text-lg mt-2 text-blue-200">Skor kaydediliyor...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="size-full bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 relative overflow-hidden">
      {/* Animasyonlu bulutlar */}
      <div className="absolute top-10 left-20 w-20 h-12 bg-white/30 rounded-full animate-pulse"></div>
      <div className="absolute top-20 right-32 w-24 h-14 bg-white/25 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-32 left-1/2 w-28 h-16 bg-white/20 rounded-full animate-pulse delay-500"></div>

      {/* Feedback Overlay */}
      {showFeedback && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`text-8xl animate-bounce ${
            showFeedback === 'correct' ? 'text-green-400' : 'text-red-400'
          }`}>
            {showFeedback === 'correct' ? '✅' : '❌'}
          </div>
        </div>
      )}

      {/* Timer */}
      <Timer 
        initialTime={timeLeft} 
        onTimeUp={handleTimeUp} 
        isActive={isGameActive && !showFeedback}
      />

      {/* Oyuncu bilgileri */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border-2 border-white/20">
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600">👤 {playerName}</div>
          <Badge className={getTableColor(multiplicationTable)}>
            {multiplicationTable} Tablosu
          </Badge>
          <div className="text-xs text-gray-500">
            {getDifficultyName(multiplicationTable)} Seviye
          </div>
          <div className="text-sm text-gray-600">Soru {questionNumber}/10</div>
          <div className="text-xl font-bold text-blue-600">🏆 {score}</div>
          
          {/* Skor kaydetme durumu */}
          {isSaving && (
            <div className="text-xs text-orange-600 animate-pulse">
              💾 Kaydediliyor...
            </div>
          )}
        </div>
      </div>

      {/* Kontroller */}
      <div className="absolute top-4 right-4 flex gap-3">
        <Button 
          onClick={() => {
            audioManager.playClick();
            audioManager.stopBackgroundMusic();
            onBackToMenu();
          }}
          variant="outline" 
          className="bg-white/90 hover:bg-white border-2 border-white/20 backdrop-blur-sm"
        >
          🏠 Menü
        </Button>
      </div>

      {/* Uçan Kuşlar */}
      <div className="absolute inset-0">
        {currentQuestion.options.map((option, index) => (
          <Bird
            key={`${questionNumber}-${index}`}
            answer={option}
            isCorrect={option === currentQuestion.correctAnswer}
            onAnswer={handleAnswer}
            position={index}
          />
        ))}
      </div>

      {/* Soru */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-2xl px-10 py-8 shadow-2xl border-4 border-white/30">
        <div className="text-center space-y-4">
          <div className="text-lg text-gray-600">Doğru cevabı seçin:</div>
          <div className="text-5xl font-bold text-gray-800">
            {currentQuestion.multiplier} × {currentQuestion.multiplicand} = ?
          </div>
          <div className="text-sm text-gray-500">
            {multiplicationTable} çarpım tablosundan ({getDifficultyName(multiplicationTable)} seviye)
          </div>
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-80">
        <div className="bg-white/30 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500"
            style={{ width: `${(questionNumber / 10) * 100}%` }}
          ></div>
        </div>
        <div className="text-center text-white text-sm mt-2">
          {questionNumber}/10 Soru
        </div>
      </div>
    </div>
  );
}