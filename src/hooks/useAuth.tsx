import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import * as Device from 'expo-device';

type AuthContextType = {
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // เก็บข้อมูลผู้ใช้ทั้งหมดใน AsyncStorage
        const userData = {
          uid: user.uid,
          email: user.email,
          deviceId: Device.modelId,
          inGame: false,
          lastGameId: null,
          lastSeen: Date.now()
        };
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem('user');
      }
      
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('ผิดพลาด', 'ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 