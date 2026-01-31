import React, { useState, useEffect } from 'react';

// Floating XP animation component
// Shows "+X XP" floating up when XP is earned
const FloatingXP = ({ xp, show, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (show && xp > 0) {
      setVisible(true);
      setAnimating(true);

      // Hide after animation completes
      const timer = setTimeout(() => {
        setAnimating(false);
        setVisible(false);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [show, xp, onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed left-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-50
        text-4xl font-black text-green-400 drop-shadow-lg
        ${animating ? 'animate-float-up' : ''}
      `}
      style={{
        textShadow: '0 0 20px rgba(74, 222, 128, 0.8), 0 0 40px rgba(74, 222, 128, 0.4)',
      }}
    >
      +{xp} XP
      <style>{`
        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -20px) scale(1.2);
          }
          40% {
            transform: translate(-50%, -40px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -100px) scale(0.8);
          }
        }
        .animate-float-up {
          animation: float-up 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FloatingXP;
