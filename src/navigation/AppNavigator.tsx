import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import GameScreen from '../screens/GameScreen';
import LocalGameSetupScreen from '../screens/LocalGameSetupScreen';
import { RootStackParamList } from '../types/navigation';
import { Theme } from '../theme';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import LocationSelectionScreen from '../screens/LocationSelectionScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useTheme() as Theme;
  const { isDarkMode } = useAppTheme();
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // ตรวจสอบว่ามีข้อมูลการเข้าสู่ระบบที่บันทึกไว้หรือไม่
        const savedUser = await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading saved user:', error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // บันทึกข้อมูลผู้ใช้เมื่อเข้าสู่ระบบ
        try {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error saving user:', error);
        }
      } else {
        // ลบข้อมูลผู้ใช้เมื่อออกจากระบบ
        try {
          await AsyncStorage.removeItem('user');
        } catch (error) {
          console.error('Error removing user:', error);
        }
      }
    });

    initializeAuth();
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      {!user ? (
        // Auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // App screens
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="LocalGameSetup" component={LocalGameSetupScreen} />
          <Stack.Screen name="LocalGame" component={GameScreen} />
          <Stack.Screen
            name="LocationSelection"
            component={LocationSelectionScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
} 