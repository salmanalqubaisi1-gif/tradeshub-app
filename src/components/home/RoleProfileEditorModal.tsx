import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JOB_CITY_OPTIONS, ROLE_CONFIG } from '../../constants/home';
import { getApprenticeshipLevels } from '../../constants/trades';
import type {
  GoogleCompanySuggestion,
  TradesHubRole,
  UserProfile,
} from '../../types/home';
import { formatPhoneNumber } from '../../utils/home';
import { styles } from './homeStyles';

// Full-screen editor for the active role's profile.
// JSX moved verbatim from src/app/home.tsx; state stays in HomeScreen.

export function RoleProfileEditorModal({
  showRoleProfileModal,
  setShowRoleProfileModal,
  activeRole,
  profile,
  editDisplayName,
  setEditDisplayName,
  editBusinessName,
  setEditBusinessName,
  showRoleBusinessSuggestions,
  setShowRoleBusinessSuggestions,
  roleBusinessSearchLoading,
  roleBusinessSuggestions,
  editRoleTrade,
  setEditRoleTrade,
  editCareerLevel,
  setEditCareerLevel,
  showRoleTradeSuggestions,
  setShowRoleTradeSuggestions,
  availableJobTrades,
  editRoleCity,
  setEditRoleCity,
  showRoleCitySuggestions,
  setShowRoleCitySuggestions,
  editPhone,
  setEditPhone,
  editWebsite,
  setEditWebsite,
  editBio,
  setEditBio,
  roleProfileMessage,
  savingRoleProfile,
  saveRoleProfile,
}: {
  showRoleProfileModal: boolean;
  setShowRoleProfileModal: (value: boolean) => void;
  activeRole: TradesHubRole;
  profile: UserProfile | null;
  editDisplayName: string;
  setEditDisplayName: (value: string) => void;
  editBusinessName: string;
  setEditBusinessName: (value: string) => void;
  showRoleBusinessSuggestions: boolean;
  setShowRoleBusinessSuggestions: (value: boolean) => void;
  roleBusinessSearchLoading: boolean;
  roleBusinessSuggestions: GoogleCompanySuggestion[];
  editRoleTrade: string;
  setEditRoleTrade: (value: string) => void;
  editCareerLevel: string;
  setEditCareerLevel: (value: string) => void;
  showRoleTradeSuggestions: boolean;
  setShowRoleTradeSuggestions: (value: boolean) => void;
  availableJobTrades: string[];
  editRoleCity: string;
  setEditRoleCity: (value: string) => void;
  showRoleCitySuggestions: boolean;
  setShowRoleCitySuggestions: (value: boolean) => void;
  editPhone: string;
  setEditPhone: (value: string) => void;
  editWebsite: string;
  setEditWebsite: (value: string) => void;
  editBio: string;
  setEditBio: (value: string) => void;
  roleProfileMessage: string;
  savingRoleProfile: boolean;
  saveRoleProfile: () => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={showRoleProfileModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setShowRoleProfileModal(false)}
    >
      <View
        style={[
          styles.fullScreenEditor,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.fullScreenEditorHeader}>
          <TouchableOpacity
            style={styles.fullScreenEditorHeaderAction}
            onPress={() => setShowRoleProfileModal(false)}
          >
            <Text style={styles.fullScreenEditorHeaderActionText}>
              Cancel
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.fullScreenEditorTitle}
            numberOfLines={1}
          >
            Edit {ROLE_CONFIG[activeRole].label}
          </Text>

          <View style={styles.fullScreenEditorHeaderAction} />
        </View>

        <KeyboardAvoidingView
          style={styles.fullScreenEditorBody}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.fullScreenEditorScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalLabel}>Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editDisplayName}
              onChangeText={setEditDisplayName}
              placeholder="Your name"
              placeholderTextColor="#7C8796"
            />

            {(activeRole === 'contractor' || activeRole === 'supplier') ? (
              <>
                <Text style={styles.modalLabel}>
                  {activeRole === 'contractor' ? 'Company Name' : 'Store / Business Name'}
                </Text>
                <TextInput
                  style={styles.modalInput}
                  value={editBusinessName}
                  onChangeText={(value) => {
                    setEditBusinessName(value);
                    setShowRoleBusinessSuggestions(
                      value.trim().length >= 2
                    );
                  }}
                  onFocus={() =>
                    setShowRoleBusinessSuggestions(
                      editBusinessName.trim().length >= 2
                    )
                  }
                  placeholder={
                    activeRole === 'contractor'
                      ? 'Start typing your company...'
                      : 'Start typing your store or business...'
                  }
                  placeholderTextColor="#7C8796"
                />

                {showRoleBusinessSuggestions &&
                editBusinessName.trim().length >= 2 ? (
                  <View style={styles.suggestionBox}>
                    {roleBusinessSearchLoading ? (
                      <View style={styles.companySearchStatus}>
                        <ActivityIndicator
                          size="small"
                          color={ROLE_CONFIG[activeRole].color}
                        />
                        <Text style={styles.companySearchStatusText}>
                          Searching businesses...
                        </Text>
                      </View>
                    ) : (
                      <>
                        {roleBusinessSuggestions.map((business) => (
                          <TouchableOpacity
                            key={business.place_id}
                            style={styles.suggestionOption}
                            onPress={() => {
                              setEditBusinessName(business.name);
                              setShowRoleBusinessSuggestions(false);
                            }}
                          >
                            <View style={styles.companySuggestionText}>
                              <Text style={styles.suggestionText}>
                                {business.name}
                              </Text>
                              <Text style={styles.companySuggestionMeta}>
                                {business.secondary_text}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                          style={styles.addCompanyOption}
                          onPress={() =>
                            setShowRoleBusinessSuggestions(false)
                          }
                        >
                          <Ionicons
                            name="create-outline"
                            size={18}
                            color={ROLE_CONFIG[activeRole].color}
                          />
                          <Text style={styles.addCompanyOptionText}>
                            Use "{editBusinessName.trim()}" as entered
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ) : null}

                <Text style={styles.tradeAwareHint}>
                  Business suggestions are only for faster entry. Selecting one does not verify ownership or employment.
                </Text>
              </>
            ) : null}

            {activeRole === 'tradesperson' ? (
              <>
                <Text style={styles.modalLabel}>Trade</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editRoleTrade}
                  onChangeText={(value) => {
                    setEditRoleTrade(value);
                    setEditCareerLevel('');
                    setShowRoleTradeSuggestions(
                      value.trim().length >= 1
                    );
                  }}
                  onFocus={() =>
                    setShowRoleTradeSuggestions(
                      editRoleTrade.trim().length >= 1
                    )
                  }
                  placeholder="Start typing your trade..."
                  placeholderTextColor="#7C8796"
                />

                {showRoleTradeSuggestions &&
                editRoleTrade.trim().length >= 1 ? (
                  <View style={styles.suggestionBox}>
                    {availableJobTrades
                      .filter((trade) =>
                        trade
                          .toLowerCase()
                          .includes(editRoleTrade.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((trade) => (
                        <TouchableOpacity
                          key={`profile-trade-${trade}`}
                          style={styles.suggestionOption}
                          onPress={() => {
                            setEditRoleTrade(trade);
                            setEditCareerLevel('');
                            setShowRoleTradeSuggestions(false);
                          }}
                        >
                          <Text style={styles.suggestionText}>
                            {trade}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                ) : null}

                <Text style={styles.modalLabel}>Career Level</Text>
                <View style={styles.jobOptionGrid}>
                  {(
                    editRoleTrade.trim()
                      ? getApprenticeshipLevels(editRoleTrade).filter(
                          (level) => level !== 'Other'
                        )
                      : []
                  ).map((level) => {
                    const selected = editCareerLevel === level;

                    return (
                      <TouchableOpacity
                        key={`profile-level-${level}`}
                        style={[
                          styles.jobOptionButton,
                          selected &&
                            styles.jobOptionButtonSelected,
                        ]}
                        onPress={() => setEditCareerLevel(level)}
                      >
                        <Text
                          style={[
                            styles.jobOptionText,
                            selected &&
                              styles.jobOptionTextSelected,
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : null}

            <Text style={styles.modalLabel}>City</Text>
            <TextInput
              style={styles.modalInput}
              value={editRoleCity}
              onChangeText={(value) => {
                setEditRoleCity(value);
                setShowRoleCitySuggestions(
                  value.trim().length >= 1
                );
              }}
              onFocus={() =>
                setShowRoleCitySuggestions(
                  editRoleCity.trim().length >= 1
                )
              }
              placeholder="Start typing your city..."
              placeholderTextColor="#7C8796"
            />

            {showRoleCitySuggestions &&
            editRoleCity.trim().length >= 1 ? (
              <View style={styles.suggestionBox}>
                {JOB_CITY_OPTIONS
                  .filter((city) =>
                    city
                      .toLowerCase()
                      .includes(editRoleCity.toLowerCase())
                  )
                  .slice(0, 8)
                  .map((city) => (
                    <TouchableOpacity
                      key={`profile-city-${city}`}
                      style={styles.suggestionOption}
                      onPress={() => {
                        setEditRoleCity(city);
                        setShowRoleCitySuggestions(false);
                      }}
                    >
                      <Text style={styles.suggestionText}>
                        {city}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </View>
            ) : null}

            <Text style={styles.modalLabel}>Phone</Text>
            <TextInput
              style={styles.modalInput}
              value={editPhone}
              onChangeText={(value) =>
                setEditPhone(formatPhoneNumber(value))
              }
              placeholder="(780) 555-1234"
              placeholderTextColor="#7C8796"
              keyboardType="phone-pad"
              maxLength={18}
            />
            <Text style={styles.tradeAwareHint}>
              Canadian and U.S. numbers are formatted automatically.
            </Text>

            {(activeRole === 'contractor' || activeRole === 'supplier') ? (
              <>
                <Text style={styles.modalLabel}>Website</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editWebsite}
                  onChangeText={setEditWebsite}
                  placeholder="Optional"
                  placeholderTextColor="#7C8796"
                  autoCapitalize="none"
                />
              </>
            ) : null}

            <Text style={styles.modalLabel}>
              {activeRole === 'contractor'
                ? 'Company Description'
                : activeRole === 'supplier'
                  ? 'Store Description'
                  : 'About'}
            </Text>
            <TextInput
              style={[styles.modalInput, styles.noteInput]}
              value={editBio}
              onChangeText={setEditBio}
              placeholder="Optional"
              placeholderTextColor="#7C8796"
              multiline
            />

            <View style={styles.emailVerificationInfo}>
              <Ionicons
                name={
                  profile?.emailVerified
                    ? 'checkmark-circle'
                    : 'alert-circle-outline'
                }
                size={18}
                color={
                  profile?.emailVerified
                    ? '#62B77A'
                    : '#D2B95B'
                }
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.emailVerificationTitle}>
                  {profile?.emailVerified
                    ? 'Email verified'
                    : 'Email not verified'}
                </Text>

                <Text style={styles.emailVerificationText}>
                  {profile?.emailVerified
                    ? 'This account email was confirmed through Trades Hub sign-in.'
                    : 'A valid-looking email is not treated as real until the user confirms it.'}
                </Text>
              </View>
            </View>

            {roleProfileMessage ? (
              <Text style={styles.modalError}>{roleProfileMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.saveHoursButton,
                savingRoleProfile && styles.disabledButton,
              ]}
              onPress={saveRoleProfile}
              disabled={savingRoleProfile}
            >
              {savingRoleProfile ? (
                <ActivityIndicator color="#0D1B2A" />
              ) : (
                <Text style={styles.saveHoursText}>SAVE CHANGES</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
