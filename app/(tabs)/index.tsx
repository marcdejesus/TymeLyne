import { TamaguiProvider, Text, View, styled } from 'tamagui'
import config from '../../tamagui.config'

import EditScreenInfo from '@/components/EditScreenInfo'

const Container = styled(View, {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
})

const Title = styled(Text, {
  fontSize: 20,
  fontWeight: 'bold',
})

const Separator = styled(View, {
  marginVertical: 30,
  height: 1,
  width: '80%',
  backgroundColor: '$color',
})

export default function TabTwoScreen() {
  return (
    <TamaguiProvider config={config}>
      <Container>
        <Title>Home</Title>
        <Separator />
        <EditScreenInfo path="app/(tabs)/index.tsx" />
      </Container>
    </TamaguiProvider>
  )
}