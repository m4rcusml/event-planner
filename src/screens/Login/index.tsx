import { Image, ImageBackground, ScrollView, View } from 'react-native'
import { MyText } from '@/components/MyText'
import { styles } from './styles'

import BgImg from '@/assets/bg.png'
import Logo from '@/assets/logo.png'
import { Field } from '@/components/Field'
import { Envelope, FacebookLogo, GoogleLogo, LinkedinLogo, XLogo } from 'phosphor-react-native'
import { Button } from '@/components/Button'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/routes/stack.routes'
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'
import { useGoogleAuth } from '@/services/auth'

export function Login() {
  const { navigate } = useNavigation<NavigationProp<RootStackParamList>>();
  const { signIn, user } = useGoogleAuth();

  const auth = getAuth()

  function forgotPassword() {
    navigate('ForgotPassword')
  }

  function register() {
    navigate('Register')
  }

  function login() {
    signInWithEmailAndPassword(auth, 'email', 'password')
      .then(() => {
        navigate('Home')
      })
      .catch(() => {
        alert('Erro ao logar')
      })
  }

  function loginWithGoogle() {
    signIn()
      .then(() => {
        navigate('Home')
      })
      .catch(() => {
        alert('Erro ao logar com Google')
      })
  }

  function loginWithFacebook() {
    const provider = new FacebookAuthProvider()
    signInWithPopup(auth, provider)
      .then(() => {
        navigate('Home')
      })
      .catch(() => {
        alert('Erro ao logar com Facebook')
      })
  }

  function loginWithX() {
    navigate('Home')
  }

  function loginWithLinkedin() {
    navigate('Home')
  }

  return (
    <ImageBackground source={BgImg} style={styles.container}>
      <View style={styles.bgHeader}>
        <Image
          source={Logo}
          style={styles.logo}
        />
      </View>

      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant='h1'>Login</MyText>
        <Field
          label='Email'
          placeholder='Digite seu email'
          icon={Envelope}
        />
        <Field
          label='Senha'
          placeholder='Digite sua senha'
          isPassword
        />

        <MyText style={styles.forgot} onPress={forgotPassword}>Esqueci minha senha</MyText>

        <Button onPress={login}>Entrar</Button>

        <MyText style={styles.or}>
          Ou acesse com
        </MyText>

        <View style={styles.socialLogin}>
          <Button backgroundColor='white' squared onPress={loginWithGoogle}>
            <GoogleLogo weight='fill' color='red' />
          </Button>
          <Button backgroundColor='white' squared onPress={loginWithFacebook}>
            <FacebookLogo weight='fill' color='blue' />
          </Button>
          <Button backgroundColor='white' squared onPress={loginWithX}>
            <XLogo />
          </Button>
          <Button backgroundColor='white' squared onPress={loginWithLinkedin}>
            <LinkedinLogo weight='fill' color='blue' />
          </Button>
        </View>

        <MyText style={styles.register}>
          Não tem conta? <MyText onPress={register} variant='button'>Cadastre-se</MyText>
        </MyText>
      </ScrollView>
    </ImageBackground>
  )
}

