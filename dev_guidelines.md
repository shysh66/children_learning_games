# הנחיות פיתוח - Development Guidelines

## 📌 בכל שינוי קוד, עדכן את הפרטים הבאים:

### 1. src/App.jsx (שורות 5-6)
```javascript
const APP_VERSION = 'X.X.X';      // עדכן גרסה
const LAST_UPDATE = 'DD.MM.YYYY'; // עדכן תאריך
```

### 2. package.json
```json
"version": "X.X.X"
```

### 3. CHANGELOG.md (הוסף בראש הקובץ)
```markdown
## [X.X.X] - DD.MM.YYYY

### 🐛 תוקן (Fixed)
- תיאור בעברית

### ✨ נוסף (Added)
- תיאור בעברית

### 🔄 שונה (Changed)
- תיאור בעברית
```

---

## 🔢 כללי מספור גרסאות (Semantic Versioning)

| סוג שינוי | דוגמה | שינוי גרסה |
|-----------|--------|------------|
| תיקון באג | תיקון תצוגה | 1.1.0 → 1.1.1 |
| תכונה חדשה | משחק חדש | 1.1.0 → 1.2.0 |
| שינוי גדול | ארכיטקטורה | 1.1.0 → 2.0.0 |

---

## 📅 פורמט תאריך
השתמש ב: `DD.MM.YYYY` (לדוגמה: 26.01.2025)

---

## ✅ צ'קליסט לפני commit
- [ ] עודכן APP_VERSION ב-App.jsx
- [ ] עודכן LAST_UPDATE ב-App.jsx
- [ ] עודכן version ב-package.json
- [ ] נוספה רשומה ל-CHANGELOG.md בעברית
