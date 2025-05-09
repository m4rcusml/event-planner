import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CaretLeft, Warning, MapPin, Clock } from 'phosphor-react-native';
import { RootStackParamList } from '@/routes/stack.routes';
import { Timestamp } from 'firebase/firestore';
import { auth } from '@/firebase/firebaseConfig';
import { addEvent } from '@/firebase/firestoreUtils';
import { Event } from '@/@types/events';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AddEvent: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Estados para campos do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 2;

  // Função para validar os dados do formulário
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Erro', 'O título do evento é obrigatório');
      return false;
    }
    if (!date.trim()) {
      Alert.alert('Erro', 'A data do evento é obrigatória');
      return false;
    }
    if (!time.trim()) {
      Alert.alert('Erro', 'O horário do evento é obrigatório');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Erro', 'O local do evento é obrigatório');
      return false;
    }

    // Validação do formato da data (DD/MM/AA)
    const dateRegex = /^\d{2}\/\d{2}\/\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert('Erro', 'Formato de data inválido. Use DD/MM/AA');
      return false;
    }

    // Validação do formato da hora (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      Alert.alert('Erro', 'Formato de hora inválido. Use HH:MM');
      return false;
    }

    return true;
  };

  // Função para converter data e hora em Timestamp
  const createTimestamp = (dateStr: string, timeStr: string) => {
    // Convertendo data no formato DD/MM/AA para Date
    const [day, month, year] = dateStr.split('/').map(Number);
    const fullYear = 2000 + year; // Assumindo que estamos no século 21

    // Convertendo hora no formato HH:MM para horas e minutos
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Criando objeto Date
    const dateObject = new Date(fullYear, month - 1, day, hours, minutes, 0);

    // Retornando Timestamp do Firestore
    return Timestamp.fromDate(dateObject);
  };

  // Função para enviar o formulário para o Firestore
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Verifica se o usuário está autenticado
      const currentUser = auth.currentUser;
      const userId = currentUser ? currentUser.uid : 'anonymous';

      // Criando o objeto de evento conforme a tipagem
      const eventData: Event = {
        title,
        description,
        date: createTimestamp(date, time),
        local: location,
        guests: guests.split(',').map(email => email.trim()).filter(email => email !== '').map((email, i) => ({ id: (email + i), email, confirmed: true })),
        createdAt: Timestamp.now(),
        userId
      };

      // Usando a função utilitária para salvar o evento
      const eventId = await addEvent(eventData);

      // Feedback e navegação
      Alert.alert(
        'Sucesso',
        'Evento salvo com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('eventSuccess')
          }
        ]
      );
    } catch (error: any) {
      console.error('Erro ao salvar evento:', error);

      // Mensagem de erro mais detalhada
      let errorMessage = 'Não foi possível salvar o evento.';
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'Permissão negada. Verifique se você tem acesso ao Firestore.';
            break;
          case 'unavailable':
            errorMessage = 'Serviço indisponível. Verifique sua conexão com a internet.';
            break;
          default:
            errorMessage = `Erro: ${error.message || error.code}`;
        }
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground source={require('@/assets/bg.png')} style={{ flex: 1 }}>
      <View style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>CRIANDO EVENTO</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Título do evento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome do evento"
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Descreva sobre o evento"
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    value={description}
                    onChangeText={setDescription}
                  />
                  <Warning size={20} color="#FF7F50" weight="duotone" style={styles.inputIcon} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Data</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AA"
                    placeholderTextColor="#999"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>

                <View style={[styles.formGroup, styles.halfWidth]}>
                  <Text style={styles.label}>Horário</Text>
                  <View style={styles.inputWithIcon}>
                    <TextInput
                      style={styles.input}
                      placeholder="__:__"
                      placeholderTextColor="#999"
                      value={time}
                      onChangeText={setTime}
                    />
                    <Clock size={20} color="#FF7F50" weight="duotone" style={styles.inputIcon} />
                  </View>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Local</Text>
                <View style={styles.inputWithIcon}>
                  <TextInput
                    style={styles.input}
                    placeholder="Informe o local"
                    placeholderTextColor="#999"
                    value={location}
                    onChangeText={setLocation}
                  />
                  <MapPin size={20} color="#FF7F50" weight="duotone" style={styles.inputIcon} />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  isSubmitting && styles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmButtonText}>
                  {isSubmitting ? 'Salvando...' : 'Confirmar'}
                </Text>
              </TouchableOpacity>

              <View style={styles.stepIndicator}>
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.stepDot,
                      index + 1 === currentStep ? styles.activeDot : {}
                    ]}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 4,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    color: '#FF7F50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FF7F50',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  confirmButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 25,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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