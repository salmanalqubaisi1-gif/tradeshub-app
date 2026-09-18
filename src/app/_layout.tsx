import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useTradesHubFonts } from '@/hooks/use-tradeshub-fonts';

export default function RootLayout() {
  const { loaded, error } = useTradesHubFonts();

  if (error) {
    console.error('Trades Hub font loading error:', error);
  }

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Brand.navy900,
        }}
      >
        <ActivityIndicator
          size="large"
          color={Brand.gold500}
        />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}