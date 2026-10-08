import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Play, Trophy, Sparkles, HelpCircle, CheckCircle2, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface SolitaireGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';

interface Card {
  id: string;
  suit: Suit;
  value: number; // 1 (Ace) to 13 (King)
  isFaceUp: boolean;
}

const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  DIAMONDS: '♦',
  CLUBS: '♣',
};

const SUIT_COLORS: Record<Suit, string> = {
  SPADES: 'text-slate-900',
  CLUBS: 'text-slate-900',
  HEARTS: 'text-rose-600',
  DIAMONDS: 'text-rose-600',
};

const VALUE_NAMES: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export const SolitaireGame: React.FC<SolitaireGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);
  const [tableaus, setTableaus] = useState<Card[][]>([[], [], [], [], [], [], []]);
  const [selectedCard, setSelectedCard] = useState<{ source: string; index?: number; card: Card } | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('arcadex_solitaire_highscore') || '0', 10);
  });

  const initDeck = useCallback(() => {
    const suits: Suit[] = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
    const deck: Card[] = [];

    suits.forEach((suit) => {
      for (let v = 1; v <= 13; v++) {
        deck.push({
          id: `${suit}-${v}`,
          suit,
          value: v,
          isFaceUp: false,
        });
      }
    });

    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // Deal Tableaus (1 to 7 cards)
    const newTableaus: Card[][] = [[], [], [], [], [], [], []];
    let cardIdx = 0;
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const c = deck[cardIdx++];
        c.isFaceUp = row === col; // Only top card is face up
        newTableaus[col].push(c);
      }
    }

    const remainingStock = deck.slice(cardIdx);
    setStock(remainingStock);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setTableaus(newTableaus);
    setSelectedCard(null);
    setScore(0);
    setMoves(0);
    setIsWon(false);

    if (soundEnabled) sounds.playPowerup();
  }, [soundEnabled]);

  useEffect(() => {
    initDeck();
  }, [initDeck]);

  // Click Stock Pile
  const handleStockClick = () => {
    if (stock.length > 0) {
      const topCard = stock[stock.length - 1];
      topCard.isFaceUp = true;
      setStock((prev) => prev.slice(0, prev.length - 1));
      setWaste((prev) => [...prev, topCard]);
      setMoves((m) => m + 1);
      if (soundEnabled) sounds.playMove();
    } else {
      // Recycle waste back into stock
      if (waste.length > 0) {
        const recycled = waste.map((c) => ({ ...c, isFaceUp: false })).reverse();
        setStock(recycled);
        setWaste([]);
        setMoves((m) => m + 1);
        if (soundEnabled) sounds.playMove();
      }
    }
  };

  // Helper: check if card can be placed on foundation
  const canPlaceOnFoundation = (card: Card, foundation: Card[]) => {
    if (foundation.length === 0) {
      return card.value === 1; // Ace only
    }
    const top = foundation[foundation.length - 1];
    return top.suit === card.suit && top.value === card.value - 1;
  };

  // Helper: check if card can be placed on tableau
  const canPlaceOnTableau = (card: Card, column: Card[]) => {
    if (column.length === 0) {
      return card.value === 13; // King only
    }
    const top = column[column.length - 1];
    if (!top.isFaceUp) return false;
    const isTopRed = top.suit === 'HEARTS' || top.suit === 'DIAMONDS';
    const isCardRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
    return isTopRed !== isCardRed && top.value === card.value + 1;
  };

  // Auto-move card to foundation on double click
  const tryAutoMoveToFoundation = (card: Card, fromSource: 'waste' | 'tableau', colIdx?: number) => {
    for (let f = 0; f < 4; f++) {
      if (canPlaceOnFoundation(card, foundations[f])) {
        // Move card to foundation f
        const newFoundations = foundations.map((found, idx) =>
          idx === f ? [...found, card] : found
        );
        setFoundations(newFoundations);

        if (fromSource === 'waste') {
          setWaste((w) => w.slice(0, w.length - 1));
        } else if (fromSource === 'tableau' && colIdx !== undefined) {
          setTableaus((tabs) => {
            const nextTabs = [...tabs];
            nextTabs[colIdx] = nextTabs[colIdx].slice(0, nextTabs[colIdx].length - 1);
            if (nextTabs[colIdx].length > 0) {
              nextTabs[colIdx][nextTabs[colIdx].length - 1].isFaceUp = true;
            }
            return nextTabs;
          });
        }

        const newScore = score + 15;
        setScore(newScore);
        setMoves((m) => m + 1);
        if (onScoreUpdate) onScoreUpdate(newScore);
        if (soundEnabled) sounds.playPowerup();

        // Check Victory
        const totalFoundation = newFoundations.reduce((acc, cur) => acc + cur.length, 0);
        if (totalFoundation === 52) {
          setIsWon(true);
          if (soundEnabled) sounds.playPowerup();
          if (onGameOver) onGameOver(newScore + 500);
          if (newScore + 500 > highScore) {
            setHighScore(newScore + 500);
            localStorage.setItem('arcadex_solitaire_highscore', (newScore + 500).toString());
          }
        }
        return true;
      }
    }
    return false;
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center select-none bg-emerald-950/80 border border-emerald-800/80 rounded-2xl p-4 sm:p-6 shadow-2xl text-white">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-emerald-800/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700/50">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-black text-emerald-300">SCORE: {score}</span>
          </div>
          <div className="text-xs text-emerald-400/80 font-bold">
            MOVES: {moves}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-700/50">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>BEST: {highScore}</span>
          </div>
          <button
            onClick={initDeck}
            className="p-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl transition-all shadow"
            title="New Deal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Play Area: Stock & Waste on Left, 4 Foundations on Right */}
      <div className="w-full grid grid-cols-7 gap-2 sm:gap-3 mb-6">
        {/* Col 0: Stock Pile */}
        <div className="col-span-1 flex justify-center">
          {stock.length > 0 ? (
            <div
              onClick={handleStockClick}
              className="w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl bg-gradient-to-br from-indigo-700 to-blue-900 border-2 border-indigo-400/60 shadow-lg cursor-pointer flex items-center justify-center text-indigo-300 hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 opacity-60" />
            </div>
          ) : (
            <div
              onClick={handleStockClick}
              className="w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl border-2 border-dashed border-emerald-700/60 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-all text-emerald-500/60"
            >
              <RotateCcw className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Col 1: Waste Pile */}
        <div className="col-span-1 flex justify-center">
          {waste.length > 0 ? (
            <div
              onDoubleClick={() => tryAutoMoveToFoundation(waste[waste.length - 1], 'waste')}
              className="w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl bg-white text-slate-900 border-2 border-slate-300 shadow-lg cursor-pointer flex flex-col justify-between p-1.5 hover:shadow-xl transition-all"
            >
              <div className={`text-xs sm:text-sm font-black flex items-center justify-between ${SUIT_COLORS[waste[waste.length - 1].suit]}`}>
                <span>{VALUE_NAMES[waste[waste.length - 1].value]}</span>
                <span>{SUIT_SYMBOLS[waste[waste.length - 1].suit]}</span>
              </div>
              <div className={`text-center text-xl sm:text-2xl font-bold ${SUIT_COLORS[waste[waste.length - 1].suit]}`}>
                {SUIT_SYMBOLS[waste[waste.length - 1].suit]}
              </div>
              <div className={`text-xs sm:text-sm font-black flex items-center justify-between rotate-180 ${SUIT_COLORS[waste[waste.length - 1].suit]}`}>
                <span>{VALUE_NAMES[waste[waste.length - 1].value]}</span>
                <span>{SUIT_SYMBOLS[waste[waste.length - 1].suit]}</span>
              </div>
            </div>
          ) : (
            <div className="w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl border-2 border-dashed border-emerald-800/40" />
          )}
        </div>

        {/* Col 2: Spacer */}
        <div className="col-span-1" />

        {/* Col 3-6: 4 Foundation Piles */}
        {foundations.map((found, fIdx) => (
          <div key={fIdx} className="col-span-1 flex justify-center">
            {found.length > 0 ? (
              <div className="w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl bg-white text-slate-900 border-2 border-slate-300 shadow-md flex flex-col justify-between p-1.5">
                <div className={`text-xs font-black flex items-center justify-between ${SUIT_COLORS[found[found.length - 1].suit]}`}>
                  <span>{VALUE_NAMES[found[found.length - 1].value]}</span>
                  <span>{SUIT_SYMBOLS[found[found.length - 1].suit]}</span>
                </div>
                <div className={`text-center text-xl sm:text-2xl ${SUIT_COLORS[found[found.length - 1].suit]}`}>
                  {SUIT_SYMBOLS[found[found.length - 1].suit]}
                </div>
                <div className={`text-xs font-black flex items-center justify-between rotate-180 ${SUIT_COLORS[found[found.length - 1].suit]}`}>
                  <span>{VALUE_NAMES[found[found.length - 1].value]}</span>
                  <span>{SUIT_SYMBOLS[found[found.length - 1].suit]}</span>
                </div>
              </div>
            ) : (
              <div className="w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl border-2 border-dashed border-emerald-700/60 flex items-center justify-center text-emerald-600/40 text-lg font-black">
                A
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Tableaus (7 Columns) */}
      <div className="w-full grid grid-cols-7 gap-2 sm:gap-3 min-h-[360px] pb-10">
        {tableaus.map((col, colIdx) => (
          <div key={colIdx} className="relative flex flex-col items-center">
            {col.length === 0 ? (
              <div className="w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl border-2 border-dashed border-emerald-700/50 flex items-center justify-center text-emerald-600/30 text-xs font-bold">
                K
              </div>
            ) : (
              col.map((card, rIdx) => (
                <div
                  key={card.id}
                  onDoubleClick={() => {
                    if (card.isFaceUp && rIdx === col.length - 1) {
                      tryAutoMoveToFoundation(card, 'tableau', colIdx);
                    }
                  }}
                  style={{ top: `${rIdx * 24}px` }}
                  className={`absolute w-12 sm:w-16 md:w-20 aspect-[5/7] rounded-xl shadow-md transition-all ${
                    card.isFaceUp
                      ? 'bg-white text-slate-900 border-2 border-slate-300 cursor-pointer hover:brightness-105'
                      : 'bg-gradient-to-br from-indigo-800 to-blue-950 border-2 border-indigo-400/50'
                  }`}
                >
                  {card.isFaceUp && (
                    <div className="h-full flex flex-col justify-between p-1.5">
                      <div className={`text-[10px] sm:text-xs font-black flex items-center justify-between ${SUIT_COLORS[card.suit]}`}>
                        <span>{VALUE_NAMES[card.value]}</span>
                        <span>{SUIT_SYMBOLS[card.suit]}</span>
                      </div>
                      <div className={`text-center text-sm sm:text-lg ${SUIT_COLORS[card.suit]}`}>
                        {SUIT_SYMBOLS[card.suit]}
                      </div>
                      <div className={`text-[10px] sm:text-xs font-black flex items-center justify-between rotate-180 ${SUIT_COLORS[card.suit]}`}>
                        <span>{VALUE_NAMES[card.value]}</span>
                        <span>{SUIT_SYMBOLS[card.suit]}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Win Banner */}
      {isWon && (
        <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 rounded-3xl flex items-center justify-center text-amber-400 mb-4 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">SOLITAIRE VICTORY!</h2>
          <p className="text-emerald-300 text-sm mt-1 mb-6">
            Congratulations! All 4 foundations completed in {moves} moves.
          </p>
          <button
            onClick={initDeck}
            className="py-3 px-8 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-extrabold text-sm rounded-xl shadow-lg transition-all"
          >
            PLAY NEW DEAL
          </button>
        </div>
      )}
    </div>
  );
};
