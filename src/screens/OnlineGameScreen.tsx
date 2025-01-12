import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import { auth, db } from '../config/firebase';
import { Button } from '../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar } from '../components/ProgressBar';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import * as Haptics from 'expo-haptics';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

type GameState = {
  currentPlayer: number;
  showRole: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  winner?: 'spy' | 'players';
  roundTime?: number;
  votedSpy?: number;
  allPlayersReady?: boolean;
  isVoting?: boolean;
  votes: number[];
  showVoteResult?: boolean;
  votedPlayers?: number[];
  showRevealScreen?: boolean;
  gameCode: string;
  hostId: string;
};

export default function OnlineGameScreen({ route, navigation }: Props) {
  const theme = useTheme() as Theme;
  const insets = useSafeAreaInsets();
  const user = auth.currentUser;
  const { gameCode = '', location, gameTime } = route.params;
  
  const [timeLeft, setTimeLeft] = useState(gameTime);
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 0,
    showRole: false,
    isGameOver: false,
    isPaused: false,
    roundTime: 0,
    allPlayersReady: false,
    isVoting: false,
    votes: [],
    showVoteResult: false,
    gameCode,
    hostId: '',
  });

  const [players, setPlayers] = useState<string[]>([]);
  const [spies, setSpies] = useState<number[]>([]);
  const [playerRoles, setPlayerRoles] = useState<string[]>([]);

  useEffect(() => {
    if (!gameCode) return;
    
    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setGameState(prev => ({
          ...prev,
          ...data,
        }));
        setPlayers(data.players || []);
        setSpies(data.spies || []);
        setPlayerRoles(data.roles || []);
      }
    });

    return () => unsubscribe();
  }, [gameCode]);

  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState.isPaused, gameState.isGameOver]);

  const handleTimeUp = async () => {
    if (!gameCode || user?.uid !== gameState.hostId) return;

    await updateDoc(doc(db, 'games', gameCode), {
      isVoting: true,
      currentPlayer: 0,
      votes: new Array(players.length).fill(0),
      votedPlayers: [],
    });
  };

  const isPlayerSpy = (playerIndex: number) => {
    return spies.includes(playerIndex);
  };

  const handleVote = async (votedIndex: number) => {
    if (!gameCode) return;
    
    if (!gameState.isVoting) {
      Alert.alert('ยังไม่สามารถโหวตได้', 'รอให้หัวห้องเริ่มการโหวตหรือเวลาหมดก่อน');
      return;
    }

    if (votedIndex === gameState.currentPlayer) {
      Alert.alert('ไม่สามารถโหวตตัวเองได้', 'กรุณาเลือกผู้เล่นคนอื่น');
      return;
    }

    const playerIndex = players.findIndex(p => p === user?.displayName);
    if (gameState.votedPlayers?.includes(playerIndex)) {
      Alert.alert('คุณได้โหวตไปแล้ว', 'รอผู้เล่นคนอื่นโหวต');
      return;
    }

    const newVotes = [...gameState.votes];
    newVotes[votedIndex]++;
    const newVotedPlayers = [...(gameState.votedPlayers || []), playerIndex];

    await updateDoc(doc(db, 'games', gameCode), {
      votes: newVotes,
      votedPlayers: newVotedPlayers,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const startVoting = async () => {
    if (!gameCode) return;
    
    if (user?.uid !== gameState.hostId) {
      Alert.alert('ไม่สามารถเริ่มโหวตได้', 'เฉพาะหัวห้องเท่านั้นที่สามารถเริ่มการโหวตได้');
      return;
    }

    await updateDoc(doc(db, 'games', gameCode), {
      isVoting: true,
      currentPlayer: 0,
      votes: new Array(players.length).fill(0),
      votedPlayers: [],
    });
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Text style={[styles.timer, { color: theme.colors.text }]}>
            {formatTime(timeLeft)}
          </Text>
          <View style={styles.progressBar}>
            <ProgressBar progress={timeLeft / gameTime} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {gameState.isVoting ? 'โหวตหาสายลับ' : 'ผู้เล่น'}
          </Text>
          <View style={styles.playerList}>
            {players.map((player, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => gameState.isVoting && handleVote(index)}
                style={[
                  styles.playerItem,
                  {
                    backgroundColor: gameState.votedPlayers?.includes(index)
                      ? theme.colors.border
                      : theme.colors.background,
                  },
                ]}
              >
                <Text style={[styles.playerName, { color: theme.colors.text }]}>
                  {player}
                </Text>
                {gameState.isVoting && (
                  <Text style={[styles.voteCount, { color: theme.colors.primary }]}>
                    {gameState.votes[index] || 0}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {user?.uid === gameState.hostId && !gameState.isVoting && (
          <Button
            title="เริ่มโหวต"
            onPress={startVoting}
            style={styles.voteButton}
            leftIcon={<Ionicons name="checkmark-circle" size={24} color="white" />}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flex: 1,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  playerList: {
    gap: 8,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  playerName: {
    fontSize: 16,
  },
  voteCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  voteButton: {
    height: 56,
  },
}); 