// English vocabulary data for learning games
// Categories: Animals, Colors, Numbers, Objects

export const englishWords = {
  animals: [
    { word: 'Dog', emoji: '🐶', hebrew: 'כלב' },
    { word: 'Cat', emoji: '🐱', hebrew: 'חתול' },
    { word: 'Lion', emoji: '🦁', hebrew: 'אריה' },
    { word: 'Elephant', emoji: '🐘', hebrew: 'פיל' },
    { word: 'Bird', emoji: '🐦', hebrew: 'ציפור' },
    { word: 'Fish', emoji: '🐟', hebrew: 'דג' },
    { word: 'Rabbit', emoji: '🐰', hebrew: 'ארנב' },
    { word: 'Bear', emoji: '🐻', hebrew: 'דוב' },
    { word: 'Monkey', emoji: '🐵', hebrew: 'קוף' },
    { word: 'Horse', emoji: '🐴', hebrew: 'סוס' },
    { word: 'Cow', emoji: '🐄', hebrew: 'פרה' },
    { word: 'Pig', emoji: '🐷', hebrew: 'חזיר' },
    { word: 'Sheep', emoji: '🐑', hebrew: 'כבש' },
    { word: 'Duck', emoji: '🦆', hebrew: 'ברווז' },
    { word: 'Butterfly', emoji: '🦋', hebrew: 'פרפר' },
  ],
  colors: [
    { word: 'Red', emoji: '🔴', hebrew: 'אדום' },
    { word: 'Blue', emoji: '🔵', hebrew: 'כחול' },
    { word: 'Green', emoji: '🟢', hebrew: 'ירוק' },
    { word: 'Yellow', emoji: '🟡', hebrew: 'צהוב' },
    { word: 'Orange', emoji: '🟠', hebrew: 'כתום' },
    { word: 'Purple', emoji: '🟣', hebrew: 'סגול' },
    { word: 'Pink', emoji: '🩷', hebrew: 'ורוד' },
    { word: 'Brown', emoji: '🟤', hebrew: 'חום' },
    { word: 'Black', emoji: '⚫', hebrew: 'שחור' },
    { word: 'White', emoji: '⚪', hebrew: 'לבן' },
  ],
  numbers: [
    { word: 'One', emoji: '1️⃣', hebrew: 'אחד' },
    { word: 'Two', emoji: '2️⃣', hebrew: 'שניים' },
    { word: 'Three', emoji: '3️⃣', hebrew: 'שלוש' },
    { word: 'Four', emoji: '4️⃣', hebrew: 'ארבע' },
    { word: 'Five', emoji: '5️⃣', hebrew: 'חמש' },
    { word: 'Six', emoji: '6️⃣', hebrew: 'שש' },
    { word: 'Seven', emoji: '7️⃣', hebrew: 'שבע' },
    { word: 'Eight', emoji: '8️⃣', hebrew: 'שמונה' },
    { word: 'Nine', emoji: '9️⃣', hebrew: 'תשע' },
    { word: 'Ten', emoji: '🔟', hebrew: 'עשר' },
  ],
  objects: [
    { word: 'Car', emoji: '🚗', hebrew: 'מכונית' },
    { word: 'House', emoji: '🏠', hebrew: 'בית' },
    { word: 'Tree', emoji: '🌳', hebrew: 'עץ' },
    { word: 'Sun', emoji: '☀️', hebrew: 'שמש' },
    { word: 'Moon', emoji: '🌙', hebrew: 'ירח' },
    { word: 'Star', emoji: '⭐', hebrew: 'כוכב' },
    { word: 'Ball', emoji: '⚽', hebrew: 'כדור' },
    { word: 'Book', emoji: '📖', hebrew: 'ספר' },
    { word: 'Apple', emoji: '🍎', hebrew: 'תפוח' },
    { word: 'Banana', emoji: '🍌', hebrew: 'בננה' },
    { word: 'Ice Cream', emoji: '🍦', hebrew: 'גלידה' },
    { word: 'Pizza', emoji: '🍕', hebrew: 'פיצה' },
    { word: 'Heart', emoji: '❤️', hebrew: 'לב' },
    { word: 'Rainbow', emoji: '🌈', hebrew: 'קשת' },
    { word: 'Flower', emoji: '🌸', hebrew: 'פרח' },
  ],
};

// Get all words as a flat array
export const getAllWords = () => {
  return [
    ...englishWords.animals,
    ...englishWords.colors,
    ...englishWords.numbers,
    ...englishWords.objects,
  ];
};

// Get random words from all categories
export const getRandomWords = (count) => {
  const allWords = getAllWords();
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Speak a word using TTS
export const speakWord = (word, onEnd = null) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slower for kids
    utterance.pitch = 1.1; // Slightly higher pitch

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }
};

// Speak Hebrew text
export const speakHebrew = (text, onEnd = null) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.9;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }
};
