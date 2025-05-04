import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check } from 'phosphor-react-native';
import { RootStackParamList } from '@/routes/stack.routes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const EventSuccess: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleContinue = () => {
    // Aqui poderia navegar para a lista de eventos ou detalhes do evento criado
    // Por exemplo, se tivéssemos o ID do evento recém-criado:
    // navigation.navigate('EventDetails', { eventId: createdEventId });

    // Por enquanto, vamos apenas voltar para a Home
    navigation.goBack();
    navigation.goBack();
  };

  return (
    <ImageBackground source={require('@/assets/bg.png')} style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.successIconContainer}>
            <Check size={64} color="#FFFFFF" weight="bold" />
          </View>

          <Text style={styles.successTitle}>EVENTO CRIADO COM SUCESSO!</Text>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Prosseguir</Text>
          </TouchableOpacity>

          <View style={styles.stepIndicator}>
            <View style={styles.stepDot} />
            <View style={[styles.stepDot, styles.activeDot]} />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FF7F50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    color: '#9B4122',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  continueButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF7F50',
  },
});
