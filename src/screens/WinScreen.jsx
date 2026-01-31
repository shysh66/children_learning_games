import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, Map } from 'lucide-react';
import { getTheme } from '../data/themes';
import { gameModes, QUESTIONS_PER_LEVEL, calculateStars } from '../data/levelConfigs';
import { getRankByXP, calculateLevelBonusXP } from '../data/ranks';
import { updateLevelStars, addXP, getTotalXP } from '../utils/storage';
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
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newRank, setNewRank] = useState(null);
  const [totalXPAfter, setTotalXPAfter] = useState(0);

  // Calculate bonus XP
  const levelBonusXP = passed ? calculateLevelBonusXP(level) : 0;
  const totalEarnedXP = earnedXP + levelBonusXP;

  // Save progress and XP when component mounts
  useEffect(() => {
    // Save star progress
    if (stars > 0) {
      updateLevelStars(gameMode, level, stars);
    }

    // Get previous XP and rank
    const previousXP = getTotalXP();
    const prevRank = getRankByXP(previousXP);

    // Add XP to storage
    if (totalEarnedXP > 0) {
      const result = addXP(totalEarnedXP);
      setTotalXPAfter(result.newXP);

      // Check if rank changed
      const newRankResult = getRankByXP(result.newXP);
      setNewRank(newRankResult);

      if (newRankResult.id !== prevRank.id) {
        // Rank up!
        setShowLevelUp(true);
        triggerConfetti?.('big');
      }
    } else {
      setTotalXPAfter(previousXP);
      setNewRank(prevRank);
    }

    // Show XP breakdown animation
    setTimeout(() => {
      setShowXPBreakdown(true);
    }, 500);
  }, [gameMode, level, stars, totalEarnedXP, triggerConfetti]);

  // Handle close level up modal
  const handleCloseLevelUp = () => {
    setShowLevelUp(false);
  };

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

          {/* XP Breakdown */}
          <div className={`bg-black/20 rounded-2xl p-6 transition-all duration-500 ${showXPBreakdown ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
            <h3 className="text-2xl font-bold text-white mb-4">סיכום נקודות XP</h3>

            <div className="space-y-3">
              {/* Score XP */}
              <div className="flex justify-between items-center text-xl">
                <span className="text-white/80">נקודות תשובות:</span>
                <span className="text-green-400 font-bold">+{earnedXP} XP</span>
              </div>

              {/* Level Bonus */}
              {passed && (
                <div className="flex justify-between items-center text-xl">
                  <span className="text-white/80">בונוס שלב {level}:</span>
                  <span className="text-yellow-400 font-bold">+{levelBonusXP} XP</span>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/20 my-2"></div>

              {/* Total */}
              <div className="flex justify-between items-center text-2xl">
                <span className="text-white font-bold">סה"כ:</span>
                <span className="text-green-300 font-black">+{totalEarnedXP} XP</span>
              </div>
            </div>

            {/* Current Rank Display */}
            {newRank && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-4xl">{newRank.icon}</span>
                  <div>
                    <div className="text-lg text-white/70">הדירוג שלך:</div>
                    <div className="text-2xl font-bold text-white">{newRank.name}</div>
                  </div>
                  <div className="text-lg text-white/60">
                    ({totalXPAfter.toLocaleString()} XP)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          {/* Next Level button - only if passed and has more levels */}
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

          {/* Retry button */}
          <Button
            onClick={onRetry}
            variant="secondary"
            size="large"
            theme={theme}
            icon={<RotateCcw size={32} />}
          >
            נסה שוב
          </Button>

          {/* Back to Map button */}
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

      {/* Level Up Modal */}
      <Modal isOpen={showLevelUp} onClose={handleCloseLevelUp} theme={theme}>
        <div className="text-9xl mb-6 animate-pulse">🎖️</div>
        <h1 className="text-5xl font-black text-white mb-4">עלית דרגה!</h1>
        {newRank && (
          <>
            <div className="text-8xl mb-4">{newRank.icon}</div>
            <h2 className="text-4xl font-bold text-white mb-8">{newRank.name}</h2>
          </>
        )}
        <p className="text-2xl text-white/90 mb-8">כל הכבוד! המשך לשחק ולצבור XP!</p>
        <Button
          onClick={handleCloseLevelUp}
          variant="primary"
          size="xlarge"
          theme={theme}
        >
          יאללה! 🚀
        </Button>
      </Modal>
    </div>
  );
};

export default WinScreen;
