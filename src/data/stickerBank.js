// Sticker Bank - 20 collectible emoji stickers for the Sticker Album
// Categories: Animals, Fantasy, Vehicles, Nature

const STICKER_BANK = [
  // Animals (7)
  { id: 'animal-lion', emoji: '🦁', name: 'אריה', category: 'animals' },
  { id: 'animal-elephant', emoji: '🐘', name: 'פיל', category: 'animals' },
  { id: 'animal-giraffe', emoji: '🦒', name: "ג'ירפה", category: 'animals' },
  { id: 'animal-dolphin', emoji: '🐬', name: 'דולפין', category: 'animals' },
  { id: 'animal-butterfly', emoji: '🦋', name: 'פרפר', category: 'animals' },
  { id: 'animal-turtle', emoji: '🐢', name: 'צב', category: 'animals' },
  { id: 'animal-ladybug', emoji: '🐞', name: 'חיפושית', category: 'animals' },

  // Fantasy (5)
  { id: 'fantasy-unicorn', emoji: '🦄', name: 'חד-קרן', category: 'fantasy' },
  { id: 'fantasy-dragon', emoji: '🐲', name: 'דרקון', category: 'fantasy' },
  { id: 'fantasy-fairy', emoji: '🧚', name: 'פיה', category: 'fantasy' },
  { id: 'fantasy-mermaid', emoji: '🧜‍♀️', name: 'בת-ים', category: 'fantasy' },
  { id: 'fantasy-genie', emoji: '🧞‍♂️', name: "ג'יני", category: 'fantasy' },

  // Vehicles (5)
  { id: 'vehicle-rocket', emoji: '🚀', name: 'רקטה', category: 'vehicles' },
  { id: 'vehicle-racecar', emoji: '🏎️', name: 'מכונית מירוץ', category: 'vehicles' },
  { id: 'vehicle-airplane', emoji: '✈️', name: 'מטוס', category: 'vehicles' },
  { id: 'vehicle-train', emoji: '🚂', name: 'רכבת', category: 'vehicles' },
  { id: 'vehicle-tractor', emoji: '🚜', name: 'טרקטור', category: 'vehicles' },

  // Nature (3)
  { id: 'nature-rainbow', emoji: '🌈', name: 'קשת', category: 'nature' },
  { id: 'nature-sun', emoji: '☀️', name: 'שמש', category: 'nature' },
  { id: 'nature-mushroom', emoji: '🍄', name: 'פטריה', category: 'nature' },
];

export const CATEGORY_NAMES = {
  animals: 'חיות',
  fantasy: 'פנטזיה',
  vehicles: 'כלי רכב',
  nature: 'טבע',
};

export default STICKER_BANK;
