// firestoreUtils.ts - Updated with guest management functions
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query, 
  where, 
  Timestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import { Event } from '@/@types/events';

// Toggle Firestore network state (with error handling)
export const toggleFirestoreNetwork = async (enable: boolean) => {
  try {
    if (enable) {
      await enableNetwork(db);
      console.log('Firestore network enabled');
    } else {
      await disableNetwork(db);
      console.log('Firestore network disabled');
    }
    return true;
  } catch (error) {
    console.error('Error toggling network:', error);
    return false;
  }
};

// Save event with proper error handling for permissions
export const saveEvent = async (eventData: Event): Promise<string | null> => {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("Cannot save event: User not authenticated");
      throw new Error("Você precisa estar autenticado para salvar eventos");
    }
    
    // Set user ID if not provided
    if (!eventData.userId) {
      eventData.userId = currentUser.uid;
    }
    
    // Generate an ID if not provided
    const eventId = eventData.id || `event_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
    
    // Ensure date is a Timestamp
    if (!(eventData.date instanceof Timestamp)) {
      console.warn('Date is not a Timestamp, converting...');
      eventData.date = Timestamp.fromDate(new Date(eventData.date as any));
    }
    
    // Add createdAt timestamp if not provided
    if (!eventData.createdAt) {
      eventData.createdAt = Timestamp.now();
    }
    
    // Add updatedAt timestamp
    eventData.updatedAt = Timestamp.now();
    
    // Remove the id field before saving
    const { id, ...dataToSave } = eventData as any;
    
    // Save to Firestore with merge option
    await setDoc(doc(db, 'events', eventId), dataToSave, { merge: true });
    
    console.log('Event saved successfully with ID:', eventId);
    return eventId;
  } catch (error: any) {
    console.error('Error saving event:', error);
    
    // Handle specific Firestore errors
    if (error.code === 'permission-denied') {
      throw new Error('Permissão negada. Verifique se você está autenticado.');
    }
    
    throw error;
  }
};

// Get events for the current user with permission handling
export const getUserEvents = async (userId?: string, futureOnly: boolean = true): Promise<Event[]> => {
  try {
    // Use current user's ID if not provided
    const currentUser = auth.currentUser;
    const userIdToUse = userId || (currentUser ? currentUser.uid : null);
    
    if (!userIdToUse) {
      console.warn('No user ID available for fetching events');
      return [];
    }
    
    // Query events where userId matches
    const q = query(collection(db, 'events'), where('userId', '==', userIdToUse));
    const querySnapshot = await getDocs(q);
    
    const events: Event[] = [];
    const now = new Date();
    
    querySnapshot.forEach((doc) => {
      const event = { id: doc.id, ...doc.data() } as Event;
      
      if (futureOnly) {
        // Include only future events if futureOnly is true
        const eventDate = event.date instanceof Timestamp 
          ? event.date.toDate()
          : event.date instanceof Date 
            ? event.date
            : new Date(event.date as any);
        
        if (eventDate >= now) {
          events.push(event);
        }
      } else {
        // Include all events if futureOnly is false
        events.push(event);
      }
    });
    
    // Sort events by date (closest first)
    events.sort((a, b) => {
      const dateA = a.date instanceof Timestamp ? a.date.toDate() : new Date(a.date as any);
      const dateB = b.date instanceof Timestamp ? b.date.toDate() : new Date(b.date as any);
      return dateA.getTime() - dateB.getTime();
    });
    
    return events;
  } catch (error: any) {
    console.error('Error fetching user events:', error);
    
    if (error.code === 'permission-denied') {
      console.warn('Permission denied when fetching events');
    }
    
    // Return empty array instead of throwing
    return [];
  }
};

// Get a single event by ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventSnapshot = await getDoc(eventRef);
    
    if (eventSnapshot.exists()) {
      return { id: eventSnapshot.id, ...eventSnapshot.data() } as Event;
    } else {
      console.warn(`Event with ID ${eventId} not found`);
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching event by ID:', error);
    
    if (error.code === 'permission-denied') {
      console.warn('Permission denied when fetching event');
    }
    
    return null;
  }
};

// Update guests for an event
export const updateEventGuests = async (
  eventId: string, 
  guests: { id: string; email: string; confirmed: boolean }[]
): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("Cannot update guests: User not authenticated");
      throw new Error("Você precisa estar autenticado para atualizar convidados");
    }
    
    // Get the event first to verify ownership
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error("Evento não encontrado");
    }
    
    // Verify that the current user owns this event
    if (event.userId !== currentUser.uid) {
      console.error("User doesn't own this event");
      throw new Error("Você não tem permissão para modificar este evento");
    }
    
    // Update the event with new guests list
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      guests: guests,
      updatedAt: Timestamp.now()
    });
    
    console.log('Event guests updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating event guests:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Permissão negada. Verifique se você está autenticado.');
    }
    
    throw error;
  }
};

// Remove a guest from an event
export const removeEventGuest = async (eventId: string, guestId: string): Promise<boolean> => {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("Cannot remove guest: User not authenticated");
      throw new Error("Você precisa estar autenticado para remover convidados");
    }
    
    // Get the current event
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error("Evento não encontrado");
    }
    
    // Verify that the current user owns this event
    if (event.userId !== currentUser.uid) {
      console.error("User doesn't own this event");
      throw new Error("Você não tem permissão para modificar este evento");
    }
    
    // Filter out the guest with the specified ID
    const updatedGuests = (event.guests || []).filter(guest => guest.id !== guestId);
    
    // Update the event with the filtered guests list
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      guests: updatedGuests,
      updatedAt: Timestamp.now()
    });
    
    console.log('Guest removed successfully');
    return true;
  } catch (error: any) {
    console.error('Error removing event guest:', error);
    
    if (error.code === 'permission-denied') {
      throw new Error('Permissão negada. Verifique se você está autenticado.');
    }
    
    throw error;
  }
};