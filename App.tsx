// App.tsx - Fixed for Permissions Issues
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Routes } from '@/routes';
import { auth } from '@/firebase/firebaseConfig';
import { setupNetworkMonitoring } from '@/utils/networkCheck';
import { onAuthStateChanged } from 'firebase/auth';
import { LogBox } from 'react-native';
import { AuthProvider } from '@/contexts/auth';

// Ignora avisos específicos do Firebase
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  'Non-serializable values were found in the navigation state',
  '@firebase/firestore:',
]);

export default function App() {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const initFirebase = async () => {
      try {
        console.log("Initializing Firebase...");

        // 1. Set up network monitoring first
        const unsubscribeNetInfo = setupNetworkMonitoring();

        // Even with errors, we'll let the app start
        setIsFirebaseReady(true);

        return () => {
          unsubscribeNetInfo();
          unsubscribeAuth();
        };
      } catch (error) {
        const errorAny = error as any;
        console.error("Firebase initialization error:", error);
        setInitError(errorAny.message || "Erro ao inicializar o Firebase");

        // Still set ready to true so the app can start
        setIsFirebaseReady(true);
      }
    };

    initFirebase();
  }, []);

  // Show error alert if there was an initialization error
  useEffect(() => {
    if (initError) {
      Alert.alert(
        "Aviso",
        initError,
        [{ text: "OK" }]
      );
    }
  }, [initError, isFirebaseReady]);

  // Show loading indicator until Firebase is initialized
  if (!isFirebaseReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7F50" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Routes />
        <StatusBar style="auto" backgroundColor='#FF7F50' />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  }
});