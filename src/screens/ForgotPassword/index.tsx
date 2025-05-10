import { useState, useRef } from 'react'
import { ImageBackground, ScrollView, View, Image, TextInput } from 'react-native'
import { styles } from './styles'

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { RootStackParamList } from '@/routes/stack.routes'

import { MyText } from '@/components/MyText'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'

import { Envelope } from 'phosphor-react-native'

import BgImg from '@/assets/bg.png'
import Checked from '@/assets/checked.png'
import Locker from '@/assets/locker.png'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/firebaseConfig'

export function ForgotPassword() {
  const codeInputRefs = Array.from({ length: 5 }, () => useRef<TextInput>(null));
  const { goBack } = useNavigation<NavigationProp<RootStackParamList>>();
  const [isFinished, setIsFinished] = useState(false);
  const [email, setEmail] = useState('');

  async function finish() {
    try {
      if(!email) return

      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error sending reset email:', error);
    }
    setIsFinished(true)
  }

  function login() {
    goBack()
  }

  // function sendCode() {
  //   setIsCodeSent(true)
  // }

  // function resendCode() {
  //   setIsCodeSent(false)
  // }

  // const handleInputChange = (text: string, index: number) => {
  //   if (text.length === 1 && index < codeInputRefs.length - 1) {
  //     codeInputRefs[index + 1]?.current?.focus();
  //   }
  // };

  if (isFinished) {
    return (
      <ImageBackground source={BgImg} style={styles.container}>
        <View style={styles.finish}>
          <Image source={Checked} />
          <MyText variant='h2' color='darkerPrimary' align='center'>Email de redefinição de senha enviado com sucesso!</MyText>
          <Button onPress={login}>Prosseguir</Button>
        </View>
      </ImageBackground>
    )
  }

  // if (isCodeSent) {
  //   return (
  //     <ImageBackground source={BgImg} style={styles.container}>
  //       <View style={[styles.form, { justifyContent: 'space-between' }]}>
  //         <View>
  //           <MyText variant='h1'>Redefinir senha</MyText>
  //           <MyText variant='body1'>Enviamos o código para o email informado, verifique.</MyText>
  //         </View>

  //         <View style={{ gap: 15 }}>
  //           <MyText variant='body2' color='darkerPrimary'>Digite o código recebido:</MyText>
  //           <View style={styles.codeInput}>
  //             {Array.from({ length: 5 }, (_, index) => (
  //               <TextInput
  //                 key={index}
  //                 ref={codeInputRefs[index]}
  //                 style={styles.codeInputField}
  //                 keyboardType='numeric'
  //                 maxLength={1}
  //                 onChangeText={(text) => handleInputChange(text, index)}
  //               />
  //             ))}
  //           </View>
  //         </View>

  //         <View>
  //           <MyText>Não recebeu o código?</MyText>
  //           <MyText variant='button' onPress={resendCode}>Reenviar</MyText>
  //         </View>

  //         <Button onPress={finish}>Prosseguir</Button>
  //       </View>
  //       <Image source={Locker} style={styles.locker} />
  //     </ImageBackground>
  //   )
  // }

  return (
    <ImageBackground source={BgImg} style={styles.container}>
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
        <MyText variant='h1'>Redefinir senha</MyText>
        <MyText variant='subtitle1'>Informe seu email e enviaremos um link para redefinir sua senha neste email</MyText>
        <Field
          label='Email'
          placeholder='Digite seu email'
          icon={Envelope}
          value={email}
          onChangeText={setEmail}
          autoCapitalize='none'
        />

        <Button onPress={finish}>Enviar código</Button>
      </ScrollView>
      <Image source={Locker} style={styles.locker} />
    </ImageBackground>
  )
}
