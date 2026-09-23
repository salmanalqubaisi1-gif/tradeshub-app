import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Whether the current session is allowed to persist to disk. Defaults to
// true (normal behavior). The sign-in screen's "Remember me" checkbox turns
// this off for the duration of a session so an unchecked sign-in never
// survives a real app restart - the session still lives in GoTrueClient's
// in-memory state either way, so the user stays signed in for the rest of
// the current run. Sign-up and password recovery always set this back to
// true before establishing their own session, so an earlier "Remember me
// off" choice never leaks into an unrelated flow.
let sessionPersistenceEnabled = true;

export function setSessionPersistence(enabled: boolean) {
  sessionPersistenceEnabled = enabled;
}

const rememberMeAwareStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
  setItem: (key: string, value: string) =>
    sessionPersistenceEnabled
      ? AsyncStorage.setItem(key, value)
      : Promise.resolve(),
};

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: rememberMeAwareStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);