import NetInfo from '@react-native-community/netinfo';
import { handleFirestoreConnection } from '@/firebase/firestoreUtils';

let isNetworkConnected = true;

// Inicializa o monitor de conexão de rede
export const setupNetworkMonitoring = () => {
  // Verifica o estado inicial
  NetInfo.fetch().then(state => {
    isNetworkConnected = state.isConnected ?? true;
    updateFirestoreNetworkState(isNetworkConnected);
    console.log('Network is', isNetworkConnected ? 'connected' : 'disconnected');
  });

  // Configura o listener para mudanças de estado da rede
  const unsubscribe = NetInfo.addEventListener(state => {
    const previousState = isNetworkConnected;
    isNetworkConnected = state.isConnected ?? true;
    
    // Se o estado da rede mudou
    if (previousState !== isNetworkConnected) {
      console.log('Network state changed to', isNetworkConnected ? 'connected' : 'disconnected');
      updateFirestoreNetworkState(isNetworkConnected);
    }
  });

  return unsubscribe;
};

// Atualiza o estado da rede do Firestore conforme a conectividade
const updateFirestoreNetworkState = async (isConnected: boolean) => {
  try {
    await handleFirestoreConnection();
  } catch (error) {
    console.error('Error updating Firestore network state:', error);
  }
};

// Função para verificar se a rede está conectada
export const isConnected = (): boolean => {
  return isNetworkConnected;
};

// Função para verificar a conectividade antes de executar uma operação
export const withNetworkCheck = async <T>(
  operation: () => Promise<T>,
  onNoConnectivity?: () => void
): Promise<T | null> => {
  if (isNetworkConnected) {
    try {
      return await operation();
    } catch (error) {
      console.error('Operation failed despite network connectivity:', error);
      throw error;
    }
  } else {
    console.warn('Operation canceled due to no network connectivity');
    onNoConnectivity?.();
    return null;
  }
};