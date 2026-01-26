import React, { useState, useEffect } from 'react';
import { ArrowRight, RotateCcw, Trophy, Map } from 'lucide-react';
import { getTheme } from '../data/themes';
import { QUESTIONS_PER_LEVEL, calculateStars, TOTAL_LEVELS } from '../data/levelConfigs';
import { getRandomMedal } from '../data/medals';
import { updateLevelStars } from '../utils/storage';
import { StarRating, Modal, Button } from '../components';

// Win/Summary screen after completing a level
const WinScreen = ({
  themeId,
  gameMode,
  level,
  score,
  onNextLevel,
  onRetry,
  onBackToMap,
  triggerConfetti,
}) => {
  const theme = getTheme(themeId);
  const stars = calculateStars(score, QUESTIONS_PER_LEVEL);
  const passed = stars >= 1;
  const hasNextLevel = level < TOTAL_LEVELS;

  // Medal modal state
  const [showMedal, setShowMedal] = useState(false);
  const [medalTitle, setMedalTitle] = useState('');

  // Save progress when component mounts
  useEffect(() => {
    if (stars > 0) {
      updateLevelStars(gameMode, level, stars);
    }
  }, [gameMode, level, stars]);

  // Handle medal button click
  const handleShowMedal = () => {
    setMedalTitle(getRandomMedal());
    setShowMedal(true);
    triggerConfetti?.('big');
  };

  // Handle close medal and go to map
  const handleCloseMedal = () => {
    setShowMedal(false);
    onBackToMap();
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
        <div className={`${theme.cardBg} rounded-3xl p-12 mb-8`}>
          <h2 className="text-6xl font-black text-white mb-6">
            {getMessage()}
          </h2>

          {/* Score */}
          <div className="text-8xl font-black text-white mb-4">
            {score}/{QUESTIONS_PER_LEVEL}
          </div>

          {/* Stars */}
          <div className="flex justify-center mb-4">
            <StarRating stars={stars} maxStars={3} size="xlarge" />
          </div>

          <p className="text-3xl text-white/90">
            {getSubMessage()}
          </p>
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

          {/* Medal or Back to Map button */}
          <Button
            onClick={passed ? handleShowMedal : onBackToMap}
            variant="ghost"
            size="large"
            theme={theme}
            icon={passed ? <Trophy size={32} /> : <Map size={32} />}
          >
            {passed ? 'קבל מדליה!' : 'חזרה למפה'}
          </Button>
        </div>
      </div>

      {/* Medal Modal */}
      <Modal isOpen={showMedal} onClose={handleCloseMedal} theme={theme}>
        <div className="text-9xl mb-6 animate-pulse">🏆</div>
        <h1 className="text-6xl font-black text-white mb-8">{medalTitle}</h1>
        <p className="text-3xl text-white/90 mb-8">כל הכבוד! המשך כך!</p>
        <Button
          onClick={handleCloseMedal}
          variant="primary"
          size="xlarge"
          theme={theme}
        >
          חזרה למפה 🗺️
        </Button>
      </Modal>
    </div>
  );
};

export default WinScreen;
