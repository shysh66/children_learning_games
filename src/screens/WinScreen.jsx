import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, Map } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes, QUESTIONS_PER_LEVEL, calculateStars } from '../data/levelConfigs';
import { getRankForTheme, getNextRankForTheme, getProgressToNextLevel, getGamesToNextLevel, calculateLevelBonusXP } from '../data/ranks';
import { getMedalDisplay } from '../data/medals';
import { updateLevelStars, addXP, recordGameStats, completeGame, getUniqueGamesCount } from '../utils/storage';
import { StarRating, Modal, Button } from '../components';

// Win/Summary screen after completing a level
const WinScreen = ({
  themeId,
  gameMode,
  level,
  score,
  earnedXP = 0,
  onNextLevel,
  onRetry,
  onBackToMap,
  triggerConfetti,
}) => {
  const theme = getTheme(themeId);
  const mode = gameModes[gameMode];
  const stars = calculateStars(score, QUESTIONS_PER_LEVEL);
  const passed = stars >= 1;
  const hasNextLevel = level < mode.totalLevels;

  // XP state
  const [showXPBreakdown, setShowXPBreakdown] = useState(false);
  const [showRankUp, setShowRankUp] = useState(false);
  const [showMedalEarned, setShowMedalEarned] = useState(false);
  const [earnedMedal, setEarnedMedal] = useState(null);
  const [currentRank, setCurrentRank] = useState(null);
  const [totalGamesCount, setTotalGamesCount] = useState(0);
  const [isNewGame, setIsNewGame] = useState(true);

  // Calculate bonus XP
  const levelBonusXP = passed ? calculateLevelBonusXP(level) : 0;
  const totalEarnedXP = earnedXP + levelBonusXP;

  // Save progress and handle game completion on mount
  useEffect(() => {
    // Step 1: Run anti-farming check via completeGame
    const gameResult = completeGame(gameMode, level, score, QUESTIONS_PER_LEVEL);
    setIsNewGame(gameResult.isNewGame);
    setTotalGamesCount(gameResult.totalUniqueGames);

    if (!gameResult.isNewGame) {
      // PRACTICE MODE - game was already completed

      // Still save star progress (allows improving stars on replay)
      if (stars > 0) {
        updateLevelStars(gameMode, level, stars);
      }

      // Load current rank info for display (but don't update)
      const gamesCount = getUniqueGamesCount();
      setTotalGamesCount(gamesCount);
      setCurrentRank(getRankForTheme(themeId, gamesCount));

      setTimeout(() => setShowXPBreakdown(true), 500);
      return;
    }

    // NEW GAME - full stats update
    // Save star progress
    if (stars > 0) {
      updateLevelStars(gameMode, level, stars);
    }

    // Record game stats for parent dashboard
    recordGameStats(gameMode, QUESTIONS_PER_LEVEL, score);

    // Add XP (still tracked as fun metric)
    if (totalEarnedXP > 0) {
      addXP(totalEarnedXP);
    }

    // Update rank display
    const rank = getRankForTheme(themeId, gameResult.totalUniqueGames);
    setCurrentRank(rank);

    // Check for rank up
    if (gameResult.newLevel > gameResult.previousLevel) {
      setShowRankUp(true);
      triggerConfetti?.('big');
    }

    // Check for medal upgrade
    if (gameResult.medalUpgrade) {
      setEarnedMedal(getMedalDisplay(gameResult.medalUpgrade));
      setTimeout(() => setShowMedalEarned(true), 1500);
    }

    // Show XP breakdown animation
    setTimeout(() => setShowXPBreakdown(true), 500);
  }, [gameMode, level, stars, score, totalEarnedXP, triggerConfetti, themeId]);

  // Get message based on performance
  const getMessage = () => {
    if (stars === 3) return 'מושלם!';
    if (stars === 2) return 'מעולה!';
    if (stars === 1) return 'יפה מאוד!';
    return 'כמעט!';
  };

  const getSubMessage = () => {
    if (stars === 3) return 'ענית נכון על כל השאלות!';
    if (stars >= 1) return 'ענית נכון על רוב השאלות!';
    return 'בוא ננסה שוב יחד';
  };

  // Progress info for rank
  const nextRank = currentRank ? getNextRankForTheme(themeId, totalGamesCount) : null;
  const progressPercent = getProgressToNextLevel(totalGamesCount);
  const gamesToNext = getGamesToNextLevel(totalGamesCount);

  return (
    <div
      className={`min-h-screen ${theme.bg} flex items-center justify-center p-8 ${theme.font}`}
      dir="rtl"
    >
      <div className="max-w-3xl w-full text-center">
        {/* Celebration emoji */}
        <div className="text-9xl mb-6 animate-bounce">
          {passed ? '🎉' : '💪'}
        </div>

        {/* Result card */}
        <div className={`${theme.cardBg} rounded-3xl p-8 sm:p-12 mb-8`}>
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-4">
            {getMessage()}
          </h2>

          {/* Score */}
          <div className="text-7xl sm:text-8xl font-black text-white mb-4">
            {score}/{QUESTIONS_PER_LEVEL}
          </div>

          {/* Stars */}
          <div className="flex justify-center mb-6">
            <StarRating stars={stars} maxStars={3} size="xlarge" />
          </div>

          <p className="text-2xl sm:text-3xl text-white/90 mb-6">
            {getSubMessage()}
          </p>

          {/* Practice Mode Banner */}
          {!isNewGame && (
            <div className="bg-yellow-500/20 border-2 border-yellow-400/40 rounded-2xl p-4 mb-6">
              <div className="text-3xl mb-2">🔄</div>
              <div className="text-xl font-bold text-yellow-300">מצב אימון</div>
              <div className="text-white/70">שיחקת את המשחק הזה כבר - אין עדכון ניקוד</div>
            </div>
          )}

          {/* XP & Rank Breakdown (only meaningful for new games) */}
          <div className={`bg-black/20 rounded-2xl p-6 transition-all duration-500 ${showXPBreakdown ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            {isNewGame && (
              <>
                <h3 className="text-2xl font-bold text-white mb-4">סיכום נקודות XP</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xl">
                    <span className="text-white/80">נקודות תשובות:</span>
                    <span className="text-green-400 font-bold">+{earnedXP} XP</span>
                  </div>
                  {passed && (
                    <div className="flex justify-between items-center text-xl">
                      <span className="text-white/80">בונוס שלב {level}:</span>
                      <span className="text-yellow-400 font-bold">+{levelBonusXP} XP</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 my-2"></div>
                  <div className="flex justify-between items-center text-2xl">
                    <span className="text-white font-bold">סה"כ:</span>
                    <span className="text-green-300 font-black">+{totalEarnedXP} XP</span>
                  </div>
                </div>
              </>
            )}

            {/* Current Rank Display (themed) */}
            {currentRank && (
              <div className={`${isNewGame ? 'mt-6 pt-4 border-t border-white/20' : ''}`}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{currentRank.icon}</span>
                  <div>
                    <div className="text-lg text-white/70">הדרגה שלך:</div>
                    <div className="text-2xl font-bold text-white">{currentRank.title}</div>
                  </div>
                </div>

                {/* Progress to next rank */}
                {nextRank && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-white/70 mb-1">
                      <span>לדרגה הבאה: {nextRank.icon} {nextRank.title}</span>
                      <span>עוד {gamesToNext} משחקים</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {!nextRank && (
                  <div className="text-center mt-2 text-yellow-300 font-bold text-sm">
                    הגעת לדרגה הגבוהה ביותר!
                  </div>
                )}

                <div className="text-center mt-2 text-white/50 text-sm">
                  {totalGamesCount} משחקים ייחודיים הושלמו
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          {passed && hasNextLevel && (
            <Button
              onClick={onNextLevel}
              variant="primary"
              size="large"
              theme={theme}
              icon={<ArrowRight size={32} />}
            >
              לשלב הבא!
            </Button>
          )}

          <Button
            onClick={onRetry}
            variant="secondary"
            size="large"
            theme={theme}
            icon={<RotateCcw size={32} />}
          >
            נסה שוב
          </Button>

          <Button
            onClick={onBackToMap}
            variant="ghost"
            size="large"
            theme={theme}
            icon={<Map size={32} />}
          >
            חזרה למפה
          </Button>
        </div>
      </div>

      {/* Rank Up Modal */}
      <Modal isOpen={showRankUp} onClose={() => setShowRankUp(false)} theme={theme}>
        <div className="text-9xl mb-6 animate-pulse">🎖️</div>
        <h1 className="text-5xl font-black text-white mb-4">עלית דרגה!</h1>
        {currentRank && (
          <>
            <div className="text-8xl mb-4">{currentRank.icon}</div>
            <h2 className="text-4xl font-bold text-white mb-8">{currentRank.title}</h2>
          </>
        )}
        <p className="text-2xl text-white/90 mb-8">כל הכבוד! המשך לשחק ולהתקדם!</p>
        <Button
          onClick={() => setShowRankUp(false)}
          variant="primary"
          size="xlarge"
          theme={theme}
        >
          יאללה! 🚀
        </Button>
      </Modal>

      {/* Medal Earned Modal */}
      <Modal isOpen={showMedalEarned} onClose={() => setShowMedalEarned(false)} theme={theme}>
        <div className="text-9xl mb-6 animate-pulse">{earnedMedal?.icon}</div>
        <h1 className="text-5xl font-black text-white mb-4">מדליה חדשה!</h1>
        <h2 className="text-4xl font-bold text-white mb-4">{earnedMedal?.name}</h2>
        <p className="text-2xl text-white/90 mb-8">הרווחת מדליית {earnedMedal?.name} בנושא {gameModes[gameMode]?.name}!</p>
        <Button
          onClick={() => setShowMedalEarned(false)}
          variant="primary"
          size="xlarge"
          theme={theme}
        >
          מגניב! ✨
        </Button>
      </Modal>
    </div>
  );
};

export default WinScreen;
