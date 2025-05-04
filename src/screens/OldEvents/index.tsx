import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import MeetingCard from '@/components/MeetingCard';
import { Event } from '@/@types/events';
import { getUserEvents } from '@/firebase/firestoreUtils';
import { Timestamp } from 'firebase/firestore';

export function OldEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
          
        return eventDate < now;
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

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Format date for display
  const formatDate = (date: Timestamp | Date | string) => {
    const eventDate = date instanceof Timestamp 
      ? date.toDate() 
      : date instanceof Date 
        ? date 
        : new Date(date);
    
    return eventDate.toLocaleDateString('pt-BR');
  };

  // Format time for display
  const formatTime = (date: Timestamp | Date | string) => {
    const eventDate = date instanceof Timestamp 
      ? date.toDate() 
      : date instanceof Date 
        ? date 
        : new Date(date);
    
    return eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/bg.png')}
        style={styles.backgroundImage}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
            />
          }
        >
          <View style={styles.contentContainer}>
            <MyText variant='h1'>
              Eventos antigos
            </MyText>
            <MyText variant='subtitle2'>
              Mostrando somente eventos que já ocorreram
            </MyText>
            
            {loading && !refreshing ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0066cc" />
              </View>
            ) : events.length > 0 ? (
              <View>
                {events.map((event) => (
                  <MeetingCard
                    key={event.id}
                    title={event.title || "EVENTO SEM TÍTULO"}
                    date={formatDate(event.date)}
                    time={formatTime(event.date)}
                    location={event.local || "Sem localização definida"}
                    description={event.description || "Sem descrição"}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <MyText variant='body1'>
                  Você não possui eventos futuros.
                </MyText>
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}