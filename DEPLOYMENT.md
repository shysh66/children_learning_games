# 🚀 הוראות Deploy ל-GitHub Pages

## שלב 1: הכן את הקבצים

כל הקבצים מוכנים! הפרויקט נמצא בתיקייה `/home/claude/math-game-project/`

## שלב 2: העלה ל-GitHub

פתח טרמינל והרץ את הפקודות הבאות:

```bash
# נווט לתיקיית הפרויקט
cd /path/to/math-game-project

# אתחל git repository (אם עדיין לא עשית)
git init

# הוסף את כל הקבצים
git add .

# צור commit ראשון
git commit -m "Initial commit - Math game for kids"

# חבר ל-GitHub repository שלך
git remote add origin https://github.com/shysh66/children_learning_games.git

# דחוף את הקוד
git branch -M main
git push -u origin main
```

## שלב 3: התקן Dependencies ו-Deploy

```bash
# התקן את כל ה-dependencies
npm install

# Deploy ל-GitHub Pages (זה יבנה ויעלה אוטומטית)
npm run deploy
```

## שלב 4: הפעל GitHub Pages

1. גש ל: https://github.com/shysh66/children_learning_games/settings/pages
2. תחת **"Source"** בחר את ה-branch `gh-pages`
3. לחץ **Save**
4. המתן 1-2 דקות

## ✅ סיימת!

האתר שלך יהיה זמין ב:
**https://shysh66.github.io/children_learning_games**

---

## 🔄 עדכונים עתידיים

כשתרצה לעדכן את האתר:

```bash
# ערוך את הקבצים
# ...

# הוסף את השינויים
git add .
git commit -m "תיאור השינויים"
git push

# Deploy מחדש
npm run deploy
```

---

## ❓ פתרון בעיות

### אם `npm install` נכשל:
```bash
# נסה עם --legacy-peer-deps
npm install --legacy-peer-deps
```

### אם `npm run deploy` נכשל:
```bash
# ודא שאתה מחובר ל-GitHub
git remote -v

# אם צריך, הוסף את ה-remote שוב
git remote set-url origin https://github.com/shysh66/children_learning_games.git
```

### אם הדף לא נטען:
- בדוק את Settings > Pages שה-branch נכון
- המתן 2-3 דקות לעיבוד
- נקה cache של הדפדפן (Ctrl+Shift+R)

---

## 📝 מבנה הפרויקט

```
math-game-project/
├── public/
│   └── index.html          # HTML בסיסי
├── src/
│   ├── App.jsx            # המשחק הראשי
│   ├── index.js           # entry point
│   └── index.css          # Tailwind CSS
├── package.json           # dependencies וscripts
├── tailwind.config.js     # הגדרות Tailwind
├── postcss.config.js      # הגדרות PostCSS
└── README.md              # תיעוד
```

בהצלחה! 🎮✨
