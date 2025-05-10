// utils/sendEmail.ts
import { Event } from '@/@types/events';
import emailjs from '@emailjs/react-native';
import { Timestamp } from 'firebase/firestore';

export const sendEmail = async (name: string, email: string, event: Event) => {
  if (!email || !email.includes('@')) {
    console.error('Invalid email address');
    return false;
  }

  try {
    const result = await emailjs.send(
      'service_uagt56i',      // ex: 'service_abc123'
      'template_sbvyr69',     // ex: 'template_xyz456'
      {
        to_name: name,
        email,
        message: 'Você foi convidado para participar de um evento!',
        name,
        event: event.title,
        date: (event.date as Timestamp).toDate().toLocaleDateString('pt-BR'),
        local: event.local
      },
      {
        publicKey: 'UVIOD7wzse_9o2hmG',       // ex: 'user_abcXYZ123'
      }
    );
    console.log('Email enviado com sucesso:', result.text);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};
