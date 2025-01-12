import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HomeScreen = ({ navigation }: any) => {
  const theme = useTheme() as Theme;
  const { isDarkMode, toggleTheme } = useAppTheme();

  const handleLogout = async () => {
    Alert.alert(
      'ยืนยันการออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel'
        },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              await AsyncStorage.removeItem('user');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Spyfall
          </Text>
          <View style={styles.headerButtons}>
            <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
            <Button
              title="ออกจากระบบ"
              onPress={handleLogout}
              variant="secondary"
              leftIcon={<Ionicons name="log-out-outline" size={20} color="white" />}
            />
          </View>
        </View>

        <View style={styles.content}>
          <Button 
            title="สร้างเกมใหม่"
            onPress={() => navigation.navigate('CreateGame')}
            style={styles.button}
            leftIcon={<Ionicons name="add-circle-outline" size={24} color="white" />}
          />
          <Button 
            title="เข้าร่วมเกม"
            onPress={() => navigation.navigate('JoinGame')}
            style={styles.button}
            variant="secondary"
            leftIcon={<Ionicons name="enter-outline" size={24} color="white" />}
          />
          <Button 
            title="เล่นจอเดียว"
            onPress={() => navigation.navigate('LocalGameSetup')}
            style={styles.button}
            variant="secondary"
            leftIcon={<Ionicons name="phone-portrait-outline" size={24} color="white" />}
          />
          <Button 
            title="ประวัติการเล่น"
            onPress={() => navigation.navigate('History')}
            style={styles.button}
            variant="outline"
            leftIcon={<Ionicons name="time-outline" size={24} color={theme.colors.primary} />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  button: {
    marginVertical: 8,
  },
}); 