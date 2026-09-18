import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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
  Layout,
  Radius,
  Spacing,
  Surfaces,
} from '@/constants/theme';
import { supabase } from '../lib/supabase';

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

export default function ResetPasswordScreen() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const checks = useMemo(
    () => getPasswordChecks(password),
    [password]
  );

  const strongPassword = Object.values(checks).every(Boolean);

  const formComplete =
    strongPassword &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  async function handleResetPassword() {
    setMessage('');

    if (!strongPassword) {
      setMessage(
        'Your password must be at least 12 characters and include uppercase, lowercase, a number and a symbol.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setSuccess(true);
      setMessage(
        'Password updated. You can now sign in with your new password.'
      );
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage(
        'Could not update your password. Please request a new reset link and try again.'
      );
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
              ACCOUNT SECURITY
            </Text>

            <Text style={styles.heroTitle}>
              Set a new password.
            </Text>

            <Text style={styles.heroSubtitle}>
              Choose a strong password you have not used before.
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formEyebrow}>
              RESET PASSWORD
            </Text>

            <Text style={styles.formTitle}>
              Create your new password
            </Text>

            <Text style={styles.formSubtitle}>
              Trades Hub requires a strong password to protect your account.
            </Text>

            <Text style={styles.inputLabel}>New password</Text>

            <View style={styles.inputShell}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={Brand.textMuted}
              />

              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor={Brand.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setMessage('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
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

            <View style={styles.passwordChecklist}>
              <PasswordCheck
                label="12+ characters"
                passed={checks.length}
              />
              <PasswordCheck
                label="Uppercase letter"
                passed={checks.uppercase}
              />
              <PasswordCheck
                label="Lowercase letter"
                passed={checks.lowercase}
              />
              <PasswordCheck
                label="Number"
                passed={checks.number}
              />
              <PasswordCheck
                label="Symbol"
                passed={checks.symbol}
              />
            </View>

            <Text style={styles.inputLabel}>
              Confirm new password
            </Text>

            <View style={styles.inputShell}>
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={Brand.textMuted}
              />

              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                placeholderTextColor={Brand.textMuted}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(value) => {
                  setConfirmPassword(value);
                  setMessage('');
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                onSubmitEditing={handleResetPassword}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() =>
                  setShowConfirmPassword((current) => !current)
                }
              >
                <Ionicons
                  name={
                    showConfirmPassword
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={20}
                  color={Brand.gold500}
                />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 &&
            password !== confirmPassword ? (
              <Text style={styles.matchError}>
                Passwords do not match.
              </Text>
            ) : null}

            {message ? (
              <View
                style={[
                  styles.messageBox,
                  success && styles.successMessageBox,
                ]}
              >
                <Ionicons
                  name={
                    success
                      ? 'checkmark-circle-outline'
                      : 'alert-circle-outline'
                  }
                  size={17}
                  color={
                    success ? Brand.success : Brand.danger
                  }
                />

                <Text
                  style={[
                    styles.messageText,
                    success && styles.successMessageText,
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            {!success ? (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!formComplete || loading) &&
                    styles.disabledButton,
                ]}
                onPress={handleResetPassword}
                disabled={!formComplete || loading}
              >
                {loading ? (
                  <ActivityIndicator color={Brand.navy900} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      UPDATE PASSWORD
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={Brand.navy900}
                    />
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.replace('/')}
              >
                <Text style={styles.primaryButtonText}>
                  BACK TO SIGN IN
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function PasswordCheck({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <View style={styles.passwordCheckRow}>
      <Ionicons
        name={
          passed
            ? 'checkmark-circle'
            : 'ellipse-outline'
        }
        size={15}
        color={
          passed ? Brand.success : Brand.textMuted
        }
      />

      <Text
        style={[
          styles.passwordCheckText,
          passed && styles.passwordCheckTextPassed,
        ]}
      >
        {label}
      </Text>
    </View>
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
    flexDirection:
      Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 64 : 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandSide: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    alignItems:
      Platform.OS === 'web' ? 'flex-start' : 'center',
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
    fontSize: 10,
    letterSpacing: 1.3,
    marginBottom: 12,
  },

  heroTitle: {
    color: Brand.white,
    fontFamily: FontFamily.display,
    fontSize: 40,
    lineHeight: 46,
    letterSpacing: -0.6,
    marginBottom: 12,
    textAlign:
      Platform.OS === 'web' ? 'left' : 'center',
  },

  heroSubtitle: {
    color: Brand.textSecondary,
    fontFamily: FontFamily.body,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 430,
    textAlign:
      Platform.OS === 'web' ? 'left' : 'center',
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

  formEyebrow: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.1,
    marginBottom: 8,
  },

  formTitle: {
    color: Brand.white,
    fontFamily: FontFamily.heading,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 7,
  },

  formSubtitle: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 22,
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
    marginBottom: 12,
  },

  input: {
    flex: 1,
    color: Brand.white,
    fontFamily: FontFamily.body,
    fontSize: 14,
    paddingVertical: 14,
  },

  eyeButton: {
    minWidth: 36,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  passwordChecklist: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  passwordCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Brand.navy850,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  passwordCheckText: {
    color: Brand.textMuted,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 9,
  },

  passwordCheckTextPassed: {
    color: '#9BD4AA',
  },

  matchError: {
    color: '#F19A9A',
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
    marginTop: -3,
    marginBottom: 12,
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

  successMessageBox: {
    backgroundColor: 'rgba(98, 183, 122, 0.08)',
    borderColor: 'rgba(98, 183, 122, 0.25)',
  },

  messageText: {
    flex: 1,
    color: '#F19A9A',
    fontFamily: FontFamily.bodyMedium,
    fontSize: 11,
    lineHeight: 17,
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
});
