import { MyText } from '@/components/MyText';
import { View } from 'react-native';

export function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <MyText>Home</MyText>
    </View>
  )
}