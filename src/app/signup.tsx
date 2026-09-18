import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  RoleColors,
  Spacing,
  Surfaces
} from '@/constants/theme';
import {
  ALBERTA_TRADES,
  getApprenticeshipLevels,
} from '../constants/trades';
import { supabase } from '../lib/supabase';

type TradesHubRole =
  | 'tradesperson'
  | 'contractor'
  | 'supplier'
  | 'homeowner';

type RoleOption = {
  id: TradesHubRole;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'tradesperson',
    title: 'Tradesperson / Apprentice',
    subtitle: 'Track your career, training, hours, credentials, jobs and tools.',
    icon: 'construct-outline',
    color: RoleColors.tradesperson,
  },
  {
    id: 'contractor',
    title: 'Contractor / Employer',
    subtitle: 'Hire skilled workers, post jobs and build your company presence.',
    icon: 'business-outline',
    color: RoleColors.contractor,
  },
  {
    id: 'supplier',
    title: 'Tool Shop / Supplier',
    subtitle: 'Sell tools, equipment, parts and inventory to tradespeople and contractors.',
    icon: 'storefront-outline',
    color: RoleColors.supplier,
  },
  {
    id: 'homeowner',
    title: 'Homeowner',
    subtitle: 'Find trusted tradespeople and manage service needs.',
    icon: 'home-outline',
    color: RoleColors.homeowner,
  },
];

const ALBERTA_CITIES = [
  'Edmonton',
  'Calgary',
  'Red Deer',
  'Lethbridge',
  'Medicine Hat',
  'Grande Prairie',
  'Fort McMurray',
  'Airdrie',
  'St. Albert',
  'Sherwood Park',
  'Spruce Grove',
  'Leduc',
  'Beaumont',
  'Fort Saskatchewan',
  'Camrose',
  'Wetaskiwin',
  'Lloydminster',
  'Okotoks',
  'Cochrane',
  'Chestermere',
  'Edson',
  'Hinton',
  'Drayton Valley',
  'Stony Plain',
  'Morinville',
  'Nisku',
  'Devon',
  'Calmar',
];

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
}

function getPasswordScore(password: string) {
  const checks = getPasswordChecks(password);
  return Object.values(checks).filter(Boolean).length;
}

function generateStrongPassword(length = 18) {
  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+=';
  const required = [
    'ABCDEFGHJKLMNPQRSTUVWXYZ',
    'abcdefghijkmnopqrstuvwxyz',
    '23456789',
    '!@#$%^&*_-+=',
  ];

  const randomIndex = (max: number) => {
    try {
      const cryptoObject = (globalThis as any).crypto;
      if (cryptoObject?.getRandomValues) {
        const buffer = new Uint32Array(1);
        cryptoObject.getRandomValues(buffer);
        return buffer[0] % max;
      }
    } catch {}

    return Math.floor(Math.random() * max);
  };

  const chars = required.map(
    (group) => group[randomIndex(group.length)]
  );

  while (chars.length < length) {
    chars.push(alphabet[randomIndex(alphabet.length)]);
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordChecks = useMemo(
    () => getPasswordChecks(password),
    [password]
  );
  const passwordScore = useMemo(
    () => getPasswordScore(password),
    [password]
  );
  const passwordStrong =
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.lower &&
    passwordChecks.number &&
    passwordChecks.symbol;

  const [selectedRoles, setSelectedRoles] = useState<TradesHubRole[]>([
    'tradesperson',
  ]);
  const [primaryRole, setPrimaryRole] =
    useState<TradesHubRole>('tradesperson');

  const [trade, setTrade] = useState('');
  const [apprenticeshipLevel, setApprenticeshipLevel] = useState('');
  const [city, setCity] = useState('Edmonton');

  const [showTradeSuggestions, setShowTradeSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const hasTradespersonRole = selectedRoles.includes('tradesperson');

  const filteredTrades = useMemo(() => {
    const search = trade.trim().toLowerCase();

    if (!search) return [];

    return ALBERTA_TRADES.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(search);
      const aliasMatch = item.aliases?.some((alias) =>
        alias.toLowerCase().includes(search)
      );

      return nameMatch || aliasMatch;
    }).slice(0, 10);
  }, [trade]);

  const filteredCities = useMemo(() => {
    const search = city.trim().toLowerCase();

    if (!search) return ['Edmonton'];

    return ALBERTA_CITIES.filter((item) =>
      item.toLowerCase().startsWith(search)
    ).slice(0, 10);
  }, [city]);

  const apprenticeshipLevels = getApprenticeshipLevels(trade);

  const accountFieldsComplete =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    passwordStrong &&
    city.trim().length > 0 &&
    selectedRoles.length > 0 &&
    !!primaryRole;

  const tradespersonFieldsComplete =
    !hasTradespersonRole ||
    (trade.trim().length > 0 && apprenticeshipLevel.length > 0);

  const formComplete = accountFieldsComplete && tradespersonFieldsComplete;

  function toggleRole(role: TradesHubRole) {
    setSelectedRoles((current) => {
      if (current.includes(role)) {
        if (current.length === 1) {
          return current;
        }

        const next = current.filter((item) => item !== role);

        if (primaryRole === role) {
          setPrimaryRole(next[0]);
        }

        return next;
      }

      const next = [...current, role];

      if (!primaryRole) {
        setPrimaryRole(role);
      }

      return next;
    });
  }

  function handleTradeChange(text: string) {
    setTrade(text);
    setApprenticeshipLevel('');
    setShowTradeSuggestions(text.trim().length > 0);
  }

  function selectTrade(tradeName: string) {
    setTrade(tradeName);
    setApprenticeshipLevel('');
    setShowTradeSuggestions(false);
  }

  function handleCityChange(text: string) {
    setCity(text);
    setShowCitySuggestions(text.trim().length > 0);
  }

  function selectCity(cityName: string) {
    setCity(cityName);
    setShowCitySuggestions(false);
  }

  async function saveRolesForActiveSession(userId: string) {
    const rows = selectedRoles.map((role) => ({
      user_id: userId,
      role,
      is_primary: role === primaryRole,
    }));

    const { error } = await supabase
      .from('user_roles')
      .upsert(rows, { onConflict: 'user_id,role' });

    if (error) {
      throw error;
    }
  }

  async function handleCreateAccount() {
    setMessage('');
    setSuccess(false);

    if (!formComplete) {
      setMessage(
        hasTradespersonRole && !tradespersonFieldsComplete
          ? 'Complete your trade and apprenticeship level.'
          : 'Please complete all required fields.'
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/`
              : 'https://tradeshub.tech',
          data: {
            full_name: fullName.trim(),
            city: city.trim(),
            selected_roles: selectedRoles,
            primary_role: primaryRole,
            trade: hasTradespersonRole ? trade.trim() : null,
            apprenticeship_level: hasTradespersonRole
              ? apprenticeshipLevel
              : null,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      // If email confirmation is disabled, Supabase may create a session
      // immediately. Save roles now. If confirmation is required, index.tsx
      // will sync these metadata roles on the user's first verified sign-in.
      if (data.session && data.user) {
        await saveRolesForActiveSession(data.user.id);
      }

      setSuccess(true);
      setMessage(
        data.session
          ? 'Account created. Your Trades Hub roles are ready.'
          : 'Account created. Check your email to verify your Trades Hub account. Your selected roles will be activated when you sign in.'
      );
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/trades-hub-logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <Text style={styles.eyebrow}>ONE ACCOUNT. EVERY ROLE.</Text>

        <Text style={styles.title}>Create your Trades Hub account</Text>

        <Text style={styles.subtitle}>
          Choose one or more roles now. You can add or remove roles later from your account.
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#7C8796"
          value={fullName}
          onChangeText={setFullName}
          autoComplete="name"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7C8796"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          autoComplete="email"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#7C8796"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="new-password"
            textContentType="newPassword"
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword((current) => !current)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={21}
              color="#D2B95B"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordStrengthHeader}>
          <Text style={styles.passwordHint}>Password strength</Text>
          <Text
            style={[
              styles.passwordStrengthLabel,
              passwordScore >= 5
                ? styles.passwordStrengthStrong
                : passwordScore >= 3
                  ? styles.passwordStrengthMedium
                  : styles.passwordStrengthWeak,
            ]}
          >
            {password.length === 0
              ? 'Not entered'
              : passwordScore >= 5
                ? 'Strong'
                : passwordScore >= 3
                  ? 'Getting there'
                  : 'Weak'}
          </Text>
        </View>

        <View style={styles.passwordMeter}>
          {[1, 2, 3, 4, 5].map((segment) => (
            <View
              key={segment}
              style={[
                styles.passwordMeterSegment,
                passwordScore >= segment &&
                  (passwordScore >= 5
                    ? styles.passwordMeterStrong
                    : passwordScore >= 3
                      ? styles.passwordMeterMedium
                      : styles.passwordMeterWeak),
              ]}
            />
          ))}
        </View>

        <View style={styles.passwordRules}>
          {[
            ['12+ characters', passwordChecks.length],
            ['Uppercase letter', passwordChecks.upper],
            ['Lowercase letter', passwordChecks.lower],
            ['Number', passwordChecks.number],
            ['Symbol', passwordChecks.symbol],
          ].map(([label, passed]) => (
            <View key={String(label)} style={styles.passwordRule}>
              <Ionicons
                name={passed ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={passed ? '#62B77A' : '#6F7D8C'}
              />
              <Text
                style={[
                  styles.passwordRuleText,
                  passed && styles.passwordRulePassed,
                ]}
              >
                {String(label)}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.suggestPasswordButton}
          onPress={() => {
            const suggested = generateStrongPassword();
            setPassword(suggested);
            setShowPassword(true);
          }}
        >
          <Ionicons
            name="sparkles-outline"
            size={18}
            color="#D2B95B"
          />
          <Text style={styles.suggestPasswordText}>
            SUGGEST STRONG PASSWORD
          </Text>
        </TouchableOpacity>

        <Text style={styles.passwordSecurityNote}>
          Save your password in a password manager. Trades Hub will never ask for it by email, message or support chat.
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>How do you use Trades Hub?</Text>
        <Text style={styles.sectionDescription}>
          Select one or more. Choosing a role does not automatically verify it.
        </Text>

        <View style={styles.roleGrid}>
          {ROLE_OPTIONS.map((role) => {
            const selected = selectedRoles.includes(role.id);

            return (
              <TouchableOpacity
                key={role.id}
                activeOpacity={0.85}
                style={[
                  styles.roleCard,
                  selected && {
                    borderColor: role.color,
                    backgroundColor: '#142638',
                  },
                ]}
                onPress={() => toggleRole(role.id)}
              >
                <View style={styles.roleCardTop}>
                  <View
                    style={[
                      styles.roleIcon,
                      {
                        borderColor: role.color,
                        backgroundColor: selected ? role.color : 'transparent',
                      },
                    ]}
                  >
                    <Ionicons
                      name={role.icon}
                      size={22}
                      color={selected ? '#0B1623' : role.color}
                    />
                  </View>

                  <View
                    style={[
                      styles.roleCheck,
                      {
                        borderColor: role.color,
                        backgroundColor: selected ? role.color : 'transparent',
                      },
                    ]}
                  >
                    {selected ? (
                      <Ionicons name="checkmark" size={16} color="#0B1623" />
                    ) : null}
                  </View>
                </View>

                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleSubtitle}>{role.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedRoles.length > 1 ? (
          <>
            <Text style={styles.sectionLabel}>Primary Role</Text>
            <Text style={styles.primaryRoleHelp}>
              This controls which Trades Hub experience opens first.
            </Text>

            <View style={styles.primaryRoleWrap}>
              {selectedRoles.map((roleId) => {
                const option = ROLE_OPTIONS.find(
                  (item) => item.id === roleId
                );
                const selected = primaryRole === roleId;

                return (
                  <TouchableOpacity
                    key={roleId}
                    style={[
                      styles.primaryRoleButton,
                      option && {
                        borderColor: option.color,
                        backgroundColor: selected
                          ? option.color
                          : 'transparent',
                      },
                    ]}
                    onPress={() => setPrimaryRole(roleId)}
                  >
                    <Text
                      style={[
                        styles.primaryRoleButtonText,
                        selected && styles.primaryRoleButtonTextSelected,
                      ]}
                    >
                      {option?.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Location</Text>

        <View style={styles.cityContainer}>
          <TextInput
            style={styles.input}
            placeholder="Start typing your city"
            placeholderTextColor="#7C8796"
            value={city}
            onChangeText={handleCityChange}
            onFocus={() => setShowCitySuggestions(true)}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {showCitySuggestions && (
            <View style={styles.suggestionsBox}>
              {filteredCities.length > 0 ? (
                <ScrollView
                  style={styles.citySuggestionsScroll}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {filteredCities.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.suggestionItem}
                      onPress={() => selectCity(item)}
                    >
                      <Text style={styles.suggestionText}>{item}</Text>
                      <Text style={styles.cityProvinceText}>Alberta</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => setShowCitySuggestions(false)}
                >
                  <Text style={styles.suggestionText}>
                    Use "{city.trim()}"
                  </Text>
                  <Text style={styles.cityProvinceText}>Custom city</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {hasTradespersonRole ? (
          <>
            <View style={styles.divider} />

            <View style={styles.tradespersonHeading}>
              <View style={styles.smallGoldIcon}>
                <Ionicons
                  name="construct-outline"
                  size={17}
                  color="#0B1623"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>
                  Tradesperson / Apprentice Profile
                </Text>
                <Text style={styles.sectionDescription}>
                  Required because you selected the tradesperson role.
                </Text>
              </View>
            </View>

            <View style={styles.tradeContainer}>
              <TextInput
                style={styles.input}
                placeholder="Search your trade"
                placeholderTextColor="#7C8796"
                value={trade}
                onChangeText={handleTradeChange}
                onFocus={() => {
                  if (trade.trim()) {
                    setShowTradeSuggestions(true);
                  }
                }}
                autoCapitalize="words"
                autoCorrect={false}
              />

              {showTradeSuggestions && (
                <View style={styles.suggestionsBox}>
                  {filteredTrades.length > 0 ? (
                    <ScrollView
                      style={styles.suggestionsScroll}
                      keyboardShouldPersistTaps="handled"
                      nestedScrollEnabled
                    >
                      {filteredTrades.map((item) => (
                        <TouchableOpacity
                          key={item.name}
                          style={styles.suggestionItem}
                          onPress={() => selectTrade(item.name)}
                        >
                          <Text style={styles.suggestionText}>
                            {item.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <View style={styles.noResultItem}>
                      <Text style={styles.noResultText}>
                        No matching trade found
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {apprenticeshipLevels.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Apprenticeship Level</Text>

                <View style={styles.levelGrid}>
                  {apprenticeshipLevels.map((level) => {
                    const selected = apprenticeshipLevel === level;

                    return (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.levelButton,
                          selected && styles.levelButtonSelected,
                        ]}
                        onPress={() => setApprenticeshipLevel(level)}
                      >
                        <Text
                          style={[
                            styles.levelButtonText,
                            selected && styles.levelButtonTextSelected,
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </>
        ) : null}

        <View style={styles.trustNotice}>
          <Ionicons
            name="shield-checkmark-outline"
            size={21}
            color="#D2B95B"
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.trustTitle}>Role verification</Text>
            <Text style={styles.trustText}>
              Your roles start as self-declared. Trades Hub can ask for proof
              later before showing a verified status.
            </Text>
          </View>
        </View>

        {message ? (
          <Text
            style={
              success ? styles.successMessage : styles.errorMessage
            }
          >
            {message}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!formComplete || loading) && styles.disabledButton,
          ]}
          onPress={handleCreateAccount}
          disabled={!formComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#0B1623" />
          ) : (
            <Text style={styles.primaryButtonText}>CREATE ACCOUNT</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>BACK TO SIGN IN</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Brand.navy950,
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    paddingVertical: 46,
  },

  header: {
    width: '100%',
    maxWidth: 780,
    alignItems: 'center',
    marginBottom: 30,
  },

  logoImage: {
    width: 340,
    maxWidth: '92%',
    height: 86,
    marginBottom: 18,
  },

  eyebrow: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 10,
  },

  title: {
    color: Brand.white,
    fontFamily: FontFamily.display,
    fontSize: 31,
    lineHeight: 38,
    letterSpacing: -0.4,
    textAlign: 'center',
  },

  subtitle: {
    color: Brand.textSecondary,
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    textAlign: 'center',
    maxWidth: 560,
  },

  form: {
    width: '100%',
    maxWidth: 780,
    backgroundColor: 'rgba(21, 37, 54, 0.98)',
    borderWidth: 1,
    borderColor: Brand.border,
    borderRadius: Radius.lg,
    padding: 26,
  },

  sectionTitle: {
    color: Brand.white,
    fontFamily: FontFamily.heading,
    fontSize: 19,
    lineHeight: 25,
    marginBottom: 7,
  },

  sectionDescription: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },

  divider: {
    height: 1,
    backgroundColor: Brand.border,
    marginVertical: 24,
  },

  input: {
    minHeight: 52,
    backgroundColor: Surfaces.input,
    color: Brand.white,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.md,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontFamily: FontFamily.body,
    fontSize: 14,
    marginBottom: 14,
  },

  passwordContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Surfaces.input,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.md,
    marginBottom: 6,
  },

  passwordInput: {
    flex: 1,
    color: Brand.white,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontFamily: FontFamily.body,
    fontSize: 14,
    outlineStyle: 'none',
  } as any,

  eyeButton: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },

  passwordHint: {
    color: Brand.textMuted,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 2,
  },

  passwordStrengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  passwordStrengthLabel: {
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
  },

  passwordStrengthWeak: {
    color: Brand.danger,
  },

  passwordStrengthMedium: {
    color: Brand.gold500,
  },

  passwordStrengthStrong: {
    color: Brand.success,
  },

  passwordMeter: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    marginBottom: 12,
  },

  passwordMeterSegment: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: Brand.border,
  },

  passwordMeterWeak: {
    backgroundColor: Brand.danger,
  },

  passwordMeterMedium: {
    backgroundColor: Brand.gold500,
  },

  passwordMeterStrong: {
    backgroundColor: Brand.success,
  },

  passwordRules: {
    gap: 7,
    marginBottom: 12,
  },

  passwordRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  passwordRuleText: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 10,
  },

  passwordRulePassed: {
    color: Brand.textSecondary,
  },

  suggestPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderColor: 'rgba(210,185,91,0.45)',
    backgroundColor: Brand.navy850,
    borderRadius: Radius.md,
    minHeight: 44,
    marginBottom: 10,
  },

  suggestPasswordText: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: 10,
    letterSpacing: 0.6,
  },

  passwordSecurityNote: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 9,
    lineHeight: 14,
    marginBottom: 18,
  },

  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  roleCard: {
    width: '48%',
    minWidth: 260,
    flexGrow: 1,
    backgroundColor: Brand.navy850,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.md,
    padding: 17,
  },

  roleCardSelected: {
    borderColor: Brand.gold500,
    backgroundColor: Brand.navy800,
  },

  roleCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleIconSelected: {
    backgroundColor: Brand.gold500,
    borderColor: Brand.gold500,
  },

  roleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleCheckSelected: {
    backgroundColor: Brand.gold500,
    borderColor: Brand.gold500,
  },

  roleTitle: {
    color: Brand.white,
    fontFamily: FontFamily.bodyBold,
    fontSize: 15,
    marginBottom: 6,
  },

  roleSubtitle: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 18,
  },

  sectionLabel: {
    color: Brand.white,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 12,
    marginTop: 18,
    marginBottom: 8,
  },

  primaryRoleHelp: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 11,
    marginBottom: 10,
  },

  primaryRoleWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  primaryRoleButton: {
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Brand.navy850,
  },

  primaryRoleButtonSelected: {
    borderColor: Brand.gold500,
    backgroundColor: Brand.gold500,
  },

  primaryRoleButtonText: {
    color: Brand.text,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
  },

  primaryRoleButtonTextSelected: {
    color: Brand.navy900,
  },

  tradeContainer: {
    position: 'relative',
    zIndex: 10,
  },

  cityContainer: {
    position: 'relative',
    zIndex: 20,
  },

  tradespersonHeading: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },

  smallGoldIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Brand.gold500,
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestionsBox: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: Brand.gold500,
    borderRadius: Radius.md,
    marginTop: -8,
    marginBottom: 14,
    overflow: 'hidden',
  },

  suggestionsScroll: {
    maxHeight: 260,
  },

  citySuggestionsScroll: {
    maxHeight: 220,
  },

  suggestionItem: {
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },

  suggestionText: {
    color: Brand.white,
    fontFamily: FontFamily.bodyMedium,
    fontSize: 13,
  },

  cityProvinceText: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 10,
    marginTop: 3,
  },

  noResultItem: {
    paddingHorizontal: 15,
    paddingVertical: 14,
  },

  noResultText: {
    color: Brand.textSecondary,
    fontFamily: FontFamily.body,
    fontSize: 12,
  },

  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },

  levelButton: {
    backgroundColor: Brand.navy850,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  levelButtonSelected: {
    backgroundColor: Brand.gold500,
    borderColor: Brand.gold500,
  },

  levelButtonText: {
    color: Brand.white,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: 11,
  },

  levelButtonTextSelected: {
    color: Brand.navy900,
  },

  trustNotice: {
    flexDirection: 'row',
    gap: 11,
    backgroundColor: Brand.navy850,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.md,
    padding: 14,
    marginTop: 24,
    marginBottom: 16,
  },

  trustTitle: {
    color: Brand.white,
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    marginBottom: 4,
  },

  trustText: {
    color: Brand.textMuted,
    fontFamily: FontFamily.body,
    fontSize: 11,
    lineHeight: 17,
  },

  errorMessage: {
    color: '#F19A9A',
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  successMessage: {
    color: '#8FD3A2',
    fontFamily: FontFamily.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },

  primaryButton: {
    minHeight: 52,
    backgroundColor: Brand.gold500,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 18,
  },

  disabledButton: {
    opacity: 0.4,
  },

  primaryButtonText: {
    color: Brand.navy900,
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
    letterSpacing: 0.7,
  },

  backButton: {
    paddingVertical: 17,
    alignItems: 'center',
  },

  backButtonText: {
    color: Brand.gold500,
    fontFamily: FontFamily.bodyBold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
});

