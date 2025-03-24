import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#fff',
    elevation: 8,
    width: '80%',
    maxHeight: '80%',
    borderRadius: 20,
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginTop: '-5%'
  },
  finish: {
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 20,
    height: '100%',
    marginTop: '-5%',
    backgroundColor: '#fff',
    elevation: 8,
    width: '80%',
    maxHeight: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15
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