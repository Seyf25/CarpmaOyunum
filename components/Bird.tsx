import { motion } from 'motion/react';
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface BirdProps {
  answer: number;
  isCorrect: boolean;
  onAnswer: (answer: number) => void;
  position: number;
}

export function Bird({ answer, isCorrect, onAnswer, position }: BirdProps) {
  const [feedbackState, setFeedbackState] = useState<'normal' | 'happy' | 'sad'>('normal');

  const handleClick = () => {
    // Doğru/yanlış feedback'i göster
    setFeedbackState(isCorrect ? 'happy' : 'sad');
    
    // 1.5 saniye sonra normal state'e dön
    setTimeout(() => {
      setFeedbackState('normal');
    }, 1500);
    
    onAnswer(answer);
  };

  const getBirdImage = () => {
    switch (feedbackState) {
      case 'happy':
        return 'https://www.dropbox.com/scl/fi/sgp0s25s5a8jmhvraebp0/bird_happy.png?rlkey=9gbb7xzeug0ecpdhqsjj01e2y&st=g0hh7xdn&dl=1';
      case 'sad':
        return 'https://www.dropbox.com/scl/fi/33iprqo1u6av0ghzjfk13/bird_sad.png?rlkey=v3xl8yon44hyth9ca9atrdrsp&st=xdsn9dam&dl=1';
      default:
        return 'https://www.dropbox.com/scl/fi/z10e319w3kun08zeu9yi5/bird_fly.png?rlkey=mshp982wexljqc40mkl2j1oc3&st=6kinocqg&dl=1';
    }
  };

  return (
    <motion.div
      className="absolute cursor-pointer"
      initial={{ x: -100, y: 50 + position * 80 }}
      animate={{ 
        x: [window.innerWidth + 100, -100],
        y: [50 + position * 80, 50 + position * 80 + Math.sin(Date.now() / 1000) * 10]
      }}
      transition={{ 
        x: { duration: 8, ease: "linear", repeat: Infinity },
        y: { duration: 2, ease: "easeInOut", repeat: Infinity }
      }}
      onClick={handleClick}
    >
      <div className="relative">
        {/* Kuş Görseli */}
        <div className="w-20 h-16 flex items-center justify-center">
          <ImageWithFallback
            src={getBirdImage()}
            alt={`${feedbackState} kuş`}
            className="w-full h-full object-contain drop-shadow-lg hover:scale-110 transition-transform duration-200"
            style={{
              filter: feedbackState === 'happy' ? 'drop-shadow(0 0 10px #22c55e)' : 
                     feedbackState === 'sad' ? 'drop-shadow(0 0 10px #ef4444)' : 
                     'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
            }}
          />
        </div>
        
        {/* Cevap balonu */}
        <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 rounded-full border-2 px-3 py-1 shadow-lg transition-all duration-300 ${
          feedbackState === 'happy' ? 'bg-green-100 border-green-300' :
          feedbackState === 'sad' ? 'bg-red-100 border-red-300' :
          'bg-white border-gray-300'
        }`}>
          <span className={`text-lg font-bold ${
            feedbackState === 'happy' ? 'text-green-800' :
            feedbackState === 'sad' ? 'text-red-800' :
            'text-gray-800'
          }`}>
            {answer}
          </span>
        </div>

        {/* Feedback efektleri */}
        {feedbackState === 'happy' && (
          <div className="absolute -inset-2 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl"
            >
              ✨
            </motion.div>
          </div>
        )}
        
        {feedbackState === 'sad' && (
          <div className="absolute -inset-2 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl"
            >
              💫
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}