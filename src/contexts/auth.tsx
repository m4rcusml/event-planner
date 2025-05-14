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

  // Busca dados do usuário no Firestore e armazena localmente
  const fetchAndStoreUserData = async (firebaseUser: User) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      let data;
      if (userDocSnap.exists()) {
        data = userDocSnap.data();
      } else {
        data = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, data);
      }

      setUserData(data);
      await AsyncStorage.setItem('@EventPlanner:userData', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
      return null;
    }
  };

  // Carrega usuário e dados do storage local
  useEffect(() => {
    const loadStoredAuth = async () => {
      setLoading(true);
      try {
        const storedUser = await AsyncStorage.getItem('@EventPlanner:user');
        const storedUserData = await AsyncStorage.getItem('@EventPlanner:userData');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
          } else if (parsedUser.uid) {
            await fetchAndStoreUserData(parsedUser);
          }
        }
      } catch (error) {
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        await AsyncStorage.setItem('@EventPlanner:user', JSON.stringify(firebaseUser));
        await fetchAndStoreUserData(firebaseUser);
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

  // Faz logout e limpa tudo
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      await AsyncStorage.removeItem('@EventPlanner:user');
      await AsyncStorage.removeItem('@EventPlanner:userData');
    } catch (error) {
      throw error;
    }
  };

  // Adiciona usuário e dados ao storage e estado
  const handleAddUserToLocalStorage = async (firebaseUser: User, userDoc?: any) => {
    try {
      setUser(firebaseUser);
      await AsyncStorage.setItem('@EventPlanner:user', JSON.stringify(firebaseUser));

      if (userDoc) {
        setUserData(userDoc);
        await AsyncStorage.setItem('@EventPlanner:userData', JSON.stringify(userDoc));
      } else {
        await fetchAndStoreUserData(firebaseUser);
      }
    } catch (error) {
      console.error('Error storing user:', error);
    }
  };

  // Sempre repassa user e userData atualizados
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