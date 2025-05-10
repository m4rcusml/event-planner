// src/screens/Guests/index.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  Alert,
} from 'react-native';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import GuestList from '@/components/GuestList';
import { Timestamp } from 'firebase/firestore';
import { 
  getUserEvents, 
  updateGuestStatus, 
  removeGuest, 
  subscribeToUserEvents
} from '@/firebase/firestoreUtils';
import { Event } from '@/@types/events';
import NetInfo from '@react-native-community/netinfo';

export function Guests() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Monitora o estado da conexão
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Função para lidar com mudança de status do convidado
  const handleGuestStatusChange = async (eventId: string, guestEmail: string, confirmed: boolean) => {
    try {
      // Atualiza a UI imediatamente para melhor experiência do usuário
      setEvents(currentEvents => currentEvents.map(event => {
        if (event.id === eventId) {
          const updatedGuests = event.guests?.map(guest =>
            guest.email === guestEmail ? { ...guest, confirmed } : guest
          ) || [];
          return { ...event, guests: updatedGuests };
        }
        return event;
      }));
      
      // Exibe notificação se dispositivo estiver offline
      if (!isConnected) {
        Alert.alert(
          'Modo Offline', 
          'Suas alterações serão sincronizadas quando você voltar a ficar online.'
        );
      }
      
      // Tenta atualizar no Firebase
      const success = await updateGuestStatus(eventId, guestEmail, confirmed);
      
      if (!success && isConnected) {
        throw new Error('Falha ao atualizar o status do convidado');
      }
      
    } catch (error) {
      console.error('Error updating guest status:', error);
      // Só exibe alerta de erro se estiver online e a operação falhar
      if (isConnected) {
        Alert.alert('Erro', 'Não foi possível atualizar o status do convidado.');
        // Recarrega os dados para restaurar o estado correto
        fetchEvents();
      }
    }
  };

  // Função para lidar com remoção de convidado
  const handleRemoveGuest = async (eventId: string, guestEmail: string) => {
    try {
      // Confirma se o usuário deseja remover o convidado
      Alert.alert(
        'Remover Convidado',
        `Deseja remover o convidado ${guestEmail}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Remover', 
            style: 'destructive',
            onPress: async () => {
              // Atualiza a UI imediatamente
              setEvents(currentEvents => currentEvents.map(event => {
                if (event.id === eventId) {
                  const updatedGuests = event.guests?.filter(guest => 
                    guest.email !== guestEmail
                  ) || [];
                  return { ...event, guests: updatedGuests };
                }
                return event;
              }));
              
              // Exibe notificação se dispositivo estiver offline
              if (!isConnected) {
                Alert.alert(
                  'Modo Offline', 
                  'Suas alterações serão sincronizadas quando você voltar a ficar online.'
                );
              }
              
              // Tenta remover no Firebase
              const success = await removeGuest(eventId, guestEmail);
              
              if (!success && isConnected) {
                throw new Error('Falha ao remover o convidado');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error removing guest:', error);
      // Só exibe alerta de erro se estiver online e a operação falhar
      if (isConnected) {
        Alert.alert('Erro', 'Não foi possível remover o convidado.');
        // Recarrega os dados para restaurar o estado correto
        fetchEvents();
      }
    }
  };

  // Função para buscar eventos do Firestore
  const fetchEvents = () => {
    try {
      setLoading(true);

      // Configurar a assinatura em tempo real
      const unsubscribe = subscribeToUserEvents(
        (allEvents) => {
          // Filtra eventos para incluir apenas aqueles após a data atual
          const now = new Date();
          const upcomingEvents = allEvents.filter(event => {
            // Converte Timestamp do Firestore para JavaScript Date se necessário
            const eventDate = event.date instanceof Timestamp
              ? event.date.toDate()
              : new Date(event.date as any);

            return eventDate >= now;
          });

          // Ordena eventos por data (mais próximos primeiro)
          upcomingEvents.sort((a, b) => {
            const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date as any);
            const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date as any);
            return dateA.getTime() - dateB.getTime();
          });

          setEvents(upcomingEvents);
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error('Error fetching events:', error);
          Alert.alert('Erro', 'Não foi possível carregar os eventos. Tente novamente.');
          setLoading(false);
          setRefreshing(false);
        }
      );

      // Retorna a função de limpeza para useEffect
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up events subscription:', error);
      setLoading(false);
      setRefreshing(false);
      return () => {};
    }
  };

  // Carrega eventos quando o componente é montado
  useEffect(() => {
    const unsubscribe = fetchEvents();

    return unsubscribe()
  }, []);

  // Sincroniza quando o status da conexão muda de offline para online
  useEffect(() => {
    let unsubscribe = () => {};
    
    if (isConnected) {
      unsubscribe = fetchEvents();
    }
    
    return () => unsubscribe();
  }, [isConnected]);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/bg.png')}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.contentContainer}>
            <MyText variant='h1'>
              Convidados
            </MyText>
            <MyText variant='subtitle2'>
              Mostrando somente convidados de eventos futuros
            </MyText>
            
            {/* Indicador de modo offline */}
            {!isConnected && (
              <View style={styles.offlineIndicator}>
                <MyText variant='body2' style={styles.offlineText}>
                  Modo offline - suas alterações serão sincronizadas quando você voltar online
                </MyText>
              </View>
            )}
            
            <View>
              {loading ? (
                <MyText variant='body1' style={{ textAlign: 'center', marginTop: 20 }}>
                  Carregando eventos...
                </MyText>
              ) : events.length > 0 ? (
                events.map((event) => (
                  <GuestList
                    key={event.id}
                    title={event.title}
                    eventId={event.id || ''}
                    guests={event.guests || []}
                    onGuestStatusChange={handleGuestStatusChange}
                    onRemoveGuest={handleRemoveGuest}
                  />
                ))
              ) : (
                <MyText variant='body1' style={{ textAlign: 'center', marginTop: 20 }}>
                  Nenhum evento futuro encontrado
                </MyText>
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}