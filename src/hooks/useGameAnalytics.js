import { useEffect, useRef, useCallback } from 'react';
import posthog from 'posthog-js';

const useGameAnalytics = (gameName) => {
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    posthog.capture('minigame_started', { game: gameName });
  }, [gameName]);

  const trackLevelComplete = useCallback((level, score, isWin) => {
    const duration = (Date.now() - startTimeRef.current) / 1000;
    posthog.capture('minigame_completed', {
      game: gameName,
      level,
      score,
      result: isWin ? 'win' : 'lose',
      duration,
    });
    startTimeRef.current = Date.now();
  }, [gameName]);

  return { trackLevelComplete };
};

export default useGameAnalytics;
