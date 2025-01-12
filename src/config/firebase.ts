import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAh1fC-JLni7GuigitcAC_UHrPyJ_fRaB4",
  authDomain: "spyfall-717b7.firebaseapp.com",
  projectId: "spyfall-717b7",
  storageBucket: "spyfall-717b7.firebasestorage.app",
  messagingSenderId: "1043826733773",
  appId: "1:1043826733773:web:97d2acd008584f7315af84",
  measurementId: "G-6FM5H1GP5Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get services
const auth = getAuth(app);
const db = getFirestore(app);

// Monitor auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:', user.email);
  } else {
    console.log('No user is signed in.');
  }
});

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence');
    }
  });

// Test database connection
const testDbConnection = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const snapshot = await getDocs(usersCollection);
    console.log('Firebase Database connected successfully. Found', snapshot.size, 'users');
  } catch (error: any) {
    console.error('Firebase Database connection error:', error?.message || error);
    if (error?.code === 'permission-denied') {
      console.error('Permission denied. Please check Firestore Rules');
    }
  }
};

// Test connection
testDbConnection();

const analytics = getAnalytics(app);

export { auth, db, analytics }; 