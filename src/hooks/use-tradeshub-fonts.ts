import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts as useInterFonts,
} from '@expo-google-fonts/inter';

import {
    Manrope_700Bold,
    Manrope_800ExtraBold,
    useFonts as useManropeFonts,
} from '@expo-google-fonts/manrope';

export function useTradesHubFonts() {
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [manropeLoaded, manropeError] = useManropeFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  return {
    loaded: interLoaded && manropeLoaded,
    error: interError || manropeError || null,
  };
}