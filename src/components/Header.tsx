import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ArrowLeft, UserCircle } from 'phosphor-react-native';
import { MyText } from './MyText';
import { useAuth } from '@/contexts/auth';

export function Header({ welcomeUser = true, useDrawer = true }: { welcomeUser?: boolean, useDrawer?: boolean }) {
  const { userData } = useAuth();
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  return (
    <View style={[styles.container, { paddingTop: top + 16 }]}>
      <View style={[styles.userContainer, { justifyContent: 'space-between' }]}>
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
          onPress={() => welcomeUser ? navigation.navigate('profile') : navigation.goBack()}
        >
          {welcomeUser ? <>
            <UserCircle size={42} color="#FFF" weight='fill' />
            <View style={{ gap: 2 }}>
              <MyText color='white' variant="subtitle1">BEM VINDO</MyText>
              <MyText color='white' variant="h5">{userData?.fullName.split(' ')[0] || 'Usuário'}!</MyText>
            </View>
          </> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={24} color="#FFF" weight="bold" />
            <MyText color='white' variant="h4">Voltar</MyText>
          </View>}
        </Pressable>
        {useDrawer && <Feather
          name="menu"
          size={24}
          color="#FFF"
          onPress={() => navigation.openDrawer()}
        />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF914D',
    padding: 16,
    borderBottomEndRadius: 20,
    borderBottomStartRadius: 20,
    elevation: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  time: {
    color: '#FFF',
    fontSize: 16,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  batteryText: {
    color: '#FFF',
    fontSize: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  welcomeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});