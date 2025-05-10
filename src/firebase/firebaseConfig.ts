// src/firebase/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  memoryLocalCache,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase configuração
const firebaseConfig = {
  apiKey: "AIzaSyB01TGN61cH45ywxl46xLxuQgFXS8du148",
  authDomain: "event-planner-40091.firebaseapp.com",
  projectId: "event-planner-40091",
  storageBucket: "event-planner-40091.firebasestorage.app",
  messagingSenderId: "956379056954",
  appId: "1:956379056954:android:02fa749b50d334d62c1e03",
};

console.log('Initializing Firebase...');

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Configure o Firestore com o tipo de cache apropriado para a plataforma
let firestoreDb;

try {
  // Verifica se estamos em um ambiente que suporta persistência
  const canUsePersistence = Platform.OS === 'ios' || Platform.OS === 'android';
  
  if (canUsePersistence) {
    // Use persistência para plataformas móveis nativas
    firestoreDb = initializeFirestore(app, {
      localCache: persistentLocalCache({
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      }),
    });
    console.log(`Firestore configured with persistent cache for ${Platform.OS}`);
  } else {
    // Use cache em memória para outras plataformas (web, testes, etc.)
    firestoreDb = initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
    console.log('Firestore configured with memory cache');
  }
} catch (error) {
  console.warn('Failed to configure Firestore cache, falling back to default:', error);
  // Fallback para a configuração padrão
  firestoreDb = getFirestore(app);
}

// Verifique se a persistência está habilitada
const getPersistenceEnabled = async () => {
  try {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  } catch (e) {
    return false;
  }
};

// Ao inicializar, verifique e log se a persistência está habilitada
getPersistenceEnabled().then(enabled => {
  console.log('Persistence enabled:', enabled);
});

// Authentication
const auth = getAuth(app);

// Storage
const storage = getStorage(app);

// Exporte as instâncias necessárias
export const db = firestoreDb;
export { auth, storage };
export default app;