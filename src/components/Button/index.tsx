import { TouchableOpacity } from 'react-native';
import { styles } from './styles';
import { MyText } from '../MyText';

type Props = {
  onPress?(): void;
  children: React.ReactNode;
  squared?: boolean;
  backgroundColor?: string;
}

export function Button({ children, onPress, squared, backgroundColor = '#FF914D' }: Props) {
  const isString = typeof children === 'string';
  const containerStyle = [styles.container, { backgroundColor }];
  const squaredStyle = [styles.squared, { backgroundColor }];
  const textColor = ['white', '#fff', '#ffffff'].includes(backgroundColor.toLowerCase()) ? 'black' : 'white';

  return (
    <TouchableOpacity style={squared ? squaredStyle : containerStyle} onPress={onPress}>
      {isString ? <MyText color={textColor} variant='button'>{children}</MyText> : children}
    </TouchableOpacity>
  )
}
