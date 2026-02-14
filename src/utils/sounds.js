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

// Play a gentle "oops" sound for wrong answers (low pitch, soft)
export const playOopsSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Two gentle descending notes - soft and non-punishing
    const notes = [
      { freq: 330, start: 0, duration: 0.15 },      // E4
      { freq: 262, start: 0.12, duration: 0.2 },     // C4 (lower)
    ];

    notes.forEach(({ freq, start, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + start);

      // Gentle attack and quick fade
      gainNode.gain.setValueAtTime(0, now + start);
      gainNode.gain.linearRampToValueAtTime(0.15, now + start + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + start + duration);

      oscillator.start(now + start);
      oscillator.stop(now + start + duration + 0.1);
    });
  } catch (e) {
    // Silently fail if audio is not supported
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

// Play a special "Star Earned!" sound - sparkly ascending with shimmer
export const playStarEarnedSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Sparkly rising arpeggio with shimmer
    const melody = [
      { freq: 659.25, start: 0, duration: 0.12 },      // E5
      { freq: 783.99, start: 0.1, duration: 0.12 },     // G5
      { freq: 987.77, start: 0.2, duration: 0.12 },     // B5
      { freq: 1318.5, start: 0.3, duration: 0.15 },     // E6
      { freq: 1567.98, start: 0.4, duration: 0.4 },     // G6 (long shimmer)
    ];

    melody.forEach(({ freq, start, duration }) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now + start);

      gainNode.gain.setValueAtTime(0, now + start);
      gainNode.gain.linearRampToValueAtTime(0.3, now + start + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + start + duration);

      oscillator.start(now + start);
      oscillator.stop(now + start + duration + 0.1);
    });

    // Add shimmer overtone on the last note
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.connect(shimmerGain);
    shimmerGain.connect(ctx.destination);
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(2637, now + 0.4);
    shimmerGain.gain.setValueAtTime(0, now + 0.4);
    shimmerGain.gain.linearRampToValueAtTime(0.1, now + 0.45);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    shimmer.start(now + 0.4);
    shimmer.stop(now + 0.9);
  } catch (e) {
    // Silently fail if audio is not supported
  }
};
