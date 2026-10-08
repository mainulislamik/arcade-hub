import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Brain, Sparkles, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { sounds } from '../../utils/soundEngine';

interface CyberChessGameProps {
  onGameOver?: (score: number) => void;
  onScoreUpdate?: (score: number) => void;
  soundEnabled?: boolean;
}

type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

type BoardState = (ChessPiece | null)[][];

const PIECE_SYMBOLS: Record<string, string> = {
  'w-k': '♔',
  'w-q': '♕',
  'w-r': '♖',
  'w-b': '♗',
  'w-n': '♘',
  'w-p': '♙',
  'b-k': '♚',
  'b-q': '♛',
  'b-r': '♜',
  'b-b': '♝',
  'b-n': '♞',
  'b-p': '♟',
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

export const CyberChessGame: React.FC<CyberChessGameProps> = ({
  onGameOver,
  onScoreUpdate,
  soundEnabled = true,
}) => {
  const [board, setBoard] = useState<BoardState>([]);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [turn, setTurn] = useState<PieceColor>('w');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [capturedWhite, setCapturedWhite] = useState<PieceType[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<PieceType[]>([]);
  const [gameStatus, setGameStatus] = useState<'PLAYING' | 'CHECK' | 'CHECKMATE_USER' | 'CHECKMATE_AI' | 'STALEMATE'>('PLAYING');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('arcadex_chess_highscore') || '0', 10);
  });

  // Initialize Standard Board
  const initBoard = useCallback(() => {
    const b: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));

    // Black pieces
    b[0] = [
      { type: 'r', color: 'b' },
      { type: 'n', color: 'b' },
      { type: 'b', color: 'b' },
      { type: 'q', color: 'b' },
      { type: 'k', color: 'b' },
      { type: 'b', color: 'b' },
      { type: 'n', color: 'b' },
      { type: 'r', color: 'b' },
    ];
    b[1] = Array(8).fill(null).map(() => ({ type: 'p', color: 'b' }));

    // White pieces
    b[6] = Array(8).fill(null).map(() => ({ type: 'p', color: 'w' }));
    b[7] = [
      { type: 'r', color: 'w' },
      { type: 'n', color: 'w' },
      { type: 'b', color: 'w' },
      { type: 'q', color: 'w' },
      { type: 'k', color: 'w' },
      { type: 'b', color: 'w' },
      { type: 'n', color: 'w' },
      { type: 'r', color: 'w' },
    ];

    setBoard(b);
    setSelectedSquare(null);
    setValidMoves([]);
    setTurn('w');
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameStatus('PLAYING');
    setScore(0);
    if (soundEnabled) sounds.playPowerup();
  }, [soundEnabled]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Generate pseudo-legal moves for a square
  const getMovesForSquare = useCallback((b: BoardState, r: number, c: number): [number, number][] => {
    const piece = b[r][c];
    if (!piece) return [];
    const moves: [number, number][] = [];
    const color = piece.color;
    const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

    const addMoveIfValid = (nr: number, nc: number) => {
      if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) return false;
      const target = b[nr][nc];
      if (!target) {
        moves.push([nr, nc]);
        return true;
      }
      if (target.color === enemyColor) {
        moves.push([nr, nc]);
      }
      return false; // hit piece
    };

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? -1 : 1;
        const startRow = color === 'w' ? 6 : 1;
        // 1 step forward
        if (r + dir >= 0 && r + dir < 8 && !b[r + dir][c]) {
          moves.push([r + dir, c]);
          // 2 steps forward
          if (r === startRow && !b[r + dir * 2][c]) {
            moves.push([r + dir * 2, c]);
          }
        }
        // Captures
        [-1, 1].forEach((dc) => {
          const nr = r + dir;
          const nc = c + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const target = b[nr][nc];
            if (target && target.color === enemyColor) {
              moves.push([nr, nc]);
            }
          }
        });
        break;
      }
      case 'n': {
        const jumps = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        jumps.forEach(([dr, dc]) => addMoveIfValid(r + dr, c + dc));
        break;
      }
      case 'b': {
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        dirs.forEach(([dr, dc]) => {
          let step = 1;
          while (addMoveIfValid(r + dr * step, c + dc * step)) {
            step++;
          }
        });
        break;
      }
      case 'r': {
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        dirs.forEach(([dr, dc]) => {
          let step = 1;
          while (addMoveIfValid(r + dr * step, c + dc * step)) {
            step++;
          }
        });
        break;
      }
      case 'q': {
        const dirs = [
          [-1, -1], [-1, 1], [1, -1], [1, 1],
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ];
        dirs.forEach(([dr, dc]) => {
          let step = 1;
          while (addMoveIfValid(r + dr * step, c + dc * step)) {
            step++;
          }
        });
        break;
      }
      case 'k': {
        const dirs = [
          [-1, -1], [-1, 1], [1, -1], [1, 1],
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ];
        dirs.forEach(([dr, dc]) => addMoveIfValid(r + dr, c + dc));
        break;
      }
    }

    return moves;
  }, []);

  // Check if a king of `color` is attacked
  const isKingInCheck = useCallback((b: BoardState, color: PieceColor): boolean => {
    let kingR = -1;
    let kingC = -1;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p && p.type === 'k' && p.color === color) {
          kingR = r;
          kingC = c;
          break;
        }
      }
      if (kingR !== -1) break;
    }

    if (kingR === -1) return true; // King dead

    const enemyColor = color === 'w' ? 'b' : 'w';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = b[r][c];
        if (p && p.color === enemyColor) {
          const enemyMoves = getMovesForSquare(b, r, c);
          if (enemyMoves.some(([mr, mc]) => mr === kingR && mc === kingC)) {
            return true;
          }
        }
      }
    }
    return false;
  }, [getMovesForSquare]);

  // AI Move calculation (MiniMax Evaluation)
  const makeAIMove = useCallback((currentBoard: BoardState) => {
    const blackMoves: { from: [number, number]; to: [number, number]; score: number }[] = [];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === 'b') {
          const moves = getMovesForSquare(currentBoard, r, c);
          moves.forEach(([tr, tc]) => {
            // Simulate move
            const targetPiece = currentBoard[tr][tc];
            let moveValue = targetPiece ? PIECE_VALUES[targetPiece.type] : 0;
            // Center control bonus
            if (tr >= 3 && tr <= 4 && tc >= 3 && tc <= 4) moveValue += 3;
            // Random noise according to difficulty
            if (difficulty === 'easy') moveValue += Math.random() * 20;
            else if (difficulty === 'medium') moveValue += Math.random() * 5;

            blackMoves.push({
              from: [r, c],
              to: [tr, tc],
              score: moveValue,
            });
          });
        }
      }
    }

    if (blackMoves.length === 0) {
      // Checkmate or stalemate
      setGameStatus('CHECKMATE_USER');
      if (soundEnabled) sounds.playPowerup();
      if (onGameOver) onGameOver(score + 1000);
      return;
    }

    // Sort by best score
    blackMoves.sort((a, b) => b.score - a.score);
    const chosen = blackMoves[0];

    // Execute AI Move
    const nextBoard = currentBoard.map((row) => [...row]);
    const movingPiece = nextBoard[chosen.from[0]][chosen.from[1]]!;
    const captured = nextBoard[chosen.to[0]][chosen.to[1]];

    if (captured) {
      setCapturedWhite((prev) => [...prev, captured.type]);
    }

    // Pawn Promotion
    if (movingPiece.type === 'p' && chosen.to[0] === 7) {
      movingPiece.type = 'q';
    }

    nextBoard[chosen.to[0]][chosen.to[1]] = movingPiece;
    nextBoard[chosen.from[0]][chosen.from[1]] = null;

    setBoard(nextBoard);
    setTurn('w');
    if (soundEnabled) sounds.playHit();

    // Check if user is in check
    if (isKingInCheck(nextBoard, 'w')) {
      setGameStatus('CHECK');
    } else {
      setGameStatus('PLAYING');
    }
  }, [getMovesForSquare, difficulty, isKingInCheck, soundEnabled, onGameOver, score]);

  // Handle Square Selection
  const handleSquareClick = (r: number, c: number) => {
    if (turn !== 'w' || gameStatus.startsWith('CHECKMATE')) return;

    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      const isMoveValid = validMoves.some(([mr, mc]) => mr === r && mc === c);

      if (isMoveValid) {
        // Execute User Move
        const nextBoard = board.map((row) => [...row]);
        const movingPiece = nextBoard[sr][sc]!;
        const captured = nextBoard[r][c];

        let pointGain = 10;
        if (captured) {
          setCapturedBlack((prev) => [...prev, captured.type]);
          pointGain += PIECE_VALUES[captured.type] * 10;
          if (soundEnabled) sounds.playExplosion();
        } else {
          if (soundEnabled) sounds.playMove();
        }

        // Pawn Promotion
        if (movingPiece.type === 'p' && r === 0) {
          movingPiece.type = 'q';
          pointGain += 90;
        }

        nextBoard[r][c] = movingPiece;
        nextBoard[sr][sc] = null;

        const newScore = score + pointGain;
        setScore(newScore);
        if (onScoreUpdate) onScoreUpdate(newScore);

        setBoard(nextBoard);
        setSelectedSquare(null);
        setValidMoves([]);
        setTurn('b');

        // Trigger AI Turn after slight delay
        setTimeout(() => {
          makeAIMove(nextBoard);
        }, 350);
        return;
      }
    }

    // Select piece
    const piece = board[r][c];
    if (piece && piece.color === 'w') {
      setSelectedSquare([r, c]);
      const moves = getMovesForSquare(board, r, c);
      setValidMoves(moves);
      if (soundEnabled) sounds.playClick();
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center select-none bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl text-white">
      {/* Top HUD */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-600/30 border border-indigo-500/40 px-3 py-1.5 rounded-xl">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-black text-indigo-300">SCORE: {score}</span>
          </div>
          <div className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
            {turn === 'w' ? '⚪ YOUR TURN' : '🤖 AI THINKING...'}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            className="bg-slate-800 border border-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-xl text-slate-300 focus:outline-none"
          >
            <option value="easy">AI: EASY</option>
            <option value="medium">AI: MEDIUM</option>
            <option value="hard">AI: MASTER</option>
          </select>
          <button
            onClick={initBoard}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all shadow"
            title="Reset Board"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Captured Pieces Cemetery */}
      <div className="w-full flex items-center justify-between px-2 mb-3 text-sm">
        <div className="flex items-center gap-1 min-h-[24px]">
          <span className="text-xs text-slate-500 font-bold mr-1">Captured:</span>
          {capturedBlack.map((type, idx) => (
            <span key={idx} className="text-slate-400 text-base">{PIECE_SYMBOLS[`b-${type}`]}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 min-h-[24px]">
          {capturedWhite.map((type, idx) => (
            <span key={idx} className="text-indigo-400 text-base">{PIECE_SYMBOLS[`w-${type}`]}</span>
          ))}
        </div>
      </div>

      {/* 8x8 Chess Board */}
      <div className="relative aspect-square w-full max-w-[480px] bg-slate-950 border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl grid grid-cols-8 grid-rows-8">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isDarkSquare = (r + c) % 2 === 1;
            const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
            const isValidTarget = validMoves.some(([mr, mc]) => mr === r && mc === c);

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleSquareClick(r, c)}
                className={`relative flex items-center justify-center cursor-pointer transition-all ${
                  isDarkSquare ? 'bg-slate-800/90' : 'bg-slate-700/60'
                } ${isSelected ? 'ring-4 ring-indigo-500 ring-inset bg-indigo-900/60' : ''}`}
              >
                {/* Valid Move Indicator Dot / Ring */}
                {isValidTarget && (
                  <div
                    className={`absolute z-10 rounded-full ${
                      piece ? 'w-full h-full border-4 border-emerald-400/80 bg-emerald-500/20' : 'w-4 h-4 bg-emerald-400 shadow-[0_0_8px_#34d399]'
                    }`}
                  />
                )}

                {/* Piece Symbol */}
                {piece && (
                  <span
                    className={`text-3xl sm:text-4xl md:text-5xl font-serif select-none transition-transform hover:scale-110 ${
                      piece.color === 'w'
                        ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
                        : 'text-indigo-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                    }`}
                  >
                    {PIECE_SYMBOLS[`${piece.color}-${piece.type}`]}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Check / Status Alert */}
      {gameStatus === 'CHECK' && (
        <div className="mt-4 flex items-center gap-2 text-rose-400 font-black text-xs uppercase bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>WARNING: YOUR KING IS UNDER CHECK!</span>
        </div>
      )}

      {/* Victory / Checkmate Modal */}
      {gameStatus === 'CHECKMATE_USER' && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="w-20 h-20 bg-amber-500/20 border border-amber-500/40 rounded-3xl flex items-center justify-center text-amber-400 mb-4 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">CHECKMATE! YOU WIN!</h2>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Spectacular tactical victory against the Cyber AI.
          </p>
          <button
            onClick={initBoard}
            className="py-3.5 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-extrabold text-sm rounded-xl shadow-lg transition-all"
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};
