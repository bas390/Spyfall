import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { Button } from '../components/Button';
import { db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { locations } from '../data/locations';
import { useAuth } from '../hooks/useAuth';

type Props = {
  navigation: any;
  route: any;
};

export default function CreateGameScreen({ navigation }: Props) {
  const theme = useTheme() as Theme;
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user]);

  const [maxPlayers, setMaxPlayers] = useState(8);
  const [spyCount, setSpyCount] = useState(1);
  const [gameTime, setGameTime] = useState(8);
  const [isCreating, setIsCreating] = useState(false);
  const [playerName, setPlayerName] = useState(user?.displayName || 'Player');

  const handleCreateGame = async () => {
    if (!user) {
      Alert.alert('ไม่สามารถสร้างเกมได้', 'กรุณาเข้าสู่ระบบก่อนสร้างเกม');
      navigation.replace('Login');
      return;
    }

    if (!playerName.trim()) {
      Alert.alert('กรุณาใส่ชื่อ', 'คุณต้องใส่ชื่อก่อนสร้างเกม');
      return;
    }

    try {
      setIsCreating(true);
      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const gameRef = doc(db, 'games', gameCode);
      await setDoc(gameRef, {
        maxPlayers,
        spyCount,
        gameTime,
        players: [{
          id: user.uid,
          name: playerName.trim(),
          isReady: false,
          isHost: true,
        }],
        status: 'waiting',
        createdAt: Date.now(),
      });

      navigation.navigate('WaitingRoom', { gameCode });
    } catch (error) {
      console.error('Error creating game:', error);
      Alert.alert('ไม่สามารถสร้างเกมได้', 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={[styles.backButton, { top: insets.top + 16 }]}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 60 }]}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>ชื่อผู้เล่น</Text>
          </View>

          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="ใส่ชื่อของคุณ"
            placeholderTextColor={theme.colors.subText}
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            }]}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>จำนวนผู้เล่น</Text>
          </View>

          <View style={styles.settingContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>จำนวนผู้เล่นสูงสุด</Text>
            <View style={styles.settingRow}>
              <Button
                title="-"
                onPress={() => setMaxPlayers(Math.max(3, maxPlayers - 1))}
                style={styles.countButton}
                variant="outline"
              />
              <Text style={[styles.countText, { color: theme.colors.text }]}>{maxPlayers}</Text>
              <Button
                title="+"
                onPress={() => setMaxPlayers(Math.min(12, maxPlayers + 1))}
                style={styles.countButton}
                variant="outline"
              />
            </View>
          </View>

          <View style={styles.settingContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>จำนวนสายลับ</Text>
            <View style={styles.settingRow}>
              <Button
                title="-"
                onPress={() => setSpyCount(Math.max(1, spyCount - 1))}
                style={styles.countButton}
                variant="outline"
              />
              <Text style={[styles.countText, { color: theme.colors.text }]}>{spyCount}</Text>
              <Button
                title="+"
                onPress={() => setSpyCount(Math.min(Math.floor(maxPlayers / 2), spyCount + 1))}
                style={styles.countButton}
                variant="outline"
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="time" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>เวลา</Text>
          </View>

          <View style={styles.settingContainer}>
            <Text style={[styles.label, { color: theme.colors.text }]}>เวลาในการเล่น (นาที)</Text>
            <View style={styles.settingRow}>
              <Button
                title="-"
                onPress={() => setGameTime(Math.max(1, gameTime - 1))}
                style={styles.countButton}
                variant="outline"
              />
              <Text style={[styles.countText, { color: theme.colors.text }]}>{gameTime}</Text>
              <Button
                title="+"
                onPress={() => setGameTime(Math.min(15, gameTime + 1))}
                style={styles.countButton}
                variant="outline"
              />
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="map" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>สถานที่</Text>
          </View>

          <Button
            title="เลือกสถานที่"
            onPress={() => navigation.navigate('LocationSelection')}
            style={styles.locationButton}
            variant="outline"
            leftIcon={<Ionicons name="map" size={24} color={theme.colors.primary} />}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { 
        paddingBottom: insets.bottom || 16,
        backgroundColor: theme.colors.card,
      }]}>
        <Button
          title="สร้างเกม"
          onPress={handleCreateGame}
          loading={isCreating}
          style={styles.createButton}
          leftIcon={<Ionicons name="add-circle" size={24} color="white" />}
        />
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  countButton: {
    width: 48,
    height: 48,
  },
  countText: {
    fontSize: 24,
    fontWeight: '600',
    minWidth: 32,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  createButton: {
    height: 56,
  },
  locationButton: {
    marginTop: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
}); 