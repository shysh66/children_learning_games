import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

// Screens
import {
  ProfileSelectScreen,
  ProfileCreateScreen,
  ThemeSelectScreen,
  GameSelectScreen,
  LevelMapScreen,
  GameScreen,
  JuniorGameScreen,
  WinScreen,
  EnglishPracticeScreen,
  AudioMemoryGame,
  FindItFastGame,
} from './screens';

// Data
import { getTheme } from './data/themes';
import { gameModes } from './data/levelConfigs';

// Utils
import {
  saveTheme,
  getSelectedTheme,
  hasActiveProfile,
  logoutProfile
} from './utils/storage';
import { playCheerSound, playCelebrationSound } from './utils/sounds';

// Version info
const APP_VERSION = '4.1.0';
const LAST_UPDATE = '31.1.2026';

// Screen names for navigation
const SCREENS = {
  PROFILE_SELECT: 'profileSelect',
  PROFILE_CREATE: 'profileCreate',
  THEME_SELECT: 'themeSelect',
  GAME_SELECT: 'gameSelect',
  LEVEL_MAP: 'levelMap',
  GAME: 'game',
  WIN: 'win',
  ENGLISH_PRACTICE: 'englishPractice',
  MEMORY_GAME: 'memoryGame',
  FIND_IT_GAME: 'findItGame',
};

const App = () => {
  // Navigation state - start with profile select if no active profile
  const [currentScreen, setCurrentScreen] = useState(
    hasActiveProfile() ? SCREENS.THEME_SELECT : SCREENS.PROFILE_SELECT
  );

  // Game context state
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [lastEarnedXP, setLastEarnedXP] = useState(0);

  // Load saved theme for active profile on mount or profile change
  useEffect(() => {
    if (hasActiveProfile()) {
      const savedTheme = getSelectedTheme();
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
    }
  }, [currentScreen]);

  // Confetti trigger function using canvas-confetti with sound
  const triggerConfetti = useCallback((type = 'normal') => {
    const theme = selectedTheme ? getTheme(selectedTheme) : null;
    const colors = theme?.confettiColors || ['#818cf8', '#c084fc', '#fbbf24'];

    if (type === 'big') {
      // Big celebration confetti with fanfare sound
      playCelebrationSound();
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else {
      // Normal confetti burst with cheer sound
      playCheerSound();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });
    }
  }, [selectedTheme]);

  // Profile handlers
  const handleSelectProfile = (profile) => {
    // Load the profile's saved theme
    const savedTheme = getSelectedTheme();
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    } else {
      setSelectedTheme(null);
    }
    setCurrentScreen(SCREENS.THEME_SELECT);
  };

  const handleAddProfile = () => {
    setCurrentScreen(SCREENS.PROFILE_CREATE);
  };

  const handleProfileCreated = (profile) => {
    // New profile - no theme selected yet
    setSelectedTheme(null);
    setCurrentScreen(SCREENS.THEME_SELECT);
  };

  const handleBackToProfileSelect = () => {
    setCurrentScreen(SCREENS.PROFILE_SELECT);
  };

  const handleSwitchUser = () => {
    logoutProfile();
    setSelectedTheme(null);
    setSelectedGameMode(null);
    setCurrentScreen(SCREENS.PROFILE_SELECT);
  };

  // Navigation handlers
  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
    saveTheme(themeId);
    setCurrentScreen(SCREENS.GAME_SELECT);
  };

  const handleSelectGame = (gameMode) => {
    setSelectedGameMode(gameMode);

    // Check if this is a practice zone (like English)
    const mode = gameModes[gameMode];
    if (mode?.isPracticeZone) {
      setCurrentScreen(SCREENS.ENGLISH_PRACTICE);
    } else {
      setCurrentScreen(SCREENS.LEVEL_MAP);
    }
  };

  const handleSelectPracticeGame = (practiceGameId) => {
    if (practiceGameId === 'memory') {
      setCurrentScreen(SCREENS.MEMORY_GAME);
    } else if (practiceGameId === 'findit') {
      setCurrentScreen(SCREENS.FIND_IT_GAME);
    }
  };

  const handleBackToEnglishPractice = () => {
    setCurrentScreen(SCREENS.ENGLISH_PRACTICE);
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    setCurrentScreen(SCREENS.GAME);
  };

  const handleGameComplete = (score, earnedXP = 0) => {
    setLastScore(score);
    setLastEarnedXP(earnedXP);
    setCurrentScreen(SCREENS.WIN);
  };

  const handleNextLevel = () => {
    setSelectedLevel((prev) => prev + 1);
    setCurrentScreen(SCREENS.GAME);
  };

  const handleRetry = () => {
    setCurrentScreen(SCREENS.GAME);
  };

  const handleBackToMap = () => {
    setCurrentScreen(SCREENS.LEVEL_MAP);
  };

  const handleBackToGameSelect = () => {
    setSelectedGameMode(null);
    setCurrentScreen(SCREENS.GAME_SELECT);
  };

  const handleBackToThemeSelect = () => {
    setSelectedTheme(null);
    setSelectedGameMode(null);
    setCurrentScreen(SCREENS.THEME_SELECT);
  };

  // Render current screen
  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.PROFILE_SELECT:
        return (
          <ProfileSelectScreen
            onSelectProfile={handleSelectProfile}
            onAddProfile={handleAddProfile}
            version={APP_VERSION}
            lastUpdate={LAST_UPDATE}
          />
        );

      case SCREENS.PROFILE_CREATE:
        return (
          <ProfileCreateScreen
            onProfileCreated={handleProfileCreated}
            onBack={handleBackToProfileSelect}
          />
        );

      case SCREENS.THEME_SELECT:
        return (
          <ThemeSelectScreen
            onSelectTheme={handleSelectTheme}
            onSwitchUser={handleSwitchUser}
            version={APP_VERSION}
            lastUpdate={LAST_UPDATE}
          />
        );

      case SCREENS.GAME_SELECT:
        return (
          <GameSelectScreen
            themeId={selectedTheme}
            onSelectGame={handleSelectGame}
            onBack={handleBackToThemeSelect}
          />
        );

      case SCREENS.LEVEL_MAP:
        return (
          <LevelMapScreen
            themeId={selectedTheme}
            gameMode={selectedGameMode}
            onSelectLevel={handleSelectLevel}
            onBack={handleBackToGameSelect}
          />
        );

      case SCREENS.GAME:
        // Use JuniorGameScreen for junior mode, regular GameScreen for others
        const GameComponent = selectedGameMode === 'junior' ? JuniorGameScreen : GameScreen;
        return (
          <GameComponent
            themeId={selectedTheme}
            gameMode={selectedGameMode}
            level={selectedLevel}
            onComplete={handleGameComplete}
            onBack={handleBackToMap}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.WIN:
        return (
          <WinScreen
            themeId={selectedTheme}
            gameMode={selectedGameMode}
            level={selectedLevel}
            score={lastScore}
            earnedXP={lastEarnedXP}
            onNextLevel={handleNextLevel}
            onRetry={handleRetry}
            onBackToMap={handleBackToMap}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.ENGLISH_PRACTICE:
        return (
          <EnglishPracticeScreen
            themeId={selectedTheme}
            onSelectGame={handleSelectPracticeGame}
            onBack={handleBackToGameSelect}
          />
        );

      case SCREENS.MEMORY_GAME:
        return (
          <AudioMemoryGame
            themeId={selectedTheme}
            onBack={handleBackToEnglishPractice}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.FIND_IT_GAME:
        return (
          <FindItFastGame
            themeId={selectedTheme}
            onBack={handleBackToEnglishPractice}
            triggerConfetti={triggerConfetti}
          />
        );

      default:
        return (
          <ProfileSelectScreen
            onSelectProfile={handleSelectProfile}
            onAddProfile={handleAddProfile}
            version={APP_VERSION}
            lastUpdate={LAST_UPDATE}
          />
        );
    }
  };

  return <>{renderScreen()}</>;
};

export default App;
