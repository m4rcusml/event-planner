import { useState } from 'react';
import { TextInput, View, TouchableOpacity } from 'react-native';
import { IconProps, Eye, EyeSlash } from 'phosphor-react-native';
import { MyText } from '../MyText';
import { styles } from './styles';

type Props = {
  label: string;
  placeholder?: string;
  isPassword?: boolean;
  icon?(props: IconProps): React.ReactElement;
}

export function Field({ label, isPassword, placeholder, icon }: Props) {
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(prev => !prev);
  };

  return (
    <View style={styles.container}>
      <MyText variant='body1'>{label}</MyText>
      <View style={styles.input}>
        <TextInput
          style={styles.inputText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={'#BEBEBE'}
        />
        {icon && icon({ size: 22, color: '#FF914D', style: styles.icon })}
        {isPassword && (
          <TouchableOpacity onPress={toggleSecureTextEntry}>
            {secureTextEntry ? (
              <EyeSlash size={22} color='#FF914D' style={styles.icon} />
            ) : (
              <Eye size={22} color='#FF914D' style={styles.icon} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}
