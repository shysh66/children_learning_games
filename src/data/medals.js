// Medal titles awarded when completing a level
// Hebrew titles for kids - fun and encouraging

export const medalTitles = [
  "אצן הברק",
  "אריה המספרים",
  "טייס חלל ראשי",
  "טי-רקס טורף תרגילים",
  "חד-קרן הקסם",
  "המוח הגדול",
  "פרופסור לחשבון",
  "ינשוף החוכמה",
  "בלש המספרים",
  "מחשב אנושי",
  "מלך העוגיות",
  "סופת טורנדו",
  "רוק-סטאר של כפל",
  "שליט הממלכה",
  "אספן היהלומים",
  "אלוף האלופים",
  "כוכב על",
  "מאסטר האש",
  "שומר המספרים",
  "מאלף הדרקונים",
];

// Get a random medal title
export const getRandomMedal = () => {
  const index = Math.floor(Math.random() * medalTitles.length);
  return medalTitles[index];
};
