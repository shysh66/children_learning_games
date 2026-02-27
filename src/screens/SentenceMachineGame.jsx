import React, { useState, useEffect, useCallback } from 'react';
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
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    // Silently fail
  }
};

// ============ Shuffle Helper ============

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============ Level Data ============
// Each round has:
//   - prompt: text shown above the sentence (the full sentence or context)
//   - slots: array of slot definitions, each with { answer: correct word, filled: null }
//   - bank: array of word strings available to the player
//   - acceptedPerSlot: array of arrays — each slot index maps to which words are valid for it

const LEVELS = [
  {
    id: 1,
    name: 'מִלָּה אַחַת',
    description: 'הַשְׁלִימוּ מִלָּה אַחַת',
    icon: '1️⃣',
    rounds: [
      {
        prompt: 'הַיֶּלֶד ___',
        display: ['הַיֶּלֶד'],
        slots: [{ answer: 'אוֹכֵל' }],
        bank: ['אוֹכֵל', 'שֻׁלְחָן'],
        acceptedPerSlot: [['אוֹכֵל']],
      },
      {
        prompt: 'הַכֶּלֶב ___',
        display: ['הַכֶּלֶב'],
        slots: [{ answer: 'רָץ' }],
        bank: ['רָץ', 'סֵפֶר'],
        acceptedPerSlot: [['רָץ']],
      },
      {
        prompt: 'הַשֶּׁמֶשׁ ___',
        display: ['הַשֶּׁמֶשׁ'],
        slots: [{ answer: 'זוֹרַחַת' }],
        bank: ['זוֹרַחַת', 'כִּסֵּא'],
        acceptedPerSlot: [['זוֹרַחַת']],
      },
      {
        prompt: 'הַחָתוּל ___',
        display: ['הַחָתוּל'],
        slots: [{ answer: 'יָשֵׁן' }],
        bank: ['יָשֵׁן', 'עוּגָה'],
        acceptedPerSlot: [['יָשֵׁן']],
      },
      {
        prompt: 'הַצִּפּוֹר ___',
        display: ['הַצִּפּוֹר'],
        slots: [{ answer: 'שָׁרָה' }],
        bank: ['שָׁרָה', 'דֶּלֶת'],
        acceptedPerSlot: [['שָׁרָה']],
      },
    ],
  },
  {
    id: 2,
    name: 'שְׁנֵי מִלִּים',
    description: 'בִּנְיוּ מִשְׁפָּט מִ-2 מִלִּים',
    icon: '2️⃣',
    rounds: [
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַכֶּלֶב' }, { answer: 'רָץ' }],
        bank: ['רָץ', 'הַכֶּלֶב'],
        acceptedPerSlot: [['הַכֶּלֶב'], ['רָץ']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַיֶּלֶד' }, { answer: 'אוֹכֵל' }],
        bank: ['אוֹכֵל', 'הַיֶּלֶד'],
        acceptedPerSlot: [['הַיֶּלֶד'], ['אוֹכֵל']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַחָתוּל' }, { answer: 'יָשֵׁן' }],
        bank: ['הַחָתוּל', 'יָשֵׁן'],
        acceptedPerSlot: [['הַחָתוּל'], ['יָשֵׁן']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַשֶּׁמֶשׁ' }, { answer: 'זוֹרַחַת' }],
        bank: ['זוֹרַחַת', 'הַשֶּׁמֶשׁ'],
        acceptedPerSlot: [['הַשֶּׁמֶשׁ'], ['זוֹרַחַת']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַתִּינוֹק' }, { answer: 'בּוֹכֶה' }],
        bank: ['בּוֹכֶה', 'הַתִּינוֹק'],
        acceptedPerSlot: [['הַתִּינוֹק'], ['בּוֹכֶה']],
      },
    ],
  },
  {
    id: 3,
    name: 'עִם מַסִּיחַ דַּעַת',
    description: '2 מִלִּים + מַסִּיחַ דַּעַת',
    icon: '3️⃣',
    rounds: [
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַחָתוּל' }, { answer: 'יָשֵׁן' }],
        bank: ['הַחָתוּל', 'יָשֵׁן', 'כִּסֵּא'],
        acceptedPerSlot: [['הַחָתוּל'], ['יָשֵׁן']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַיַּלְדָּה' }, { answer: 'רוֹקֶדֶת' }],
        bank: ['הַיַּלְדָּה', 'רוֹקֶדֶת', 'שֻׁלְחָן'],
        acceptedPerSlot: [['הַיַּלְדָּה'], ['רוֹקֶדֶת']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַכֶּלֶב' }, { answer: 'נוֹבֵחַ' }],
        bank: ['נוֹבֵחַ', 'הַכֶּלֶב', 'עוּגָה'],
        acceptedPerSlot: [['הַכֶּלֶב'], ['נוֹבֵחַ']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַצִּפּוֹר' }, { answer: 'עָפָה' }],
        bank: ['הַצִּפּוֹר', 'עָפָה', 'סֵפֶר'],
        acceptedPerSlot: [['הַצִּפּוֹר'], ['עָפָה']],
      },
      {
        prompt: '___ ___',
        display: [],
        slots: [{ answer: 'הַדָּג' }, { answer: 'שׁוֹחֶה' }],
        bank: ['שׁוֹחֶה', 'הַדָּג', 'דֶּלֶת'],
        acceptedPerSlot: [['הַדָּג'], ['שׁוֹחֶה']],
      },
    ],
  },
  {
    id: 4,
    name: 'הַתְאָמַת דִּקְדּוּק',
    description: 'זָכָר / נְקֵבָה, יָחִיד / רַבִּים',
    icon: '📏',
    rounds: [
      {
        prompt: 'הַיַּלְדָּה ___',
        display: ['הַיַּלְדָּה'],
        slots: [{ answer: 'רָצָה' }],
        bank: ['רָצָה', 'רָץ'],
        acceptedPerSlot: [['רָצָה']],
      },
      {
        prompt: 'הַיֶּלֶד ___',
        display: ['הַיֶּלֶד'],
        slots: [{ answer: 'אוֹכֵל' }],
        bank: ['אוֹכֵל', 'אוֹכֶלֶת'],
        acceptedPerSlot: [['אוֹכֵל']],
      },
      {
        prompt: 'הַיְלָדִים ___',
        display: ['הַיְלָדִים'],
        slots: [{ answer: 'מְשַׂחֲקִים' }],
        bank: ['מְשַׂחֲקִים', 'מְשַׂחֶקֶת'],
        acceptedPerSlot: [['מְשַׂחֲקִים']],
      },
      {
        prompt: 'הַיַּלְדָּה ___',
        display: ['הַיַּלְדָּה'],
        slots: [{ answer: 'שָׁרָה' }],
        bank: ['שָׁרָה', 'שָׁר'],
        acceptedPerSlot: [['שָׁרָה']],
      },
      {
        prompt: 'הַכְּלָבִים ___',
        display: ['הַכְּלָבִים'],
        slots: [{ answer: 'רָצִים' }],
        bank: ['רָצִים', 'רָץ'],
        acceptedPerSlot: [['רָצִים']],
      },
    ],
  },
  {
    id: 5,
    name: 'שְׁלוֹשׁ מִלִּים',
    description: 'שֵׁם + תֹּאַר + פֹּעַל',
    icon: '3️⃣',
    rounds: [
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַפֶּרַח' }, { answer: 'הַיָּפֶה' }, { answer: 'פּוֹרֵחַ' }],
        bank: ['הַפֶּרַח', 'הַיָּפֶה', 'פּוֹרֵחַ'],
        acceptedPerSlot: [['הַפֶּרַח'], ['הַיָּפֶה'], ['פּוֹרֵחַ']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַכֶּלֶב' }, { answer: 'הַקָּטָן' }, { answer: 'רָץ' }],
        bank: ['הַכֶּלֶב', 'הַקָּטָן', 'רָץ'],
        acceptedPerSlot: [['הַכֶּלֶב'], ['הַקָּטָן'], ['רָץ']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַיַּלְדָּה' }, { answer: 'הַחֲכָמָה' }, { answer: 'קוֹרֵאת' }],
        bank: ['הַיַּלְדָּה', 'הַחֲכָמָה', 'קוֹרֵאת'],
        acceptedPerSlot: [['הַיַּלְדָּה'], ['הַחֲכָמָה'], ['קוֹרֵאת']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַחָתוּל' }, { answer: 'הַשָּׁמֵן' }, { answer: 'יָשֵׁן' }],
        bank: ['הַחָתוּל', 'הַשָּׁמֵן', 'יָשֵׁן'],
        acceptedPerSlot: [['הַחָתוּל'], ['הַשָּׁמֵן'], ['יָשֵׁן']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַצִּפּוֹר' }, { answer: 'הַצְּבָעוֹנִית' }, { answer: 'שָׁרָה' }],
        bank: ['הַצִּפּוֹר', 'הַצְּבָעוֹנִית', 'שָׁרָה'],
        acceptedPerSlot: [['הַצִּפּוֹר'], ['הַצְּבָעוֹנִית'], ['שָׁרָה']],
      },
    ],
  },
  {
    id: 6,
    name: 'עִם מַסִּיחֵי דַּעַת',
    description: '3 מִלִּים + מַסִּיחֵי דַּעַת',
    icon: '🧩',
    rounds: [
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַתִּינוֹק' }, { answer: 'הַקָּטָן' }, { answer: 'בּוֹכֶה' }],
        bank: ['הַתִּינוֹק', 'הַקָּטָן', 'בּוֹכֶה', 'טָס'],
        acceptedPerSlot: [['הַתִּינוֹק'], ['הַקָּטָן'], ['בּוֹכֶה']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַיֶּלֶד' }, { answer: 'הַגָּבֹהַּ' }, { answer: 'קוֹפֵץ' }],
        bank: ['הַיֶּלֶד', 'הַגָּבֹהַּ', 'קוֹפֵץ', 'שֻׁלְחָן'],
        acceptedPerSlot: [['הַיֶּלֶד'], ['הַגָּבֹהַּ'], ['קוֹפֵץ']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַדָּג' }, { answer: 'הַכָּתֹם' }, { answer: 'שׁוֹחֶה' }],
        bank: ['הַדָּג', 'הַכָּתֹם', 'שׁוֹחֶה', 'כּוֹתֵב'],
        acceptedPerSlot: [['הַדָּג'], ['הַכָּתֹם'], ['שׁוֹחֶה']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הָאַרְיֵה' }, { answer: 'הַחָזָק' }, { answer: 'שׁוֹאֵג' }],
        bank: ['הָאַרְיֵה', 'הַחָזָק', 'שׁוֹאֵג', 'יָשֵׁן'],
        acceptedPerSlot: [['הָאַרְיֵה'], ['הַחָזָק'], ['שׁוֹאֵג']],
      },
      {
        prompt: '___ ___ ___',
        display: [],
        slots: [{ answer: 'הַיַּלְדָּה' }, { answer: 'הַשְּׂמֵחָה' }, { answer: 'צוֹחֶקֶת' }],
        bank: ['הַיַּלְדָּה', 'הַשְּׂמֵחָה', 'צוֹחֶקֶת', 'כִּסֵּא'],
        acceptedPerSlot: [['הַיַּלְדָּה'], ['הַשְּׂמֵחָה'], ['צוֹחֶקֶת']],
      },
    ],
  },
];

const XP_PER_LEVEL = 20;

// ============ Main Component ============

const SentenceMachineGame = ({ themeId, onBack, triggerConfetti }) => {
  const theme = getTheme(themeId);

  const [currentLevel, setCurrentLevel] = useState(0);
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [filledSlots, setFilledSlots] = useState([]);
  const [bankWords, setBankWords] = useState([]);
  const [shakenWord, setShakenWord] = useState(null);
  const [encourageText, setEncourageText] = useState('');
  const [sentenceComplete, setSentenceComplete] = useState(false);

  const startLevel = useCallback((levelId) => {
    const level = LEVELS[levelId - 1];
    const shuffledRounds = level.rounds.map((r) => ({
      ...r,
      bank: shuffle([...r.bank]),
    }));
    setRounds(shuffledRounds);
    setRoundIndex(0);
    setScore(0);
    setTotalAttempts(0);
    setCurrentLevel(levelId);
    setGameComplete(false);
    setSentenceComplete(false);
    setFilledSlots(new Array(shuffledRounds[0].slots.length).fill(null));
    setBankWords(shuffledRounds[0].bank.map((w) => ({ word: w, inBank: true })));
    setShakenWord(null);
    setEncourageText('');
  }, []);

  const initRound = useCallback((roundData) => {
    setFilledSlots(new Array(roundData.slots.length).fill(null));
    setBankWords(shuffle([...roundData.bank]).map((w) => ({ word: w, inBank: true })));
    setShakenWord(null);
    setEncourageText('');
    setSentenceComplete(false);
  }, []);

  // Read instruction when round changes
  useEffect(() => {
    if (currentLevel > 0 && rounds.length > 0 && roundIndex < rounds.length && !sentenceComplete) {
      const timer = setTimeout(() => speak('הַשְׁלִימוּ אֶת הַמִּשְׁפָּט'), 400);
      return () => clearTimeout(timer);
    }
  }, [currentLevel, roundIndex, rounds.length, sentenceComplete]);

  const round = rounds[roundIndex];

  // Check if sentence is complete after each slot fill
  useEffect(() => {
    if (!round || sentenceComplete) return;
    const allFilled = filledSlots.every((s) => s !== null);
    if (allFilled) {
      // Verify all slots are correct
      const allCorrect = filledSlots.every((word, idx) => word === round.slots[idx].answer);
      if (allCorrect) {
        setSentenceComplete(true);
        setScore((prev) => prev + 1);
        triggerConfetti?.('normal');

        // Read the complete sentence
        const fullSentence = [...(round.display || []), ...filledSlots].join(' ');
        setTimeout(() => speak(fullSentence), 300);

        setTimeout(() => {
          if (roundIndex + 1 >= rounds.length) {
            setGameComplete(true);
            addXP(XP_PER_LEVEL);
            recordGameStats('sentenceMachine', totalAttempts, score + 1);
            triggerConfetti?.('big');
          } else {
            const nextRound = rounds[roundIndex + 1];
            setRoundIndex((prev) => prev + 1);
            initRound(nextRound);
          }
        }, 2500);
      }
    }
  }, [filledSlots, round, sentenceComplete, roundIndex, rounds, score, totalAttempts, triggerConfetti, initRound]);

  const handleBankWordClick = (wordObj) => {
    if (sentenceComplete || !wordObj.inBank || shakenWord) return;

    setTotalAttempts((prev) => prev + 1);

    // Find the first empty slot
    const emptySlotIndex = filledSlots.findIndex((s) => s === null);
    if (emptySlotIndex === -1) return;

    // Check if the word is valid for this slot
    const accepted = round.acceptedPerSlot[emptySlotIndex];
    if (!accepted.includes(wordObj.word)) {
      // Invalid — shake the word in bank
      playOopsSound();
      setShakenWord(wordObj.word);
      setEncourageText('נַסּוּ מִלָּה אַחֶרֶת!');
      setTimeout(() => {
        setShakenWord(null);
        setEncourageText('');
      }, 600);
      return;
    }

    // Valid — move word to slot
    const newSlots = [...filledSlots];
    newSlots[emptySlotIndex] = wordObj.word;
    setFilledSlots(newSlots);
    setBankWords((prev) =>
      prev.map((w) => (w.word === wordObj.word ? { ...w, inBank: false } : w))
    );
    setEncourageText('');
  };

  const handleSlotWordClick = (slotIndex) => {
    if (sentenceComplete) return;

    const word = filledSlots[slotIndex];
    if (!word) return;

    // Return word to bank
    const newSlots = [...filledSlots];
    newSlots[slotIndex] = null;
    setFilledSlots(newSlots);
    setBankWords((prev) =>
      prev.map((w) => (w.word === word ? { ...w, inBank: true } : w))
    );
  };

  // ============ Level Select ============
  if (currentLevel === 0) {
    return (
      <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 ${theme.font}`} dir="rtl">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">📝</div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-2xl">מְכוֹנַת הַמִּשְׁפָּטִים</h1>
          <p className="text-xl text-white/80">בִּנְיוּ מִשְׁפָּטִים מְנֻקָּדִים!</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-md">
          {LEVELS.map((level) => (
            <button
              key={level.id}
              onClick={() => startLevel(level.id)}
              data-testid={`level-${level.id}`}
              className={`${theme.cardBg} rounded-3xl p-6 text-right transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{level.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">שָׁלָב {level.id}: {level.name}</h2>
                  <p className="text-white/70 text-lg">{level.description}</p>
                </div>
                <div className="text-3xl text-white/60">←</div>
              </div>
            </button>
          ))}
        </div>

        <button onClick={onBack} className="mt-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
          ← חֲזָרָה
        </button>
      </div>
    );
  }

  // ============ Game Complete ============
  if (gameComplete) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center p-6 ${theme.font}`} dir="rtl">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🌟</div>
          <h1 className="text-5xl font-black text-white mb-4">כָּל הַכָּבוֹד!</h1>
          <p className="text-2xl text-white/90 mb-2">סִיַּמְתֶּם אֶת שָׁלָב {currentLevel}: {LEVELS[currentLevel - 1].name}</p>
          <p className="text-xl text-white/70 mb-4">צִיּוּן: {score}/{rounds.length}</p>
          <div className="text-3xl text-yellow-300 font-bold mb-8">+{XP_PER_LEVEL} XP</div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => startLevel(currentLevel)} className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-2xl text-white text-xl font-bold transition-all">
              שַׂחֲקוּ שׁוּב 🔄
            </button>
            {currentLevel < LEVELS.length && (
              <button onClick={() => startLevel(currentLevel + 1)} data-testid="next-level-btn" className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-2xl text-white text-xl font-bold transition-all">
                שָׁלָב הַבָּא ⭐
              </button>
            )}
            <button onClick={() => setCurrentLevel(0)} className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
              בְּחִירַת שָׁלָב 📋
            </button>
            <button onClick={onBack} className="px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-xl font-bold transition-all">
              חֲזָרָה ←
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ Game Play ============
  if (!round) return null;

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center p-4 sm:p-8 ${theme.font}`} dir="rtl">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-4 mt-2">
        <button onClick={onBack} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all">← חֲזָרָה</button>
        <div className="text-white/80 font-bold text-lg">{roundIndex + 1} / {rounds.length}</div>
        <div className="text-white font-bold text-lg">⭐ {score}</div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-2xl h-3 bg-white/20 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${(roundIndex / rounds.length) * 100}%` }} />
      </div>

      {/* Instruction */}
      <button onClick={() => speak('הַשְׁלִימוּ אֶת הַמִּשְׁפָּט')} className="mb-8 flex items-center gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-white">הַשְׁלִימוּ אֶת הַמִּשְׁפָּט! ✍️</span>
        <span className="text-2xl">🔊</span>
      </button>

      {/* Sentence area with slots */}
      <div className="w-full max-w-2xl mb-8" data-testid="sentence-area">
        <div className={`${theme.cardBg} rounded-3xl p-6 sm:p-8`}>
          <div className="flex flex-wrap items-center justify-center gap-3 text-2xl sm:text-3xl font-bold text-white">
            {/* Display pre-filled words */}
            {round.display && round.display.map((word, idx) => (
              <span key={`display-${idx}`} className="px-3 py-2">{word}</span>
            ))}

            {/* Slots */}
            {filledSlots.map((word, idx) => (
              <button
                key={`slot-${idx}`}
                onClick={() => handleSlotWordClick(idx)}
                data-testid={`slot-${idx}`}
                className={`min-w-[80px] sm:min-w-[100px] px-4 py-2 rounded-2xl border-4 border-dashed transition-all duration-300 text-center ${
                  word
                    ? 'bg-green-500/30 border-green-400 cursor-pointer hover:bg-green-500/50'
                    : 'bg-white/10 border-white/40'
                } ${sentenceComplete ? 'border-green-400 bg-green-500/40' : ''}`}
              >
                {word || '___'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Encouragement text */}
      {encourageText && (
        <div data-testid="encourage-text" className="mb-4 text-center">
          <p className="text-xl font-bold text-yellow-300">{encourageText}</p>
        </div>
      )}

      {/* Success text */}
      {sentenceComplete && (
        <div data-testid="success-text" className="mb-4 text-center">
          <p className="text-2xl font-bold text-green-300">מְצֻיָּן! 🌟</p>
        </div>
      )}

      {/* Word Bank */}
      <div className="w-full max-w-2xl" data-testid="word-bank">
        <div className={`${theme.cardBg} rounded-3xl p-6`}>
          <p className="text-lg text-white/60 mb-4 text-center">בַּנְק הַמִּלִּים:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {bankWords.map((wordObj, idx) => (
              <button
                key={idx}
                onClick={() => handleBankWordClick(wordObj)}
                disabled={!wordObj.inBank || sentenceComplete}
                data-testid={`bank-word-${idx}`}
                data-word={wordObj.word}
                className={`px-5 py-3 rounded-2xl text-xl sm:text-2xl font-bold transition-all duration-300 transform ${
                  wordObj.inBank
                    ? 'bg-blue-500/40 text-white hover:bg-blue-500/60 hover:scale-105 cursor-pointer border-2 border-blue-300/50'
                    : 'bg-gray-500/20 text-white/30 cursor-not-allowed border-2 border-transparent'
                } ${shakenWord === wordObj.word ? 'animate-shake' : ''}`}
              >
                {wordObj.word}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SentenceMachineGame;
