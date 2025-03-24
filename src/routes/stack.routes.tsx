import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Login } from '@/screens/Login'
import { Register } from '@/screens/Register'
import { ForgotPassword } from '@/screens/ForgotPassword'
import { Home } from '@/screens/Home'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  Home: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function StackRoutes() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: {
        backgroundColor: '#FF914D',
      },
      headerTintColor: '#fff',
    }}>
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={Register} options={{ title: 'Voltar' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Voltar' }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}
