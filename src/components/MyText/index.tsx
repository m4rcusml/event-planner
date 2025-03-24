import { Text, TextStyle } from 'react-native';

type FontWeight = 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
type FontSize =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'button';
type Color = 'primary' | 'darkerPrimary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'white' | 'black';

const fontSizes: Record<FontSize, number> = {
  h1: 25,
  h2: 22,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  subtitle1: 16,
  subtitle2: 14,
  body1: 16,
  body2: 14,
  caption: 12,
  button: 16,
};

const fontWeights: Record<FontSize, FontWeight> = {
  h1: 'bold',
  h2: 'bold',
  h3: 'bold',
  h4: 'bold',
  h5: 'bold',
  h6: 'bold',
  subtitle1: 'normal',
  subtitle2: 'normal',
  body1: 'normal',
  body2: 'normal',
  caption: 'normal',
  button: 'bold',
};

const colors: Record<Color, string> = {
  primary: '#FF914D',
  darkerPrimary: '#9C462A',
  secondary: '#03dac6',
  error: '#b00020',
  warning: '#ffa700',
  info: '#2196f3',
  success: '#00e676',
  white: '#ffffff',
  black: '#000000',
};

type Props = {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: FontSize;
  color?: Color;
  align?: 'center' | 'left' | 'right';
  onPress?(): void;
};

export function MyText({ children, style, variant, color, onPress, align }: Props) {
  const fontSize = variant ? fontSizes[variant] : 16;
  const fontWeight = variant ? fontWeights[variant] : 'normal';
  const textStyle: TextStyle = {
    fontSize,
    fontWeight,
    textAlign: align,
    color: color ? colors[color] : colors['primary'],
    ...style,
  };

  return <Text style={textStyle} onPress={onPress}>{children}</Text>;
}
