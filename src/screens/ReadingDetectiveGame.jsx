import React, { useState, useCallback } from 'react';
import { getTheme } from '../data/themes';
import { addXP, recordGameStats } from '../utils/storage';
import { playOopsSound } from '../utils/sounds';

// ============ TTS Helper ============

const speak = (text) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Silently fail
  }
};

// ============ Levels Data ============

const STAGES = [
  {
    id: 1,
    name: 'שלב 1',
    description: 'משפטים קצרים עם ניקוד',
    text: 'דָּנָה קָמָה מֵהַסַּפָּה.',
    question: 'מי קמה?',
    options: ['דָּנָה', 'רִנָּה', 'גַּל'],
    correctIndex: 0,
    hasNiqqud: true,
  },
  {
    id: 2,
    name: 'שלב 2',
    description: 'משפטים קצרים עם ניקוד',
    text: 'הַיֶּלֶד אָכַל תַּפּוּחַ אָדֹם.',
    question: 'מה אכל הילד?',
    options: ['תַּפּוּחַ', 'בָּנָנָה', 'עוּגָה'],
    correctIndex: 0,
    hasNiqqud: true,
  },
  {
    id: 3,
    name: 'שלב 3',
    description: 'משפטים בינוניים עם ניקוד',
    text: 'הַכֶּלֶב הַלָּבָן רָץ מַהֵר לַחָצֵר.',
    question: 'לאן רץ הכלב?',
    options: ['לַחָצֵר', 'לַבַּיִת', 'לַגַּן'],
    correctIndex: 0,
    hasNiqqud: true,
  },
  {
    id: 4,
    name: 'שלב 4',
    description: 'משפטים בינוניים עם ניקוד',
    text: 'הַחֲתוּל הַקָּטָן יָשַׁב עַל הַגָּדֵר וְהִסְתַּכֵּל עַל הַצִּפּוֹרִים.',
    question: 'איפה ישב החתול?',
    options: ['עַל הַגָּדֵר', 'עַל הָעֵץ', 'עַל הַכִּסֵּא'],
    correctIndex: 0,
    hasNiqqud: true,
  },
  {
    id: 5,
    name: 'שלב 5',
    description: 'משפטים ארוכים יותר',
    text: 'אִמָּא הֵכִינָה עוּגָה גְּדוֹלָה עִם שׁוֹקוֹלָד וְקְצָפָת לְיוֹם הַהוּלֶּדֶת שֶׁל יוֹסִי.',
    question: 'למי אמא הכינה עוגה?',
    options: ['לְיוֹסִי', 'לְדָנִי', 'לְמִיכַל'],
    correctIndex: 0,
    hasNiqqud: true,
  },
  {
    id: 6,
    name: 'שלב 6',
    description: 'ללא ניקוד!',
    text: 'דני אכל תפוח אדום ומתוק.',
    question: 'מה אכל דני?',
    options: ['תפוח', 'אגס', 'בננה'],
    correctIndex: 0,
    hasNiqqud: false,
  },
  {
    id: 7,
    name: 'שלב 7',
    description: 'ללא ניקוד - משפטים ארוכים',
    text: 'הילדים רצו לגן ושיחקו בחול עד שהתחיל לרדת גשם.',
    question: 'מה קרה בסוף?',
    options: ['ירד גשם', 'יצאה שמש', 'בא רוח'],
    correctIndex: 0,
    hasNiqqud: false,
  },
  {
    id: 8,
    name: 'שלב 8',
    description: 'ללא ניקוד - דיוק',
    text: 'מיכל קנתה גלידה בטעם שוקולד אבל חברה שלה העדיפה וניל.',
    question: 'איזה טעם בחרה מיכל?',
    options: ['שוקולד', 'וניל', 'תות'],
    correctIndex: 0,
    hasNiqqud: false,
  },
  {
    id: 9,
    name: 'שלב 9',
    description: 'מסיחים מתוחכמים',
    text: 'גַּל לָבַשׁ חוּלְצָה כְּחֻלָּה וּמִכְנָסַיִם אֲדֻמִּים.',
    question: 'מה לבש גל?',
    options: ['חולצה כחולה', 'חולצה אדומה', 'מכנס כחול'],
    correctIndex: 0,
    hasNiqqud: true,
  },
];

// ============ Story Mode Data ============

const STORIES = [
  {
    id: 'egypt',
    title: 'תעלומת החתול',
    icon: '🏺',
    period: 'מצרים העתיקה',
    hasNiqqud: true,
    text: 'בַּזְּמַן הָעַתִּיק, בְּאֶרֶץ מִצְרַיִם, חַי פַּרְעֹה גָּדוֹל שֶׁאָהַב חֲתוּלִים מְאוֹד. יוֹם אֶחָד, הַחָתוּל הָאָהוּב שֶׁלּוֹ נֶעֱלַם מֵהָאַרְמוֹן. הַפַּרְעֹה שָׁלַח אֶת כָּל הַחַיָּלִים לְחַפֵּשׂ. הֵם מָצְאוּ אֶת הַחָתוּל יָשֵׁן בְּתוֹךְ כַּד גָּדוֹל בַּמִּטְבָּח.',
    question: 'איפה מצאו את החתול?',
    options: ['בתוך כד במטבח', 'על גג הארמון', 'בגינה', 'ליד הנהר'],
    correctIndex: 0,
  },
  {
    id: 'maccabees',
    title: 'כד השמן',
    icon: '🕎',
    period: 'תקופת המכבים',
    hasNiqqud: true,
    text: 'יְהוּדָה הַמַּכַּבִּי וְהַלּוֹחֲמִים שֶׁלּוֹ נִכְנְסוּ לְבֵית הַמִּקְדָּשׁ אַחֲרֵי הַקְּרָב הַגָּדוֹל. הַמָּקוֹם הָיָה חָשׁוּךְ וּמְלֻכְלָךְ. הֵם חִפְּשׂוּ שֶׁמֶן לְהַדְלִיק אֶת הַמְּנוֹרָה, אֲבָל מָצְאוּ רַק כַּד קָטָן אֶחָד. הַנֵּס הַגָּדוֹל הָיָה שֶׁהַשֶּׁמֶן הִסְפִּיק לִשְׁמוֹנָה יָמִים!',
    question: 'כמה ימים הספיק השמן?',
    options: ['שמונה ימים', 'שלושה ימים', 'יום אחד', 'עשרה ימים'],
    correctIndex: 0,
  },
  {
    id: 'apollo',
    title: 'הנחיתה על הירח',
    icon: '🚀',
    period: 'אפולו 11',
    hasNiqqud: false,
    text: 'החללית אפולו נחתה ברכות על אדמת הירח האפורה. האסטרונאוט ניל ארמסטרונג לבש את חליפת החלל הכבדה וחבש את הקסדה. הוא ירד בזהירות בסולם והניח את הרגל הראשונה על הקרקע. על הירח אין אוויר, והכל שקט מאוד וקל כמו נוצה. ניל תקע את הדגל והסתכל בהתרגשות על כדור הארץ הרחוק.',
    question: 'איך ניל ירד מהחללית?',
    options: ['ירד בזהירות בסולם', 'קפץ מהר מהסולם', 'ירד בריצה קלה', 'החליק על המעקה'],
    correctIndex: 0,
  },
];

// ============ Shuffle Helper ============

const shuffleWithCorrect = (options, correctIndex) => {
  const correctAnswer = options[correctIndex];
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  const newCorrectIndex = shuffled.indexOf(correctAnswer);
  return { shuffled, correctIndex: newCorrectIndex };
};

// ============ Main Component ============

const ReadingDetectiveGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  // Game state
  const [mode, setMode] = useState(null); // null = menu, 'levels', 'stories'
  const [currentStage, setCurrentStage] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState(null);
  const [shuffledCorrectIndex, setShuffledCorrectIndex] = useState(0);
  const [completedStories, setCompletedStories] = useState([]);

  // Get current data based on mode
  const currentData = mode === 'levels' ? STAGES[currentStage] : currentStory;

  // Shuffle options when data changes
  const initShuffledOptions = useCallback((data) => {
    if (data) {
      const { shuffled, correctIndex } = shuffleWithCorrect(data.options, data.correctIndex);
      setShuffledOptions(shuffled);
      setShuffledCorrectIndex(correctIndex);
    }
  }, []);

  const handleAnswer = useCallback((index) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);

    const correct = index === shuffledCorrectIndex;
    setIsCorrect(correct);

    if (correct) {
      triggerConfetti('normal');
      setScore(prev => prev + 1);
      addXP(15);
    } else {
      playOopsSound();
    }
  }, [showResult, shuffledCorrectIndex, triggerConfetti]);

  const handleNext = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResult(false);

    if (mode === 'levels') {
      if (currentStage < STAGES.length - 1) {
        const nextStage = currentStage + 1;
        setCurrentStage(nextStage);
        initShuffledOptions(STAGES[nextStage]);
      } else {
        setGameComplete(true);
        triggerConfetti('big');
        recordGameStats('readingDetective', score + (isCorrect ? 0 : 0), totalAnswered + 1);
      }
    } else if (mode === 'stories') {
      setCompletedStories(prev => [...prev, currentStory.id]);
      setCurrentStory(null);
      setShuffledOptions(null);
    }
  }, [mode, currentStage, initShuffledOptions, triggerConfetti, score, totalAnswered, isCorrect, currentStory]);

  const startLevelMode = useCallback(() => {
    setMode('levels');
    setCurrentStage(0);
    setScore(0);
    setTotalAnswered(0);
    setGameComplete(false);
    initShuffledOptions(STAGES[0]);
  }, [initShuffledOptions]);

  const startStoryMode = useCallback(() => {
    setMode('stories');
    setScore(0);
    setTotalAnswered(0);
  }, []);

  const selectStory = useCallback((story) => {
    setCurrentStory(story);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowResult(false);
    initShuffledOptions(story);
  }, [initShuffledOptions]);

  const handleBackToMenu = useCallback(() => {
    setMode(null);
    setCurrentStage(0);
    setCurrentStory(null);
    setScore(0);
    setTotalAnswered(0);
    setGameComplete(false);
    setShuffledOptions(null);
    setCompletedStories([]);
  }, []);

  // ============ Render: Main Menu ============

  if (mode === null) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-10">
            <div className="text-8xl mb-4">🔍</div>
            <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">בלש הקריאה</h1>
            <p className="text-xl text-white/80">קראו, הבינו, ופתרו!</p>
          </div>

          <div className="space-y-5">
            <button
              onClick={startLevelMode}
              className={`${theme.cardBg} w-full rounded-3xl p-8 transform transition-all duration-300 hover:scale-105 text-right`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">📖</div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">שלבי קריאה</div>
                  <div className="text-lg text-white/70">9 שלבים - ממשפטים קצרים ועד טקסט ללא ניקוד</div>
                </div>
              </div>
            </button>

            <button
              onClick={startStoryMode}
              className={`${theme.cardBg} w-full rounded-3xl p-8 transform transition-all duration-300 hover:scale-105 text-right`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">🏛️</div>
                <div>
                  <div className="text-3xl font-black text-white mb-1">סיפורים היסטוריים</div>
                  <div className="text-lg text-white/70">מסע בזמן - מצרים, המכבים, והחלל!</div>
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={onBack}
            className="mx-auto block mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
          >
            ← חזרה
          </button>
        </div>
      </div>
    );
  }

  // ============ Render: Game Complete ============

  if (gameComplete) {
    const earnedXP = score * 15;
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
        <div className={`${theme.cardBg} rounded-3xl p-10 max-w-lg w-full text-center`}>
          <div className="text-8xl mb-4">🏆</div>
          <h2 className="text-4xl font-black text-white mb-4">כל הכבוד!</h2>
          <p className="text-2xl text-white/90 mb-2">
            עניתם נכון על {score} מתוך {totalAnswered} שאלות
          </p>
          <p className={`text-xl ${theme.accent} mb-8`}>+{earnedXP} XP</p>
          <div className="space-y-3">
            <button
              onClick={startLevelMode}
              className={`${theme.primary} w-full px-6 py-4 rounded-2xl text-white text-xl font-bold transition-all`}
            >
              🔄 שחקו שוב
            </button>
            <button
              onClick={handleBackToMenu}
              className="w-full px-6 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
            >
              ← תפריט ראשי
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ Render: Story Selection ============

  if (mode === 'stories' && !currentStory) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-7xl mb-3">🏛️</div>
            <h2 className="text-4xl font-black text-white mb-2">סיפורים היסטוריים</h2>
            <p className="text-xl text-white/80">בחרו סיפור לקרוא</p>
          </div>

          <div className="space-y-4">
            {STORIES.map((story) => {
              const isDone = completedStories.includes(story.id);
              return (
                <button
                  key={story.id}
                  onClick={() => selectStory(story)}
                  className={`${theme.cardBg} w-full rounded-3xl p-7 transform transition-all duration-300 hover:scale-105 text-right ${isDone ? 'opacity-70' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{story.icon}</div>
                    <div className="flex-1">
                      <div className="text-2xl font-black text-white mb-1">
                        {story.title}
                        {isDone && <span className="text-green-400 mr-2"> ✓</span>}
                      </div>
                      <div className="text-lg text-white/70">{story.period}</div>
                      {!story.hasNiqqud && (
                        <div className="text-sm text-yellow-300 mt-1">⚡ ללא ניקוד</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleBackToMenu}
            className="mx-auto block mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all"
          >
            ← חזרה לתפריט
          </button>
        </div>
      </div>
    );
  }

  // ============ Render: Reading + Question ============

  if (!currentData || !shuffledOptions) return null;

  return (
    <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`} dir="rtl">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={mode === 'levels' ? handleBackToMenu : () => { setCurrentStory(null); setShuffledOptions(null); setShowResult(false); }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all"
          >
            ← חזרה
          </button>
          <div className="text-center">
            <div className="text-white font-bold text-lg">
              {mode === 'levels' ? `${STAGES[currentStage].name} / ${STAGES.length}` : currentData.title}
            </div>
            {mode === 'levels' && (
              <div className="text-white/60 text-sm">{STAGES[currentStage].description}</div>
            )}
          </div>
          <div className={`${theme.accent} font-bold text-lg`}>
            ⭐ {score}
          </div>
        </div>

        {/* Progress bar (levels only) */}
        {mode === 'levels' && (
          <div className="w-full bg-white/20 rounded-full h-3 mb-6">
            <div
              className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentStage + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        )}

        {/* Text Card */}
        <div className={`${theme.cardBg} rounded-3xl p-6 mb-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-white/60 text-sm">
              {currentData.hasNiqqud ? '📖 טקסט מנוקד' : '⚡ טקסט ללא ניקוד'}
            </div>
            <button
              onClick={() => speak(currentData.text)}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-xl text-white text-sm transition-all"
            >
              🔊 הקראה
            </button>
          </div>
          <p className={`text-white text-2xl leading-relaxed font-medium ${currentData.hasNiqqud ? '' : 'tracking-wide'}`}>
            {currentData.text}
          </p>
        </div>

        {/* Question */}
        <div className={`${theme.cardBg} rounded-3xl p-6`}>
          <h3 className="text-2xl font-black text-white mb-5">
            🔍 {currentData.question}
          </h3>

          <div className="space-y-3">
            {shuffledOptions.map((option, index) => {
              let btnClass = `w-full p-4 rounded-2xl text-xl font-bold transition-all duration-300 text-right `;

              if (showResult) {
                if (index === shuffledCorrectIndex) {
                  btnClass += 'bg-green-500 text-white scale-105 ring-4 ring-green-300';
                } else if (index === selectedAnswer && !isCorrect) {
                  btnClass += 'bg-red-500/80 text-white line-through';
                } else {
                  btnClass += 'bg-white/10 text-white/40';
                }
              } else {
                btnClass += `${theme.primary} text-white hover:scale-105`;
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                  className={btnClass}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showResult && (
            <div className="mt-5 text-center">
              <div className={`text-2xl font-black mb-3 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect ? '🎉 נכון מאוד!' : '❌ לא נכון...'}
              </div>
              {!isCorrect && (
                <p className="text-white/80 text-lg mb-3">
                  התשובה הנכונה: <span className="text-green-400 font-bold">{shuffledOptions[shuffledCorrectIndex]}</span>
                </p>
              )}
              <button
                onClick={handleNext}
                className={`${theme.primary} px-8 py-3 rounded-2xl text-white text-xl font-bold transition-all hover:scale-105`}
              >
                {mode === 'levels' && currentStage === STAGES.length - 1 ? '🏆 סיום' : mode === 'stories' ? '← חזרה לסיפורים' : 'הבא →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReadingDetectiveGame;
