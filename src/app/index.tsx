import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  FontSize,
  Layout,
  Radius,
  Spacing,
  Surfaces,
} from '@/constants/theme';
import { supabase } from '../lib/supabase';

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
  const [message, setMessage] = useState('');

  const normalizedEmail = email.trim().toLowerCase();

  const formComplete =
    looksLikeEmail(normalizedEmail) &&
    password.length > 0;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    try {
      const savedEmail = window.localStorage.getItem(
        'tradeshub_remembered_email'
      );

      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.warn('Could not load remembered email:', error);
    }
  }, []);

  async function syncSignupRoles(
    userId: string,
    metadata: SignupMetadata
  ) {
    const metadataRoles: TradesHubRole[] = Array.isArray(
      metadata?.selected_roles
    )
      ? metadata.selected_roles.filter(
          (role: unknown): role is TradesHubRole =>
            VALID_ROLES.includes(role as TradesHubRole)
        )
      : [];

    if (metadataRoles.length === 0) {
      return;
    }

    const metadataPrimary = VALID_ROLES.includes(
      metadata?.primary_role as TradesHubRole
    )
      ? (metadata.primary_role as TradesHubRole)
      : metadataRoles[0];

    const { data: existingRoles, error: existingError } =
      await supabase
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

    const { error: insertError } = await supabase
      .from('user_roles')
      .insert(rows);

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
        window.localStorage.setItem(
          'tradeshub_remembered_email',
          normalizedEmail
        );
      } else {
        window.localStorage.removeItem(
          'tradeshub_remembered_email'
        );
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
        if (
          key.startsWith('sb-') &&
          key.includes('auth-token')
        ) {
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

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          redirectTo ? { redirectTo } : undefined
        );

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        'Password reset email sent. Check your inbox for the reset link.'
      );
    } catch (error) {
      console.error('Forgot password error:', error);
      setMessage(
        'Could not send the reset email. Please try again.'
      );
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

      const { data, error } =
        await supabase.auth.signInWithPassword({
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
          await syncSignupRoles(
            data.user.id,
            data.user.user_metadata as SignupMetadata
          );
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

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.backdropGlowOne} />
      <View style={styles.backdropGlowTwo} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shell}>
          <View style={styles.brandSide}>
            <Image
              source={require('../../assets/images/trades-hub-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            <Text style={styles.eyebrow}>
              THE COMPLETE TRADE ECOSYSTEM
            </Text>

            <Text style={styles.heroTitle}>
              Built for the trades.
            </Text>

            <Text style={styles.heroSubtitle}>
              One account for your career, hiring, tools and projects.
            </Text>

            <View style={styles.brandRule} />

            <View style={styles.brandPoint}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={Brand.gold500}
              />
              <Text style={styles.brandPointText}>
                Career records, jobs, businesses and tools in one platform.
              </Text>
            </View>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formEyebrow}>
                WELCOME BACK
              </Text>
              <Text style={styles.formTitle}>
                Sign in to Trades Hub
              </Text>
              <Text style={styles.formSubtitle}>
                Use the account you created for your Trades Hub roles.
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

            <Text style={styles.securityNote}>
              Your account can hold multiple Trades Hub roles.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Brand.navy950,
    overflow: 'hidden',
  },

  backdropGlowOne: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    backgroundColor: 'rgba(77, 157, 224, 0.07)',
    top: -160,
    left: -180,
  },

  backdropGlowTwo: {
    position: 'absolute',
    width: 460,
    height: 460,
    borderRadius: 230,
    backgroundColor: 'rgba(210, 185, 91, 0.05)',
    bottom: -180,
    right: -120,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.eight,
  },

  shell: {
    width: '100%',
    maxWidth: Layout.maxContentWidth,
    alignSelf: 'center',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 64 : 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandSide: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
  },

  logoImage: {
    width: Platform.OS === 'web' ? 360 : 300,
    maxWidth: '100%',
    height: 104,
    marginBottom: 20,
  },

  eyebrow: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: FontSize.caption,
    letterSpacing: 1.4,
    marginBottom: 13,
  },

  heroTitle: {
    color: Brand.white,
    fontFamily: FontFamily.display,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.7,
    marginBottom: 12,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },

  heroSubtitle: {
    color: Brand.textSecondary,
    fontFamily: FontFamily.body,
    fontSize: 16,
    lineHeight: 25,
    maxWidth: 440,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },

  brandRule: {
    width: 56,
    height: 3,
    borderRadius: 999,
    backgroundColor: Brand.gold500,
    marginTop: 28,
    marginBottom: 18,
  },

  brandPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 430,
  },

  brandPointText: {
    flex: 1,
    color: Brand.textMuted,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
  },

  formCard: {
    width: '100%',
    maxWidth: Layout.authCardWidth,
    backgroundColor: 'rgba(21, 37, 54, 0.97)',
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radius.lg,
    padding: 28,
  },

  formHeader: {
    marginBottom: 24,
  },

  formEyebrow: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  formTitle: {
    color: Brand.white,
    fontFamily: FontFamily.heading,
    fontSize: 25,
    lineHeight: 31,
    marginBottom: 7,
  },

  formSubtitle: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },

  inputLabel: {
    color: Brand.textSecondary,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
    marginBottom: 7,
  },

  inputShell: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Surfaces.input,
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
    marginBottom: 16,
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
    minHeight: 52,
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
    letterSpacing: 0.7,
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

  createAccountButton: {
    minHeight: 50,
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
    letterSpacing: 0.7,
  },

  securityNote: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 15,
  },
});
