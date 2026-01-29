// Sound utilities for game feedback
// Uses Web Audio API for sound generation

let audioContext = null;

// Initialize audio context (must be called after user interaction)
const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Play a cheerful "success" sound
export const playCheerSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Create a cheerful ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const noteDuration = 0.12;

    notes.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + index * noteDuration);

      // Quick attack and decay for a "ding" sound
      gainNode.gain.setValueAtTime(0, now + index * noteDuration);
      gainNode.gain.linearRampToValueAtTime(0.3, now + index * noteDuration + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * noteDuration + noteDuration);

      oscillator.start(now + index * noteDuration);
      oscillator.stop(now + index * noteDuration + noteDuration + 0.1);
    });
  } catch (e) {
    // Silently fail if audio is not supported
    console.log('Audio not supported:', e);
  }
};

// Play a bigger celebration sound (for winning)
export const playCelebrationSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Play a fanfare-like sound
    const melody = [
      { freq: 523.25, start: 0, duration: 0.15 },      // C5
      { freq: 659.25, start: 0.15, duration: 0.15 },   // E5
      { freq: 783.99, start: 0.3, duration: 0.15 },    // G5
      { freq: 1046.5, start: 0.45, duration: 0.3 },    // C6 (longer)
      { freq: 783.99, start: 0.75, duration: 0.1 },    // G5
      { freq: 1046.5, start: 0.85, duration: 0.4 },    // C6 (final, long)
    ];

    melody.forEach(({ freq, start, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0, now + start);
      gainNode.gain.linearRampToValueAtTime(0.25, now + start + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + start + duration);

      oscillator.start(now + start);
      oscillator.stop(now + start + duration + 0.1);
    });
  } catch (e) {
    console.log('Audio not supported:', e);
  }
};
