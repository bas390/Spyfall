import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  Dimensions,
  Platform,
  BackHandler,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Location, locations } from '../data/locations';
import { RootStackParamList } from '../types/navigation';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import { auth, db } from '../config/firebase';
import { Button } from '../components/Button';
import { GameDB } from '../utils/db';
import * as Haptics from 'expo-haptics';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  useSharedValue,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { SharedElement } from 'react-navigation-shared-element';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressBar } from '../components/ProgressBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Game' | 'LocalGame'>;

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
  gameCode?: string;
};

export default function GameScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useTheme() as Theme;
  const user = auth.currentUser;
  const { players, spies, location, gameTime, gameCode } = route.params;
  const isLocalGame = route.name === 'LocalGame';
  
  const [timeLeft, setTimeLeft] = useState(gameTime);
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: 0,
    showRole: false,
    isGameOver: false,
    isPaused: false,
    roundTime: 0,
    allPlayersReady: false,
    isVoting: false,
    votes: new Array(players.length).fill(0),
    showVoteResult: false,
    gameCode,
  });

  const [playerRoles] = useState(() => {
    const roles = new Array(players.length).fill('');
    players.forEach((_, index) => {
      if (!spies.includes(index)) {
        const availableRoles = [...location.roles];
        const randomRole = availableRoles[Math.floor(Math.random() * availableRoles.length)];
        roles[index] = randomRole;
      }
    });
    return roles;
  });

  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const cardFlip = useSharedValue(0);
  const progressWidth = useSharedValue(SCREEN_WIDTH);

  const cardStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      cardFlip.value,
      [0, 1],
      [0, 180],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotateY: `${rotateValue}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const isPlayerSpy = (playerIndex: number) => {
    return spies.includes(playerIndex);
  };

  const startVoting = () => {
    setGameState(prev => ({
      ...prev,
      isVoting: true,
      currentPlayer: 0,
      votes: new Array(players.length).fill(0),
      votedPlayers: [],
      showVoteResult: false,
    }));
  };

  const handleVote = async (votedIndex: number) => {
    if (votedIndex === gameState.currentPlayer) {
      Alert.alert('ไม่สามารถโหวตตัวเองได้', 'กรุณาเลือกผู้เล่นคนอื่น');
      return;
    }

    if (gameState.votedPlayers?.includes(gameState.currentPlayer)) {
      const newVotes = [...gameState.votes];
      newVotes[votedIndex]--;
      const newVotedPlayers = gameState.votedPlayers?.filter(
        (player) => player !== gameState.currentPlayer
      );
      
      if (isLocalGame) {
        setGameState({
          ...gameState,
          votes: newVotes,
          votedPlayers: newVotedPlayers,
        });
      } else {
        await updateGameState({
          votes: newVotes,
          votedPlayers: newVotedPlayers,
        });
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    const newVotes = [...gameState.votes];
    newVotes[votedIndex]++;
    const newVotedPlayers = [
      ...(gameState.votedPlayers || []),
      gameState.currentPlayer,
    ];

    const isLastPlayer = gameState.currentPlayer === players.length - 1;
    const newState = {
      votes: newVotes,
      votedPlayers: newVotedPlayers,
      currentPlayer: isLastPlayer ? 0 : gameState.currentPlayer + 1,
      isVoting: !isLastPlayer,
      showVoteResult: isLastPlayer,
    };

    if (isLocalGame) {
      setGameState({
        ...gameState,
        ...newState,
      });
    } else {
      await updateGameState(newState);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReveal = async () => {
    if (!gameState.votes) return;
    
    const maxVotes = Math.max(...gameState.votes);
    const topVotedPlayers = gameState.votes.filter(votes => votes === maxVotes).length;

    if (topVotedPlayers > 1) {
      Alert.alert(
        'มีคะแนนเสมอกัน!',
        'กรุณาโหวตใหม่อีกครั้ง',
        [
          {
            text: 'โหวตใหม่',
            onPress: async () => {
              const newState = {
                isVoting: true,
                currentPlayer: 0,
                votes: new Array(players.length).fill(0),
                showVoteResult: false,
              };

              if (isLocalGame) {
                setGameState(prev => ({
                  ...prev,
                  ...newState,
                }));
              } else {
                await updateGameState(newState);
              }
            }
          }
        ]
      );
      return;
    }

    const mostVotedIndex = gameState.votes.indexOf(maxVotes);
    const newState = {
      showRevealScreen: true,
      votedSpy: mostVotedIndex,
    };

    if (isLocalGame) {
      setGameState(prev => ({
        ...prev,
        ...newState,
      }));
    } else {
      await updateGameState(newState);
    }
  };

  const saveGameResult = useCallback(async (winner: 'spy' | 'players') => {
    if (!user) return;

    try {
      await GameDB.saveGameHistory({
        players,
        location: location.name,
        spies,
        winner,
        duration: gameTime - timeLeft,
        timestamp: Date.now()
      });

      await GameDB.updatePlayerStats(user.uid, {
        isWin: (winner === 'spy' && isPlayerSpy(gameState.currentPlayer)) || 
               (winner === 'players' && !isPlayerSpy(gameState.currentPlayer)),
        role: isPlayerSpy(gameState.currentPlayer) ? 'spy' : 'player'
      });
    } catch (error) {
      console.error('Failed to save game result:', error);
    }
  }, [user, players, location, spies, gameTime, timeLeft, gameState.currentPlayer]);

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  };

  const handleTimeUp = () => {
    setGameState(prev => ({
      ...prev,
      isGameOver: true,
      winner: 'spy'
    }));
    saveGameResult('spy');
  };

  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

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
  }, [gameState.isGameOver, gameState.isPaused]);

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        'ยืนยันการออกจากเกม',
        'คุณต้องการออกจากเกมใช่หรือไม่?',
        [
          {
            text: 'ยกเลิก',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'ออกจากเกม',
            onPress: () => navigation.goBack(),
            style: 'destructive',
          },
        ]
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const handleNextPlayer = () => {
    const nextPlayer = gameState.currentPlayer + 1;
    
    // ถ้าเป็นผู้เล่นคนสุดท้าย
    if (nextPlayer === players.length) {
      setGameState(prev => ({
        ...prev,
        allPlayersReady: true,
        showRole: false,
        currentPlayer: 0, // รีเซ็ตกลับไปที่ผู้เล่นคนแรก
      }));
      return;
    }

    // ถ้ายังไม่ใช่ผู้เล่นคนสุดท้าย
    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      showRole: false,
    }));
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const VoteResults = () => (
    <View style={styles.voteResults}>
      {players.map((player, index) => (
        <View key={index} style={styles.voteResultItem}>
          <Text>{player}</Text>
          <Text>{gameState.votes?.[index] || 0} โหวต</Text>
          <ProgressBar 
            progress={(gameState.votes?.[index] || 0) / players.length}
          />
        </View>
      ))}
    </View>
  );

  const handleTieBreaker = () => {
    if (!gameState.votes) return;
    const maxVotes = Math.max(...(gameState.votes || []));
    const tiedPlayers = gameState.votes
      .map((votes, index) => ({ index, votes }))
      .filter(p => p.votes === maxVotes);
    
    setGameState(prev => ({
      ...prev,
      tiedPlayers: tiedPlayers.map(p => p.index),
      isRevoting: true,
      votes: new Array(players.length).fill(0),
    }));
  };

  useEffect(() => {
    if (isLocalGame || !gameCode) return;

    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (!snapshot.exists()) {
        Alert.alert('เกมถูกยกเลิก', 'เกมนี้ถูกยกเลิกหรือจบไปแล้ว');
        navigation.goBack();
        return;
      }

      const gameData = snapshot.data();
      setGameState(prev => ({
        ...prev,
        isVoting: gameData.isVoting || false,
        votes: gameData.votes || new Array(players.length).fill(0),
        showVoteResult: gameData.showVoteResult || false,
        votedPlayers: gameData.votedPlayers || [],
        showRevealScreen: gameData.showRevealScreen || false,
        votedSpy: gameData.votedSpy,
        winner: gameData.winner,
        isGameOver: gameData.isGameOver || false,
      }));
    });

    return () => unsubscribe();
  }, [isLocalGame, gameCode, players.length]);

  const updateGameState = async (newState: Partial<GameState>) => {
    if (isLocalGame || !gameCode) return;

    try {
      const gameRef = doc(db, 'games', gameCode);
      await updateDoc(gameRef, newState);
    } catch (error) {
      console.error('Error updating game state:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถอัพเดทสถานะเกมได้');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.timeContainer}>
          <Text style={[styles.timeText, { color: theme.colors.text }]}>
            {`${minutes}:${seconds.toString().padStart(2, '0')}`}
          </Text>
        </View>
        <Button
          title="หยุดชั่วคราว"
          onPress={togglePause}
          variant="secondary"
          style={styles.pauseButton}
          leftIcon={
            <Ionicons 
              name={gameState.isPaused ? "play" : "pause"} 
              size={20} 
              color="white" 
            />
          }
        />
      </View>

      <View style={styles.content}>
        {gameState.showRevealScreen ? (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.revealContent}>
              <View style={styles.revealSection}>
                <Text style={[styles.revealLabel, { color: theme.colors.subText }]}>
                  สถานที่
                </Text>
                <Text style={[styles.locationTitle, { color: theme.colors.primary }]}>
                  {location.name}
                </Text>
              </View>

              <View style={styles.revealSection}>
                <Text style={[styles.revealLabel, { color: theme.colors.subText }]}>
                  สายลับ
                </Text>
                {spies.map((spyIndex) => (
                  <View key={spyIndex} style={styles.spyItem}>
                    <Ionicons name="person" size={24} color={theme.colors.primary} />
                    <Text style={[styles.spyName, { color: theme.colors.text }]}>
                      {players[spyIndex]}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.revealSection}>
                <Text style={[styles.revealLabel, { color: theme.colors.subText }]}>
                  ผลการโหวต
                </Text>
                <View style={styles.voteResultBox}>
                  <View style={styles.voteResultRow}>
                    <Ionicons 
                      name={isPlayerSpy(gameState.votedSpy || 0) ? "checkmark-circle" : "close-circle"} 
                      size={32} 
                      color={isPlayerSpy(gameState.votedSpy || 0) ? theme.colors.success : theme.colors.error} 
                    />
                    <Text style={[styles.votedPlayerName, { color: theme.colors.text }]}>
                      {players[gameState.votedSpy || 0]}
                    </Text>
                  </View>
                  <Text style={[styles.voteResultText, { 
                    color: isPlayerSpy(gameState.votedSpy || 0) ? theme.colors.success : theme.colors.error 
                  }]}>
                    {isPlayerSpy(gameState.votedSpy || 0) ? 'จับสายลับได้!' : 'จับผิดตัว!'}
                  </Text>
                </View>
              </View>

              <Button
                title="จบเกม"
                onPress={() => {
                  const isSpy = isPlayerSpy(gameState.votedSpy || 0);
                  setGameState(prev => ({
                    ...prev,
                    isGameOver: true,
                    winner: isSpy ? 'players' : 'spy',
                  }));
                  saveGameResult(isSpy ? 'players' : 'spy');
                  navigation.goBack();
                }}
                style={styles.endButton}
                leftIcon={<Ionicons name="flag" size={24} color="white" />}
              />
            </View>
          </View>
        ) : gameState.isVoting ? (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              รอบการโหวต ({gameState.currentPlayer + 1}/{players.length})
            </Text>
            <Text style={[styles.playerNameBig, { color: theme.colors.primary }]}>
              {players[gameState.currentPlayer]}
            </Text>
            <Text style={[styles.instructionText, { color: theme.colors.text }]}>
              โปรดเลือกผู้เล่นที่คิดว่าเป็นสายลับ
            </Text>
            <ScrollView style={styles.playerList}>
              {players.map((player, index) => (
                <Button
                  key={index}
                  title={player}
                  onPress={() => handleVote(index)}
                  variant={index === gameState.currentPlayer ? 'outline' : 'primary'}
                  disabled={index === gameState.currentPlayer}
                  style={styles.voteButton}
                />
              ))}
            </ScrollView>
          </View>
        ) : gameState.showVoteResult ? (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              ผลการโหวต
            </Text>
            <ScrollView style={styles.playerList}>
              {players.map((player, index) => (
                <View key={index} style={styles.voteResult}>
                  <Text style={[styles.playerName, { color: theme.colors.text }]}>
                    {player}
                  </Text>
                  <Text style={[styles.voteCount, { color: theme.colors.text }]}>
                    {gameState.votes?.[index] || 0} โหวต
                  </Text>
                </View>
              ))}
            </ScrollView>
            <Button
              title="เปิดเผยผล"
              onPress={handleReveal}
              variant="primary"
              style={styles.revealButton}
            />
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            {gameState.allPlayersReady ? (
              <View style={styles.locationListContainer}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  สถานที่ที่เป็นไปได้
                </Text>
                <ScrollView 
                  style={styles.locationList}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.locationListContent}
                >
                  {Object.entries(
                    locations.reduce((acc, loc) => {
                      if (!acc[loc.category]) {
                        acc[loc.category] = [];
                      }
                      acc[loc.category].push(loc);
                      return acc;
                    }, {} as Record<string, Location[]>)
                  ).map(([category, locs]) => (
                    <View key={category} style={styles.categorySection}>
                      <View style={styles.categoryHeader}>
                        <Ionicons 
                          name={
                            category === 'education' ? 'school-outline' :
                            category === 'entertainment' ? 'game-controller-outline' :
                            category === 'business' ? 'business-outline' :
                            category === 'public' ? 'library-outline' :
                            'train-outline'
                          } 
                          size={24} 
                          color={theme.colors.primary} 
                        />
                        <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                          {
                            category === 'education' ? 'การศึกษา' :
                            category === 'entertainment' ? 'ความบันเทิง' :
                            category === 'business' ? 'ธุรกิจ' :
                            category === 'public' ? 'สถานที่ราชการ' :
                            'การขนส่ง'
                          }
                        </Text>
                      </View>
                      <View style={styles.locationGrid}>
                        {locs.map((loc, index) => (
                          <View 
                            key={index}
                            style={[
                              styles.locationItem,
                              { 
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                              }
                            ]}
                          >
                            <View style={styles.locationContent}>
                              <Text style={[styles.locationName, { color: theme.colors.text }]}>
                                {loc.name}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <Button
                  title="เริ่มโหวต"
                  onPress={startVoting}
                  style={styles.voteButton}
                  leftIcon={<Ionicons name="people" size={24} color="white" />}
                />
              </View>
            ) : !gameState.showRole ? (
              <View style={styles.roleContainer}>
                <Text style={[styles.instructionText, { color: theme.colors.text }]}>
                  กรุณาส่งมือถือให้
                </Text>
                <Text style={[styles.playerNameBig, { color: theme.colors.primary }]}>
                  {players[gameState.currentPlayer]}
                </Text>
                <View style={styles.buttonContainer}>
                  <Button
                    title="ดูบทบาท"
                    onPress={() => setGameState(prev => ({ ...prev, showRole: true }))}
                    leftIcon={<Ionicons name="eye" size={24} color="white" />}
                    style={styles.roleButton}
                  />
                  <Button
                    title="ยกเลิกเกม"
                    onPress={() => {
                      Alert.alert(
                        'ยกเลิกเกม',
                        'คุณต้องการยกเลิกเกมนี้ใช่หรือไม่?',
                        [
                          { text: 'ยกเลิก', style: 'cancel' },
                          { 
                            text: 'ยืนยัน', 
                            style: 'destructive',
                            onPress: () => navigation.goBack()
                          },
                        ],
                      );
                    }}
                    variant="secondary"
                    style={styles.cancelButton}
                    leftIcon={<Ionicons name="close" size={24} color="white" />}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.roleContainer}>
                <LinearGradient
                  colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0)']}
                  style={styles.gradientBackground}
                />
                <Text style={[styles.roleText, { color: theme.colors.text }]}>
                  {isPlayerSpy(gameState.currentPlayer) ? 
                    'คุณคือสายลับ! 🕵️‍♂️' : 
                    'บทบาทของคุณ'
                  }
                </Text>
                {!isPlayerSpy(gameState.currentPlayer) && (
                  <View style={styles.roleInfo}>
                    <View style={[styles.roleCard, { backgroundColor: theme.colors.card }]}>
                      <Text style={[styles.locationTitle, { color: theme.colors.primary }]}>
                        {location.name}
                      </Text>
                      <Text style={[styles.roleTitle, { color: theme.colors.text }]}>
                        {playerRoles[gameState.currentPlayer]}
                      </Text>
                      <Text style={[styles.subText, { color: theme.colors.subText }]}>
                        {location.description}
                      </Text>
                    </View>
                  </View>
                )}
                <Button
                  title="ส่งต่อผู้เล่นถัดไป"
                  onPress={handleNextPlayer}
                  style={styles.nextButton}
                  leftIcon={<Ionicons name="arrow-forward" size={24} color="white" />}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  pauseButton: {
    minWidth: 120,
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: SCREEN_WIDTH * 0.95,
    minHeight: 600,
    maxHeight: '95%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  playerNameBig: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  playerList: {
    flex: 1,
    width: '100%',
  },
  voteResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  voteCount: {
    fontSize: 14,
  },
  revealButton: {
    marginTop: 16,
  },
  locationListContainer: {
    width: '100%',
    flex: 1,
  },
  locationList: {
    flex: 1,
    width: '100%',
  },
  locationListContent: {
    paddingVertical: 8,
  },
  categorySection: {
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -2,
  },
  locationItem: {
    width: '33.33%',
    padding: 2,
  },
  locationContent: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  voteButton: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  roleContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  roleButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
  },
  cancelButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  roleInfo: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  roleCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 0,
    lineHeight: 24,
  },
  nextButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderRadius: 24,
  },
  voteResults: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  voteResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  revealContent: {
    width: '100%',
    alignItems: 'stretch',
    paddingVertical: 20,
  },
  revealSection: {
    marginBottom: 32,
  },
  revealLabel: {
    fontSize: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  spyName: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  voteResultBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  voteResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  votedPlayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  voteResultText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  endButton: {
    marginTop: 40,
    width: '100%',
    height: 56,
    borderRadius: 16,
  },
}); 