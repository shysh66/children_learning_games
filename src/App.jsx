import React, { useState } from 'react';
import { ArrowRight, RotateCcw, Trophy } from 'lucide-react';

// 📌 מספר גרסה - עדכן כאן!
const APP_VERSION = '1.1.0';
const LAST_UPDATE = '26.01.2025';

const MathGameApp = () => {
  const [theme, setTheme] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [screen, setScreen] = useState('home');
  const [level, setLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiType, setConfettiType] = useState('normal');
  const [showMedal, setShowMedal] = useState(false);
  const [medalTitle, setMedalTitle] = useState('');

  const themes = {
    space: {
      name: 'חלל',
      icon: '🚀',
      bg: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
      primary: 'bg-indigo-600 hover:bg-indigo-500',
      secondary: 'bg-purple-600 hover:bg-purple-500',
      accent: 'text-yellow-300',
      cardBg: 'bg-indigo-800/40 backdrop-blur-sm border-2 border-indigo-500/30',
      visualIcon: '⭐',
      font: 'font-mono',
      confettiColors: ['#818cf8', '#c084fc', '#fbbf24']
    },
    dino: {
      name: 'דינוזאורים',
      icon: '🦕',
      bg: 'bg-gradient-to-br from-green-800 via-emerald-700 to-teal-800',
      primary: 'bg-green-600 hover:bg-green-500',
      secondary: 'bg-emerald-600 hover:bg-emerald-500',
      accent: 'text-lime-300',
      cardBg: 'bg-green-800/40 backdrop-blur-sm border-2 border-green-500/30',
      visualIcon: '🦖',
      font: 'font-bold',
      confettiColors: ['#86efac', '#a3e635', '#fde047']
    },
    unicorn: {
      name: 'חדי-קרן',
      icon: '🦄',
      bg: 'bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400',
      primary: 'bg-pink-500 hover:bg-pink-400',
      secondary: 'bg-purple-500 hover:bg-purple-400',
      accent: 'text-fuchsia-200',
      cardBg: 'bg-white/30 backdrop-blur-sm border-2 border-pink-300/50',
      visualIcon: '🌟',
      font: 'font-semibold',
      confettiColors: ['#f9a8d4', '#c084fc', '#67e8f9']
    }
  };

  const Confetti = ({ colors, type }) => {
    const particles = type === 'big' ? 50 : 30;
    const shapes = ['●', '★', '■', '▲', '♦'];
    
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {[...Array(particles)].map((_, i) => {
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const left = Math.random() * 100;
          const delay = Math.random() * 0.5;
          const duration = 2 + Math.random() * 2;
          
          return (
            <div
              key={i}
              className="absolute text-3xl animate-confetti-fall"
              style={{
                left: `${left}%`,
                top: '-10%',
                color: color,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            >
              {shape}
            </div>
          );
        })}
      </div>
    );
  };

  const triggerConfetti = (type = 'normal') => {
    setConfettiType(type);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), type === 'big' ? 4000 : 3000);
  };

  const generateMultiplicationQuestion = (level) => {
    const minNum = Math.max(1, level); // מינימום מתחיל מהשלב
    const maxNum = Math.min(2 + level * 2, 10);
    const minResult = (level - 1) * 10; // תוצאה מינימלית: שלב 1=0, שלב 2=10, שלב 3=20
    
    let num1, num2, correct;
    let attempts = 0;
    
    do {
      num1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      num2 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      correct = num1 * num2;
      attempts++;
      
      // אם אחרי 50 ניסיונות לא מצאנו, הרחב את הטווח
      if (attempts > 50) {
        num1 = Math.floor(Math.random() * maxNum) + minNum;
        num2 = Math.floor(Math.random() * maxNum) + minNum;
        correct = num1 * num2;
        break;
      }
    } while (correct < minResult);
    
    const answers = [correct];
    while (answers.length < 4) {
      const wrong = correct + Math.floor(Math.random() * 20) - 10;
      if (wrong > 0 && !answers.includes(wrong)) {
        answers.push(wrong);
      }
    }
    
    return {
      type: 'multiply',
      num1,
      num2,
      correct,
      answers: answers.sort(() => Math.random() - 0.5),
      visual: { groups: num1, items: num2 }
    };
  };

  const generateAddSubQuestion = (level) => {
    const maxResult = 20 * level;
    const isAdd = Math.random() > 0.4;
    
    let num1, num2, correct;
    if (isAdd) {
      num1 = Math.floor(Math.random() * (maxResult / 2)) + 1;
      num2 = Math.floor(Math.random() * (maxResult - num1)) + 1;
      correct = num1 + num2;
    } else {
      // חיסור: num1 הוא המספר הגדול, num2 הוא המספר הקטן
      num1 = Math.floor(Math.random() * (maxResult - 5)) + 6; // מינימום 6
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // תמיד קטן מ-num1
      correct = num1 - num2;
    }
    
    const answers = [correct];
    while (answers.length < 4) {
      const wrong = correct + Math.floor(Math.random() * 16) - 8;
      if (wrong > 0 && !answers.includes(wrong)) {
        answers.push(wrong);
      }
    }
    
    return {
      type: isAdd ? 'add' : 'subtract',
      num1,
      num2,
      correct,
      answers: answers.sort(() => Math.random() - 0.5),
      visual: { total: isAdd ? num1 + num2 : num1 }
    };
  };

  const startGame = (mode) => {
    setGameMode(mode);
    setScreen('game');
    setLevel(1);
    setQuestionIndex(0);
    setScore(0);
    generateQuestion(mode, 1);
  };

  const generateQuestion = (mode, currentLevel) => {
    const question = mode === 'multiply' 
      ? generateMultiplicationQuestion(currentLevel)
      : generateAddSubQuestion(currentLevel);
    setCurrentQuestion(question);
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const isCorrect = answer === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(score + 1);
      triggerConfetti('normal');
    } else {
      setShakeWrong(true);
      setTimeout(() => setShakeWrong(false), 500);
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (questionIndex + 1 < 8) {
        setQuestionIndex(questionIndex + 1);
        generateQuestion(gameMode, level);
      } else {
        setScreen('summary');
      }
    }, 1500);
  };

  const nextLevel = () => {
    setLevel(level + 1);
    setQuestionIndex(0);
    setScore(0);
    setScreen('game');
    generateQuestion(gameMode, level + 1);
  };

  const retry = () => {
    setQuestionIndex(0);
    setScore(0);
    setScreen('game');
    generateQuestion(gameMode, level);
  };

  const getMedal = () => {
    const themeName = themes[theme].name;
    const modeName = gameMode === 'multiply' ? 'הכפל' : 'החיבור והחיסור';
    const titles = [
      `אלוף ${themeName} של ${modeName}`,
      `גיבור ${themeName} המתמטי`,
      `מלך ${themeName} בחשבון`,
      `כוכב ${themeName} הבהיר`
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  };

  const goHome = () => {
    setScreen('home');
    setTheme(null);
    setGameMode(null);
  };

  const renderVisualQuestion = () => {
    if (!currentQuestion) return null;
    const t = themes[theme];
    
    if (currentQuestion.type === 'multiply') {
      return (
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="text-6xl font-bold text-white mb-2" dir="ltr">
            {currentQuestion.num1} × {currentQuestion.num2}
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl">
            {[...Array(currentQuestion.visual.groups)].map((_, groupIdx) => (
              <div key={groupIdx} className={`${t.cardBg} rounded-2xl p-3 animate-bounce`} style={{ animationDelay: `${groupIdx * 0.1}s` }}>
                <div className="flex gap-2">
                  {[...Array(currentQuestion.visual.items)].map((_, itemIdx) => (
                    <span key={itemIdx} className="text-4xl">{t.visualIcon}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      const total = Math.min(currentQuestion.visual.total, 30);
      return (
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="text-6xl font-bold text-white mb-2" dir="ltr">
            {currentQuestion.num1} {currentQuestion.type === 'add' ? '+' : '-'} {currentQuestion.num2}
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
            {[...Array(total)].map((_, idx) => (
              <span 
                key={idx} 
                className={`text-3xl transition-all ${currentQuestion.type === 'subtract' && idx >= currentQuestion.correct ? 'opacity-30 line-through' : ''}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {t.visualIcon}
              </span>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {showConfetti && theme && <Confetti colors={themes[theme].confettiColors} type={confettiType} />}
      {screen === 'home' && !theme && (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-8 font-sans" dir="rtl">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12 animate-bounce">
              <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                🎮 משחקי החשבון שלי 🎮
              </h1>
              <p className="text-2xl text-white/90 font-semibold">בחר נושא למשחק!</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className="group relative overflow-hidden rounded-3xl p-8 transform transition-all duration-300 hover:scale-110 hover:rotate-2 bg-white/20 backdrop-blur-md border-4 border-white/30 hover:border-white/60"
                >
                  <div className="text-8xl mb-4 animate-pulse">{t.icon}</div>
                  <div className="text-3xl font-black text-white drop-shadow-lg">{t.name}</div>
                </button>
              ))}
            </div>
            
            {/* Version info - prominent display */}
            <div className="mt-6 text-center">
              <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
                <p className="text-white/80 text-lg font-semibold">
                  גרסה {APP_VERSION} • {LAST_UPDATE}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}      )}

      {screen === 'home' && theme && !gameMode && (
        <div className={`min-h-screen ${themes[theme].bg} flex items-center justify-center p-8 ${themes[theme].font}`} dir="rtl">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <div className="text-8xl mb-4 animate-bounce">{themes[theme].icon}</div>
              <h1 className="text-6xl font-black text-white mb-6 drop-shadow-2xl">
                עולם ה{themes[theme].name}
              </h1>
              <p className="text-2xl text-white/90">בחר משחק!</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => startGame('multiply')}
                className={`${themes[theme].cardBg} rounded-3xl p-10 transform transition-all duration-300 hover:scale-105 group`}
              >
                <div className="text-6xl mb-4">✖️</div>
                <div className="text-4xl font-black text-white mb-2">לוח הכפל</div>
                <div className="text-xl text-white/80">תרגול כפל מהנה</div>
              </button>
              
              <button
                onClick={() => startGame('addsub')}
                className={`${themes[theme].cardBg} rounded-3xl p-10 transform transition-all duration-300 hover:scale-105 group`}
              >
                <div className="text-6xl mb-4">➕➖</div>
                <div className="text-4xl font-black text-white mb-2">חיבור וחיסור</div>
                <div className="text-xl text-white/80">תרגול מתקדם</div>
              </button>
            </div>
            
            <button
              onClick={() => setTheme(null)}
              className="mx-auto block px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
            >
              ← חזרה לבחירת נושא
            </button>
          </div>
        </div>
      )}      )}

      {screen === 'game' && theme && (
        <div className={`min-h-screen ${themes[theme].bg} flex items-center justify-center p-8 ${themes[theme].font}`} dir="rtl">
          <div className="max-w-5xl w-full">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl text-white font-bold">שלב {level}</span>
                <span className="text-2xl text-white font-bold">שאלה {questionIndex + 1} מתוך 8</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div 
                  className={`h-full ${themes[theme].primary} transition-all duration-500 rounded-full`}
                  style={{ width: `${((questionIndex + 1) / 8) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className={`${themes[theme].cardBg} rounded-3xl p-10 mb-8`}>
              {renderVisualQuestion()}
            </div>

            {/* Answers */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {currentQuestion?.answers.map((answer, idx) => {
                const isSelected = selectedAnswer === answer;
                const isCorrect = answer === currentQuestion.correct;
                const showCorrect = showFeedback && isCorrect;
                const showWrong = showFeedback && isSelected && !isCorrect;
                
                return (
                  <button
                    key={idx}
                    onClick={() => !showFeedback && handleAnswer(answer)}
                    disabled={showFeedback}
                    className={`
                      text-5xl font-black py-10 rounded-3xl transition-all duration-300 transform
                      ${showCorrect ? 'bg-green-500 scale-110 ring-8 ring-green-300' : 
                        showWrong ? `bg-red-500 ${shakeWrong ? 'animate-shake' : ''}` :
                        `${themes[theme].cardBg} hover:scale-105`}
                      ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl'}
                      text-white
                    `}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>
          </div>

          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-10px); }
              75% { transform: translateX(10px); }
            }
            .animate-shake {
              animation: shake 0.3s ease-in-out;
            }
            @keyframes confetti-fall {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
              }
            }
            .animate-confetti-fall {
              animation: confetti-fall 3s ease-out forwards;
            }
          `}</style>
        </div>
      )}      )}

      {screen === 'summary' && theme && (() => {
        const t = themes[theme];
        const passed = score >= 6;
        
        return (
          <div className={`min-h-screen ${t.bg} flex items-center justify-center p-8 ${t.font}`} dir="rtl">
            <div className="max-w-3xl w-full text-center">
              <div className="text-9xl mb-6 animate-bounce">
                {passed ? '🎉' : '💪'}
              </div>
              
              <div className={`${t.cardBg} rounded-3xl p-12 mb-8`}>
                <h2 className="text-6xl font-black text-white mb-6">
                  {passed ? 'מעולה!' : 'כמעט!'}
                </h2>
                <div className="text-8xl font-black text-white mb-4">
                  {score}/8
                </div>
                <p className="text-3xl text-white/90">
                  {passed ? 'ענית נכון על רוב השאלות!' : 'בוא ננסה שוב יחד'}
                </p>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                {passed && (
                  <button
                    onClick={nextLevel}
                    className={`${t.primary} text-white px-10 py-6 rounded-2xl text-3xl font-black transform hover:scale-110 transition-all shadow-2xl flex items-center gap-3`}
                  >
                    <ArrowRight size={32} />
                    לשלב הבא!
                  </button>
                )}
                
                <button
                  onClick={retry}
                  className={`${t.secondary} text-white px-10 py-6 rounded-2xl text-3xl font-black transform hover:scale-110 transition-all shadow-2xl flex items-center gap-3`}
                >
                  <RotateCcw size={32} />
                  נסה שוב
                </button>
                
                <button
                  onClick={() => {
                    if (passed) {
                      triggerConfetti('big');
                      setMedalTitle(getMedal());
                      setShowMedal(true);
                    } else {
                      goHome();
                    }
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-10 py-6 rounded-2xl text-3xl font-black transform hover:scale-110 transition-all shadow-2xl flex items-center gap-3"
                >
                  <Trophy size={32} />
                  {passed ? 'קבל מדליה!' : 'חזרה הביתה'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showMedal && theme && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8" dir="rtl">
          <div className={`${themes[theme].cardBg} rounded-3xl p-16 max-w-2xl w-full text-center transform scale-100 animate-bounce`}>
            <div className="text-9xl mb-6 animate-pulse">🏆</div>
            <h1 className="text-6xl font-black text-white mb-8">
              {medalTitle}
            </h1>
            <p className="text-3xl text-white/90 mb-8">
              כל הכבוד! המשך כך!
            </p>
            <button
              onClick={() => {
                setShowMedal(false);
                goHome();
              }}
              className={`${themes[theme].primary} text-white px-12 py-8 rounded-2xl text-4xl font-black transform hover:scale-110 transition-all shadow-2xl`}
            >
              חזרה למשחקים 🎮
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MathGameApp;