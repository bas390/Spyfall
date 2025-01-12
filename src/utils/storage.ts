import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async set(key: string, value: any) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage Error:', error);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage Error:', error);
      return null;
    }
  },

  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Storage Error:', error);
    }
  }
}; 