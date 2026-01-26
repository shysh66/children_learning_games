#!/bin/bash

echo "🚀 מתחיל להעלות את משחק החשבון ל-GitHub Pages..."
echo ""

# בדיקה אם אנחנו בתיקייה הנכונה
if [ ! -f "package.json" ]; then
    echo "❌ שגיאה: הרץ את הסקריפט מתוך תיקיית הפרויקט"
    exit 1
fi

# אתחול git אם צריך
if [ ! -d ".git" ]; then
    echo "📦 מאתחל Git repository..."
    git init
fi

# הוספת remote
echo "🔗 מחבר ל-GitHub..."
git remote add origin https://github.com/shysh66/children_learning_games.git 2>/dev/null || git remote set-url origin https://github.com/shysh66/children_learning_games.git

# הוספת קבצים
echo "📝 מוסיף קבצים..."
git add .

# commit
echo "💾 יוצר commit..."
git commit -m "Deploy math game for kids 🎮"

# דחיפה ל-main
echo "⬆️  דוחף ל-GitHub..."
git branch -M main
git push -u origin main

# התקנת dependencies
echo "📦 מתקין dependencies..."
npm install

# deploy ל-GitHub Pages
echo "🚀 מעלה ל-GitHub Pages..."
npm run deploy

echo ""
echo "✅ סיימנו!"
echo "🌐 האתר שלך יהיה זמין בקרוב ב:"
echo "   https://shysh66.github.io/children_learning_games"
echo ""
echo "📋 עכשיו:"
echo "   1. לך ל-GitHub Settings > Pages"
echo "   2. בחר את ה-branch 'gh-pages'"
echo "   3. המתן 1-2 דקות"
echo ""
