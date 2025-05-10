import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  Pressable,
  Alert,
} from 'react-native';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { CalendarBlank, Camera, EnvelopeSimple, PencilSimpleLine, UserCircle } from 'phosphor-react-native';
import { useAuth } from '@/contexts/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import { updateEmail } from 'firebase/auth';

export function Profile() {
  const { signOut, userData, user, handleAddUserToLocalStorage } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState('');

  async function saveData() {
    try {
      setLoading(true);
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        fullName: name,
        email: email,
        birthDate: birthday,
      });

      // Update auth email if changed
      if (email !== userData.email) {
        await updateEmail(user, email);
      }

      await handleAddUserToLocalStorage(user, {
        fullName: name,
        email: email,
        birthDate: birthday,
      });
      
      Alert.alert("Sucesso", "Perfil atualizado com sucesso");
    } catch (error) {
      console.error("Error updating profile: ", error);
      Alert.alert("Erro", "Não foi possível atualizar o perfil");
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    setName(userData.fullName);
    setEmail(userData.email);
    setBirthday(userData.birthDate);
  }, []);
  
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/bg.png')}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 }}>
          <View style={styles.contentContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: '8%' }}>
              <Pressable>
                <UserCircle size={128} color="gray" weight='fill' />
                <View style={{
                  alignItems: 'center',
                  backgroundColor: '#D7592E',
                  borderRadius: 50,
                  padding: 6,
                  position: 'absolute',
                  bottom: 0,
                  right: 10
                }}>
                  <Camera size={26} color="white" />
                </View>
              </Pressable>
              <MyText variant='h3'>{name?.split(' ')[0] && name?.split(' ')[1] ? `${name.split(' ')[0]} ${name.split(' ')[1][0]}.` : 'Usuário'}</MyText>
            </View>

            <MyText variant='h4' color='darkerPrimary'>Informações pessoais</MyText>

            <Field
              label='Nome'
              placeholder={'Digite seu nome'}
              icon={PencilSimpleLine}
              value={name}
              onChangeText={setName}
            />
            <Field
              label='Email'
              placeholder={'Digite seu email'}
              icon={EnvelopeSimple}
              value={email}
              onChangeText={setEmail}
            />
            <Field
              label='Data de nascimento'
              placeholder={'DD/MM/AAAA'}
              icon={CalendarBlank}
              value={birthday}
              onChangeText={setBirthday}
            />
            <Button onPress={saveData} disabled={loading}>Salvar</Button>
            <Button onPress={signOut} disabled={loading}>Sair</Button>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
