import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageBackground
} from 'react-native';
import { EnvelopeSimple, Plus, User, Trash, Calendar, MapPin } from 'phosphor-react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/routes/stack.routes';
import { getEventById, updateEventGuests, removeEventGuest } from '@/firebase/firestoreUtils';
import { Timestamp } from 'firebase/firestore';
import { Event } from '@/@types/events';

// Define the Guest interface to match the Event interface's guests property
interface Guest {
  id: string;
  email: string;
  confirmed: boolean;
}

type AddGuestsScreenRouteProp = RouteProp<RootStackParamList, 'addGuest'>;
type AddGuestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AddGuestsProps {
  route: AddGuestsScreenRouteProp;
  navigation: AddGuestsScreenNavigationProp;
}

export function AddGuests({ route, navigation }: AddGuestsProps) {
  const { eventId } = route.params;
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Format event date and time for display
  const formatEventDateTime = (date: Timestamp | Date | string) => {
    const eventDate = date instanceof Timestamp 
      ? date.toDate() 
      : date instanceof Date 
        ? date 
        : new Date(date as any);
    
    const dateString = eventDate.toLocaleDateString('pt-BR');
    const timeString = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `${dateString} às ${timeString}`;
  };

  // Load event and existing guests when component mounts
  useEffect(() => {
    loadEventAndGuests();
  }, []);

  // Function to load the event and its guests
  async function loadEventAndGuests() {
    setIsLoading(true);
    try {
      // Get event data from Firestore
      const eventData = await getEventById(eventId);
      
      if (eventData) {
        // Check if the event is in the future
        const eventDate = eventData.date instanceof Timestamp 
          ? eventData.date.toDate() 
          : eventData.date instanceof Date 
            ? eventData.date 
            : new Date(eventData.date as any);
        
        const now = new Date();
        
        if (eventDate < now) {
          Alert.alert('Atenção', 'Este evento já ocorreu e não pode ser modificado.');
          navigation.goBack();
          return;
        }
        
        setEvent(eventData);
        // Set guests from event data or empty array if none
        setGuests(eventData.guests || []);
      } else {
        Alert.alert('Erro', 'Evento não encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do evento');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddGuest() {
    if (!email.trim()) {
      Alert.alert('Erro', 'O email é obrigatório');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    // Check if email already exists in guests list
    if (guests.some(guest => guest.email.toLowerCase() === email.trim().toLowerCase())) {
      Alert.alert('Atenção', 'Este email já foi adicionado à lista');
      return;
    }

    setIsLoading(true);

    try {
      // Create new guest object
      const newGuest: Guest = {
        id: `guest_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`,
        email: email.trim(),
        confirmed: true
      };

      // Add guest to Firestore
      await updateEventGuests(eventId, [...guests, newGuest]);
      
      // Update local state
      setGuests(prevGuests => [...prevGuests, newGuest]);
      setEmail('');
      
    } catch (error) {
      console.error('Error adding guest:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o convidado');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveGuest(guestId: string) {
    setIsLoading(true);

    try {
      // Remove guest from Firestore
      await removeEventGuest(eventId, guestId);
      
      // Update local state
      setGuests(prevGuests => prevGuests.filter(guest => guest.id !== guestId));
      
    } catch (error) {
      console.error('Error removing guest:', error);
      Alert.alert('Erro', 'Não foi possível remover o convidado');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendInvitations() {
    if (guests.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um convidado');
      return;
    }

    setIsSending(true);

    try {
      // In a real app, you would implement email sending logic here
      // For now, we'll just mark the changes as successful
      
      Alert.alert(
        'Sucesso',
        'Convidados salvos com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error sending invitations:', error);
      Alert.alert('Erro', 'Não foi possível enviar os convites');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ImageBackground source={require('@/assets/bg.png')} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Adicione os convidados</Text>
          <Text style={styles.sectionSubtitle}>
            Enviaremos um email de convite para cada pessoa adicionada
          </Text>

          {event && (
            <View style={styles.eventInfoContainer}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                <Calendar size={16} color="#FF8350" weight="fill" style={{marginRight: 6}} />
                <Text style={styles.eventDate}>
                  {formatEventDateTime(event.date)}
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                <MapPin size={16} color="#FF8350" weight="fill" style={{marginRight: 6}} />
                <Text style={styles.eventLocation}>
                  {event.local || "Sem localização definida"}
                </Text>
              </View>
              <Text style={styles.eventIdInfo}>ID: {eventId}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <EnvelopeSimple size={20} color="#FF8350" weight="bold" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Insira o email do convidado"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              editable={!isLoading && !isSending}
            />
            <TouchableOpacity
              style={[styles.addButton, (isLoading || isSending) && styles.buttonDisabled]}
              onPress={handleAddGuest}
              disabled={isLoading || isSending}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Plus size={20} color="#FFF" weight="bold" />
              )}
            </TouchableOpacity>
          </View>

          {isLoading && guests.length === 0 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8350" />
              <Text style={styles.loadingText}>Carregando convidados...</Text>
            </View>
          )}

          {guests.length > 0 && (
            <View style={styles.guestsContainer}>
              <Text style={styles.guestsTitle}>Convidados ({guests.length})</Text>

              {guests.map(guest => (
                <View key={guest.id} style={styles.guestItem}>
                  <View style={styles.guestInfo}>
                    <User size={18} color="#FF8350" weight="fill" />
                    <Text style={styles.guestEmail}>{guest.email}</Text>
                    {guest.confirmed && (
                      <View style={styles.confirmedBadge}>
                        <Text style={styles.confirmedText}>Confirmado</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveGuest(guest.id)}
                    style={styles.removeButton}
                    disabled={isLoading || isSending}
                  >
                    <Trash size={18} color="#FF5555" weight="bold" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, (isLoading || isSending) && styles.buttonDisabled]}
          onPress={handleSendInvitations}
          disabled={isLoading || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Salvar e Enviar Convites</Text>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  eventInfoContainer: {
    backgroundColor: '#F9F7FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FF8350',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventLocation: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIdInfo: {
    fontSize: 12,
    color: '#888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF8350',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#FFAA80',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  guestsContainer: {
    marginTop: 8,
  },
  guestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  guestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  guestEmail: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  confirmedBadge: {
    backgroundColor: '#E7F9F1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  confirmedText: {
    fontSize: 10,
    color: '#2CC070',
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 6,
  },
  footer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  confirmButton: {
    backgroundColor: '#FF8350',
    borderRadius: 24,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});