import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Login } from '@/screens/Login'
import { Register } from '@/screens/Register'
import { ForgotPassword } from '@/screens/ForgotPassword'
import DrawerRoutes from './drawer.routes'
import { Profile } from '@/screens/Profile'
import { Header } from '@/components/Header'
import { Events } from '@/screens/Events'
import { OldEvents } from '@/screens/OldEvents'
import { Guests } from '@/screens/Guests'
import { AddEvent } from '@/screens/AddEvent'
import { EventSuccess } from '@/screens/EventSuccess'
import { AddGuests } from '@/screens/AddGuest'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  logged: undefined
  profile: undefined
  events: undefined
  oldEvents: undefined
  guests: undefined
  addEvent: undefined
  eventSuccess: undefined
  addGuest: { eventId: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function StackRoutes() {
  return (
    <Stack.Navigator screenOptions={{
      header: () => <Header welcomeUser={false} useDrawer={false} />,
      headerStyle: {
        backgroundColor: '#FF914D',
      },
      headerTintColor: '#fff',
      statusBarBackgroundColor: '#D54E21',
    }}>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Voltar' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Voltar' }} />
      <Stack.Screen name="logged" component={DrawerRoutes} options={{ headerShown: false }} />
      <Stack.Screen name="profile" component={Profile} options={{ title: 'Voltar' }} />
      <Stack.Screen name="events" component={Events} options={{ title: 'Voltar' }} />
      <Stack.Screen name="oldEvents" component={OldEvents} options={{ title: 'Voltar' }} />
      <Stack.Screen name="guests" component={Guests} options={{ title: 'Voltar' }} />
      <Stack.Screen name="addEvent" component={AddEvent} options={{ title: 'Voltar' }} />
      <Stack.Screen name="eventSuccess" component={EventSuccess} options={{ headerShown: false }} />
      <Stack.Screen name="addGuest" component={AddGuests} options={{ title: 'Voltar' }} />
    </Stack.Navigator>
  )
}
