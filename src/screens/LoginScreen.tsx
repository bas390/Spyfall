import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Theme } from '../theme';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme as useAppTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const theme = useTheme() as Theme;
  const { isDarkMode, toggleTheme } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace('Home');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-email') {
        Alert.alert('ไม่สามารถเข้าสู่ระบบได้', 'อีเมลไม่ถูกต้อง');
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert('ไม่สามารถเข้าสู่ระบบได้', 'รหัสผ่านไม่ถูกต้อง');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('ไม่สามารถเข้าสู่ระบบได้', 'ไม่พบบัญชีผู้ใช้นี้');
      } else {
        Alert.alert('ไม่สามารถเข้าสู่ระบบได้', 'กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Spyfall
          </Text>
          <ThemeToggle isDark={isDarkMode} onToggle={toggleTheme} />
        </View>

        <View style={styles.content}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>อีเมล</Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={theme.colors.text} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="กรอกอีเมล"
                  placeholderTextColor={theme.colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>รหัสผ่าน</Text>
              <View style={[
                styles.inputWrapper,
                { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border
                }
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={theme.colors.text} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  placeholder="กรอกรหัสผ่าน"
                  placeholderTextColor={theme.colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="เข้าสู่ระบบ"
              onPress={handleLogin}
              loading={loading}
              disabled={!email || !password || loading}
              style={styles.loginButton}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.subText }]}>หรือ</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <Button
              title="สมัครสมาชิก"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  passwordToggle: {
    padding: 12,
  },
  loginButton: {
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
}); 