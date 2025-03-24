import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth } from './firebaseConfig';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '956379056954-mqv2dml9jpjtoaol1japngks2ol0v4mj.apps.googleusercontent.com',
    androidClientId: '956379056954-5jft7a847p8vdmqn74vs4e2mqbo5coao.apps.googleusercontent.com',
    // iosClientId: 'SEU_IOS_CLIENT_ID',
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          setUser(userCredential.user);
        })
        .catch((error) => console.error(error));
    }
  }, [response]);

  return { user, signIn: () => promptAsync() };
}
