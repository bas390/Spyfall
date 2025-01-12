import { useState, useCallback, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FirebaseError } from '../utils/errors';
import { GameState, Player } from '../types/game';

interface UseGameStateProps {
  gameCode?: string;
  isLocalGame: boolean;
}

export const useGameState = ({ gameCode, isLocalGame }: UseGameStateProps) => {
  const [gameState, setGameState] = useState<GameState>({
    showRole: true,
    isGameOver: false,
    isPaused: false,
    isVoting: false,
    votes: [],
    showVoteResult: false,
    votedSpy: undefined,
    currentPlayer: 0,
    allPlayersReady: false,
    winner: undefined,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLocalGame && gameCode) {
      const gameRef = doc(db, 'games', gameCode);
      const unsubscribe = onSnapshot(
        gameRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setGameState((prev: GameState) => ({
              ...prev,
              isVoting: data.isVoting || false,
              votes: Object.values(data.votes || {}),
              showVoteResult: data.showVoteResult || false,
              votedPlayers: data.votedPlayers || [],
            }));
          }
        },
        (error) => {
          console.error('Game state subscription error:', error);
          setError('ไม่สามารถติดตามการเปลี่ยนแปลงของเกมได้');
        }
      );

      return () => unsubscribe();
    }
  }, [isLocalGame, gameCode]);

  const startVoting = useCallback(async () => {
    if (!isLocalGame && gameCode) {
      setLoading(true);
      try {
        const gameRef = doc(db, 'games', gameCode);
        await updateDoc(gameRef, { 
          isVoting: true,
          votes: {},
          votedPlayers: [],
          showVoteResult: false
        });
      } catch (error) {
        console.error('Error starting voting:', error);
        setError('ไม่สามารถเริ่มการโหวตได้');
        throw new FirebaseError('ไม่สามารถเริ่มการโหวตได้', 'voting-error');
      } finally {
        setLoading(false);
      }
    } else {
      setGameState((prev: GameState) => ({
        ...prev,
        isVoting: true,
        votes: [],
        votedPlayers: [],
        showVoteResult: false
      }));
    }
  }, [gameCode, isLocalGame]);

  const handleVote = useCallback(async (votedIndex: number, playerId: string) => {
    if (!isLocalGame && gameCode) {
      setLoading(true);
      try {
        const gameRef = doc(db, 'games', gameCode);
        await updateDoc(gameRef, {
          [`votes.${votedIndex}`]: increment(1),
          votedPlayers: arrayUnion(playerId)
        });
      } catch (error) {
        console.error('Error voting:', error);
        setError('ไม่สามารถลงคะแนนได้');
        throw new FirebaseError('ไม่สามารถลงคะแนนได้', 'voting-error');
      } finally {
        setLoading(false);
      }
    } else {
      setGameState((prev: GameState) => {
        const newVotes = [...prev.votes];
        newVotes[votedIndex] = (newVotes[votedIndex] || 0) + 1;
        return {
          ...prev,
          votes: newVotes
        };
      });
    }
  }, [gameCode, isLocalGame]);

  const endGame = useCallback(async (winner: 'spy' | 'players') => {
    if (!isLocalGame && gameCode) {
      setLoading(true);
      try {
        const gameRef = doc(db, 'games', gameCode);
        await updateDoc(gameRef, {
          status: 'finished',
          winner,
          endedAt: new Date().getTime()
        });
      } catch (error) {
        console.error('Error ending game:', error);
        setError('ไม่สามารถจบเกมได้');
        throw new FirebaseError('ไม่สามารถจบเกมได้', 'game-end-error');
      } finally {
        setLoading(false);
      }
    }
    setGameState((prev: GameState) => ({
      ...prev,
      isGameOver: true,
      winner
    }));
  }, [gameCode, isLocalGame]);

  const togglePause = useCallback(() => {
    setGameState((prev: GameState) => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  return {
    gameState,
    loading,
    error,
    actions: {
      startVoting,
      handleVote,
      endGame,
      togglePause
    }
  };
}; 