import React from 'react';

// Modal overlay component
const Modal = ({
  isOpen,
  onClose,
  children,
  theme = null,
  className = '',
}) => {
  if (!isOpen) return null;

  // Get card background based on theme
  const getCardBg = () => {
    if (theme) {
      return theme.cardBg;
    }
    return 'bg-indigo-800/90 backdrop-blur-sm border-2 border-indigo-500/30';
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className={`${getCardBg()} rounded-3xl p-16 max-w-2xl w-full text-center transform animate-bounce-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
