import React, { useState, useCallback } from 'react';
import { getTheme } from '../data/themes';
import STICKER_BANK, { CATEGORY_NAMES } from '../data/stickerBank';
import { getAlbumData, purchaseSticker } from '../utils/storage';
import { playCelebrationSound } from '../utils/sounds';

// ============ Sticker Selection Modal ============

const StickerSelectionModal = ({ choices, onPick, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center transform animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-2">
          בחר מדבקה!
        </h2>
        <p className="text-xl text-white/80 mb-8">
          איזו מדבקה תרצה?
        </p>

        <div className="flex justify-center gap-4 sm:gap-6 mb-8">
          {choices.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => onPick(sticker.id)}
              className="bg-white/20 hover:bg-white/40 rounded-3xl p-6 transition-all duration-300 hover:scale-110 hover:shadow-2xl group flex flex-col items-center gap-2"
            >
              <span className="text-7xl sm:text-8xl group-hover:animate-bounce">
                {sticker.emoji}
              </span>
              <span className="text-lg font-bold text-white">
                {sticker.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-2xl text-white text-lg font-bold transition-all"
        >
          ביטול
        </button>
      </div>

      <style>{`
        @keyframes modal-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modal-in {
          animation: modal-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// ============ New Sticker Celebration ============

const NewStickerCelebration = ({ sticker, onDone }) => {
  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6"
      dir="rtl"
      onClick={onDone}
    >
      <div
        className="bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-3xl p-12 max-w-md w-full text-center transform animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-9xl mb-4 animate-bounce">{sticker.emoji}</div>
        <h2 className="text-4xl font-black text-white mb-3">
          מדבקה חדשה!
        </h2>
        <p className="text-2xl text-white/90 font-bold mb-6">
          {sticker.name}
        </p>
        <button
          onClick={onDone}
          className="px-8 py-4 bg-white/30 hover:bg-white/40 rounded-2xl text-white text-xl font-bold transition-all"
        >
          יופי! 🎉
        </button>
      </div>
    </div>
  );
};

// ============ Main Sticker Album Component ============

const StickerAlbum = ({ themeId, onBack }) => {
  const theme = getTheme(themeId);

  // Load album data from storage
  const [albumData, setAlbumData] = useState(() => getAlbumData());
  const [showShop, setShowShop] = useState(false);
  const [shopChoices, setShopChoices] = useState([]);
  const [newSticker, setNewSticker] = useState(null);

  const refreshAlbum = useCallback(() => {
    setAlbumData(getAlbumData());
  }, []);

  // Open the sticker shop with 3 random unowned stickers
  const handleOpenShop = useCallback(() => {
    const owned = new Set(albumData.stickers);
    const available = STICKER_BANK.filter((s) => !owned.has(s.id));

    if (available.length === 0) return;

    // Pick up to 3 random stickers
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, Math.min(3, shuffled.length));
    setShopChoices(picks);
    setShowShop(true);
  }, [albumData.stickers]);

  // Purchase a sticker
  const handlePickSticker = useCallback((stickerId) => {
    const result = purchaseSticker(stickerId);
    if (result.success) {
      setShowShop(false);
      const sticker = STICKER_BANK.find((s) => s.id === stickerId);
      setNewSticker(sticker);
      playCelebrationSound();
      refreshAlbum();
    }
  }, [refreshAlbum]);

  // Close the celebration modal
  const handleCelebrationDone = useCallback(() => {
    setNewSticker(null);
  }, []);

  // Group stickers by category for display
  const ownedSet = new Set(albumData.stickers);
  const categories = ['animals', 'fantasy', 'vehicles', 'nature'];

  return (
    <div
      className={`min-h-screen ${theme.bg} flex flex-col items-center p-6 ${theme.font}`}
      dir="rtl"
    >
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 mt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-white font-bold transition-all"
        >
          ← חזרה
        </button>
        <div className="bg-yellow-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold text-yellow-300">{albumData.stars}</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <div className="text-7xl mb-3">📒</div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-2 drop-shadow-2xl">
          אלבום המדבקות שלי
        </h1>
        <p className="text-xl text-white/80">
          {albumData.stickers.length} / {STICKER_BANK.length} מדבקות
        </p>
      </div>

      {/* Section B: The Shop */}
      <div className="w-full max-w-4xl mb-8">
        {albumData.stars > 0 ? (
          <button
            onClick={handleOpenShop}
            className="w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 rounded-3xl p-6 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-yellow-500/30"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-4xl">🎁</span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                בחר מדבקה חדשה!
              </span>
              <span className="text-4xl">🎁</span>
            </div>
            <p className="text-lg text-white/90 mt-1">
              יש לך ⭐ {albumData.stars} כוכבים
            </p>
          </button>
        ) : (
          <div className={`${theme.cardBg} rounded-3xl p-6 text-center`}>
            <p className="text-xl text-white/70">
              {albumData.stickers.length >= STICKER_BANK.length
                ? '🏆 אספת את כל המדבקות! כל הכבוד!'
                : '⭐ סיים משחקים חדשים כדי לצבור כוכבים!'}
            </p>
          </div>
        )}
      </div>

      {/* Section A: The Collection */}
      <div className="w-full max-w-4xl">
        {categories.map((category) => {
          const categoryStickers = STICKER_BANK.filter(
            (s) => s.category === category
          );

          return (
            <div key={category} className="mb-6">
              <h2 className="text-2xl font-bold text-white/90 mb-3">
                {CATEGORY_NAMES[category]}
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3">
                {categoryStickers.map((sticker) => {
                  const owned = ownedSet.has(sticker.id);
                  return (
                    <div
                      key={sticker.id}
                      className={`
                        aspect-square rounded-2xl flex flex-col items-center justify-center
                        transition-all duration-300
                        ${owned
                          ? `${theme.cardBg} hover:scale-110`
                          : 'bg-white/5 border-2 border-dashed border-white/20'
                        }
                      `}
                    >
                      {owned ? (
                        <>
                          <span className="text-4xl sm:text-5xl">{sticker.emoji}</span>
                          <span className="text-xs text-white/70 mt-1 hidden sm:block">
                            {sticker.name}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl sm:text-4xl opacity-20">❓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shop Modal */}
      {showShop && (
        <StickerSelectionModal
          choices={shopChoices}
          onPick={handlePickSticker}
          onClose={() => setShowShop(false)}
        />
      )}

      {/* New Sticker Celebration */}
      {newSticker && (
        <NewStickerCelebration
          sticker={newSticker}
          onDone={handleCelebrationDone}
        />
      )}
    </div>
  );
};

export default StickerAlbum;
