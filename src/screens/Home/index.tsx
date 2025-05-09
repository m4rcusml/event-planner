import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Alert,
} from 'react-native';
import { Calendar, Clock, MagnifyingGlass, Plus, UsersThree } from 'phosphor-react-native';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './styles';
import { RootStackParamList } from '@/routes/stack.routes';
import { Timestamp, collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, auth } from '@/firebase/firebaseConfig';
import { Event } from '@/@types/events';

// Calendar data
const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const months = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

export function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [month, setMonth] = useState('JANEIRO');
  const [year, setYear] = useState('2025');
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const currentDate = new Date();
    setMonth(months[currentDate.getMonth()]);
    setYear(currentDate.getFullYear().toString());
  }, []);

  // Função para se inscrever em atualizações em tempo real dos eventos
  const subscribeToEvents = () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }

      // Criar uma query para buscar eventos do usuário atual
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('userId', '==', user.uid));
      
      // Inscrever-se para atualizações em tempo real
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsData: Event[] = [];
        
        querySnapshot.forEach((doc) => {
          const eventData = doc.data() as Event;
          eventsData.push({
            ...eventData,
            id: doc.id
          });
        });
        
        // Filtrar eventos futuros
        const now = new Date();
        const upcomingEvents = eventsData.filter(event => {
          const eventDate = event.date instanceof Timestamp
            ? event.date.toDate()
            : new Date(event.date as any);
          
          return eventDate >= now;
        });
        
        // Ordenar por data (mais próximos primeiro)
        upcomingEvents.sort((a, b) => {
          const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date as any);
          const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date as any);
          return dateA.getTime() - dateB.getTime();
        });
        
        setEvents(upcomingEvents);
        setLoading(false);
        setRefreshing(false);
        console.log(`Subscribed to ${upcomingEvents.length} upcoming events in real-time`);
      }, (error) => {
        console.error('Error subscribing to events:', error);
        Alert.alert('Erro', 'Não foi possível monitorar os eventos em tempo real. Tente novamente.');
        setLoading(false);
        setRefreshing(false);
      });
      
      // Armazenar a função de unsubscribe para limpar depois
      unsubscribeRef.current = unsubscribe;
      
    } catch (error) {
      console.error('Error setting up events subscription:', error);
      Alert.alert('Erro', 'Não foi possível configurar o monitoramento de eventos. Tente novamente.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Inscrever-se quando o componente montar
  useEffect(() => {
    subscribeToEvents();
    
    // Limpar a inscrição quando o componente desmontar
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        console.log('Unsubscribed from events real-time updates');
      }
    };
  }, []);

  // Reinscrever-se quando a tela receber foco novamente
  useFocusEffect(
    React.useCallback(() => {
      // Se já existe uma inscrição, cancele-a primeiro
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      
      // Inscrever-se novamente
      subscribeToEvents();
      
      return () => {
        // Não precisa fazer nada aqui, pois queremos manter a inscrição
        // quando a tela perde o foco, para detectar atualizações em background
      };
    }, [])
  );

  const renderCalendarDay = (day: number) => {
    const today = new Date();
    const isToday = day === today.getDate() &&
      months[today.getMonth()] === month &&
      today.getFullYear().toString() === year;

    return (
      <TouchableOpacity
        style={[styles.calendarDay, isToday && styles.todayCell]}
        key={day}
      >
        <Text style={[styles.calendarDayText, isToday && styles.todayText]}>
          {day}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCalendarGrid = () => {
    const cells = [];

    // Week days header
    cells.push(
      <View key="header" style={styles.weekDaysRow}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
    );

    // Get number of days in the selected month
    const monthIndex = months.indexOf(month);
    const daysInMonth = new Date(parseInt(year), monthIndex + 1, 0).getDate();

    // Get first day of the month
    const firstDay = new Date(parseInt(year), monthIndex, 1).getDay();

    // Calendar days - rows of 7 days
    let row = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      row.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Add the actual days
    for (let i = 1; i <= daysInMonth; i++) {
      row.push(renderCalendarDay(i));

      if (row.length === 7) {
        cells.push(
          <View key={`row-${Math.ceil(i / 7)}`} style={styles.calendarRow}>
            {row}
          </View>
        );
        row = [];
      }
    }

    // Add remaining empty cells if needed
    if (row.length > 0) {
      while (row.length < 7) {
        row.push(<View key={`empty-end-${row.length}`} style={styles.calendarDay} />);
      }
      cells.push(
        <View key="last-row" style={styles.calendarRow}>
          {row}
        </View>
      );
    }

    return cells;
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/bg.png')}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.contentContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisa"
                placeholderTextColor="#999"
              />
              <View style={styles.searchIcon}>
                <MagnifyingGlass size={20} color="#FF914D" weight="bold" />
              </View>
            </View>
            {/* Calendar */}
            <View style={styles.calendarContainer}>
              {renderCalendarGrid()}
              {/* Month/Year Selector */}
              <View style={styles.monthSelector}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity onPress={() => {
                    const currentIndex = months.indexOf(month);
                    if (currentIndex > 0) {
                      setMonth(months[currentIndex - 1]);
                    } else {
                      setMonth(months[11]);
                      setYear((parseInt(year) - 1).toString());
                    }
                  }}>
                    <Text style={[styles.monthYearText, { marginRight: 10 }]}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.monthYearText}>{month} / {year}</Text>
                  <TouchableOpacity onPress={() => {
                    const currentIndex = months.indexOf(month);
                    if (currentIndex < 11) {
                      setMonth(months[currentIndex + 1]);
                    } else {
                      setMonth(months[0]);
                      setYear((parseInt(year) + 1).toString());
                    }
                  }}>
                    <Text style={[styles.monthYearText, { marginLeft: 10 }]}>▶</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.monthHint}>Escolha o mês</Text>
              </View>
            </View>
            {/* Action Buttons - First Row */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('addEvent')}>
                <View style={styles.buttonIconContainer}>
                  <Plus size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>CRIAR EVENTO</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('guests')}>
                <View style={styles.buttonIconContainer}>
                  <UsersThree size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>CONVIDADOS</Text>
              </TouchableOpacity>
            </View>
            {/* Action Buttons - Second Row */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('events')}>
                <View style={styles.buttonIconContainer}>
                  <Calendar size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>MEUS EVENTOS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('oldEvents')}>
                <View style={styles.buttonIconContainer}>
                  <Clock size={18} color="#FFF" weight="bold" />
                </View>
                <Text style={styles.buttonText}>EVENTOS ANTIGOS</Text>
              </TouchableOpacity>
            </View>
            {/* Reminders Section */}
            <View style={styles.remindersContainer}>
              {/* Reminders Header */}
              <View style={styles.remindersHeader}>
                <Text style={[styles.reminderHeaderText, styles.reminderTitleHeader]}>LEMBRETES</Text>
                <Text style={[styles.reminderHeaderText, styles.reminderDayHeader]}>DIA</Text>
                <Text style={[styles.reminderHeaderText, styles.reminderTimeHeader]}>HORA</Text>
              </View>
              {/* Reminders List */}
              {events.length > 0 ? (
                events.map((event, index) => (
                  <View key={index} style={styles.reminderItem}>
                    <Text style={[styles.reminderText, styles.reminderTitle]}>{event.title}</Text>
                    <Text style={[styles.reminderText, styles.reminderDay]}>
                      {event.date instanceof Timestamp
                        ? event.date.toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                        : new Date(event.date as any).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </Text>
                    <Text style={[styles.reminderText, styles.reminderTime]}>
                      {event.date instanceof Timestamp
                        ? event.date.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : new Date(event.date as any).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.reminderItem}>
                  <Text style={[styles.reminderText, { textAlign: 'center', flex: 1 }]}>
                    {loading ? "Carregando..." : "Sem eventos futuros"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}