import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Brand,
  FontFamily,
  Radius,
  Spacing,
  Surfaces,
} from '@/constants/theme';
import { setSessionPersistence, supabase } from '../lib/supabase';

// Completes the browser auth session on web; a documented no-op on native.
WebBrowser.maybeCompleteAuthSession();

// Public, non-secret flag - only shows the button once Google OAuth is
// actually configured in the Supabase dashboard and Google Cloud Console.
// Set EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true in .env once that's done.
const GOOGLE_AUTH_ENABLED =
  process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

type TradesHubRole =
  | 'tradesperson'
  | 'contractor'
  | 'supplier'
  | 'homeowner';

type SignupMetadata = {
  selected_roles?: unknown;
  primary_role?: unknown;
};

const VALID_ROLES: TradesHubRole[] = [
  'tradesperson',
  'contractor',
  'supplier',
  'homeowner',
];

function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
}

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  const normalizedEmail = email.trim().toLowerCase();

  const formComplete = looksLikeEmail(normalizedEmail) && password.length > 0;

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        if (data.session) {
          router.replace('/home');
          return;
        }

        setCheckingSession(false);
      })
      .catch((error) => {
        console.error('Session restore error:', error);

        if (isMounted) {
          setCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    try {
      const savedEmail = window.localStorage.getItem('tradeshub_remembered_email');

      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.warn('Could not load remembered email:', error);
    }
  }, []);

  async function syncSignupRoles(userId: string, metadata: SignupMetadata) {
    const metadataRoles: TradesHubRole[] = Array.isArray(metadata?.selected_roles)
      ? metadata.selected_roles.filter(
          (role: unknown): role is TradesHubRole =>
            VALID_ROLES.includes(role as TradesHubRole)
        )
      : [];

    if (metadataRoles.length === 0) {
      return;
    }

    const metadataPrimary = VALID_ROLES.includes(metadata?.primary_role as TradesHubRole)
      ? (metadata.primary_role as TradesHubRole)
      : metadataRoles[0];

    const { data: existingRoles, error: existingError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (existingError) {
      throw existingError;
    }

    if ((existingRoles || []).length > 0) {
      return;
    }

    const rows = metadataRoles.map((role) => ({
      user_id: userId,
      role,
      is_primary: role === metadataPrimary,
    }));

    const { error: insertError } = await supabase.from('user_roles').insert(rows);

    if (insertError) {
      throw insertError;
    }
  }

  function updateRememberedEmail() {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    try {
      if (rememberMe) {
        window.localStorage.setItem('tradeshub_remembered_email', normalizedEmail);
      } else {
        window.localStorage.removeItem('tradeshub_remembered_email');
      }
    } catch (error) {
      console.warn('Could not update remembered email:', error);
    }
  }

  function clearPersistedWebSession() {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    try {
      Object.keys(window.localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          window.localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Could not clear persisted session:', error);
    }
  }

  async function handleForgotPassword() {
    setMessage('');

    if (!normalizedEmail) {
      setMessage('Enter your email first, then choose Forgot password.');
      return;
    }

    if (!looksLikeEmail(normalizedEmail)) {
      setMessage('Enter a valid email address first.');
      return;
    }

    try {
      setResetLoading(true);

      const redirectTo =
        Platform.OS === 'web' && typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        redirectTo ? { redirectTo } : undefined
      );

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage('Password reset email sent. Check your inbox for the reset link.');
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage('Could not send the reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  }

  async function handleSignIn() {
    setMessage('');

    if (!normalizedEmail || !password) {
      setMessage('Enter your email and password.');
      return;
    }

    if (!looksLikeEmail(normalizedEmail)) {
      setMessage('Enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      setSessionPersistence(rememberMe);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      updateRememberedEmail();

      if (!rememberMe) {
        clearPersistedWebSession();
      }

      if (data.user) {
        try {
          await syncSignupRoles(data.user.id, data.user.user_metadata as SignupMetadata);
        } catch (roleError) {
          console.error('Role sync error:', roleError);
          setMessage(
            'Signed in, but Trades Hub could not finish your role setup. Please try again.'
          );
          return;
        }
      }

      router.replace('/home');
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setMessage('');

    try {
      setGoogleLoading(true);
      // Google sign-in has no "Remember me" checkbox of its own - behave
      // like a normal checked sign-in and persist the session.
      setSessionPersistence(true);

      const redirectTo = Linking.createURL('auth/callback');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data?.url) {
        setMessage('Google sign-in is not available right now.');
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === 'cancel' || result.type === 'dismiss') {
        // User backed out of the Google flow - not an error.
        return;
      }

      if (result.type !== 'success' || !result.url) {
        setMessage('Could not complete Google sign-in. Please try again.');
        return;
      }

      const callbackUrl = new URL(result.url);
      const oauthError =
        callbackUrl.searchParams.get('error_description') ||
        callbackUrl.searchParams.get('error');

      if (oauthError) {
        setMessage(oauthError);
        return;
      }

      const code = callbackUrl.searchParams.get('code');

      if (!code) {
        setMessage('Google sign-in did not return a valid code.');
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setMessage(exchangeError.message);
        return;
      }

      router.replace('/home');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setMessage('Could not sign in with Google. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <View style={styles.sessionCheckContainer}>
        <ActivityIndicator size="large" color={Brand.gold500} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground
        source={require('../../assets/images/trades-hub-login-welding.jpg')}
        style={styles.pageBackground}
        imageStyle={styles.pageBackgroundImage}
        resizeMode="cover"
      >
        <View style={styles.pageOverlay} />
        <View style={styles.leftShade} />
        <View style={styles.rightShade} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            <View style={styles.brandSide}>
              <Image
                source={require('../../assets/images/trades-hub-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />

              <View style={styles.goldRule} />

              <Text style={styles.heroEyebrow}>
                THE SKILLED TRADES. ONE PLATFORM.
              </Text>

              <Text style={styles.heroTitle}>
                Built for the trades.
              </Text>

              <Text style={styles.heroSubtitle}>
                Track your career. Find work. Hire skilled people.
                Discover tools and opportunities.
              </Text>

              <View style={styles.featurePills}>
                <View style={styles.featurePill}>
                  <Ionicons
                    name="construct-outline"
                    size={15}
                    color={Brand.gold500}
                  />
                  <Text style={styles.featurePillText}>CAREER</Text>
                </View>

                <View style={styles.featurePill}>
                  <Ionicons
                    name="briefcase-outline"
                    size={15}
                    color={Brand.gold500}
                  />
                  <Text style={styles.featurePillText}>JOBS</Text>
                </View>

                <View style={styles.featurePill}>
                  <Ionicons
                    name="storefront-outline"
                    size={15}
                    color={Brand.gold500}
                  />
                  <Text style={styles.featurePillText}>MARKETPLACE</Text>
                </View>
              </View>
            </View>

            <View style={styles.formPanel}>
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formEyebrow}>WELCOME BACK</Text>
                  <Text style={styles.formTitle}>Sign in</Text>
                  <Text style={styles.formSubtitle}>
                    Access your Trades Hub workspace.
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Email</Text>
                <View style={styles.inputShell}>
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color={Brand.textMuted}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={Brand.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      if (message) setMessage('');
                    }}
                    autoComplete="email"
                    textContentType="username"
                    importantForAutofill="yes"
                  />
                </View>

                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputShell}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={Brand.textMuted}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={Brand.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (message) setMessage('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    textContentType="password"
                    importantForAutofill="yes"
                    onSubmitEditing={handleSignIn}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() =>
                      setShowPassword((current) => !current)
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={20}
                      color={Brand.gold500}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.loginOptionsRow}>
                  <TouchableOpacity
                    style={styles.rememberRow}
                    onPress={() =>
                      setRememberMe((current) => !current)
                    }
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        rememberMe && styles.checkboxChecked,
                      ]}
                    >
                      {rememberMe ? (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={Brand.navy900}
                        />
                      ) : null}
                    </View>

                    <Text style={styles.rememberText}>
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={resetLoading}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.forgotPasswordText}>
                      {resetLoading
                        ? 'Sending...'
                        : 'Forgot password?'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {message ? (
                  <View
                    style={[
                      styles.messageBox,
                      message.startsWith('Password reset email sent') &&
                        styles.successMessageBox,
                    ]}
                  >
                    <Ionicons
                      name={
                        message.startsWith('Password reset email sent')
                          ? 'checkmark-circle-outline'
                          : 'alert-circle-outline'
                      }
                      size={17}
                      color={
                        message.startsWith('Password reset email sent')
                          ? Brand.success
                          : Brand.danger
                      }
                    />
                    <Text
                      style={[
                        styles.errorMessage,
                        message.startsWith('Password reset email sent') &&
                          styles.successMessageText,
                      ]}
                    >
                      {message}
                    </Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    (!formComplete || loading) &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSignIn}
                  disabled={!formComplete || loading}
                  activeOpacity={0.88}
                >
                  {loading ? (
                    <ActivityIndicator color={Brand.navy900} />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>
                        SIGN IN
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={17}
                        color={Brand.navy900}
                      />
                    </>
                  )}
                </TouchableOpacity>

                {GOOGLE_AUTH_ENABLED ? (
                  <>
                    <View style={styles.orDividerRow}>
                      <View style={styles.separatorLine} />
                      <Text style={styles.separatorText}>OR</Text>
                      <View style={styles.separatorLine} />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.googleButton,
                        googleLoading && styles.disabledButton,
                      ]}
                      onPress={handleGoogleSignIn}
                      disabled={googleLoading}
                      activeOpacity={0.88}
                    >
                      {googleLoading ? (
                        <ActivityIndicator color={Brand.white} />
                      ) : (
                        <>
                          <Ionicons
                            name="logo-google"
                            size={18}
                            color={Brand.white}
                          />
                          <Text style={styles.googleButtonText}>
                            Continue with Google
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </>
                ) : null}

                <View style={styles.separatorRow}>
                  <View style={styles.separatorLine} />
                  <Text style={styles.separatorText}>
                    NEW TO TRADES HUB?
                  </Text>
                  <View style={styles.separatorLine} />
                </View>

                <TouchableOpacity
                  style={styles.createAccountButton}
                  onPress={() => router.push('/signup')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.createAccountText}>
                    CREATE ACCOUNT
                  </Text>
                </TouchableOpacity>

                <View style={styles.securityRow}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={14}
                    color={Brand.textMuted}
                  />
                  <Text style={styles.securityNote}>
                    One account can hold multiple Trades Hub roles.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Brand.navy950,
  },

  sessionCheckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.navy950,
  },

  pageBackground: {
    flex: 1,
    backgroundColor: Brand.navy950,
  },

  pageBackgroundImage: {
    opacity: 1,
    transform:
      Platform.OS === 'web'
        ? [{ scale: 1.06 }, { translateX: 52 }, { translateY: 110 }]
        : [{ scale: 1.02 }, { translateY: 24 }],
  },

  pageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 14, 25, 0.84)',
  },

  leftShade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: Platform.OS === 'web' ? '58%' : '100%',
    backgroundColor: 'rgba(7, 23, 38, 0.16)',
  },

  rightShade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: Platform.OS === 'web' ? '44%' : '100%',
    backgroundColor:
      Platform.OS === 'web'
        ? 'rgba(3, 11, 20, 0.36)'
        : 'rgba(3, 11, 20, 0.10)',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'web' ? 28 : Spacing.five,
    paddingVertical: Platform.OS === 'web' ? 40 : Spacing.six,
  },

  shell: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1440 : 1240,
    minHeight: Platform.OS === 'web' ? 680 : undefined,
    alignSelf: 'center',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Platform.OS === 'web' ? 48 : 28,
  },

  brandSide: {
    flex: 1,
    width: '100%',
    maxWidth: 660,
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },

  logoImage: {
    width: Platform.OS === 'web' ? 300 : 240,
    maxWidth: '100%',
    height: Platform.OS === 'web' ? 94 : 76,
    marginBottom: Platform.OS === 'web' ? 34 : 24,
  },

  goldRule: {
    width: 54,
    height: 3,
    borderRadius: 999,
    backgroundColor: Brand.gold500,
    marginBottom: 18,
  },

  heroEyebrow: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: Platform.OS === 'web' ? 12 : 10,
    letterSpacing: 1.6,
    marginBottom: 12,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },

  heroTitle: {
    color: Brand.white,
    fontFamily: FontFamily.display,
    fontSize: Platform.OS === 'web' ? 56 : 38,
    lineHeight: Platform.OS === 'web' ? 62 : 44,
    letterSpacing: -1.1,
    marginBottom: 16,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },

  heroSubtitle: {
    color: 'rgba(241, 245, 249, 0.90)',
    fontFamily: FontFamily.body,
    fontSize: Platform.OS === 'web' ? 18 : 15,
    lineHeight: Platform.OS === 'web' ? 29 : 23,
    maxWidth: 535,
    marginBottom: 28,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },

  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'center',
  },

  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(210, 185, 91, 0.30)',
    backgroundColor: 'rgba(8, 24, 39, 0.56)',
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },

  featurePillText: {
    color: 'rgba(241, 245, 249, 0.90)',
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.9,
  },

  formPanel: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    alignSelf: 'center',
    marginLeft: 'auto',
  },

  formCard: {
    width: '100%',
    backgroundColor: 'rgba(12, 24, 37, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    paddingHorizontal: Platform.OS === 'web' ? 30 : 20,
    paddingVertical: Platform.OS === 'web' ? 30 : 22,
    shadowColor: '#000',
    shadowOpacity: 0.30,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },

  formHeader: {
    marginBottom: 24,
  },

  formEyebrow: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 8,
  },

  formTitle: {
    color: Brand.white,
    fontFamily: FontFamily.heading,
    fontSize: 30,
    lineHeight: 36,
    marginBottom: 7,
  },

  formSubtitle: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 13,
    lineHeight: 20,
  },

  inputLabel: {
    color: Brand.textSecondary,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    marginBottom: 8,
  },

  inputShell: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(18, 34, 50, 0.92)',
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    color: Brand.white,
    fontFamily: FontFamily.body,
    fontSize: 14,
    paddingVertical: 14,
    outlineStyle: 'none' as any,
  },

  eyeButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: -2,
    marginBottom: 18,
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    backgroundColor: Surfaces.input,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxChecked: {
    backgroundColor: Brand.gold500,
    borderColor: Brand.gold500,
  },

  rememberText: {
    color: Brand.textSecondary,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
  },

  forgotPasswordText: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
  },

  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(229, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(229, 107, 107, 0.25)',
    borderRadius: Radius.sm,
    padding: 11,
    marginBottom: 15,
  },

  errorMessage: {
    flex: 1,
    color: '#F19A9A',
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 17,
  },

  successMessageBox: {
    backgroundColor: 'rgba(98, 183, 122, 0.08)',
    borderColor: 'rgba(98, 183, 122, 0.25)',
  },

  successMessageText: {
    color: '#8FD3A2',
  },

  primaryButton: {
    minHeight: 54,
    backgroundColor: Brand.gold500,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },

  disabledButton: {
    opacity: 0.42,
  },

  primaryButtonText: {
    color: Brand.navy900,
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
  },

  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 20,
  },

  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Brand.border,
  },

  separatorText: {
    color: Brand.textMuted,
    fontFamily: FontFamily.bodyBold,
    fontSize: 9,
    letterSpacing: 0.9,
  },

  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },

  googleButton: {
    minHeight: 54,
    marginTop: 14,
    backgroundColor: '#111F2E',
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },

  googleButtonText: {
    color: Brand.white,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 13,
  },

  createAccountButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: Brand.gold500,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  createAccountText: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.8,
  },

  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },

  securityNote: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
});
