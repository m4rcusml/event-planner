import { useState } from 'react'
import { ImageBackground, ScrollView, View, Image, Alert } from 'react-native'
import { styles } from './styles'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/routes/stack.routes'
import { MyText } from '@/components/MyText'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'
import { CalendarBlank, Envelope, User } from 'phosphor-react-native'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import BgImg from '@/assets/bg.png'
import Checked from '@/assets/checked.png'
import { useAuth } from '@/contexts/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase/firebaseConfig'

export function Register() {
  const { handleAddUserToLocalStorage } = useAuth();
  const { navigate, goBack } = useNavigation<NavigationProp<RootStackParamList>>();
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function register() {
    if (!fullName || !email || !birthDate || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
      // Here you can also add the user's additional info to Firestore if needed

      const userDoc = {
        fullName,
        email,
        birthDate,
        createdAt: new Date(),
      };
      
      handleAddUserToLocalStorage(auth.currentUser!, userDoc);

      await setDoc(doc(db, "users", auth.currentUser!.uid), userDoc);

      setIsRegistered(true);
    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro ao criar sua conta';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function login() {
    goBack()
  }

  if (isRegistered) {
    return (
      <ImageBackground source={BgImg} style={styles.container}>
        <View style={styles.finish}>
          <Image source={Checked} />
          <MyText variant='h2' color='darkerPrimary' align='center'>
            Cadastro concluído com sucesso!
          </MyText>
          <Button onPress={login}>Prosseguir</Button>
        </View>
      </ImageBackground>
    )
  }

  return (
    <ImageBackground source={BgImg} style={styles.container}>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant='h1'>Cadastro</MyText>
        <MyText variant='subtitle1'>
          Vamos criar seu cadastro. Precisamos apenas de algumas informações:
        </MyText>
        <Field
          label='Nome Completo'
          placeholder='Digite seu nome completo'
          icon={User}
          value={fullName}
          onChangeText={setFullName}
        />
        <Field
          label='Email'
          placeholder='Digite seu email'
          icon={Envelope}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field
          label='Data de Nascimento'
          placeholder='DD/MM/AAAA'
          icon={CalendarBlank}
          value={birthDate}
          onChangeText={setBirthDate}
        />
        <Field
          label='Senha'
          placeholder='Digite sua senha'
          isPassword
          value={password}
          onChangeText={setPassword}
        />
        <Field
          label='Confirmar Senha'
          placeholder='Confirme sua senha'
          isPassword
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button
          onPress={register}
          disabled={loading}
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </ScrollView>
    </ImageBackground>
  )
}
