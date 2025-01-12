import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@db_cache_';
const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes

type CacheItem = {
  data: any;
  timestamp: number;
};

// ฟังก์ชันสำหรับจัดการ Cache
const getCache = async (key: string): Promise<CacheItem | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (cached) {
      const item: CacheItem = JSON.parse(cached);
      const now = Date.now();
      if (now - item.timestamp < CACHE_EXPIRY) {
        return item;
      }
      // Cache expired
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    }
  } catch (error) {
    console.warn('Cache read error:', error);
  }
  return null;
};

const setCache = async (key: string, data: any): Promise<void> => {
  try {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
};

export type GameHistory = {
  players: string[];
  location: string;
  spies: number[];
  winner: 'spy' | 'players';
  duration: number;
  timestamp: number;
};

// ฟังก์ชันสำหรับจัดการ Game Data
export const GameDB = {
  // บันทึกประวัติเกม
  async saveGameHistory(gameData: {
    players: string[];
    location: string;
    spies: number[];
    winner: 'spy' | 'players';
    duration: number;
    timestamp: number;
  }) {
    try {
      const gameRef = doc(collection(db, 'game_history'));
      await setDoc(gameRef, {
        ...gameData,
        createdAt: new Date(),
      });
      return gameRef.id;
    } catch (error) {
      console.error('Error saving game history:', error);
      throw new Error('ไม่สามารถบันทึกประวัติเกมได้');
    }
  },

  // ดึงประวัติเกม
  async getGameHistory(userId: string, limitCount = 10) {
    const cacheKey = `game_history_${userId}_${limitCount}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached.data;

    try {
      const q = query(
        collection(db, 'game_history'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      await setCache(cacheKey, history);
      return history;
    } catch (error) {
      console.error('Error fetching game history:', error);
      throw new Error('ไม่สามารถดึงประวัติเกมได้');
    }
  },

  // บันทึกสถิติผู้เล่น
  async updatePlayerStats(userId: string, gameResult: {
    isWin: boolean;
    role: 'spy' | 'player';
  }) {
    try {
      const statsRef = doc(db, 'player_stats', userId);
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        const currentStats = statsDoc.data();
        await updateDoc(statsRef, {
          totalGames: (currentStats.totalGames || 0) + 1,
          wins: (currentStats.wins || 0) + (gameResult.isWin ? 1 : 0),
          spyGames: (currentStats.spyGames || 0) + (gameResult.role === 'spy' ? 1 : 0),
          spyWins: (currentStats.spyWins || 0) + (gameResult.role === 'spy' && gameResult.isWin ? 1 : 0),
          lastUpdated: new Date()
        });
      } else {
        await setDoc(statsRef, {
          totalGames: 1,
          wins: gameResult.isWin ? 1 : 0,
          spyGames: gameResult.role === 'spy' ? 1 : 0,
          spyWins: gameResult.role === 'spy' && gameResult.isWin ? 1 : 0,
          createdAt: new Date(),
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
      throw new Error('ไม่สามารถอัพเดทสถิติผู้เล่นได้');
    }
  },

  // ดึงสถิติผู้เล่น
  async getPlayerStats(userId: string) {
    const cacheKey = `player_stats_${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached.data;

    try {
      const statsRef = doc(db, 'player_stats', userId);
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        const stats = statsDoc.data();
        await setCache(cacheKey, stats);
        return stats;
      }
      return null;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw new Error('ไม่สามารถดึงสถิติผู้เล่นได้');
    }
  },

  // ดึงอันดับผู้เล่น
  async getLeaderboard(limitCount = 10) {
    const cacheKey = `leaderboard_${limitCount}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached.data;

    try {
      const q = query(
        collection(db, 'player_stats'),
        orderBy('wins', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      const leaderboard = snapshot.docs.map(doc => ({
        userId: doc.id,
        ...doc.data()
      }));

      await setCache(cacheKey, leaderboard);
      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw new Error('ไม่สามารถดึงข้อมูลอันดับผู้เล่นได้');
    }
  },

  async clearDatabase() {
    try {
      // ล้างข้อมูลเกม
      const gamesRef = collection(db, 'games');
      const gamesSnapshot = await getDocs(gamesRef);
      const gamePromises = gamesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // ล้างข้อมูลผู้ใช้
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const userPromises = usersSnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // ล้างประวัติเกม
      const historyRef = collection(db, 'game_history');
      const historySnapshot = await getDocs(historyRef);
      const historyPromises = historySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      // ล้างสถิติผู้เล่น
      const statsRef = collection(db, 'player_stats');
      const statsSnapshot = await getDocs(statsRef);
      const statsPromises = statsSnapshot.docs.map(doc => deleteDoc(doc.ref));

      // ล้างข้อมูลทั้งหมดพร้อมกัน
      await Promise.all([
        ...gamePromises,
        ...userPromises,
        ...historyPromises,
        ...statsPromises
      ]);
      
      console.log('ล้างข้อมูลทั้งหมดเรียบร้อย');
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการล้างข้อมูล:', error);
      throw error;
    }
  },

  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('All users:', users);
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },
}; 