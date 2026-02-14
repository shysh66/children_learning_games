import React, { useState, useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getAllProfilesWithStats } from '../utils/storage';
import { getRankForTheme } from '../data/ranks';
import { getMedalDisplay, SUBJECT_NAMES } from '../data/medals';

// Category display config
const CATEGORIES = {
  junior: { name: 'חשבון ראשוני', icon: '🔢' },
  addsub: { name: 'חיבור וחיסור', icon: '➕' },
  multiply: { name: 'כפל', icon: '✖️' },
  divide: { name: 'חילוק', icon: '➗' },
  compare: { name: 'השוואה', icon: '🐊' },
  sequence: { name: 'סדרות', icon: '🚂' },
  english: { name: 'אנגלית', icon: '🔤' },
};

// Get last 7 days as array of date strings
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
};

// Format date for display (e.g., "4.2" for Feb 4)
const formatDate = (dateStr) => {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(day)}.${parseInt(month)}`;
};

// Parent Dashboard Screen
const ParentDashboard = ({ onBack }) => {
  const profiles = useMemo(() => getAllProfilesWithStats(), []);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);

  const selectedProfile = profiles[selectedProfileIndex] || null;

  // Prepare daily XP chart data (last 7 days)
  const dailyXPData = useMemo(() => {
    if (!selectedProfile) return [];
    const days = getLast7Days();
    return days.map((date) => ({
      date: formatDate(date),
      xp: selectedProfile.stats.dailyXP[date] || 0,
    }));
  }, [selectedProfile]);

  // Prepare category accuracy chart data
  const categoryData = useMemo(() => {
    if (!selectedProfile) return [];
    const stats = selectedProfile.stats.categoryStats;

    return Object.entries(CATEGORIES)
      .map(([key, config]) => {
        const catStats = stats[key] || { attempts: 0, correct: 0 };
        const accuracy =
          catStats.attempts > 0
            ? Math.round((catStats.correct / catStats.attempts) * 100)
            : 0;
        return {
          name: config.name,
          icon: config.icon,
          accuracy,
          attempts: catStats.attempts,
          correct: catStats.correct,
          hasData: catStats.attempts > 0,
        };
      })
      .filter((d) => d.hasData);
  }, [selectedProfile]);

  // Generate insights text
  const insights = useMemo(() => {
    if (!selectedProfile || categoryData.length === 0) {
      return 'אין מספיק נתונים עדיין. שחקו עוד קצת כדי לראות תובנות!';
    }

    const sorted = [...categoryData].sort((a, b) => b.accuracy - a.accuracy);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    if (sorted.length === 1) {
      return `${selectedProfile.name} שיחק/ה ב${best.name} עם דיוק של ${best.accuracy}%.`;
    }

    if (best.accuracy === worst.accuracy) {
      return `${selectedProfile.name} מראה ביצועים עקביים בכל הנושאים (${best.accuracy}%).`;
    }

    const bestMsg = `${selectedProfile.name} מצטיין/ת ב${best.name} (${best.accuracy}%)`;
    const worstMsg =
      worst.accuracy < 70
        ? ` אבל צריך/ה עזרה ב${worst.name} (${worst.accuracy}%).`
        : ` ומסתדר/ת יפה גם ב${worst.name} (${worst.accuracy}%).`;

    return bestMsg + worstMsg;
  }, [selectedProfile, categoryData]);

  // Total XP over last 7 days
  const weeklyTotalXP = useMemo(() => {
    return dailyXPData.reduce((sum, d) => sum + d.xp, 0);
  }, [dailyXPData]);

  if (profiles.length === 0) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8"
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-white mb-4">אין פרופילים</h1>
          <p className="text-white/60 mb-8">צרו פרופיל כדי לראות סטטיסטיקות</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-bold transition-all"
          >
            חזרה
          </button>
        </div>
      </div>
    );
  }

  const uniqueGamesCount = (selectedProfile?.completedGameIds || []).length;
  const themeId = selectedProfile?.selectedTheme || 'space';
  const rank = selectedProfile ? getRankForTheme(themeId, uniqueGamesCount) : null;
  const profileMedals = selectedProfile?.medals || {};

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8 font-sans"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all flex items-center gap-2"
          >
            <ArrowRight size={20} />
            חזרה
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>📊</span> אזור הורים
          </h1>
        </div>

        {/* Child Selector Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {profiles.map((profile, index) => (
            <button
              key={profile.id}
              onClick={() => setSelectedProfileIndex(index)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-lg transition-all whitespace-nowrap ${
                index === selectedProfileIndex
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span className="text-2xl">{profile.avatar}</span>
              {profile.name}
            </button>
          ))}
        </div>

        {selectedProfile && (
          <>
            {/* Profile Summary Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-5xl">{selectedProfile.avatar}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedProfile.name}
                  </h2>
                  <div className="flex items-center gap-2 text-white/60">
                    {rank && (
                      <>
                        <span className="text-xl">{rank.icon}</span>
                        <span>{rank.title}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{uniqueGamesCount} משחקים ייחודיים</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Medals */}
            {Object.keys(profileMedals).length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🏅</span> מדליות לפי נושא
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(profileMedals).map(([subject, medalTier]) => {
                    const medal = getMedalDisplay(medalTier);
                    if (!medal) return null;
                    return (
                      <div
                        key={subject}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                      >
                        <div className="text-3xl mb-1">{medal.icon}</div>
                        <div className="text-sm text-white/50">{SUBJECT_NAMES[subject] || subject}</div>
                        <div className="text-lg font-bold text-white">{medal.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chart 1: Activity & Growth (Line Chart) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📈</span> פעילות וצמיחה
                </h3>
                <span className="text-sm text-white/40">7 ימים אחרונים</span>
              </div>

              {weeklyTotalXP > 0 ? (
                <>
                  <div className="mb-4 text-center">
                    <span className="text-3xl font-bold text-purple-400">
                      {weeklyTotalXP.toLocaleString()}
                    </span>
                    <span className="text-white/50 mr-2">XP השבוע</span>
                  </div>
                  <div className="h-52 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyXPData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <YAxis
                          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(30, 30, 50, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white',
                            direction: 'rtl',
                          }}
                          formatter={(value) => [`${value} XP`, 'נקודות']}
                        />
                        <Line
                          type="monotone"
                          dataKey="xp"
                          stroke="#a855f7"
                          strokeWidth={3}
                          dot={{ fill: '#a855f7', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              ) : (
                <div className="h-52 flex items-center justify-center">
                  <p className="text-white/40 text-lg">
                    אין פעילות ב-7 הימים האחרונים
                  </p>
                </div>
              )}
            </div>

            {/* Chart 2: Strengths & Weaknesses (Bar Chart) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> חוזקות וחולשות
              </h3>

              {categoryData.length > 0 ? (
                <div className="h-52 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} barSize={40}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(30, 30, 50, 0.95)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: 'white',
                          direction: 'rtl',
                        }}
                        formatter={(value, name, props) => [
                          `${value}% (${props.payload.correct}/${props.payload.attempts})`,
                          'דיוק',
                        ]}
                      />
                      <Bar dataKey="accuracy" fill="#22d3ee" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center">
                  <p className="text-white/40 text-lg">
                    אין נתונים עדיין. שחקו כדי לראות סטטיסטיקות!
                  </p>
                </div>
              )}
            </div>

            {/* Insights Section */}
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/20 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                <span>💡</span> תובנות
              </h3>
              <p className="text-lg text-white/80 leading-relaxed">{insights}</p>
            </div>

            {/* Per-category detail cards */}
            {categoryData.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {categoryData.map((cat) => (
                  <div
                    key={cat.name}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-sm text-white/50 mb-1">{cat.name}</div>
                    <div
                      className={`text-2xl font-bold ${
                        cat.accuracy >= 80
                          ? 'text-green-400'
                          : cat.accuracy >= 60
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}
                    >
                      {cat.accuracy}%
                    </div>
                    <div className="text-xs text-white/30 mt-1">
                      {cat.correct}/{cat.attempts} תשובות
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;
