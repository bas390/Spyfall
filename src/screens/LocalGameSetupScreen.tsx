import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import { Button } from '../components/Button';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { locations } from '../data/locations';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'LocalGameSetup'>;

export default function LocalGameSetupScreen({ navigation, route }: Props) {
  const theme = useTheme() as Theme;
  const insets = useSafeAreaInsets();
  const { availableLocations } = route.params || {};

  const [players, setPlayers] = useState<string[]>(['ผู้เล่น 1', 'ผู้เล่น 2', 'ผู้เล่น 3']);
  const [spyCount, setSpyCount] = useState(1);
  const [gameTime, setGameTime] = useState(480); // 8 นาที

  const handleStartGame = () => {
    if (players.length < 3) {
      Alert.alert('ผู้เล่นไม่พอ', 'ต้องมีผู้เล่นอย่างน้อย 3 คน');
      return;
    }

    if (spyCount >= players.length) {
      Alert.alert('สายลับมากเกินไป', 'จำนวนสายลับต้องน้อยกว่าจำนวนผู้เล่น');
      return;
    }

    // สุ่มเลือกสายลับ
    const spies: number[] = [];
    while (spies.length < spyCount) {
      const spy = Math.floor(Math.random() * players.length);
      if (!spies.includes(spy)) {
        spies.push(spy);
      }
    }

    // สุ่มเลือกสถานที่
    const locationsToUse = availableLocations || locations;
    const randomLocation = locationsToUse[Math.floor(Math.random() * locationsToUse.length)];

    navigation.navigate('LocalGame', {
      players,
      spies,
      location: randomLocation,
      gameTime,
    });
  };

  const handleSelectLocations = () => {
    navigation.navigate('LocationSelection');
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
            <Ionicons name="people" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>ผู้เล่น ({players.length})</Text>
          </View>
          
          {players.map((player, index) => (
            <View key={index} style={styles.playerInput}>
              <TextInput
                style={[styles.input, { 
                  color: theme.colors.text,
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                }]}
                value={player}
                onChangeText={(text) => {
                  const newPlayers = [...players];
                  newPlayers[index] = text;
                  setPlayers(newPlayers);
                }}
                placeholder={`ผู้เล่น ${index + 1}`}
                placeholderTextColor={theme.colors.subText}
              />
              {players.length > 3 && (
                <TouchableOpacity
                  onPress={() => {
                    const newPlayers = players.filter((_, i) => i !== index);
                    setPlayers(newPlayers);
                  }}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <Button
            title="เพิ่มผู้เล่น"
            onPress={() => setPlayers([...players, `ผู้เล่น ${players.length + 1}`])}
            style={styles.addButton}
            variant="outline"
            leftIcon={<Ionicons name="add" size={24} color={theme.colors.primary} />}
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings" size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>ตั้งค่าเกม</Text>
          </View>

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
              onPress={() => setSpyCount(Math.min(Math.floor(players.length / 2), spyCount + 1))}
              style={styles.countButton}
              variant="outline"
            />
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>เวลาในการเล่น (นาที)</Text>
          <View style={styles.settingRow}>
            <Button
              title="-"
              onPress={() => setGameTime(Math.max(60, gameTime - 60))}
              style={styles.countButton}
              variant="outline"
            />
            <Text style={[styles.countText, { color: theme.colors.text }]}>{gameTime / 60}</Text>
            <Button
              title="+"
              onPress={() => setGameTime(Math.min(900, gameTime + 60))}
              style={styles.countButton}
              variant="outline"
            />
          </View>

          <Button
            title="เลือกสถานที่"
            onPress={handleSelectLocations}
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
          title="เริ่มเกม"
          onPress={handleStartGame}
          style={styles.startButton}
          leftIcon={<Ionicons name="play" size={24} color="white" />}
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
  playerInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
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
  locationButton: {
    width: '100%',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  startButton: {
    height: 56,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
}); 