import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

// Screens
import {
  ThemeSelectScreen,
  GameSelectScreen,
  LevelMapScreen,
  GameScreen,
  JuniorGameScreen,
  WinScreen,
} from './screens';

// Data
import { getTheme } from './data/themes';

// Utils
import { saveTheme, getSelectedTheme } from './utils/storage';
import { playCheerSound, playCelebrationSound } from './utils/sounds';

// Version info
const APP_VERSION = '3.0.0';
const LAST_UPDATE = '31.1.2026';

// Screen names for navigation
const SCREENS = {
  THEME_SELECT: 'themeSelect',
  GAME_SELECT: 'gameSelect',
  LEVEL_MAP: 'levelMap',
  GAME: 'game',
  WIN: 'win',
};

const App = () => {
  // Navigation state
  const [currentScreen, setCurrentScreen] = useState(SCREENS.THEME_SELECT);

  // Game context state
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [lastEarnedXP, setLastEarnedXP] = useState(0);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = getSelectedTheme();
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
  }, []);

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

  // Navigation handlers
  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
    saveTheme(themeId);
    setCurrentScreen(SCREENS.GAME_SELECT);
  };

  const handleSelectGame = (gameMode) => {
    setSelectedGameMode(gameMode);
    setCurrentScreen(SCREENS.LEVEL_MAP);
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
      case SCREENS.THEME_SELECT:
        return (
          <ThemeSelectScreen
            onSelectTheme={handleSelectTheme}
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

      default:
        return (
          <ThemeSelectScreen
            onSelectTheme={handleSelectTheme}
            version={APP_VERSION}
            lastUpdate={LAST_UPDATE}
          />
        );
    }
  };

  return <>{renderScreen()}</>;
};

export default App;
