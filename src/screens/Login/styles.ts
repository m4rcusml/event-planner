import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgHeader: {
    backgroundColor: '#fffc',
    height: '40%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 7
  },
  logo: {
    marginTop: 100,
    alignSelf: 'center'
  },
  form: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    width: '80%',
    maxHeight: '58%',
    borderRadius: 20,
    marginTop: '-10%',
    position: 'relative',
    elevation: 8,
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  formContent: {
    gap: 15
  },
  forgot: {
    alignSelf: 'flex-end'
  },
  or: {
    alignSelf: 'center',
  },
  socialLogin: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center'
  },
  register: {
    alignSelf: 'center'
  }
});