import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit as limitQuery,
  Timestamp,
  serverTimestamp,
  increment,
  connectFirestoreEmulator,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { handleFirebaseError } from './errors';
import NetInfo from '@react-native-community/netinfo';

// Types
interface UserData {
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  gamesPlayed: number;
  gamesWon: number;
  lastOnline?: Timestamp;
}

interface GameData {
  players: string[];
  location: string;
  spy: string;
  startedAt: Timestamp;
  endedAt?: Timestamp;
  winner?: 'spy' | 'citizens';
  status: 'waiting' | 'playing' | 'finished';
  version: number;
}

// Network state management
let isOffline = false;

NetInfo.addEventListener(state => {
  if (state.isConnected && isOffline) {
    enableNetwork(db).catch(console.error);
    isOffline = false;
  } else if (!state.isConnected && !isOffline) {
    disableNetwork(db).catch(console.error);
    isOffline = true;
  }
});

// User Operations
export const createUserProfile = async (userId: string, email: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userData: UserData = {
      email,
      createdAt: Timestamp.now(),
      gamesPlayed: 0,
      gamesWon: 0,
      lastOnline: Timestamp.now(),
    };
    
    await setDoc(userRef, userData);
    return;
  } catch (error) {
    handleFirebaseError(error);
    return;
  }
};

export const getUserProfile = async (userId: string): Promise<UserData | null | undefined> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    handleFirebaseError(error);
    return undefined;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserData>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      lastOnline: Timestamp.now(),
    });
    return;
  } catch (error) {
    handleFirebaseError(error);
    return;
  }
};

// Game Operations
export const createGame = async (gameId: string, data: Omit<GameData, 'startedAt' | 'status' | 'version'>): Promise<void> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameData: GameData = {
      ...data,
      startedAt: Timestamp.now(),
      status: 'waiting',
      version: 1,
    };
    
    await setDoc(gameRef, gameData);
    return;
  } catch (error) {
    handleFirebaseError(error);
    return;
  }
};

export const updateGame = async (gameId: string, data: Partial<GameData>): Promise<void> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('เกมไม่มีอยู่ในระบบ');
    }
    
    await updateDoc(gameRef, {
      ...data,
      version: increment(1),
    });
    return;
  } catch (error) {
    handleFirebaseError(error);
    return;
  }
};

export const getGame = async (gameId: string): Promise<GameData | null | undefined> => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (gameSnap.exists()) {
      return gameSnap.data() as GameData;
    }
    return null;
  } catch (error) {
    handleFirebaseError(error);
    return undefined;
  }
};

export const getUserGames = async (userId: string, limit = 10): Promise<(GameData & { id: string })[]> => {
  try {
    const gamesRef = collection(db, 'games');
    const q = query(
      gamesRef,
      where('players', 'array-contains', userId),
      orderBy('startedAt', 'desc'),
      limitQuery(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (GameData & { id: string })[];
  } catch (error) {
    handleFirebaseError(error);
    return [];
  }
};

// Stats Operations
export const updateUserStats = async (userId: string, wonGame: boolean): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      gamesPlayed: increment(1),
      gamesWon: wonGame ? increment(1) : increment(0),
      lastOnline: Timestamp.now(),
    });
    return;
  } catch (error) {
    handleFirebaseError(error);
    return;
  }
};

export const getLeaderboard = async (limit = 10): Promise<(UserData & { id: string })[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('gamesWon', 'desc'),
      limitQuery(limit)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (UserData & { id: string })[];
  } catch (error) {
    handleFirebaseError(error);
    return [];
  }
}; 