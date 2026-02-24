import React, { useState, useEffect, useCallback } from 'react';
import posthog from 'posthog-js';
import confetti from 'canvas-confetti';

// Screens
import {
  ProfileSelectScreen,
  ProfileCreateScreen,
  ThemeSelectScreen,
  ZoneSelectScreen,
  GameSelectScreen,
  LevelMapScreen,
  GameScreen,
  JuniorGameScreen,
  WinScreen,
  EnglishPracticeScreen,
  AudioMemoryGame,
  FindItFastGame,
  LogicSelectScreen,
  CompareGameScreen,
  SequenceGameScreen,
  ParentDashboard,
  LittleExplorersMenuScreen,
  SorterGame,
  FeedTheAnimalGame,
  SmartMemoryGame,
  FirstWordGame,
  PolygonDetectiveGame,
  PatternSequenceGame,
  OddOneOutGame,
  OppositesGame,
  ReadingDetectiveGame,
  RobotLabGame,
  StickerAlbum,
  BalloonPartyGame,
  FirstLetterMatchGame,
  ShadowDetective,
  DirectionCatcher,
  WildPlantPatrolGame,
  SentenceMachineGame,
} from './screens';

// Zone components
import LetterKingdom from './components/zones/LetterKingdom';
import NumberKingdom from './components/zones/NumberKingdom';
import LogicKingdom from './components/zones/LogicKingdom';
import MathKingdom from './components/zones/MathKingdom';
import DetectiveHQ from './components/zones/DetectiveHQ';
import ReadingWorld from './components/zones/ReadingWorld';
import NatureLab from './components/zones/NatureLab';

// Components
import ParentGateModal from './components/ParentGateModal';
import Modal from './components/Modal';
import Button from './components/Button';
import Footer from './components/Footer';

// Data
import { getTheme } from './data/themes';

// Utils
import {
  saveTheme,
  getSelectedTheme,
  hasActiveProfile,
  getActiveProfile,
  hasProfiles,
  logoutProfile,
  saveSelectedZone,
  getSelectedZone,
  checkAndMigrateProfiles,
} from './utils/storage';
import { playCheerSound, playCelebrationSound } from './utils/sounds';

// Version info
const APP_VERSION = '6.11.0';
const LAST_UPDATE = '24.02.2026';

// Screen names for navigation
const SCREENS = {
  PROFILE_SELECT: 'profileSelect',
  PROFILE_CREATE: 'profileCreate',
  THEME_SELECT: 'themeSelect',
  ZONE_SELECT: 'zoneSelect',
  GAME_SELECT: 'gameSelect',
  LITTLE_EXPLORERS_MENU: 'littleExplorersMenu',
  SORTER_GAME: 'sorterGame',
  FEED_ANIMAL_GAME: 'feedAnimalGame',
  LEVEL_MAP: 'levelMap',
  GAME: 'game',
  WIN: 'win',
  ENGLISH_PRACTICE: 'englishPractice',
  MEMORY_GAME: 'memoryGame',
  FIND_IT_GAME: 'findItGame',
  LOGIC_SELECT: 'logicSelect',
  SMART_MEMORY_GAME: 'smartMemoryGame',
  FIRST_WORD_GAME: 'firstWordGame',
  LETTER_KINGDOM: 'letterKingdom',
  BALLOON_PARTY_GAME: 'balloonPartyGame',
  FIRST_LETTER_GAME: 'firstLetterGame',
  POLYGON_DETECTIVE_GAME: 'polygonDetectiveGame',
  PATTERN_SEQUENCE_GAME: 'patternSequenceGame',
  ODD_ONE_OUT_GAME: 'oddOneOutGame',
  OPPOSITES_GAME: 'oppositesGame',
  READING_DETECTIVE_GAME: 'readingDetectiveGame',
  ROBOT_LAB_GAME: 'robotLabGame',
  STICKER_ALBUM: 'stickerAlbum',
  NUMBER_KINGDOM: 'numberKingdom',
  LOGIC_KINGDOM: 'logicKingdom',
  MATH_KINGDOM: 'mathKingdom',
  DETECTIVE_HQ: 'detectiveHQ',
  READING_WORLD: 'readingWorld',
  NATURE_LAB: 'natureLab',
  SHADOW_DETECTIVE_GAME: 'shadowDetectiveGame',
  DIRECTION_CATCHER_GAME: 'directionCatcherGame',
  WILD_PLANT_PATROL_GAME: 'wildPlantPatrolGame',
  SENTENCE_MACHINE_GAME: 'sentenceMachineGame',
  PARENT_DASHBOARD: 'parentDashboard',
};

// Determine the initial screen based on profile state
const getInitialScreen = () => {
  const profile = getActiveProfile();
  if (profile && profile.name) return SCREENS.THEME_SELECT;
  return SCREENS.PROFILE_CREATE;
};

const App = () => {
  // Navigation state - force profile creation if no valid profile
  const [currentScreen, setCurrentScreen] = useState(getInitialScreen);

  // Game context state
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [lastScore, setLastScore] = useState(0);
  const [lastEarnedXP, setLastEarnedXP] = useState(0);
  const [showParentGate, setShowParentGate] = useState(false);
  const [inMathKingdom, setInMathKingdom] = useState(false);

  // v6.0.0 Migration modal state
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  // Run v6.0.0 migration check on mount
  useEffect(() => {
    const migrated = checkAndMigrateProfiles();
    if (migrated) {
      setShowMigrationModal(true);
    }
  }, []);

  // Load saved theme for active profile on mount or profile change
  useEffect(() => {
    if (hasActiveProfile()) {
      const savedTheme = getSelectedTheme();
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
    }
  }, [currentScreen]);

  // Identify user in PostHog when profile changes
  useEffect(() => {
    const profile = getActiveProfile();
    if (profile) {
      posthog.identify(profile.id, {
        name: profile.name,
        theme: profile.progress?.selectedTheme,
      });
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

  // Parent zone handlers
  const handleParentsZone = () => {
    setShowParentGate(true);
  };

  const handleParentGateSuccess = () => {
    setShowParentGate(false);
    setCurrentScreen(SCREENS.PARENT_DASHBOARD);
  };

  // Navigation handlers
  const handleSelectTheme = (themeId) => {
    setSelectedTheme(themeId);
    saveTheme(themeId);
    // Auto-route to saved zone if one exists
    const savedZone = getSelectedZone();
    if (savedZone) {
      handleSelectZone(savedZone);
    } else {
      setCurrentScreen(SCREENS.ZONE_SELECT);
    }
  };

  const handleSelectZone = (zoneId) => {
    saveSelectedZone(zoneId);
    if (zoneId === 'aceAcademy') {
      setCurrentScreen(SCREENS.GAME_SELECT);
    } else {
      setCurrentScreen(SCREENS.LITTLE_EXPLORERS_MENU);
    }
  };

  const handleChangeZone = () => {
    saveSelectedZone(null);
    setCurrentScreen(SCREENS.ZONE_SELECT);
  };

  const handleSelectExplorerKingdom = (kingdomId) => {
    if (kingdomId === 'numberKingdom') {
      setCurrentScreen(SCREENS.NUMBER_KINGDOM);
    } else if (kingdomId === 'letterKingdom') {
      setCurrentScreen(SCREENS.LETTER_KINGDOM);
    } else if (kingdomId === 'logicKingdom') {
      setCurrentScreen(SCREENS.LOGIC_KINGDOM);
    }
  };

  const handleSelectNumberKingdomGame = (gameId) => {
    if (gameId === 'juniorMath') {
      setSelectedGameMode('junior');
      setCurrentScreen(SCREENS.LEVEL_MAP);
    } else if (gameId === 'feedAnimal') {
      setCurrentScreen(SCREENS.FEED_ANIMAL_GAME);
    }
  };

  const handleSelectLogicKingdomGame = (gameId) => {
    if (gameId === 'sorter') {
      setCurrentScreen(SCREENS.SORTER_GAME);
    } else if (gameId === 'smartMemory') {
      setCurrentScreen(SCREENS.SMART_MEMORY_GAME);
    } else if (gameId === 'patternSequence') {
      setCurrentScreen(SCREENS.PATTERN_SEQUENCE_GAME);
    } else if (gameId === 'oddOneOut') {
      setCurrentScreen(SCREENS.ODD_ONE_OUT_GAME);
    } else if (gameId === 'opposites') {
      setCurrentScreen(SCREENS.OPPOSITES_GAME);
    } else if (gameId === 'shadowDetective') {
      setCurrentScreen(SCREENS.SHADOW_DETECTIVE_GAME);
    } else if (gameId === 'directionCatcher') {
      setCurrentScreen(SCREENS.DIRECTION_CATCHER_GAME);
    }
  };

  const handleOpenStickerAlbum = () => {
    setCurrentScreen(SCREENS.STICKER_ALBUM);
  };

  const handleBackToExplorersMenu = () => {
    setCurrentScreen(SCREENS.LITTLE_EXPLORERS_MENU);
  };

  const handleBackToLetterKingdom = () => {
    setCurrentScreen(SCREENS.LETTER_KINGDOM);
  };

  const handleBackToNumberKingdom = () => {
    setCurrentScreen(SCREENS.NUMBER_KINGDOM);
  };

  const handleBackToLogicKingdom = () => {
    setCurrentScreen(SCREENS.LOGIC_KINGDOM);
  };

  const handleSelectLetterKingdomGame = (gameId) => {
    if (gameId === 'firstWord') {
      setCurrentScreen(SCREENS.FIRST_WORD_GAME);
    } else if (gameId === 'balloonParty') {
      setCurrentScreen(SCREENS.BALLOON_PARTY_GAME);
    } else if (gameId === 'firstLetter') {
      setCurrentScreen(SCREENS.FIRST_LETTER_GAME);
    }
  };

  const handleBackToZoneSelect = () => {
    setCurrentScreen(SCREENS.ZONE_SELECT);
  };

  const handleSelectGame = (hubId) => {
    // Route to hub screens from the Class Champions menu
    if (hubId === 'mathKingdom') {
      setCurrentScreen(SCREENS.MATH_KINGDOM);
    } else if (hubId === 'detectiveHQ') {
      setCurrentScreen(SCREENS.DETECTIVE_HQ);
    } else if (hubId === 'readingWorld') {
      setCurrentScreen(SCREENS.READING_WORLD);
    } else if (hubId === 'natureLab') {
      setCurrentScreen(SCREENS.NATURE_LAB);
    }
  };

  const handleSelectDetectiveHQGame = (gameId) => {
    setSelectedGameMode(gameId);
    if (gameId === 'polygonDetective') {
      setCurrentScreen(SCREENS.POLYGON_DETECTIVE_GAME);
    } else if (gameId === 'logic') {
      setCurrentScreen(SCREENS.LOGIC_SELECT);
    } else if (gameId === 'smartMemory') {
      setCurrentScreen(SCREENS.SMART_MEMORY_GAME);
    }
  };

  const handleSelectReadingWorldGame = (gameId) => {
    setSelectedGameMode(gameId);
    if (gameId === 'readingDetective') {
      setCurrentScreen(SCREENS.READING_DETECTIVE_GAME);
    } else if (gameId === 'english') {
      setCurrentScreen(SCREENS.ENGLISH_PRACTICE);
    } else if (gameId === 'sentenceMachine') {
      setCurrentScreen(SCREENS.SENTENCE_MACHINE_GAME);
    }
  };

  const handleSelectNatureLabGame = (gameId) => {
    setSelectedGameMode(gameId);
    if (gameId === 'robotLab') {
      setCurrentScreen(SCREENS.ROBOT_LAB_GAME);
    } else if (gameId === 'wildPlantPatrol') {
      setCurrentScreen(SCREENS.WILD_PLANT_PATROL_GAME);
    }
  };

  const handleBackToDetectiveHQ = () => {
    setSelectedGameMode(null);
    setCurrentScreen(SCREENS.DETECTIVE_HQ);
  };

  const handleBackToReadingWorld = () => {
    setSelectedGameMode(null);
    setCurrentScreen(SCREENS.READING_WORLD);
  };

  const handleBackToNatureLab = () => {
    setSelectedGameMode(null);
    setCurrentScreen(SCREENS.NATURE_LAB);
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

  const handleSelectLogicGame = (logicGameMode) => {
    setSelectedGameMode(logicGameMode);
    setCurrentScreen(SCREENS.LEVEL_MAP);
  };

  const handleBackToLogicSelect = () => {
    setSelectedGameMode('logic');
    setCurrentScreen(SCREENS.LOGIC_SELECT);
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
    setInMathKingdom(false);
    setCurrentScreen(SCREENS.GAME_SELECT);
  };

  const handleSelectMathKingdomGame = (gameMode) => {
    setInMathKingdom(true);
    setSelectedGameMode(gameMode);
    setCurrentScreen(SCREENS.LEVEL_MAP);
  };

  const handleBackToMathKingdom = () => {
    setInMathKingdom(false);
    setSelectedGameMode(null);
    setCurrentScreen(SCREENS.MATH_KINGDOM);
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
            onParentsZone={handleParentsZone}
            version={APP_VERSION}
            lastUpdate={LAST_UPDATE}
          />
        );

      case SCREENS.PROFILE_CREATE:
        return (
          <ProfileCreateScreen
            onProfileCreated={handleProfileCreated}
            onBack={handleBackToProfileSelect}
            canGoBack={hasProfiles()}
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

      case SCREENS.ZONE_SELECT:
        return (
          <ZoneSelectScreen
            onSelectZone={handleSelectZone}
            onBack={handleBackToThemeSelect}
            onParentsZone={handleParentsZone}
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
            onBack={handleBackToZoneSelect}
            onChangeZone={handleChangeZone}
          />
        );

      case SCREENS.LITTLE_EXPLORERS_MENU:
        return (
          <LittleExplorersMenuScreen
            themeId={selectedTheme}
            onBack={handleBackToZoneSelect}
            onSelectGame={handleSelectExplorerKingdom}
            onOpenAlbum={handleOpenStickerAlbum}
            onChangeZone={handleChangeZone}
          />
        );

      case SCREENS.SORTER_GAME:
        return (
          <SorterGame
            themeId={selectedTheme}
            onBack={handleBackToLogicKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.FEED_ANIMAL_GAME:
        return (
          <FeedTheAnimalGame
            themeId={selectedTheme}
            onBack={handleBackToNumberKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.LETTER_KINGDOM:
        return (
          <LetterKingdom
            themeId={selectedTheme}
            onBack={handleBackToExplorersMenu}
            onSelectGame={handleSelectLetterKingdomGame}
          />
        );

      case SCREENS.NUMBER_KINGDOM:
        return (
          <NumberKingdom
            themeId={selectedTheme}
            onBack={handleBackToExplorersMenu}
            onSelectGame={handleSelectNumberKingdomGame}
          />
        );

      case SCREENS.LOGIC_KINGDOM:
        return (
          <LogicKingdom
            themeId={selectedTheme}
            onBack={handleBackToExplorersMenu}
            onSelectGame={handleSelectLogicKingdomGame}
          />
        );

      case SCREENS.FIRST_WORD_GAME:
        return (
          <FirstWordGame
            themeId={selectedTheme}
            onBack={handleBackToLetterKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.BALLOON_PARTY_GAME:
        return (
          <BalloonPartyGame
            themeId={selectedTheme}
            onBack={handleBackToLetterKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.FIRST_LETTER_GAME:
        return (
          <FirstLetterMatchGame
            themeId={selectedTheme}
            onBack={handleBackToLetterKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.PATTERN_SEQUENCE_GAME:
        return (
          <PatternSequenceGame
            themeId={selectedTheme}
            onBack={handleBackToLogicKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.ODD_ONE_OUT_GAME:
        return (
          <OddOneOutGame
            themeId={selectedTheme}
            onBack={handleBackToLogicKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.OPPOSITES_GAME:
        return (
          <OppositesGame
            themeId={selectedTheme}
            onBack={handleBackToLogicKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.SHADOW_DETECTIVE_GAME:
        return (
          <ShadowDetective
            themeId={selectedTheme}
            onBack={handleBackToLogicKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.DIRECTION_CATCHER_GAME:
        return (
          <DirectionCatcher
            themeId={selectedTheme}
            onBack={handleBackToLogicKingdom}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.STICKER_ALBUM:
        return (
          <StickerAlbum
            themeId={selectedTheme}
            onBack={handleBackToExplorersMenu}
          />
        );

      case SCREENS.MATH_KINGDOM:
        return (
          <MathKingdom
            themeId={selectedTheme}
            onBack={handleBackToGameSelect}
            onSelectGame={handleSelectMathKingdomGame}
          />
        );

      case SCREENS.DETECTIVE_HQ:
        return (
          <DetectiveHQ
            themeId={selectedTheme}
            onBack={handleBackToGameSelect}
            onSelectGame={handleSelectDetectiveHQGame}
          />
        );

      case SCREENS.READING_WORLD:
        return (
          <ReadingWorld
            themeId={selectedTheme}
            onBack={handleBackToGameSelect}
            onSelectGame={handleSelectReadingWorldGame}
          />
        );

      case SCREENS.NATURE_LAB:
        return (
          <NatureLab
            themeId={selectedTheme}
            onBack={handleBackToGameSelect}
            onSelectGame={handleSelectNatureLabGame}
          />
        );

      case SCREENS.POLYGON_DETECTIVE_GAME:
        return (
          <PolygonDetectiveGame
            themeId={selectedTheme}
            onBack={handleBackToDetectiveHQ}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.READING_DETECTIVE_GAME:
        return (
          <ReadingDetectiveGame
            themeId={selectedTheme}
            onBack={handleBackToReadingWorld}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.WILD_PLANT_PATROL_GAME:
        return (
          <WildPlantPatrolGame
            themeId={selectedTheme}
            onBack={handleBackToNatureLab}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.SENTENCE_MACHINE_GAME:
        return (
          <SentenceMachineGame
            themeId={selectedTheme}
            onBack={handleBackToReadingWorld}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.ROBOT_LAB_GAME:
        return (
          <RobotLabGame
            themeId={selectedTheme}
            onBack={handleBackToNatureLab}
            triggerConfetti={triggerConfetti}
          />
        );

      case SCREENS.LEVEL_MAP: {
        const levelMapBackHandler =
          selectedGameMode === 'compare' || selectedGameMode === 'sequence'
            ? handleBackToLogicSelect
            : selectedGameMode === 'junior' && getSelectedZone() === 'littleExplorers'
              ? handleBackToNumberKingdom
              : inMathKingdom
                ? handleBackToMathKingdom
                : handleBackToGameSelect;
        return (
          <LevelMapScreen
            themeId={selectedTheme}
            gameMode={selectedGameMode}
            onSelectLevel={handleSelectLevel}
            onBack={levelMapBackHandler}
          />
        );
      }

      case SCREENS.GAME: {
        // Route to specialized game screens based on game mode
        let GameComponent;
        if (selectedGameMode === 'junior') GameComponent = JuniorGameScreen;
        else if (selectedGameMode === 'compare') GameComponent = CompareGameScreen;
        else if (selectedGameMode === 'sequence') GameComponent = SequenceGameScreen;
        else GameComponent = GameScreen;
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
      }

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
            onBack={handleBackToReadingWorld}
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

      case SCREENS.SMART_MEMORY_GAME: {
        const smartMemoryBack = getSelectedZone() === 'littleExplorers'
          ? handleBackToLogicKingdom
          : handleBackToDetectiveHQ;
        return (
          <SmartMemoryGame
            themeId={selectedTheme}
            onBack={smartMemoryBack}
            triggerConfetti={triggerConfetti}
          />
        );
      }

      case SCREENS.LOGIC_SELECT:
        return (
          <LogicSelectScreen
            themeId={selectedTheme}
            onSelectGame={handleSelectLogicGame}
            onBack={handleBackToDetectiveHQ}
          />
        );

      case SCREENS.PARENT_DASHBOARD:
        return (
          <ParentDashboard
            onBack={handleBackToProfileSelect}
          />
        );

      default:
        return (
          <ProfileSelectScreen
            onSelectProfile={handleSelectProfile}
            onAddProfile={handleAddProfile}
            onParentsZone={handleParentsZone}
            version={APP_VERSION}
            lastUpdate={LAST_UPDATE}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        {renderScreen()}
      </div>
      <Footer version={APP_VERSION} />
      <ParentGateModal
        isOpen={showParentGate}
        onClose={() => setShowParentGate(false)}
        onSuccess={handleParentGateSuccess}
      />

      {/* v6.0.0 Migration Modal */}
      <Modal isOpen={showMigrationModal} onClose={() => setShowMigrationModal(false)}>
        <div className="text-9xl mb-6 animate-pulse">🚀</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">מערכת חדשה!</h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-6 leading-relaxed">
          מערכת הדרגות השתדרגה! הניקוד אופס כדי להתחיל את האתגר החדש.
        </p>
        <p className="text-lg text-white/70 mb-8">
          עכשיו ההתקדמות שלך נמדדת לפי משחקים ייחודיים שהשלמת. כל משחק חדש מקדם אותך בדרגה!
        </p>
        <Button
          onClick={() => setShowMigrationModal(false)}
          variant="primary"
          size="xlarge"
        >
          יאללה, בוא נתחיל! 🎮
        </Button>
      </Modal>
    </div>
  );
};

export default App;
