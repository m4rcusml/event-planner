import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  ImageBackground,
  Pressable,
} from 'react-native';
import { styles } from './styles';
import { MyText } from '@/components/MyText';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { CalendarBlank, Camera, EnvelopeSimple, PencilSimpleLine, UserCircle } from 'phosphor-react-native';

export function Profile() {
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
              <MyText variant='h3'>Usuário</MyText>
            </View>

            <MyText variant='h4' color='darkerPrimary'>Informações pessoais</MyText>

            <Field
              label='Nome'
              placeholder={'Digite seu nome'}
              icon={PencilSimpleLine}
            />
            <Field
              label='Email'
              placeholder={'Digite seu email'}
              icon={EnvelopeSimple}
            />
            <Field
              label='Data de nascimento'
              placeholder={'DD/MM/AAAA'}
              icon={CalendarBlank}
            />
            <Field
              label='Senha'
              placeholder={'Digite sua senha'}
              isPassword={true}
            />
            <Button>Salvar</Button>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
