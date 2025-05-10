// src/firebase/firestoreUtils.ts
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  disableNetwork,
  enableNetwork,
  WriteBatch,
  runTransaction,
  writeBatch,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  Query,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { Event } from '@/@types/events';
import NetInfo from '@react-native-community/netinfo';
import { v4 as uuidv4 } from 'uuid';

// Função para gerenciar a conexão com o Firestore
export const handleFirestoreConnection = async () => {
  const netInfo = await NetInfo.fetch();

  if (netInfo.isConnected) {
    try {
      await enableNetwork(db);
      console.log('Firestore network enabled');
    } catch (error) {
      console.error('Error enabling Firestore network:', error);
    }
  } else {
    try {
      await disableNetwork(db);
      console.log('Firestore network disabled - running in offline mode');
    } catch (error) {
      console.error('Error disabling Firestore network:', error);
    }
  }
};

// Função para obter todos os eventos do usuário atual
export const getUserEvents = async (): Promise<Event[]> => {
  try {
    // Verificar se existe um usuário autenticado
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    // Atualizar conexão com base no estado da rede
    await handleFirestoreConnection();

    // Consultar eventos do usuário
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('userId', '==', user.uid));

    const querySnapshot = await getDocs(q);

    const events: Event[] = [];
    querySnapshot.forEach((doc) => {
      const eventData = doc.data() as Event;
      events.push({
        ...eventData,
        id: doc.id // Adicionar o ID do documento aos dados do evento
      });
    });

    console.log(`Fetched ${events.length} events for user ${user.uid}`);
    return events;
  } catch (error) {
    console.error('Error fetching user events:', error);
    return [];
  }
};

/**
 * Função para criar uma assinatura em tempo real para eventos
 * 
 * @param onSuccess - Callback chamado quando novos dados são recebidos
 * @param onError - Callback chamado em caso de erro
 * @param queryConstraints - Restrições de consulta opcionais
 * @returns Função para cancelar a assinatura
 */
export const subscribeToUserEvents = (
  onSuccess: (events: Event[]) => void,
  onError: (error: Error) => void,
  queryConstraints: QueryConstraint[] = []
): (() => void) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      onError(new Error('No authenticated user found'));
      return () => { };
    }

    // Criar query base
    const eventsRef = collection(db, 'events');

    // Adicionar restrição de usuário e quaisquer outras restrições fornecidas
    const constraints = [where('userId', '==', user.uid), ...queryConstraints];
    const q = query(eventsRef, ...constraints);

    // Configurar a assinatura
    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const events: Event[] = [];
        querySnapshot.forEach((doc) => {
          const eventData = doc.data() as Event;
          events.push({
            ...eventData,
            id: doc.id
          });
        });

        console.log(`Subscription received ${events.length} events in real-time`);
        onSuccess(events);
      },
      (error) => {
        console.error('Error in events subscription:', error);
        onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up subscription:', error);
    onError(error as Error);
    return () => { };
  }
};

/**
 * Função para criar uma assinatura em tempo real para eventos futuros
 * 
 * @param onSuccess - Callback chamado quando novos dados são recebidos
 * @param onError - Callback chamado em caso de erro
 * @returns Função para cancelar a assinatura
 */
export const subscribeToUpcomingEvents = (
  onSuccess: (events: Event[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  // Primeiro executar handleFirestoreConnection para garantir conexão adequada
  handleFirestoreConnection().catch(error => {
    console.warn('Network connection status check failed:', error);
  });

  return subscribeToUserEvents(
    (events) => {
      // Filtrar eventos futuros com timestamp atual
      const now = new Date();
      console.log(`Processing ${events.length} events, filtering for future events`);

      const upcomingEvents = events.filter(event => {
        if (!event.date) {
          console.warn('Event without date found:', event.id);
          return false;
        }

        // Converter para Date, independente do formato
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

      console.log(`Filtered to ${upcomingEvents.length} upcoming events`);

      // Limitar a 10 eventos para melhor desempenho na UI (opcional)
      const limitedEvents = upcomingEvents.slice(0, 10);
      onSuccess(limitedEvents);
    },
    onError
  );
};

/**
 * Função para criar uma assinatura em tempo real para eventos passados
 * 
 * @param onSuccess - Callback chamado quando novos dados são recebidos
 * @param onError - Callback chamado em caso de erro
 * @returns Função para cancelar a assinatura
 */
export const subscribeToPastEvents = (
  onSuccess: (events: Event[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  return subscribeToUserEvents(
    (events) => {
      // Filtrar eventos passados
      const now = new Date();
      const pastEvents = events.filter(event => {
        const eventDate = event.date instanceof Timestamp
          ? event.date.toDate()
          : new Date(event.date as any);

        return eventDate < now;
      });

      // Ordenar por data (mais recentes primeiro)
      pastEvents.sort((a, b) => {
        const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date as any);
        const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date as any);
        return dateB.getTime() - dateA.getTime();
      });

      onSuccess(pastEvents);
    },
    onError
  );
};

// Função para adicionar um novo evento
export const addEvent = async (eventData: Event): Promise<string | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user found');
      return null;
    }

    // Garantir conexão para adicionar o evento
    await handleFirestoreConnection();

    // Validar dados obrigatórios
    if (!eventData.title || !eventData.date) {
      console.error('Missing required event data: title or date');
      return null;
    }

    // Criar um novo documento com ID automático
    const eventsRef = collection(db, 'events');
    const newEventRef = doc(eventsRef);

    // Adicionar o ID do usuário e timestamp de criação aos dados do evento
    const eventWithUserId = {
      ...eventData,
      userId: user.uid,
      createdAt: new Date(),
      // Garantir que date seja sempre um Timestamp para consistência
      date: eventData.date instanceof Timestamp
        ? eventData.date
        : Timestamp.fromDate(new Date(eventData.date as any))
    };

    await setDoc(newEventRef, eventWithUserId);
    console.log('Event added with ID:', newEventRef.id);

    // Os listeners de tempo real já capturarão esta alteração
    // e atualizarão as interfaces automaticamente

    return newEventRef.id;
  } catch (error) {
    console.error('Error adding event:', error);
    return null;
  }
};

// Função para obter um evento específico
export const getEvent = async (eventId: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);

    if (eventDoc.exists()) {
      return { ...eventDoc.data() as Event, id: eventDoc.id };
    } else {
      console.log('No event found with ID:', eventId);
      return null;
    }
  } catch (error) {
    console.error('Error getting event:', error);
    return null;
  }
};

// Função para atualizar um evento
export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);

    // Verificar se o evento existe
    const eventDoc = await getDoc(eventRef);
    if (!eventDoc.exists()) {
      console.log('Event not found:', eventId);
      return false;
    }

    // Atualizar apenas os campos fornecidos
    await updateDoc(eventRef, eventData);
    console.log('Event updated:', eventId);

    return true;
  } catch (error) {
    console.error('Error updating event:', error);
    return false;
  }
};

// Função para excluir um evento
export const deleteEvent = async (eventId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);

    // Verificar se o evento existe
    const eventDoc = await getDoc(eventRef);
    if (!eventDoc.exists()) {
      console.log('Event not found:', eventId);
      return false;
    }

    // Excluir o evento
    await deleteDoc(eventRef);
    console.log('Event deleted:', eventId);

    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    return false;
  }
};

// Função para atualizar o status de um convidado
export const updateGuestStatus = async (
  eventId: string,
  guestEmail: string,
  confirmed: boolean
): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);

    // Executar uma transação para garantir consistência
    return await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) {
        console.log('Event not found:', eventId);
        return false;
      }

      const event = eventDoc.data() as Event;
      const guests = event.guests || [];

      // Atualizar o status do convidado
      const updatedGuests = guests.map(guest => {
        if (guest.email === guestEmail) {
          return { ...guest, confirmed };
        }
        return guest;
      });

      // Se o convidado não existir na lista
      const guestExists = updatedGuests.some(guest => guest.email === guestEmail);
      if (!guestExists) {
        const timestamp = Date.now();
        updatedGuests.push({ 
          id: `guest_${guestEmail}_${timestamp}`, 
          email: guestEmail, 
          confirmed 
        });
      }

      // Atualizar o evento com a lista de convidados atualizada
      transaction.update(eventRef, { guests: updatedGuests });
      console.log(`Guest ${guestEmail} status updated to ${confirmed}`);

      return true;
    });
  } catch (error) {
    console.error('Error updating guest status:', error);
    return false;
  }
};

// Função para remover um convidado
export const removeGuest = async (eventId: string, guestEmail: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'events', eventId);

    // Executar uma transação para garantir consistência
    return await runTransaction(db, async (transaction) => {
      const eventDoc = await transaction.get(eventRef);

      if (!eventDoc.exists()) {
        console.log('Event not found:', eventId);
        return false;
      }

      const event = eventDoc.data() as Event;
      const guests = event.guests || [];

      // Remover o convidado da lista
      const updatedGuests = guests.filter(guest => guest.email !== guestEmail);

      // Atualizar o evento com a lista de convidados atualizada
      transaction.update(eventRef, { guests: updatedGuests });
      console.log(`Guest ${guestEmail} removed from event ${eventId}`);

      return true;
    });
  } catch (error) {
    console.error('Error removing guest:', error);
    return false;
  }
};