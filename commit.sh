#!/bin/bash

echo "📝 מכין את הקבצים ל-Git..."
echo ""

# בדיקה אם אנחנו בתיקייה הנכונה
if [ ! -f "package.json" ]; then
    echo "❌ שגיאה: הרץ את הסקריפט מתוך תיקיית הפרויקט"
    exit 1
fi

# בדיקת הגדרות Git user
echo "🔍 בודק הגדרות Git..."
USER_NAME=$(git config user.name)
USER_EMAIL=$(git config user.email)

if [ -z "$USER_NAME" ] || [ -z "$USER_EMAIL" ]; then
    echo "⚠️  לא הוגדר Git user. אנא הגדר:"
    echo "   git config --global user.name \"Your Name\""
    echo "   git config --global user.email \"your.email@example.com\""
    exit 1
fi

echo "✅ Git user: $USER_NAME <$USER_EMAIL>"
echo ""

# הצגת סטטוס
echo "📊 סטטוס נוכחי:"
git status --short
echo ""

# שאלה האם להמשיך
read -p "📤 להוסיף את כל הקבצים ולעשות commit? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ בוטל על ידי המשתמש"
    exit 1
fi

# הוספת קבצים
echo "📦 מוסיף קבצים..."
git add .

# יצירת commit
echo "💾 יוצר commit..."
git commit -m "Version 1.1.0 - Bug fixes and version tracking system

- Fix multiplication difficulty progression (min results per level)
- Fix subtraction number order (larger number always on left)
- Add version display on home screen
- Add CHANGELOG.md for version tracking
- Add VERSION_UPDATE_GUIDE.md for future updates
- Clean up unused imports
- Prepare for Vercel deployment"

# בדיקה אם יש remote
if git remote -v | grep -q "origin"; then
    echo ""
    read -p "🚀 לדחוף ל-GitHub? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "⬆️  דוחף ל-GitHub..."
        git push origin main
        
        echo ""
        echo "✅ הכל הועלה בהצלחה!"
        echo ""
        echo "🌐 בדוק את: https://github.com/shysh66/children_learning_games"
    else
        echo "⏭️  דילגת על push. אתה יכול לדחוף מאוחר יותר עם: git push origin main"
    fi
else
    echo ""
    echo "⚠️  לא נמצא remote 'origin'"
    echo "הוסף remote עם:"
    echo "   git remote add origin https://github.com/shysh66/children_learning_games.git"
    echo "   git push -u origin main"
fi

echo ""
echo "📋 השלב הבא: Deploy ל-Vercel!"
echo "   קרא את: VERCEL_DEPLOYMENT.md"
echo ""
