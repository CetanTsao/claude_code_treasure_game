import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import AuthScreen from './components/AuthScreen';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import keyIcon from './assets/key.png';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

interface ScoreRecord {
  score: number;
  played_at: string;
}

interface AuthState {
  token: string;
  username: string;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [history, setHistory] = useState<ScoreRecord[]>([]);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
    setScoreSaved(false);
  };

  useEffect(() => {
    if (auth || isGuest) initializeGame();
  }, [auth, isGuest]);

  // Load score history when auth changes
  useEffect(() => {
    if (!auth) return;
    fetch(`${API_BASE}/api/scores`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {});
  }, [auth]);

  const saveScore = async (finalScore: number) => {
    if (!auth || scoreSaved) return;
    setScoreSaved(true);
    try {
      await fetch(`${API_BASE}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ score: finalScore }),
      });
      // Refresh history
      const res = await fetch(`${API_BASE}/api/scores`, { headers: { Authorization: `Bearer ${auth.token}` } });
      setHistory(await res.json());
    } catch {}
  };

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          const newScore = box.hasTreasure ? score + 150 : score - 50;
          setScore(newScore);
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();

          const treasureFound = box.hasTreasure;
          const allWillBeOpen = prevBoxes.filter(b => b.id !== boxId).every(b => b.isOpen);
          if (treasureFound || allWillBeOpen) {
            setGameEnded(true);
            saveScore(newScore);
          }

          return { ...box, isOpen: true };
        }
        return box;
      });
      return updatedBoxes;
    });
  };

  const handleSignOut = () => {
    setAuth(null);
    setIsGuest(false);
    setBoxes([]);
    setHistory([]);
  };

  // Show auth screen if not signed in and not guest
  if (!auth && !isGuest) {
    return <AuthScreen onAuth={(token, username) => setAuth({ token, username })} onGuest={() => setIsGuest(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">
      {/* Header bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <div className="text-amber-800 font-medium">
          {auth ? `👤 ${auth.username}` : '👻 Guest Mode'}
        </div>
        <Button variant="ghost" className="text-amber-600 text-sm" onClick={handleSignOut}>
          {auth ? 'Sign Out' : 'Back to Menu'}
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">Click on the treasure chests to discover what's inside!</p>
        <p className="text-amber-700 text-sm">💰 Treasure: +$150 | 💀 Skeleton: -$50</p>
      </div>

      <div className="mb-8 flex items-center gap-4">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>${score}</span>
        </div>
        <div className={`text-2xl font-bold px-4 py-2 rounded-full border-2 ${
          score > 0 ? 'bg-green-100 text-green-700 border-green-400'
          : score < 0 ? 'bg-red-100 text-red-700 border-red-400'
          : 'bg-amber-100 text-amber-700 border-amber-400'
        }`}>
          {score > 0 ? 'WIN' : score < 0 ? 'LOSS' : 'TIE'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={!box.isOpen ? { cursor: `url(${keyIcon}) 16 16, pointer` } : { cursor: 'default' }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{ rotateY: box.isOpen ? 180 : 0, scale: box.isOpen ? 1.1 : 1 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="relative"
            >
              <img
                src={box.isOpen ? (box.hasTreasure ? treasureChest : skeletonChest) : closedChest}
                alt={box.isOpen ? (box.hasTreasure ? 'Treasure!' : 'Skeleton!') : 'Treasure Chest'}
                className="w-48 h-48 object-contain drop-shadow-lg"
              />
              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure
                    ? <div className="text-2xl animate-bounce">✨💰✨</div>
                    : <div className="text-2xl animate-pulse">💀👻💀</div>}
                </motion.div>
              )}
            </motion.div>
            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$150' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">Click to open!</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score: <span className={score >= 0 ? 'text-green-600' : 'text-red-600'}>${score}</span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {auth && (
              <p className="text-xs text-amber-500 mt-1">
                {scoreSaved ? '✅ Score saved to your account!' : 'Saving score...'}
              </p>
            )}
            {isGuest && (
              <p className="text-xs text-amber-500 mt-1">Sign in to save your scores!</p>
            )}
          </div>
          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}

      {/* Score history for signed-in users */}
      {auth && history.length > 0 && (
        <div className="mt-8 w-full max-w-sm">
          <h3 className="text-amber-900 text-lg mb-3 text-center">Your Recent Scores</h3>
          <div className="bg-amber-200/60 rounded-xl border border-amber-300 overflow-hidden">
            {history.map((record, i) => (
              <div key={i} className="flex justify-between items-center px-4 py-2 border-b border-amber-300 last:border-0">
                <span className={`font-medium ${record.score > 0 ? 'text-green-700' : record.score < 0 ? 'text-red-700' : 'text-amber-700'}`}>
                  ${record.score}
                </span>
                <span className="text-amber-600 text-sm">
                  {new Date(record.played_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
