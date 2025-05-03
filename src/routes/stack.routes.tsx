import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Login } from '@/screens/Login'
import { Register } from '@/screens/Register'
import { ForgotPassword } from '@/screens/ForgotPassword'
import DrawerRoutes from './drawer.routes'
import { Profile } from '@/screens/Profile'
import { Header } from '@/components/Header'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  logged: undefined

  profile: undefined
  events: undefined
  addEvent: undefined
  guests: undefined
  addGuest: undefined
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
    </Stack.Navigator>
  )
}
