import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { signOut, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../firebase/firebaseConfig';
import { db } from '@/firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextData {
  user: User | null;
  userData: any;
  loading: boolean;
  signOut: () => Promise<void>;
  handleAddUserToLocalStorage: (user: User, userDoc?: any) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        // Check if there's a user in AsyncStorage
        const storedUser = await AsyncStorage.getItem('@EventPlanner:user');
        const storedUserData = await AsyncStorage.getItem('@EventPlanner:userData');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
          }
        }
      } catch (error) {
        console.error('Error loading stored user:', error);
      }
    };

    loadStoredUser();

    // Listen to auth state changes
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        setUser(user);
        await AsyncStorage.setItem('@EventPlanner:user', JSON.stringify(user));
        
        // Get user data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          await AsyncStorage.setItem('@EventPlanner:userData', JSON.stringify(userDoc.data()));
        }
      } else {
        setUser(null);
        setUserData(null);
        await AsyncStorage.removeItem('@EventPlanner:user');
        await AsyncStorage.removeItem('@EventPlanner:userData');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('@EventPlanner:user');
      await AsyncStorage.removeItem('@EventPlanner:userData');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const handleAddUserToLocalStorage = async (user: User, userDoc?: any) => {
    try {
      await AsyncStorage.setItem('@EventPlanner:user', JSON.stringify(user));
      await AsyncStorage.setItem('@EventPlanner:userData', JSON.stringify(userDoc));
      setUser(user);
      setUserData(userDoc);
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        handleAddUserToLocalStorage,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}