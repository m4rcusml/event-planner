import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Home } from '@/screens/Home';
import { Header } from '@/components/Header';
import { SignOut, Gear, Question, House } from 'phosphor-react-native';

const Drawer = createDrawerNavigator();

export default function DrawerRoutes() {
  return (
    <Drawer.Navigator
      screenOptions={{
        header: () => <Header />,
        drawerStyle: {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          width: 240,
          height: 240,
        },
        drawerPosition: 'right',
        drawerItemStyle: {
          backgroundColor: '#FF914D',
          marginVertical: 4,
          height: 48,
          borderRadius: 12,
        },
        drawerLabelStyle: {
          color: '#FFFFFF',
          fontSize: 14,
          marginTop: -3
        },
        drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.2)',
      }}
    >
      <Drawer.Screen
        name="HomeDrawer"
        component={Home}
        options={{
          title: 'Inicio',
          drawerIcon: ({ size }) => (
            <House size={size} color="#FFFFFF" />
          ),
        }}
      />

      <Drawer.Screen
        name="Settings"
        component={Home}
        options={{
          title: 'Configurações',
          drawerIcon: ({ size }) => (
            <Gear size={size} color="#FFFFFF" />
          ),
        }}
      />

      <Drawer.Screen
        name="Help"
        component={Home}
        options={{
          title: 'Dúvidas',
          drawerIcon: ({ size }) => (
            <Question size={size} color="#FFFFFF" />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}