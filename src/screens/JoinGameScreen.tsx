import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { Button } from '../components/Button';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

type Props = {
  navigation: any;
  route: any;
};

export default function JoinGameScreen({ navigation }: Props) {
  const theme = useTheme() as Theme;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinGame = async () => {
    if (!gameCode.trim()) {
      Alert.alert('กรุณาใส่รหัสเกม');
      return;
    }

    if (!playerName.trim()) {
      Alert.alert('กรุณาใส่ชื่อผู้เล่น');
      return;
    }

    setIsJoining(true);

    try {
      const gameRef = doc(db, 'games', gameCode.toUpperCase());
      const gameDoc = await getDoc(gameRef);

      if (!gameDoc.exists()) {
        Alert.alert('ไม่พบเกม', 'กรุณาตรวจสอบรหัสเกมอีกครั้ง');
        setIsJoining(false);
        return;
      }

      const gameData = gameDoc.data();

      if (gameData.status !== 'waiting') {
        Alert.alert('ไม่สามารถเข้าร่วมได้', 'เกมได้เริ่มไปแล้วหรือจบไปแล้ว');
        setIsJoining(false);
        return;
      }

      if (gameData.players.length >= gameData.maxPlayers) {
        Alert.alert('ห้องเต็ม', 'ไม่สามารถเข้าร่วมได้เนื่องจากห้องเต็ม');
        setIsJoining(false);
        return;
      }

      // เพิ่มผู้เล่นใหม่
      const newPlayer = {
        id: user?.uid,
        name: playerName,
        isReady: false,
        isHost: false,
      };

      await updateDoc(gameRef, {
        players: [...gameData.players, newPlayer],
      });

      // นำทางไปยังห้องรอ
      navigation.replace('WaitingRoom', { gameCode: gameCode.toUpperCase() });
    } catch (error) {
      console.error('Error joining game:', error);
      Alert.alert('ไม่สามารถเข้าร่วมเกมได้');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>เข้าร่วมเกม</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="game-controller" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>ข้อมูลการเข้าร่วม</Text>
          </View>
          
          <Text style={[styles.label, { color: theme.colors.text }]}>รหัสเกม</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            }]}
            value={gameCode}
            onChangeText={(text) => setGameCode(text.toUpperCase())}
            placeholder="ใส่รหัสเกม 6 หลัก"
            placeholderTextColor={theme.colors.subText}
            autoCapitalize="characters"
            maxLength={6}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>ชื่อผู้เล่น</Text>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            }]}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="ใส่ชื่อผู้เล่น"
            placeholderTextColor={theme.colors.subText}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { 
        paddingBottom: insets.bottom || 16,
        backgroundColor: theme.colors.card,
      }]}>
        <Button
          title="เข้าร่วม"
          onPress={handleJoinGame}
          style={styles.joinButton}
          loading={isJoining}
          leftIcon={<Ionicons name="enter" size={24} color="white" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 44,
    paddingHorizontal: 16,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  joinButton: {
    height: 56,
  },
}); 