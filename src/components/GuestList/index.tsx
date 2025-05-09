// Arquivo: components/GuestList/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Envelope, Trash, Check, Plus, WarningCircle } from 'phosphor-react-native';
import { RootStackParamList } from '@/routes/stack.routes';
import { removeGuest } from '@/firebase/firestoreUtils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Guest {
  id?: string;
  email: string;
  confirmed: boolean;
}

interface GuestListProps {
  title: string;
  eventId: string;
  guests: Guest[];
  onGuestStatusChange: (id: string, guestEmail: string, confirmed: boolean) => void;
  onRemoveGuest: (id: string, email: string) => void;
}

const GuestList: React.FC<GuestListProps> = ({
  title,
  eventId,
  guests: initialGuests = [],
  onGuestStatusChange,
}) => {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const navigation = useNavigation<NavigationProp>();

  const navigateToAddGuest = () => {
    navigation.navigate('addGuest', { eventId });
  };

  async function handleRemoveGuest(guestEmail: string) {
    try {
      // Remove guest from Firestore
      await removeGuest(eventId, guestEmail);

      // Update local state
      setGuests(prevGuests => prevGuests.filter(guest => guest.email !== guestEmail));

    } catch (error) {
      console.error('Error removing guest:', error);
      Alert.alert('Erro', 'Não foi possível remover o convidado');
    }
  }

  const renderGuestItem = (guest: Guest) => (
    <View key={guest.id || guest.email} style={styles.guestItem}>
      <View style={styles.emailContainer}>
        <Envelope size={22} color="#FF6B35" weight="light" />
        <Text style={styles.emailText}>{guest.email}</Text>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveGuest(guest.email)}
        >
          <Trash size={20} color="#ff4d4d" weight="light" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{title}</Text>
        <WarningCircle size={20} color="#FF6B35" weight="fill" />
      </View>
      <View style={styles.contentContainer}>
        {/* Mostra mensagem se não houver convidados */}
        {guests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum convidado adicionado</Text>
          </View>
        ) : (
          guests.map(guest => renderGuestItem(guest))
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={navigateToAddGuest}
        >
          <Plus size={20} color="#fff" weight="bold" />
          <Text style={styles.addButtonText}>Adicionar Convidado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContainer: {
    backgroundColor: '#F9C4A1',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7D4427',
  },
  contentContainer: {
    backgroundColor: '#f2f2f2',
  },
  guestList: {
    width: '100%',
  },
  guestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButton: {
    marginRight: 12,
    padding: 4,
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    padding: 12,
    margin: 15,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
});

export default GuestList;