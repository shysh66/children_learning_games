import React, { useState, useMemo } from 'react';

// Parent Gate - multiplication question to verify adult
const ParentGateModal = ({ isOpen, onClose, onSuccess }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);

  // Generate a random multiplication question
  const question = useMemo(() => {
    const a = Math.floor(Math.random() * 8) + 2; // 2-9
    const b = Math.floor(Math.random() * 8) + 2; // 2-9
    return { a, b, correct: a * b };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(answer, 10) === question.correct) {
      setAnswer('');
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setAnswer('');
      setTimeout(() => setError(false), 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600/50 rounded-3xl p-8 sm:p-12 max-w-md w-full text-center transform animate-bounce-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Lock icon */}
        <div className="text-6xl mb-4">🔒</div>

        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
          אזור הורים בלבד
        </h2>
        <p className="text-white/60 mb-6 text-lg">
          פתרו את התרגיל כדי להיכנס
        </p>

        {/* Math question */}
        <div className="bg-white/10 rounded-2xl p-6 mb-6">
          <div className="text-4xl sm:text-5xl font-black text-white">
            {question.a} × {question.b} = ?
          </div>
        </div>

        {/* Answer form */}
        <form onSubmit={handleSubmit} className="flex gap-3 justify-center">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="?"
            className={`w-28 text-center text-3xl font-bold rounded-xl py-3 bg-white/10 border-2 text-white placeholder-white/30 focus:outline-none transition-all ${
              error
                ? 'border-red-500 bg-red-500/20'
                : 'border-white/20 focus:border-purple-400'
            }`}
            autoFocus
          />
          <button
            type="submit"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xl font-bold rounded-xl transition-all"
          >
            כניסה
          </button>
        </form>

        {/* Error message */}
        {error && (
          <p className="text-red-400 mt-4 text-lg font-bold animate-pulse">
            תשובה שגויה, נסו שוב
          </p>
        )}

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="mt-6 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          ביטול
        </button>
      </div>

      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ParentGateModal;
