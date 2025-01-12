import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert, Animated } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { Button } from '../components/Button';
import { db } from '../config/firebase';
import { doc, onSnapshot, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { locations } from '../data/locations';

type Props = {
  navigation: any;
  route: any;
};

type Player = {
  id: string;
  name: string;
  isReady: boolean;
  isHost: boolean;
  lastSeen: number;
};

type GameData = {
  maxPlayers: number;
  spyCount: number;
  gameTime: number;
  location: Location;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished' | 'deleted';
  createdAt: number;
  lastActivity: number;
};

type Notification = {
  id: string;
  message: string;
  type: 'join' | 'leave' | 'kick' | 'ready';
};

export default function WaitingRoomScreen({ navigation, route }: Props) {
  const theme = useTheme() as Theme;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { gameCode } = route.params;

  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const currentPlayer = game?.players.find(p => p.id === user?.uid);
  const isHost = currentPlayer?.isHost;

  const showNotification = (message: string, type: Notification['type']) => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // แสดงการแจ้งเตือนและซ่อนหลัง 3 วินาที
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    });
  };

  useEffect(() => {
    const gameRef = doc(db, 'games', gameCode);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      if (doc.exists()) {
        const gameData = doc.data() as GameData;
        
        // เช็คว่าผู้เล่นยังอยู่ในห้องหรือไม่
        if (user && !gameData.players.find(p => p.id === user.uid)) {
          navigation.navigate('Home');
          return;
        }
        
        // เช็คการเปลี่ยนแปลงของผู้เล่น
        if (game) {
          const prevPlayers = game.players;
          const newPlayers = gameData.players;
          
          // มีผู้เล่นใหม่เข้าห้อง
          newPlayers.forEach(player => {
            if (!prevPlayers.find(p => p.id === player.id)) {
              showNotification(`${player.name} เข้าร่วมห้อง`, 'join');
            }
          });
          
          // มีผู้เล่นออกจากห้อง
          prevPlayers.forEach(player => {
            if (!newPlayers.find(p => p.id === player.id)) {
              showNotification(`${player.name} ออกจากห้อง`, 'leave');
            }
          });
          
          // มีผู้เล่นเปลี่ยนสถานะพร้อม
          newPlayers.forEach(player => {
            const prevPlayer = prevPlayers.find(p => p.id === player.id);
            if (prevPlayer && prevPlayer.isReady !== player.isReady) {
              showNotification(
                `${player.name} ${player.isReady ? 'พร้อมแล้ว' : 'ยกเลิกพร้อม'}`,
                'ready'
              );
            }
          });
        }
        
        setGame(gameData);

        // ถ้าเกมเริ่มแล้ว ให้ไปหน้าเกม
        if (gameData.status === 'playing') {
          navigation.replace('Game', {
            gameCode,
            location: gameData.location,
            gameTime: gameData.gameTime,
          });
        }

        // ถ้าห้องถูกลบ ให้กลับไปหน้าหลัก
        if (gameData.status === 'deleted') {
          navigation.navigate('Home');
        }
      } else {
        // ถ้าไม่พบห้อง (ถูกลบไปแล้ว) ให้กลับไปหน้าหลัก
        navigation.navigate('Home');
      }
    });

    return () => unsubscribe();
  }, [gameCode, navigation, game, user]);

  useEffect(() => {
    if (!game || !user) return;

    const updateLastSeen = async () => {
      try {
        const gameRef = doc(db, 'games', gameCode);
        // เช็คว่าห้องยังมีอยู่หรือไม่
        const gameDoc = await getDoc(gameRef);
        if (!gameDoc.exists()) {
          // ถ้าห้องถูกลบไปแล้ว ให้กลับไปหน้าหลัก
          navigation.navigate('Home');
          return;
        }

        const updatedPlayers = game.players.map(p => {
          if (p.id === user.uid) {
            return { ...p, lastSeen: Date.now() };
          }
          return p;
        });
        await updateDoc(gameRef, { 
          players: updatedPlayers,
          lastActivity: Date.now()
        });
      } catch (error: any) {
        console.error('Error updating last seen:', error);
        // ถ้าเกิดข้อผิดพลาดในการอัพเดท ให้หยุดการทำงานของ interval
        if (error.message?.includes('No document to update')) {
          navigation.navigate('Home');
        }
      }
    };

    const interval = setInterval(updateLastSeen, 10000);
    updateLastSeen(); // อัพเดททันทีเมื่อเข้าห้อง

    return () => clearInterval(interval);
  }, [game, user, gameCode, navigation]);

  useEffect(() => {
    if (!game || !user || !currentPlayer?.isHost) return;

    const checkInactivePlayers = async () => {
      try {
        const now = Date.now();
        const inactivePlayers = game.players.filter(p => 
          !p.isHost && // ไม่เช็คหัวห้อง
          now - p.lastSeen > 30000 // เกิน 30 วินาที
        );

        if (inactivePlayers.length > 0) {
          const gameRef = doc(db, 'games', gameCode);
          const updatedPlayers = game.players.filter(p => 
            p.isHost || now - p.lastSeen <= 30000
          );
          
          await updateDoc(gameRef, { players: updatedPlayers });
          
          inactivePlayers.forEach(player => {
            showNotification(`${player.name} หลุดการเชื่อมต่อ`, 'leave');
          });
        }
      } catch (error) {
        console.error('Error checking inactive players:', error);
      }
    };

    const interval = setInterval(checkInactivePlayers, 10000);
    return () => clearInterval(interval);
  }, [game, user, gameCode, currentPlayer?.isHost]);

  useEffect(() => {
    if (!game || !user || !currentPlayer?.isHost) return;

    const checkInactiveRoom = async () => {
      try {
        const now = Date.now();
        if (now - game.lastActivity > 3600000) { // 1 ชั่วโมง
          const gameRef = doc(db, 'games', gameCode);
          await updateDoc(gameRef, { status: 'deleted' });
          await deleteDoc(gameRef);
          navigation.navigate('Home');
        }
      } catch (error) {
        console.error('Error checking inactive room:', error);
      }
    };

    const interval = setInterval(checkInactiveRoom, 60000); // เช็คทุก 1 นาที
    return () => clearInterval(interval);
  }, [game, user, gameCode, currentPlayer?.isHost]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Spyfall game! Game code: ${gameCode}`,
      });
    } catch (error) {
      console.error('Error sharing game code:', error);
      Alert.alert('Failed to share game code');
    }
  };

  const handleToggleReady = async () => {
    if (!game || !user) return;

    try {
      const gameRef = doc(db, 'games', gameCode);
      const currentPlayer = game.players.find(p => p.id === user.uid);
      if (!currentPlayer) return;

      const updatedPlayers = game.players.map(p => {
        if (p.id === user.uid) {
          return { ...p, isReady: !p.isReady };
        }
        return p;
      });

      await updateDoc(gameRef, { players: updatedPlayers });
    } catch (error) {
      console.error('Error toggling ready status:', error);
      Alert.alert('Failed to update ready status');
    }
  };

  const handleStartGame = async () => {
    if (!game) return;

    // เช็คว่าทุกคนพร้อมหรือยัง
    if (!game.players.every(p => p.isReady)) {
      Alert.alert('Not all players are ready');
      return;
    }

    try {
      setIsLoading(true);

      // สุ่มเลือกสายลับ
      const spyIndices: number[] = [];
      while (spyIndices.length < game.spyCount) {
        const index = Math.floor(Math.random() * game.players.length);
        if (!spyIndices.includes(index)) {
          spyIndices.push(index);
        }
      }

      // อัพเดทสถานะเกม
      const gameRef = doc(db, 'games', gameCode);
      await updateDoc(gameRef, {
        status: 'playing',
        startedAt: Date.now(),
        spies: spyIndices,
      });

    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Failed to start game');
      setIsLoading(false);
    }
  };

  const handleLeaveGame = async () => {
    try {
      if (!gameCode) return;

      const gameRef = doc(db, 'games', gameCode);
      const currentPlayer = game?.players.find(p => p.id === user?.uid);

      if (currentPlayer?.isHost) {
        // ถ้าเป็นหัวห้อง ให้อัพเดทสถานะเป็น deleted ก่อนลบห้อง
        await updateDoc(gameRef, { status: 'deleted' });
        await deleteDoc(gameRef);
      } else {
        // ถ้าเป็นผู้เล่นธรรมดา ให้ลบแค่ตัวเองออก
        const updatedPlayers = game?.players.filter(p => p.id !== user?.uid) || [];
        await updateDoc(gameRef, {
          players: updatedPlayers,
        });
      }
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error leaving game:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถออกจากเกมได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleKickPlayer = async (playerId: string) => {
    if (!game || !user) return;

    // เช็คว่าผู้เล่นปัจจุบันเป็นเจ้าของห้องหรือไม่
    const currentPlayer = game.players.find(p => p.id === user.uid);
    if (!currentPlayer?.isHost) {
      Alert.alert('ไม่สามารถเตะผู้เล่นได้', 'เฉพาะเจ้าของห้องเท่านั้นที่สามารถเตะผู้เล่นได้');
      return;
    }

    try {
      const gameRef = doc(db, 'games', gameCode);
      const gameDoc = await getDoc(gameRef);

      if (!gameDoc.exists()) {
        Alert.alert('ไม่พบห้อง');
        navigation.goBack();
        return;
      }

      const playerToKick = game.players.find(p => p.id === playerId);
      if (!playerToKick) {
        Alert.alert('ไม่พบผู้เล่นที่ต้องการเตะ');
        return;
      }

      // ไม่อนุญาตให้เตะเจ้าของห้อง
      if (playerToKick.isHost) {
        Alert.alert('ไม่สามารถเตะเจ้าของห้องได้');
        return;
      }

      const updatedPlayers = game.players.filter(p => p.id !== playerId);
      await updateDoc(gameRef, { players: updatedPlayers });
      
      showNotification(`${playerToKick.name} ถูกเตะออกจากห้อง`, 'kick');
    } catch (error) {
      console.error('Error kicking player:', error);
      Alert.alert('ไม่สามารถเตะผู้เล่นออกจากห้องได้', 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  if (!game) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity 
        onPress={handleLeaveGame}
        style={[styles.backButton, { top: insets.top + 16 }]}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {notifications.map(notification => (
        <Animated.View
          key={notification.id}
          style={[
            styles.notification,
            {
              backgroundColor: 
                notification.type === 'join' ? theme.colors.primary :
                notification.type === 'leave' ? theme.colors.border :
                notification.type === 'kick' ? theme.colors.error :
                theme.colors.primary,
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <Ionicons
            name={
              notification.type === 'join' ? 'person-add' :
              notification.type === 'leave' ? 'person-remove' :
              notification.type === 'kick' ? 'close-circle' :
              notification.type === 'ready' ? 'checkmark-circle' :
              'information-circle'
            }
            size={24}
            color="white"
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </Animated.View>
      ))}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 60 }]}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="game-controller" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>รหัสเกม</Text>
          </View>
          
          <View style={styles.gameCodeContainer}>
            <Text style={[styles.gameCode, { color: theme.colors.text }]}>{gameCode}</Text>
            <Button
              title="แชร์"
              onPress={handleShare}
              variant="ghost"
              leftIcon={<Ionicons name="share-outline" size={24} color={theme.colors.primary} />}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              ผู้เล่น ({game.players.length}/{game.maxPlayers})
            </Text>
          </View>

          {game.players.map((player, index) => (
            <View 
              key={player.id} 
              style={[
                styles.playerItem,
                index !== game.players.length - 1 && styles.playerItemBorder,
                { borderBottomColor: theme.colors.border }
              ]}
            >
              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, { color: theme.colors.text }]}>
                  {player.name}
                </Text>
                {player.isHost && (
                  <Text style={[styles.hostLabel, { color: theme.colors.primary }]}>
                    (เจ้าของห้อง)
                  </Text>
                )}
              </View>
              <View style={styles.playerActions}>
                {player.isReady && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
                {isHost && !player.isHost && (
                  <TouchableOpacity 
                    onPress={() => handleKickPlayer(player.id)}
                    style={styles.kickButton}
                  >
                    <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { 
        paddingBottom: insets.bottom || 16,
        backgroundColor: theme.colors.card,
      }]}>
        {isHost ? (
          <Button
            title="เริ่มเกม"
            onPress={handleStartGame}
            style={styles.startButton}
            loading={isLoading}
            leftIcon={<Ionicons name="play" size={24} color="white" />}
          />
        ) : (
          <Button
            title={currentPlayer?.isReady ? "ยกเลิกพร้อม" : "พร้อม"}
            onPress={handleToggleReady}
            style={styles.readyButton}
            variant={currentPlayer?.isReady ? "outline" : "primary"}
            leftIcon={
              <Ionicons 
                name={currentPlayer?.isReady ? "close-circle" : "checkmark-circle"} 
                size={24} 
                color={currentPlayer?.isReady ? theme.colors.primary : "white"} 
              />
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  gameCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gameCode: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  playerItemBorder: {
    borderBottomWidth: 1,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  hostLabel: {
    fontSize: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  startButton: {
    height: 56,
  },
  readyButton: {
    height: 56,
  },
  playerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kickButton: {
    padding: 4,
  },
  notification: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  notificationText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
}); 