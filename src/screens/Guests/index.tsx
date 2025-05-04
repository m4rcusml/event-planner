// Arquivo: index.tsx (componente Guests)
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
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import { getUserEvents } from '@/firebase/firestoreUtils';
import { Event } from '@/@types/events';
import { db } from '@/firebase/firebaseConfig';

export function Guests() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleGuestStatusChange = async (eventId: string, guestEmail: string, confirmed: boolean) => {
    try {
      // Find and update the event in the local state first
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          // Create a completely new guests array with the updated status
          const updatedGuests = event.guests?.map(guest =>
            guest.email === guestEmail ? { ...guest, confirmed } : guest
          ) || [];
          return { ...event, guests: updatedGuests };
        }
        return event;
      });
      
      // Update the state immediately for better UX
      setEvents(updatedEvents);
      
      // Update in Firebase
      const eventRef = doc(db, 'events', eventId);
      
      // Find the event to get the current guests list
      const eventToUpdate = events.find(e => e.id === eventId);
      if (!eventToUpdate || !eventToUpdate.guests) {
        throw new Error('Event or guests not found');
      }
      
      // Create a new guests array with the updated status
      const updatedGuests = eventToUpdate.guests.map(guest => {
        if (guest.email === guestEmail) {
          return { email: guest.email, confirmed };
        }
        return guest;
      });
      
      // Update the entire guests array in one operation
      await updateDoc(eventRef, {
        guests: updatedGuests
      });
      
    } catch (error) {
      console.error('Error updating guest status:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o status do convidado.');
      // Revert the local state back in case of error
      fetchEvents();
    }
  };

  const handleRemoveGuest = async (eventId: string, guestEmail: string) => {
    try {
      // Remove from local state first for immediate UI update
      const updatedEvents = events.map(event => {
        if (event.id === eventId) {
          const updatedGuests = event.guests?.filter(guest => guest.email !== guestEmail) || [];
          return { ...event, guests: updatedGuests };
        }
        return event;
      });
      
      setEvents(updatedEvents);
      
      // Get the current event data
      const eventToUpdate = events.find(e => e.id === eventId);
      if (!eventToUpdate || !eventToUpdate.guests) {
        throw new Error('Event or guests not found');
      }
      
      // Filter out the guest to remove
      const updatedGuests = eventToUpdate.guests.filter(guest => guest.email !== guestEmail);
      
      // Update the entire guests array in Firebase
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        guests: updatedGuests
      });
      
    } catch (error) {
      console.error('Error removing guest:', error);
      Alert.alert('Erro', 'Não foi possível remover o convidado.');
      // Revert the local state back in case of error
      fetchEvents();
    }
  };

  // Function to fetch events from Firestore
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const allEvents = await getUserEvents();

      // Filter events to only include those after the current date
      const now = new Date();
      const upcomingEvents = allEvents.filter(event => {
        // Convert Firestore Timestamp to JavaScript Date if needed
        const eventDate = event.date instanceof Timestamp
          ? event.date.toDate()
          : new Date(event.date as any);

        return eventDate >= now;
      });

      // Sort events by date (closest first)
      upcomingEvents.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date as any);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date as any);
        return dateA.getTime() - dateB.getTime();
      });

      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Erro', 'Não foi possível carregar os eventos. Tente novamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load events when component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

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
              Mostrando somente convidados de evento que não ocorreram
            </MyText>
            <View>
              {events.length > 0 ? (
                events.map((event) => (
                  <GuestList
                    key={event.id}
                    title={event.title}
                    eventId={event.id || ''}
                    guests={event.guests || []}
                    onGuestStatusChange={(id, email, confirmed) => 
                      handleGuestStatusChange(event.id || '', email, confirmed)}
                    onRemoveGuest={(id, email) => 
                      handleRemoveGuest(event.id || '', email)}
                  />
                ))
              ) : (
                <MyText variant='body1' style={{ textAlign: 'center', marginTop: 20 }}>
                  {loading ? 'Carregando eventos...' : 'Nenhum evento encontrado'}
                </MyText>
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}