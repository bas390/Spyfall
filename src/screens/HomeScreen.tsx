import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../theme';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { GameDB } from '../utils/db';

type Props = {
  navigation: any;
};

export const HomeScreen = ({ navigation }: Props) => {
  const theme = useTheme() as Theme;
  const { signOut, loading } = useAuth();
  const { user } = useAuth();

  console.log('Current user email:', user?.email);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Button
        title=""
        onPress={async () => {
          try {
            await signOut();
            navigation.replace('Login');
          } catch (error) {
            console.error('Error signing out:', error);
          }
        }}
        variant="ghost"
        style={styles.logoutButton}
        leftIcon={<Ionicons name="log-out-outline" size={24} color={theme.colors.error} />}
        disabled={loading}
      />
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Spyfall
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.subText }]}>
            เกมสายลับในสถานที่ลับ
          </Text>
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
          <Button 
            title="วิธีการเล่น"
            onPress={() => navigation.navigate('Tutorial')}
            style={styles.button}
            variant="outline"
            leftIcon={<Ionicons name="help-circle-outline" size={24} color={theme.colors.primary} />}
          />

          {user?.email === 'rockmanm53@gmail.com' && (
            <>
              <Button
                title="ล้างข้อมูลเกม"
                onPress={async () => {
                  try {
                    await GameDB.clearDatabase();
                    Alert.alert('สำเร็จ', 'ล้างข้อมูลเกมทั้งหมดเรียบร้อยแล้ว');
                  } catch (error) {
                    Alert.alert('ผิดพลาด', 'ไม่สามารถล้างข้อมูลได้');
                  }
                }}
                style={[styles.button, { backgroundColor: theme.colors.error }]}
                leftIcon={<Ionicons name="trash" size={24} color="white" />}
              />
              <Button
                title="ดูข้อมูลผู้ใช้"
                onPress={async () => {
                  try {
                    const users = await GameDB.getAllUsers();
                    console.log('Users:', users);
                    Alert.alert('ข้อมูลผู้ใช้', `พบผู้ใช้ ${users.length} คน\nดูรายละเอียดใน console log`);
                  } catch (error) {
                    Alert.alert('ผิดพลาด', 'ไม่สามารถดึงข้อมูลผู้ใช้ได้');
                  }
                }}
                style={[styles.button, { backgroundColor: theme.colors.primary }]}
                leftIcon={<Ionicons name="people" size={24} color="white" />}
              />
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    height: 56,
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    top: 48,
    zIndex: 1,
  },
}); 