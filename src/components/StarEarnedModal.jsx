import React, { useEffect } from 'react';
import { playStarEarnedSound } from '../utils/sounds';

// Animated "Star Earned!" modal shown when a child earns a star
const StarEarnedModal = ({ isOpen, onClose, totalStars }) => {
  useEffect(() => {
    if (isOpen) {
      playStarEarnedSound();
      const timer = setTimeout(() => {
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-3xl p-12 max-w-md w-full text-center transform animate-star-pop shadow-2xl shadow-yellow-500/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-9xl mb-4 animate-star-spin">⭐</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 drop-shadow-lg">
          כוכב חדש!
        </h1>
        <p className="text-2xl text-white/90 font-bold mb-2">
          כל הכבוד!
        </p>
        <div className="bg-white/30 rounded-2xl px-6 py-3 inline-block">
          <span className="text-3xl font-black text-white">
            ⭐ {totalStars}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes star-pop {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(5deg); }
          70% { transform: scale(0.95) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-star-pop {
          animation: star-pop 0.6s ease-out forwards;
        }
        @keyframes star-spin {
          0% { transform: scale(0) rotate(-180deg); }
          60% { transform: scale(1.3) rotate(20deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .animate-star-spin {
          animation: star-spin 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StarEarnedModal;
