import { useState } from 'react'
import { ImageBackground, ScrollView, View, Image } from 'react-native'
import { styles } from './styles'

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/routes/stack.routes'

import { MyText } from '@/components/MyText'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'

import { CalendarBlank, Envelope, User } from 'phosphor-react-native'

import BgImg from '@/assets/bg.png'
import Checked from '@/assets/checked.png'

export function Register() {
  const { navigate, goBack } = useNavigation<NavigationProp<RootStackParamList>>();
  const [isRegistered, setIsRegistered] = useState(false);

  function register() {
    setIsRegistered(true)
  }

  function login() {
    goBack()
  }

  if (isRegistered) {
    return (
      <ImageBackground source={BgImg} style={styles.container}>
        <View style={styles.finish}>
          <Image source={Checked} />
          <MyText variant='h2' color='darkerPrimary' align='center'>Cadastro concluído com sucesso!</MyText>
          <Button onPress={login}>Prosseguir</Button>
        </View>
      </ImageBackground>
    )
  }
  
  return (
    <ImageBackground source={BgImg} style={styles.container}>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant='h1'>Cadastro</MyText>
        <MyText variant='subtitle1'>Vamos criar seu cadastro. Precisamos apenas de algumas informações:</MyText>
        <Field
          label='Nome Completo'
          placeholder='Digite seu nome completo'
          icon={User}
        />
        <Field
          label='Email'
          placeholder='Digite seu email'
          icon={Envelope}
        />
        <Field
          label='Data de Nascimento'
          placeholder='DD/MM/AAAA'
          icon={CalendarBlank}
        />
        <Field
          label='Senha'
          placeholder='Digite sua senha'
          isPassword
        />
        <Field
          label='Confirmar Senha'
          placeholder='Confirme sua senha'
          isPassword
        />

        <Button onPress={register}>Cadastrar</Button>
      </ScrollView>
    </ImageBackground>
  )
}
