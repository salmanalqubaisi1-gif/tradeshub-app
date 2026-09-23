// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeownerFindPro from '../components/homeowner/HomeownerFindPro';
import MarketplaceScreen from '../components/marketplace/MarketplaceScreen';
import SupplierDashboard from '../components/supplier/SupplierDashboard';
import SupplierProducts from '../components/supplier/SupplierProducts';
import {
  EMPLOYMENT_TYPES,
  JOB_CITY_OPTIONS,
  JOB_REQUIREMENT_OPTIONS,
  JOB_TRADE_OPTIONS,
  JOURNEYPERSON_EXPERIENCE_OPTIONS,
  OTHER_LEVEL_OPTIONS,
  ROLE_CONFIG,
  ROLE_TABS,
  WAGE_UNITS,
} from '../constants/home';
import { Brand, FontFamily } from '../constants/theme';
import {
  getApprenticeshipLevels,
  getPeriodHours,
  getTotalRequiredHours,
} from '../constants/trades';
import {
  ActionCard,
  PeriodSelector,
  ProfileRow,
  formatCareerLevel,
  formatDate,
  formatHours,
  formatNumber,
  formatPercentage,
} from '../components/home/HomeShared';
import {
  HomeBottomNav,
  HomeHeader,
  RoleSwitcherPanel,
} from '../components/home/HomeChrome';
import { RoleProfileEditorModal } from '../components/home/RoleProfileEditorModal';
import { CareerSection } from '../components/home/CareerSection';
import { ContractorWorkspace } from '../components/home/ContractorWorkspace';
import {
  TradespersonCareerOverview,
  TradespersonShiftTracker,
} from '../components/home/TradespersonWorkspace';
import { styles } from '../components/home/homeStyles';
import { setSessionPersistence, supabase } from '../lib/supabase';
import type {
  CompanySuggestion,
  GoogleCompanySuggestion,
  HoursEntry,
  HoursView,
  JobPost,
  RoleProfile,
  TabName,
  TechnicalTrainingEntry,
  TradesHubRole,
  TrainingBreakdownItem,
  TrainingProviderSuggestion,
  UserProfile,
  UserRoleRow,
} from '../types/home';
import {
  containsBlockedContent,
  formatPhoneNumber,
  getProviderSearchAliases,
  getTradeWorkTypes,
  isValidPhoneNumber,
  moderationMessage,
  normalizeTrainingProviderSearchText
} from '../utils/home';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabName>('Feed');
  const [careerOverviewExpanded, setCareerOverviewExpanded] = useState(false);

  const [userRoles, setUserRoles] = useState<UserRoleRow[]>([]);
  const [activeRole, setActiveRole] = useState<TradesHubRole>('tradesperson');
  const [rolesLoading, setRolesLoading] = useState(true);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [managingRoles, setManagingRoles] = useState(false);
  const [roleMessage, setRoleMessage] = useState('');
  const [rolePendingDelete, setRolePendingDelete] =
    useState<TradesHubRole | null>(null);
  const [deletingRole, setDeletingRole] = useState(false);
  const [roleOnboardingComplete, setRoleOnboardingComplete] =
    useState<boolean | null>(null);
  const [onboardingRoles, setOnboardingRoles] =
    useState<TradesHubRole[]>([]);
  const [onboardingPrimaryRole, setOnboardingPrimaryRole] =
    useState<TradesHubRole | null>(null);
  const [savingRoleOnboarding, setSavingRoleOnboarding] =
    useState(false);
  const [roleOnboardingMessage, setRoleOnboardingMessage] =
    useState('');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [roleProfiles, setRoleProfiles] = useState<
    Partial<Record<TradesHubRole, RoleProfile>>
  >({});
  const [showRoleProfileModal, setShowRoleProfileModal] = useState(false);
  const [savingRoleProfile, setSavingRoleProfile] = useState(false);
  const [roleProfileMessage, setRoleProfileMessage] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editRoleTrade, setEditRoleTrade] = useState('');
  const [editCareerLevel, setEditCareerLevel] = useState('');
  const [editRoleCity, setEditRoleCity] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editBio, setEditBio] = useState('');
  const [roleBusinessSuggestions, setRoleBusinessSuggestions] =
    useState<GoogleCompanySuggestion[]>([]);
  const [roleBusinessSearchLoading, setRoleBusinessSearchLoading] =
    useState(false);
  const [showRoleBusinessSuggestions, setShowRoleBusinessSuggestions] =
    useState(false);
  const [showRoleTradeSuggestions, setShowRoleTradeSuggestions] =
    useState(false);
  const [showRoleCitySuggestions, setShowRoleCitySuggestions] =
    useState(false);

  const [editCompanySuggestions, setEditCompanySuggestions] =
    useState<GoogleCompanySuggestion[]>([]);
  const [editCompanySearchLoading, setEditCompanySearchLoading] =
    useState(false);
  const [showEditCompanySuggestions, setShowEditCompanySuggestions] =
    useState(false);

  const [hoursGoogleCompanySuggestions, setHoursGoogleCompanySuggestions] =
    useState<GoogleCompanySuggestion[]>([]);

  const [hoursEntries, setHoursEntries] = useState<HoursEntry[]>([]);
  const [hoursLoading, setHoursLoading] = useState(true);
  const [hoursView, setHoursView] = useState<HoursView>('week');
  const [careerProgressExpanded, setCareerProgressExpanded] = useState(true);
  const [careerHoursExpanded, setCareerHoursExpanded] = useState(false);
  const [careerMilestonesExpanded, setCareerMilestonesExpanded] = useState(false);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [clockMessage, setClockMessage] = useState('');

  const [trainingEntries, setTrainingEntries] = useState<TechnicalTrainingEntry[]>([]);
  const [trainingLoading, setTrainingLoading] = useState(true);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingPeriod, setTrainingPeriod] = useState<number | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TechnicalTrainingEntry['status']>('Not Started');
  const [trainingSchool, setTrainingSchool] = useState('');
  const [trainingStartDate, setTrainingStartDate] = useState('');
  const [trainingEndDate, setTrainingEndDate] = useState('');
  const [trainingGrade, setTrainingGrade] = useState('');
  const [trainingTheoryAverage, setTrainingTheoryAverage] = useState('');
  const [trainingPracticalAverage, setTrainingPracticalAverage] = useState('');
  const [trainingExamMark, setTrainingExamMark] = useState('');
  const [trainingNote, setTrainingNote] = useState('');
  const [trainingProviderId, setTrainingProviderId] = useState<string | null>(null);
  const [trainingCampusId, setTrainingCampusId] = useState<string | null>(null);
  const [trainingClassroomHours, setTrainingClassroomHours] = useState('');
  const [trainingProgramVersion, setTrainingProgramVersion] = useState('');
  const [trainingImportSource, setTrainingImportSource] = useState<'progress_report' | 'manual' | null>(null);
  const [trainingImportedDocumentDate, setTrainingImportedDocumentDate] = useState('');
  const [trainingSubjectBreakdown, setTrainingSubjectBreakdown] = useState<TrainingBreakdownItem[]>([]);
  const [trainingExamBreakdown, setTrainingExamBreakdown] = useState<TrainingBreakdownItem[]>([]);
  const [trainingProviderSelectionMethod, setTrainingProviderSelectionMethod] =
    useState<'document_import' | 'user_selected' | 'manual_entry' | null>(null);
  const [savingTraining, setSavingTraining] = useState(false);
  const [trainingMessage, setTrainingMessage] = useState('');
  const [trainingProviderSuggestions, setTrainingProviderSuggestions] =
    useState<TrainingProviderSuggestion[]>([]);
  const [trainingProviderLoading, setTrainingProviderLoading] = useState(false);
  const [showTrainingProviderSuggestions, setShowTrainingProviderSuggestions] =
    useState(false);

  const [aitLetterFileName, setAitLetterFileName] = useState('');
  const [aitLetterScanning, setAitLetterScanning] = useState(false);
  const [aitLetterMessage, setAitLetterMessage] = useState('');
  const [showProgressReportGuide, setShowProgressReportGuide] = useState(false);

  const [showHoursModal, setShowHoursModal] = useState(false);
  const [newHours, setNewHours] = useState('');
  const [newHoursNote, setNewHoursNote] = useState('');
  const [newPeriod, setNewPeriod] = useState<number | null>(null);
  const [newCompany, setNewCompany] = useState('');
  const [newWorkType, setNewWorkType] = useState('');
  const [manualEntryMode, setManualEntryMode] =
    useState<'duration' | 'times'>('times');
  const [manualWorkDate, setManualWorkDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualStartMeridiem, setManualStartMeridiem] =
    useState<'AM' | 'PM'>('AM');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualEndMeridiem, setManualEndMeridiem] =
    useState<'AM' | 'PM'>('PM');
  const [manualBreakMinutes, setManualBreakMinutes] = useState('0');
  const [manualEntryKind, setManualEntryKind] =
    useState<'shift' | 'historical_bulk'>('shift');
  const [historicalStartDate, setHistoricalStartDate] = useState('');
  const [historicalEndDate, setHistoricalEndDate] = useState('');
  const [showCompanySuggestions, setShowCompanySuggestions] = useState(false);
  const [showWorkTypes, setShowWorkTypes] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [hoursMessage, setHoursMessage] = useState('');

  const [selectedEntry, setSelectedEntry] =
    useState<HoursEntry | null>(null);

  const [showEntryMenu, setShowEntryMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editHours, setEditHours] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editPeriod, setEditPeriod] = useState<number | null>(null);
  const [editCompany, setEditCompany] = useState('');
  const [editWorkType, setEditWorkType] = useState('');
  const [editEntryKind, setEditEntryKind] =
    useState<'shift' | 'historical_bulk'>('shift');
  const [editHistoricalStartDate, setEditHistoricalStartDate] =
    useState('');
  const [editHistoricalEndDate, setEditHistoricalEndDate] =
    useState('');

  const [editingEntry, setEditingEntry] = useState(false);
  const [deletingEntry, setDeletingEntry] = useState(false);
  const [editMessage, setEditMessage] = useState('');

  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [showJobModal, setShowJobModal] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [jobMessage, setJobMessage] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobTrade, setJobTrade] = useState('');
  const [jobLevel, setJobLevel] = useState('');
  const [jobCity, setJobCity] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobEmploymentType, setJobEmploymentType] =
    useState<JobPost['employment_type']>('full_time');
  const [jobWageMin, setJobWageMin] = useState('');
  const [jobWageMax, setJobWageMax] = useState('');
  const [jobWageUnit, setJobWageUnit] =
    useState<JobPost['wage_unit']>('hour');
  const [jobDescription, setJobDescription] = useState('');
  const [jobRequirements, setJobRequirements] = useState('');
  const [jobStatus, setJobStatus] =
    useState<'draft' | 'active'>('active');
  const [jobWorkTypes, setJobWorkTypes] = useState<string[]>([]);
  const [jobRequirementChips, setJobRequirementChips] =
    useState<string[]>([]);
  const [jobCareerType, setJobCareerType] =
    useState<'apprentice' | 'journeyperson' | 'other'>('apprentice');
  const [availableJobTrades, setAvailableJobTrades] =
    useState<string[]>(JOB_TRADE_OPTIONS);
  const [showJobTradeSuggestions, setShowJobTradeSuggestions] =
    useState(false);
  const [jobCompanySuggestions, setJobCompanySuggestions] =
    useState<GoogleCompanySuggestion[]>([]);
  const [jobCompanySearchLoading, setJobCompanySearchLoading] =
    useState(false);
  const [showJobCompanySuggestions, setShowJobCompanySuggestions] =
    useState(false);
  const [showJobCitySuggestions, setShowJobCitySuggestions] =
    useState(false);

  useEffect(() => {
    loadProfile();
    loadRoles();
    loadRoleProfiles();
    loadHours();
    loadTraining();
    loadJobs();
    loadJobTradeOptions();
  }, []);

  async function loadProfile() {
    try {
      setProfileLoading(true);

      let user;

      try {
        const authResult = await supabase.auth.getUser();
        user = authResult.data.user;
      } catch (authError) {
        // getUser() itself failed (e.g. network error, expired session)
        // before roleOnboardingComplete could be set, which would otherwise
        // leave the "Loading Trades Hub..." gate stuck forever. Recover by
        // sending the user back to sign-in - a downstream query failure
        // below (after we already have a valid user) should NOT do this,
        // since that would sign out an already-authenticated user over a
        // transient error.
        console.error('Profile load error (auth):', authError);
        router.replace('/');
        return;
      }

      if (!user) {
        router.replace('/');
        return;
      }

      setRoleOnboardingComplete(
        Boolean(user.user_metadata?.role_onboarding_complete)
      );

      const { data: tradespersonRoleProfile } = await supabase
        .from('role_profiles')
        .select('display_name, trade, career_level, city')
        .eq('user_id', user.id)
        .eq('role', 'tradesperson')
        .maybeSingle();

      setProfile({
        fullName:
          tradespersonRoleProfile?.display_name ||
          user.user_metadata?.full_name ||
          'Trades Hub User',

        trade:
          tradespersonRoleProfile?.trade ||
          user.user_metadata?.trade ||
          'Trade not set',

        apprenticeshipLevel:
          tradespersonRoleProfile?.career_level ||
          user.user_metadata?.apprenticeship_level ||
          'Level not set',

        city:
          tradespersonRoleProfile?.city ||
          user.user_metadata?.city ||
          'City not set',

        email:
          user.email || '',

        emailVerified:
          Boolean(user.email_confirmed_at),
      });
    } catch (error) {
      // A failure here happens after roleOnboardingComplete is already set,
      // so the loading gate isn't stuck - just log it rather than signing
      // out an already-authenticated user over a transient query error.
      console.error('Profile load error:', error);
    } finally {
      setProfileLoading(false);
    }
  }

  async function loadRoleProfiles() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('role_profiles')
      .select(
        'id, user_id, role, display_name, business_name, trade, career_level, city, phone, website, bio'
      )
      .eq('user_id', user.id);

    if (error) {
      console.error('Role profile load error:', error);
      return;
    }

    const next: Partial<Record<TradesHubRole, RoleProfile>> = {};

    (data || []).forEach((row: any) => {
      next[row.role as TradesHubRole] = row as RoleProfile;
    });

    setRoleProfiles(next);
  }

  function openRoleProfileEditor() {
    const current = roleProfiles[activeRole];

    setRoleProfileMessage('');
    setEditDisplayName(
      current?.display_name || profile?.fullName || ''
    );
    setEditBusinessName(current?.business_name || '');
    setEditRoleTrade(
      current?.trade ||
        (activeRole === 'tradesperson' ? profile?.trade || '' : '')
    );
    setEditCareerLevel(
      current?.career_level ||
        (activeRole === 'tradesperson'
          ? profile?.apprenticeshipLevel || ''
          : '')
    );
    setEditRoleCity(current?.city || profile?.city || '');
    setEditPhone(formatPhoneNumber(current?.phone || ''));
    setEditWebsite(current?.website || '');
    setEditBio(current?.bio || '');
    setRoleBusinessSuggestions([]);
    setShowRoleBusinessSuggestions(false);
    setShowRoleTradeSuggestions(false);
    setShowRoleCitySuggestions(false);
    setShowRoleProfileModal(true);
  }

  async function saveRoleProfile() {
    if (savingRoleProfile) return;

    try {
      setSavingRoleProfile(true);
      setRoleProfileMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRoleProfileMessage('You must be signed in.');
        return;
      }

      if (!editDisplayName.trim()) {
        setRoleProfileMessage('Enter your name or display name.');
        return;
      }

      if (
        (activeRole === 'contractor' || activeRole === 'supplier') &&
        !editBusinessName.trim()
      ) {
        setRoleProfileMessage(
          activeRole === 'contractor'
            ? 'Enter your company name.'
            : 'Enter your store or business name.'
        );
        return;
      }

      if (!isValidPhoneNumber(editPhone)) {
        setRoleProfileMessage(
          'Enter a valid phone number. Example: (780) 555-1234.'
        );
        return;
      }

      if (
        containsBlockedContent(
          editDisplayName,
          editBusinessName,
          editBio
        )
      ) {
        setRoleProfileMessage(moderationMessage());
        return;
      }

      const payload = {
        user_id: user.id,
        role: activeRole,
        display_name: editDisplayName.trim() || null,
        business_name:
          activeRole === 'contractor' || activeRole === 'supplier'
            ? editBusinessName.trim() || null
            : null,
        trade:
          activeRole === 'tradesperson'
            ? editRoleTrade.trim() || null
            : null,
        career_level:
          activeRole === 'tradesperson'
            ? editCareerLevel.trim() || null
            : null,
        city: editRoleCity.trim() || null,
        phone: editPhone.trim() ? formatPhoneNumber(editPhone) : null,
        website:
          activeRole === 'contractor' || activeRole === 'supplier'
            ? editWebsite.trim() || null
            : null,
        bio: editBio.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('role_profiles')
        .upsert(payload, { onConflict: 'user_id,role' })
        .select(
          'id, user_id, role, display_name, business_name, trade, career_level, city, phone, website, bio'
        )
        .single();

      if (error) throw error;

      setRoleProfiles((current) => ({
        ...current,
        [activeRole]: data as RoleProfile,
      }));

      if (activeRole === 'tradesperson') {
        setProfile((current) =>
          current
            ? {
                ...current,
                fullName: data.display_name || current.fullName,
                trade: data.trade || current.trade,
                apprenticeshipLevel:
                  data.career_level || current.apprenticeshipLevel,
                city: data.city || current.city,
              }
            : current
        );
      }

      setShowRoleProfileModal(false);
    } catch (error: any) {
      console.error('Role profile save error:', error);
      setRoleProfileMessage(
        error?.message || 'Could not save your profile.'
      );
    } finally {
      setSavingRoleProfile(false);
    }
  }

  async function loadRoles() {
    try {
      setRolesLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          role,
          is_primary,
          user_role_verifications (
            verification_status
          )
        `)
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Role load error:', error);
        return;
      }

      const rows = (data || []).map((row: any) => ({
        id: row.id,
        role: row.role as TradesHubRole,
        is_primary: Boolean(row.is_primary),
        verification_status:
          row.user_role_verifications?.verification_status || 'self_declared',
      })) as UserRoleRow[];

      setUserRoles(rows);

      setOnboardingRoles((current) =>
        current.length > 0 ? current : rows.map((row) => row.role)
      );

      setOnboardingPrimaryRole((current) =>
        current ||
        rows.find((row) => row.is_primary)?.role ||
        rows[0]?.role ||
        null
      );

      const primary =
        rows.find((row) => row.is_primary)?.role ||
        rows[0]?.role ||
        'tradesperson';

      setActiveRole(primary);
    } catch (error) {
      console.error('Role load error:', error);
    } finally {
      setRolesLoading(false);
    }
  }

  function toggleOnboardingRole(role: TradesHubRole) {
    setRoleOnboardingMessage('');

    setOnboardingRoles((current) => {
      if (current.includes(role)) {
        const next = current.filter((item) => item !== role);

        if (onboardingPrimaryRole === role) {
          setOnboardingPrimaryRole(next[0] || null);
        }

        return next;
      }

      const next = [...current, role];

      if (!onboardingPrimaryRole) {
        setOnboardingPrimaryRole(role);
      }

      return next;
    });
  }

  async function saveRoleOnboarding() {
    if (savingRoleOnboarding) return;

    if (onboardingRoles.length === 0) {
      setRoleOnboardingMessage('Choose at least one role to continue.');
      return;
    }

    const primaryRole =
      onboardingPrimaryRole &&
      onboardingRoles.includes(onboardingPrimaryRole)
        ? onboardingPrimaryRole
        : onboardingRoles[0];

    try {
      setSavingRoleOnboarding(true);
      setRoleOnboardingMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRoleOnboardingMessage('You must be signed in.');
        return;
      }

      const existingRoles = new Set(
        userRoles.map((row) => row.role)
      );

      const missingRoles = onboardingRoles.filter(
        (role) => !existingRoles.has(role)
      );

      if (missingRoles.length > 0) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert(
            missingRoles.map((role) => ({
              user_id: user.id,
              role,
              is_primary: false,
            }))
          );

        if (insertError) throw insertError;
      }

      const { error: primaryError } = await supabase.rpc(
        'set_primary_user_role',
        {
          p_role: primaryRole,
        }
      );

      if (primaryError) throw primaryError;

      const rolesToRemove = userRoles
        .map((row) => row.role)
        .filter((role) => !onboardingRoles.includes(role));

      if (rolesToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id)
          .in('role', rolesToRemove);

        if (deleteError) throw deleteError;
      }

      const { error: metadataError } =
        await supabase.auth.updateUser({
          data: {
            role_onboarding_complete: true,
          },
        });

      if (metadataError) throw metadataError;

      setRoleOnboardingComplete(true);
      setActiveRole(primaryRole);
      setActiveTab('Feed');
      await loadRoles();
    } catch (error: any) {
      console.error('Role onboarding error:', error);
      setRoleOnboardingMessage(
        error?.message || 'Could not save your roles.'
      );
    } finally {
      setSavingRoleOnboarding(false);
    }
  }

  async function switchPrimaryRole(role: TradesHubRole) {
    if (role === activeRole || switchingRole) {
      setShowRoleSwitcher(false);
      return;
    }

    try {
      setSwitchingRole(true);
      setRoleMessage('');

      const { error } = await supabase.rpc(
        'set_primary_user_role',
        {
          p_role: role,
        }
      );

      if (error) throw error;

      setUserRoles((current) =>
        current.map((row) => ({
          ...row,
          is_primary: row.role === role,
        }))
      );

      setActiveRole(role);
      setActiveTab('Feed');
      setShowRoleSwitcher(false);
      setRoleMessage(
        `${ROLE_CONFIG[role].label} is now your primary workspace.`
      );
    } catch (error: any) {
      console.error('Role switch error:', error);
      setRoleMessage(
        error?.message || 'Could not change your primary workspace.'
      );
    } finally {
      setSwitchingRole(false);
    }
  }


  async function addUserRole(role: TradesHubRole) {
    if (userRoles.some((row) => row.role === role) || managingRoles) return;

    try {
      setManagingRoles(true);
      setRoleMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRoleMessage('You must be signed in.');
        return;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role,
          is_primary: userRoles.length === 0,
        });

      if (error) throw error;

      await loadRoles();
      setRoleMessage(`${ROLE_CONFIG[role].label} added.`);
    } catch (error: any) {
      console.error('Add role error:', error);
      setRoleMessage(error?.message || 'Could not add this role.');
    } finally {
      setManagingRoles(false);
    }
  }

  function requestRemoveUserRole(role: TradesHubRole) {
    if (managingRoles || deletingRole) return;

    if (userRoles.length <= 1) {
      setRoleMessage(
        'You must keep at least one Trades Hub role on your account.'
      );
      return;
    }

    setRoleMessage('');
    setRolePendingDelete(role);
  }

  async function confirmRemoveUserRole() {
    const role = rolePendingDelete;

    if (!role || managingRoles || deletingRole) return;

    if (userRoles.length <= 1) {
      setRolePendingDelete(null);
      setRoleMessage(
        'You must keep at least one Trades Hub role on your account.'
      );
      return;
    }

    const row = userRoles.find((item) => item.role === role);
    if (!row) {
      setRolePendingDelete(null);
      return;
    }

    const replacementRole =
      userRoles.find((item) => item.role !== role)?.role || null;

    if (!replacementRole) {
      setRolePendingDelete(null);
      setRoleMessage(
        'You must keep at least one Trades Hub role on your account.'
      );
      return;
    }

    try {
      setDeletingRole(true);
      setManagingRoles(true);
      setRoleMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRoleMessage('You must be signed in.');
        return;
      }

      if (role === 'contractor') {
        const { error: pauseJobsError } = await supabase
          .from('job_posts')
          .update({ status: 'paused' })
          .eq('created_by', user.id)
          .eq('status', 'active');

        if (pauseJobsError) throw pauseJobsError;
      }

      if (row.is_primary) {
        const { error: primaryError } = await supabase.rpc(
          'set_primary_user_role',
          {
            p_role: replacementRole,
          }
        );

        if (primaryError) throw primaryError;
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.id)
        .eq('role', role);

      if (error) throw error;

      setRolePendingDelete(null);

      if (activeRole === role) {
        setActiveRole(replacementRole);
        setActiveTab('Feed');
      }

      await loadRoles();

      setRoleMessage(
        `${ROLE_CONFIG[role].label} removed. You can add it again later.`
      );
    } catch (error: any) {
      console.error('Remove role error:', error);
      setRoleMessage(
        error?.message || 'Could not remove this role.'
      );
    } finally {
      setDeletingRole(false);
      setManagingRoles(false);
    }
  }

  function formatVerificationStatus(
    status: UserRoleRow['verification_status']
  ) {
    if (status === 'business_verified') return 'Business verified';
    if (status === 'verified') return 'Verified';
    if (status === 'pending') return 'Pending';
    if (status === 'rejected') return 'Needs review';
    return 'Self-declared';
  }

  function getVerificationColor(
    status: UserRoleRow['verification_status']
  ) {
    if (status === 'business_verified' || status === 'verified') {
      return '#62B77A';
    }
    if (status === 'pending') return '#D2B95B';
    if (status === 'rejected') return '#E56B6B';
    return '#7C8796';
  }

  async function loadHours() {
    try {
      setHoursLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('apprenticeship_hours')
        .select(
          'id, hours, work_date, note, period_number, company_name, work_type, clock_in, clock_out, break_minutes, entry_source, reconciliation_status, qualifying_hours, pay_period_id, entry_kind, historical_start_date, historical_end_date'
        )
        .eq('user_id', user.id)
        .order('work_date', {
          ascending: false,
        })
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.error('Hours load error:', error);
        return;
      }

      setHoursEntries(
        (data || []).map((entry) => ({
          ...entry,
          hours: Number(entry.hours),
          break_minutes: Number(entry.break_minutes || 0),
          qualifying_hours:
            entry.qualifying_hours === null || entry.qualifying_hours === undefined
              ? null
              : Number(entry.qualifying_hours),
          period_number:
            entry.period_number === null
              ? null
              : Number(entry.period_number),
        }))
      );
    } finally {
      setHoursLoading(false);
    }
  }

  async function loadTraining() {
    try {
      setTrainingLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('technical_training')
        .select('id, period_number, status, school_name, start_date, end_date, grade, theory_average, practical_average, period_exam_mark, provider_verified, note, training_provider_id, training_campus_id, classroom_hours, program_version, import_source, imported_document_date, subject_breakdown, exam_breakdown, provider_selection_method')
        .eq('user_id', user.id)
        .order('period_number', { ascending: true });

      if (error) {
        console.error('Technical training load error:', error);
        return;
      }

      setTrainingEntries((data || []).map((entry) => ({
        ...entry,
        period_number: Number(entry.period_number),
      })) as TechnicalTrainingEntry[]);
    } finally {
      setTrainingLoading(false);
    }
  }

  const careerLevels = useMemo(() => {
    if (!profile?.trade) {
      return [];
    }

    return getApprenticeshipLevels(
      profile.trade
    ).filter(
      (level) => level !== 'Other'
    );
  }, [profile]);

  const periodNumbers = useMemo(() => {
    return careerLevels
      .filter((level) =>
        level.includes('Period Apprentice')
      )
      .map((_, index) => index + 1);
  }, [careerLevels]);

  const currentLevelIndex = useMemo(() => {
    if (!profile?.apprenticeshipLevel) {
      return -1;
    }

    return careerLevels.findIndex(
      (level) =>
        level ===
        profile.apprenticeshipLevel
    );
  }, [careerLevels, profile]);

  const currentPeriodNumber = useMemo(() => {
    const match = profile?.apprenticeshipLevel?.match(/(\d+)/);
    return match ? Number(match[1]) : null;
  }, [profile]);

  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);

  useEffect(() => {
    const query = newCompany.trim();

    if (query.length < 2) {
      setCompanySuggestions([]);
      setHoursGoogleCompanySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCompanySearchLoading(true);

        const { data, error } = await supabase
          .from('companies')
          .select('id, name, city, province, verified')
          .ilike('name', `${query}%`)
          .eq('city', profile?.city || 'Edmonton')
          .order('verified', { ascending: false })
          .order('name', { ascending: true })
          .limit(8);

        if (error) {
          console.error('Company search error:', error);
          return;
        }

        setCompanySuggestions((data || []) as CompanySuggestion[]);

        const { data: googleData, error: googleError } =
          await supabase.functions.invoke('search-companies', {
            body: { query },
          });

        if (googleError) {
          setHoursGoogleCompanySuggestions([]);
        } else {
          setHoursGoogleCompanySuggestions(
            (googleData?.companies || []) as GoogleCompanySuggestion[]
          );
        }
      } finally {
        setCompanySearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [newCompany, profile?.city]);

  useEffect(() => {
    const query = editBusinessName.trim();

    if (
      !showRoleBusinessSuggestions ||
      query.length < 2 ||
      (activeRole !== 'contractor' && activeRole !== 'supplier')
    ) {
      setRoleBusinessSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setRoleBusinessSearchLoading(true);

        const { data, error } = await supabase.functions.invoke(
          'search-companies',
          { body: { query } }
        );

        if (error) {
          setRoleBusinessSuggestions([]);
          return;
        }

        setRoleBusinessSuggestions(
          (data?.companies || []) as GoogleCompanySuggestion[]
        );
      } finally {
        setRoleBusinessSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [
    editBusinessName,
    showRoleBusinessSuggestions,
    activeRole,
  ]);

  useEffect(() => {
    const query = editCompany.trim();

    if (!showEditCompanySuggestions || query.length < 2) {
      setEditCompanySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setEditCompanySearchLoading(true);

        const { data, error } = await supabase.functions.invoke(
          'search-companies',
          { body: { query } }
        );

        if (error) {
          setEditCompanySuggestions([]);
          return;
        }

        setEditCompanySuggestions(
          (data?.companies || []) as GoogleCompanySuggestion[]
        );
      } finally {
        setEditCompanySearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [editCompany, showEditCompanySuggestions]);

  useEffect(() => {
    const query = jobCompany.trim();

    if (query.length < 2 || !showJobCompanySuggestions) {
      setJobCompanySuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setJobCompanySearchLoading(true);

        const { data, error } = await supabase.functions.invoke(
          'search-companies',
          {
            body: { query },
          }
        );

        if (error) {
          setJobCompanySuggestions([]);
          return;
        }

        setJobCompanySuggestions(
          (data?.companies || []) as GoogleCompanySuggestion[]
        );
      } finally {
        setJobCompanySearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [jobCompany, showJobCompanySuggestions]);

  const totalHours = useMemo(() => {
    return hoursEntries.reduce(
      (total, entry) =>
        total + entry.hours,
      0
    );
  }, [hoursEntries]);

  const activeClockEntry = useMemo(() => {
    return (
      hoursEntries.find(
        (entry) =>
          entry.entry_source === 'clock' &&
          entry.clock_in &&
          !entry.clock_out
      ) || null
    );
  }, [hoursEntries]);


  const completedHoursEntries = useMemo(() => {
    return hoursEntries.filter((entry) => Number(entry.hours) > 0);
  }, [hoursEntries]);

  const frequentCompanies = useMemo(() => {
    const companyMap = new Map<
      string,
      {
        name: string;
        count: number;
        latestDate: string;
      }
    >();

    hoursEntries.forEach((entry) => {
      const company = entry.company_name?.trim();
      if (!company) return;

      const key = company.toLowerCase();
      const existing = companyMap.get(key);

      if (existing) {
        existing.count += 1;
        if (entry.work_date > existing.latestDate) {
          existing.latestDate = entry.work_date;
        }
      } else {
        companyMap.set(key, {
          name: company,
          count: 1,
          latestDate: entry.work_date,
        });
      }
    });

    return Array.from(companyMap.values())
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.latestDate.localeCompare(a.latestDate);
      })
      .slice(0, 5);
  }, [hoursEntries]);

  function parseWorkDate(value: string) {
    return new Date(`${value}T00:00:00`);
  }

  function getWeekStart(date: Date) {
    const copy = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function getWeekEnd(date: Date) {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  function isHistoricalBulkEntry(entry: HoursEntry) {
    return (
      entry.entry_kind === 'historical_bulk' ||
      (
        !entry.entry_kind &&
        entry.entry_source === 'manual' &&
        !entry.clock_in &&
        !entry.clock_out &&
        Number(entry.hours) > 24
      )
    );
  }

  const hoursViewData = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const weekStart = getWeekStart(today);
    const weekEnd = getWeekEnd(today);

    const entries = completedHoursEntries.filter((entry) => {
      const historical = isHistoricalBulkEntry(entry);

      if (hoursView === 'all') {
        return true;
      }

      if (hoursView === 'week' || hoursView === 'month') {
        if (historical) return false;

        const date = parseWorkDate(entry.work_date);

        if (hoursView === 'week') {
          return date >= weekStart && date <= weekEnd;
        }

        return (
          date.getFullYear() === year &&
          date.getMonth() === month
        );
      }

      if (historical) {
        const startDate = entry.historical_start_date
          ? parseWorkDate(entry.historical_start_date)
          : parseWorkDate(entry.work_date);

        const endDate = entry.historical_end_date
          ? parseWorkDate(entry.historical_end_date)
          : startDate;

        return (
          startDate.getFullYear() <= year &&
          endDate.getFullYear() >= year
        );
      }

      return parseWorkDate(entry.work_date).getFullYear() === year;
    });

    const total = entries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    );

    return {
      entries,
      total,
      today,
      year,
      month,
      weekStart,
      weekEnd,
    };
  }, [completedHoursEntries, hoursView]);

  const hoursBreakdown = useMemo(() => {
    const entries = hoursViewData.entries;

    if (hoursView === 'week') {
      const rows = Array.from({ length: 7 }).map((_, index) => {
        const date = new Date(hoursViewData.weekStart);
        date.setDate(date.getDate() + index);

        const key = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-');

        const total = entries
          .filter((entry) => entry.work_date === key)
          .reduce((sum, entry) => sum + Number(entry.hours), 0);

        return {
          key,
          label: date.toLocaleDateString('en-CA', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          total,
        };
      });

      return rows;
    }

    if (hoursView === 'month') {
      const buckets: Record<string, number> = {};

      entries.forEach((entry) => {
        const date = parseWorkDate(entry.work_date);
        const weekStart = getWeekStart(date);
        const weekKey = weekStart.toISOString().slice(0, 10);

        buckets[weekKey] =
          (buckets[weekKey] || 0) + Number(entry.hours);
      });

      return Object.entries(buckets)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, total]) => {
          const start = parseWorkDate(key);
          const end = getWeekEnd(start);

          return {
            key,
            label: `${start.toLocaleDateString('en-CA', {
              month: 'short',
              day: 'numeric',
            })} – ${end.toLocaleDateString('en-CA', {
              month: 'short',
              day: 'numeric',
            })}`,
            total,
          };
        });
    }

    if (hoursView === 'year') {
      const monthRows = Array.from({ length: 12 }).map((_, monthIndex) => {
        const total = entries
          .filter(
            (entry) =>
              !isHistoricalBulkEntry(entry) &&
              parseWorkDate(entry.work_date).getMonth() === monthIndex
          )
          .reduce((sum, entry) => sum + Number(entry.hours), 0);

        return {
          key: String(monthIndex),
          label: new Date(
            hoursViewData.year,
            monthIndex,
            1
          ).toLocaleDateString('en-CA', {
            month: 'long',
          }),
          total,
        };
      });

      const historicalTotal = entries
        .filter(isHistoricalBulkEntry)
        .reduce((sum, entry) => sum + Number(entry.hours), 0);

      return historicalTotal > 0
        ? [
            ...monthRows,
            {
              key: 'historical',
              label: 'Past apprenticeship hours',
              total: historicalTotal,
            },
          ]
        : monthRows;
    }

    const buckets: Record<string, number> = {};

    entries.forEach((entry) => {
      const dateSource =
        isHistoricalBulkEntry(entry) && entry.historical_start_date
          ? entry.historical_start_date
          : entry.work_date;

      const year = String(
        parseWorkDate(dateSource).getFullYear()
      );

      buckets[year] =
        (buckets[year] || 0) + Number(entry.hours);
    });

    return Object.entries(buckets)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([key, total]) => ({
        key,
        label: key,
        total,
      }));
  }, [hoursView, hoursViewData]);

  const periodRequirements = useMemo(() => {
    if (!profile?.trade) {
      return [];
    }

    return getPeriodHours(profile.trade);
  }, [profile]);

  const totalRequiredHours = useMemo(() => {
    if (!profile?.trade) {
      return null;
    }

    return getTotalRequiredHours(profile.trade);
  }, [profile]);

  const assignedHours = useMemo(() => {
    return hoursEntries
      .filter((entry) => entry.period_number !== null)
      .reduce((total, entry) => total + entry.hours, 0);
  }, [hoursEntries]);

  const unassignedHours = useMemo(() => {
    return hoursEntries
      .filter((entry) => entry.period_number === null)
      .reduce((total, entry) => total + entry.hours, 0);
  }, [hoursEntries]);

  const periodProgress = useMemo(() => {
    return periodRequirements.map((requiredHours, index) => {
      const periodNumber = index + 1;

      const loggedHours = hoursEntries
        .filter((entry) => entry.period_number === periodNumber)
        .reduce((total, entry) => total + entry.hours, 0);

      const percentage =
        requiredHours > 0
          ? Math.min((loggedHours / requiredHours) * 100, 100)
          : 0;

      return {
        periodNumber,
        loggedHours,
        requiredHours,
        percentage,
      };
    });
  }, [hoursEntries, periodRequirements]);

  const overallProgressPercentage = useMemo(() => {
    if (!totalRequiredHours || totalRequiredHours <= 0) {
      return 0;
    }

    return Math.min(
      (assignedHours / totalRequiredHours) * 100,
      100
    );
  }, [assignedHours, totalRequiredHours]);

  async function handleClockIn() {
    if (activeClockEntry || clockActionLoading) return;

    try {
      setClockActionLoading(true);
      setClockMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setClockMessage('You must be signed in.');
        return;
      }

      const now = new Date();
      const workDate = now.toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from('apprenticeship_hours')
        .insert({
          user_id: user.id,
          hours: 0,
          work_date: workDate,
          period_number: currentPeriodNumber,
          clock_in: now.toISOString(),
          clock_out: null,
          break_minutes: 0,
          entry_source: 'clock',
          reconciliation_status: 'tracked',
        })
        .select(
          'id, hours, work_date, note, period_number, company_name, work_type, clock_in, clock_out, break_minutes, entry_source, reconciliation_status, qualifying_hours, pay_period_id, entry_kind, historical_start_date, historical_end_date'
        )
        .single();

      if (error) throw error;

      const created: HoursEntry = {
        ...data,
        hours: Number(data.hours || 0),
        break_minutes: Number(data.break_minutes || 0),
        qualifying_hours:
          data.qualifying_hours === null || data.qualifying_hours === undefined
            ? null
            : Number(data.qualifying_hours),
        period_number:
          data.period_number === null
            ? null
            : Number(data.period_number),
      };

      setHoursEntries((current) => [created, ...current]);
      setClockMessage('Clocked in. Your shift is now being tracked.');
    } catch (error: any) {
      console.error('Clock in error:', error);
      setClockMessage(error?.message || 'Could not clock in.');
    } finally {
      setClockActionLoading(false);
    }
  }

  async function handleClockOut() {
    if (!activeClockEntry || clockActionLoading) return;

    try {
      setClockActionLoading(true);
      setClockMessage('');

      const clockOut = new Date();
      const clockIn = new Date(activeClockEntry.clock_in as string);
      const breakMinutes = Number(activeClockEntry.break_minutes || 0);

      const elapsedHours =
        (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);

      const workedHours = Math.max(
        elapsedHours - breakMinutes / 60,
        0
      );

      const roundedHours = Math.round(workedHours * 100) / 100;

      const { data, error } = await supabase
        .from('apprenticeship_hours')
        .update({
          clock_out: clockOut.toISOString(),
          hours: roundedHours,
          reconciliation_status: 'tracked',
          updated_at: clockOut.toISOString(),
        })
        .eq('id', activeClockEntry.id)
        .select(
          'id, hours, work_date, note, period_number, company_name, work_type, clock_in, clock_out, break_minutes, entry_source, reconciliation_status, qualifying_hours, pay_period_id, entry_kind, historical_start_date, historical_end_date'
        )
        .single();

      if (error) throw error;

      const updated: HoursEntry = {
        ...data,
        hours: Number(data.hours || 0),
        break_minutes: Number(data.break_minutes || 0),
        qualifying_hours:
          data.qualifying_hours === null || data.qualifying_hours === undefined
            ? null
            : Number(data.qualifying_hours),
        period_number:
          data.period_number === null
            ? null
            : Number(data.period_number),
      };

      setHoursEntries((current) =>
        current.map((entry) =>
          entry.id === updated.id ? updated : entry
        )
      );

      setClockMessage(
        `Clocked out. ${formatHours(updated.hours)} hours tracked.`
      );
    } catch (error: any) {
      console.error('Clock out error:', error);
      setClockMessage(error?.message || 'Could not clock out.');
    } finally {
      setClockActionLoading(false);
    }
  }

  async function ensureCompanyExists(companyName: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('You must be signed in.');
    }

    const normalizedName = companyName.trim();
    const city = profile?.city || 'Edmonton';
    const province = 'Alberta';

    const { data: existingCompany, error: searchError } = await supabase
      .from('companies')
      .select('id, name')
      .ilike('name', normalizedName)
      .eq('city', city)
      .eq('province', province)
      .limit(1)
      .maybeSingle();

    if (searchError) {
      throw searchError;
    }

    if (existingCompany) {
      return existingCompany;
    }

    const { data: createdCompany, error: insertError } = await supabase
      .from('companies')
      .insert({
        name: normalizedName,
        city,
        province,
        created_by: user.id,
        verified: false,
      })
      .select('id, name')
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: duplicateCompany, error: duplicateError } = await supabase
          .from('companies')
          .select('id, name')
          .ilike('name', normalizedName)
          .eq('city', city)
          .eq('province', province)
          .limit(1)
          .maybeSingle();

        if (duplicateError) throw duplicateError;
        return duplicateCompany;
      }

      throw insertError;
    }

    return createdCompany;
  }

  function normalizeClockText(value: string) {
    const raw = value.trim().replace(/\s+/g, '');

    if (!raw) return null;

    if (/^\d{1,2}$/.test(raw)) {
      const hour = Number(raw);
      if (hour < 1 || hour > 12) return null;
      return `${hour}:00`;
    }

    if (/^\d{3,4}$/.test(raw)) {
      const padded = raw.padStart(4, '0');
      const hour = Number(padded.slice(0, 2));
      const minute = Number(padded.slice(2, 4));

      if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        return null;
      }

      return `${hour}:${String(minute).padStart(2, '0')}`;
    }

    const match = raw.match(/^(\d{1,2}):(\d{1,2})$/);
    if (match) {
      const hour = Number(match[1]);
      const minute = Number(match[2]);

      if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
        return null;
      }

      return `${hour}:${String(minute).padStart(2, '0')}`;
    }

    return null;
  }

  function to24HourMinutes(
    timeText: string,
    meridiem: 'AM' | 'PM'
  ) {
    const normalized = normalizeClockText(timeText);
    if (!normalized) return null;

    const [hourText, minuteText] = normalized.split(':');
    let hour = Number(hourText);
    const minute = Number(minuteText);

    if (meridiem === 'AM' && hour === 12) hour = 0;
    if (meridiem === 'PM' && hour !== 12) hour += 12;

    return hour * 60 + minute;
  }

  function getManualCalculatedHours() {
    if (manualEntryMode !== 'times') return null;

    const startMinutes = to24HourMinutes(
      manualStartTime,
      manualStartMeridiem
    );
    const endMinutes = to24HourMinutes(
      manualEndTime,
      manualEndMeridiem
    );
    const breakMinutes = Number(manualBreakMinutes || 0);

    if (
      startMinutes === null ||
      endMinutes === null ||
      Number.isNaN(breakMinutes) ||
      breakMinutes < 0
    ) {
      return null;
    }

    let durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) {
      durationMinutes += 24 * 60;
    }

    const paidMinutes = Math.max(
      durationMinutes - breakMinutes,
      0
    );

    return Math.round((paidMinutes / 60) * 100) / 100;
  }

  async function handleAddHours() {
    setHoursMessage('');

    if (manualEntryKind === 'historical_bulk') {
      if (!historicalStartDate.trim() || !historicalEndDate.trim()) {
        setHoursMessage('Enter a start and end date for historical hours.');
        return;
      }

      const startDate = new Date(`${historicalStartDate}T00:00:00`);
      const endDate = new Date(`${historicalEndDate}T00:00:00`);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate < startDate
      ) {
        setHoursMessage('Enter a valid historical date range.');
        return;
      }
    }

    let parsedHours: number;
    let normalizedStart: string | null = null;
    let normalizedEnd: string | null = null;
    let parsedBreakMinutes = 0;

    if (
      manualEntryKind === 'shift' &&
      manualEntryMode === 'times'
    ) {
      normalizedStart = normalizeClockText(manualStartTime);
      normalizedEnd = normalizeClockText(manualEndTime);
      parsedBreakMinutes = Number(manualBreakMinutes || 0);
      const calculated = getManualCalculatedHours();

      if (!manualWorkDate.trim()) {
        setHoursMessage('Enter the work date.');
        return;
      }

      if (!normalizedStart || !normalizedEnd) {
        setHoursMessage(
          'Enter valid start and end times, such as 8, 830 or 4:30.'
        );
        return;
      }

      if (
        Number.isNaN(parsedBreakMinutes) ||
        parsedBreakMinutes < 0
      ) {
        setHoursMessage('Break minutes must be 0 or more.');
        return;
      }

      if (calculated === null || calculated <= 0) {
        setHoursMessage(
          'The calculated shift must be longer than the break time.'
        );
        return;
      }

      parsedHours = calculated;
    } else {
      parsedHours = Number(newHours);

      if (
        !newHours.trim() ||
        Number.isNaN(parsedHours) ||
        parsedHours <= 0
      ) {
        setHoursMessage(
          'Enter a valid number of hours.'
        );
        return;
      }
    }

    if (!newPeriod) {
      setHoursMessage(
        'Select the apprenticeship period.'
      );
      return;
    }

    if (
      currentPeriodNumber !== null &&
      newPeriod > currentPeriodNumber
    ) {
      setHoursMessage(
        'Future apprenticeship periods are locked.'
      );
      return;
    }

    if (!newCompany.trim()) {
      setHoursMessage('Enter the company you worked for.');
      return;
    }

    if (!newWorkType) {
      setHoursMessage('Select the type of work.');
      return;
    }

    try {
      setSavingHours(true);

      await ensureCompanyExists(newCompany);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHoursMessage(
          'You must be signed in.'
        );
        return;
      }

      let clockInIso: string | null = null;
      let clockOutIso: string | null = null;

      if (
        manualEntryMode === 'times' &&
        normalizedStart &&
        normalizedEnd
      ) {
        const buildIso = (
          date: string,
          normalizedTime: string,
          meridiem: 'AM' | 'PM'
        ) => {
          const [hourText, minuteText] =
            normalizedTime.split(':');
          let hour = Number(hourText);
          const minute = Number(minuteText);

          if (meridiem === 'AM' && hour === 12) hour = 0;
          if (meridiem === 'PM' && hour !== 12) hour += 12;

          const localDate = new Date(
            `${date}T${String(hour).padStart(2, '0')}:${String(
              minute
            ).padStart(2, '0')}:00`
          );

          return localDate;
        };

        const startDate = buildIso(
          manualWorkDate,
          normalizedStart,
          manualStartMeridiem
        );
        let endDate = buildIso(
          manualWorkDate,
          normalizedEnd,
          manualEndMeridiem
        );

        if (endDate.getTime() <= startDate.getTime()) {
          endDate = new Date(
            endDate.getTime() + 24 * 60 * 60 * 1000
          );
        }

        clockInIso = startDate.toISOString();
        clockOutIso = endDate.toISOString();
      }

      const { data, error } = await supabase
        .from('apprenticeship_hours')
        .insert({
          user_id: user.id,
          hours: parsedHours,
          work_date:
            manualEntryKind === 'historical_bulk'
              ? historicalStartDate
              : manualEntryMode === 'times'
                ? manualWorkDate
                : undefined,
          note:
            newHoursNote.trim() || null,
          period_number: newPeriod,
          company_name: newCompany.trim(),
          work_type: newWorkType,
          entry_source: 'manual',
          entry_kind: manualEntryKind,
          historical_start_date:
            manualEntryKind === 'historical_bulk'
              ? historicalStartDate
              : null,
          historical_end_date:
            manualEntryKind === 'historical_bulk'
              ? historicalEndDate
              : null,
          reconciliation_status: 'tracked',
          clock_in:
            manualEntryKind === 'historical_bulk'
              ? null
              : clockInIso,
          clock_out:
            manualEntryKind === 'historical_bulk'
              ? null
              : clockOutIso,
          break_minutes:
            manualEntryKind === 'shift' &&
            manualEntryMode === 'times'
              ? parsedBreakMinutes
              : 0,
        })
        .select(
          'id, hours, work_date, note, period_number, company_name, work_type, clock_in, clock_out, break_minutes, entry_source, reconciliation_status, qualifying_hours, pay_period_id, entry_kind, historical_start_date, historical_end_date'
        )
        .single();

      if (error) {
        setHoursMessage(error.message);
        return;
      }

      setHoursEntries((current) => [
        {
          ...data,
          hours: Number(data.hours),
          break_minutes: Number(data.break_minutes || 0),
          qualifying_hours:
            data.qualifying_hours === null ||
            data.qualifying_hours === undefined
              ? null
              : Number(data.qualifying_hours),
          period_number:
            data.period_number === null
              ? null
              : Number(data.period_number),
        },
        ...current,
      ]);

      setNewHours('');
      setNewHoursNote('');
      setNewPeriod(currentPeriodNumber);
      setNewCompany('');
      setNewWorkType('');
      setManualWorkDate(
        new Date().toISOString().slice(0, 10)
      );
      setManualStartTime('');
      setManualEndTime('');
      setManualStartMeridiem('AM');
      setManualEndMeridiem('PM');
      setManualBreakMinutes('0');
      setManualEntryKind('shift');
      setHistoricalStartDate('');
      setHistoricalEndDate('');
      setHoursMessage('');
      setShowHoursModal(false);
    } catch (error) {
      console.error(
        'Add hours error:',
        error
      );

      setHoursMessage(
        'Something went wrong. Please try again.'
      );
    } finally {
      setSavingHours(false);
    }
  }

  function openEntryMenu(entry: HoursEntry) {
    setSelectedEntry(entry);
    setShowEntryMenu(true);
  }

  function openEditEntry() {
    if (!selectedEntry) return;

    setEditHours(
      selectedEntry.hours.toString()
    );

    setEditNote(
      selectedEntry.note || ''
    );

    setEditPeriod(
      selectedEntry.period_number
    );

    setEditCompany(selectedEntry.company_name || '');
    setEditCompanySuggestions([]);
    setShowEditCompanySuggestions(false);
    setEditWorkType(selectedEntry.work_type || '');
    setEditEntryKind(
      isHistoricalBulkEntry(selectedEntry)
        ? 'historical_bulk'
        : 'shift'
    );
    setEditHistoricalStartDate(
      selectedEntry.historical_start_date || ''
    );
    setEditHistoricalEndDate(
      selectedEntry.historical_end_date || ''
    );
    setEditMessage('');
    setShowEntryMenu(false);
    setShowEditModal(true);
  }

  function openDeleteEntry() {
    setShowEntryMenu(false);
    setShowDeleteModal(true);
  }

  async function handleEditEntry() {
    if (!selectedEntry) return;

    setEditMessage('');

    if (editEntryKind === 'historical_bulk') {
      if (
        !editHistoricalStartDate.trim() ||
        !editHistoricalEndDate.trim()
      ) {
        setEditMessage(
          'Enter a start and end date for historical hours.'
        );
        return;
      }

      const startDate = new Date(
        `${editHistoricalStartDate}T00:00:00`
      );
      const endDate = new Date(
        `${editHistoricalEndDate}T00:00:00`
      );

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        endDate < startDate
      ) {
        setEditMessage('Enter a valid historical date range.');
        return;
      }
    }

    const parsedHours = Number(editHours);

    if (
      !editHours.trim() ||
      Number.isNaN(parsedHours) ||
      parsedHours <= 0
    ) {
      setEditMessage(
        'Enter a valid number of hours.'
      );
      return;
    }

    if (!editPeriod) {
      setEditMessage(
        'Select the apprenticeship period.'
      );
      return;
    }

    if (
      currentPeriodNumber !== null &&
      editPeriod > currentPeriodNumber
    ) {
      setEditMessage(
        'Future apprenticeship periods are locked.'
      );
      return;
    }

    if (!editCompany.trim()) {
      setEditMessage('Enter the company you worked for.');
      return;
    }
    if (!editWorkType) {
      setEditMessage('Select the type of work.');
      return;
    }

    try {
      setEditingEntry(true);

      const { data, error } = await supabase
        .from('apprenticeship_hours')
        .update({
          hours: parsedHours,
          note:
            editNote.trim() || null,
          period_number: editPeriod,
          company_name: editCompany.trim(),
          work_type: editWorkType,
          entry_kind: editEntryKind,
          historical_start_date:
            editEntryKind === 'historical_bulk'
              ? editHistoricalStartDate
              : null,
          historical_end_date:
            editEntryKind === 'historical_bulk'
              ? editHistoricalEndDate
              : null,
          work_date:
            editEntryKind === 'historical_bulk'
              ? editHistoricalStartDate
              : selectedEntry.work_date,
        })
        .eq('id', selectedEntry.id)
        .select(
          'id, hours, work_date, note, period_number, company_name, work_type'
        )
        .single();

      if (error) {
        setEditMessage(error.message);
        return;
      }

      setHoursEntries((current) =>
        current.map((entry) =>
          entry.id === data.id
            ? {
                ...data,
                hours: Number(data.hours),
                period_number:
                  data.period_number === null
                    ? null
                    : Number(data.period_number),
              }
            : entry
        )
      );

      setSelectedEntry(null);
      setShowEditModal(false);
      setEditMessage('');
    } catch (error) {
      console.error(
        'Edit hours error:',
        error
      );

      setEditMessage(
        'Something went wrong. Please try again.'
      );
    } finally {
      setEditingEntry(false);
    }
  }

  async function handleDeleteEntry() {
    if (!selectedEntry) return;

    try {
      setDeletingEntry(true);

      const { error } = await supabase
        .from('apprenticeship_hours')
        .delete()
        .eq('id', selectedEntry.id);

      if (error) {
        console.error(
          'Delete hours error:',
          error
        );
        return;
      }

      setHoursEntries((current) =>
        current.filter(
          (entry) =>
            entry.id !== selectedEntry.id
        )
      );

      setSelectedEntry(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error(
        'Delete hours error:',
        error
      );
    } finally {
      setDeletingEntry(false);
    }
  }

  async function loadTrainingProviders(periodNumber: number) {
    if (!profile?.trade) {
      setTrainingProviderSuggestions([]);
      return;
    }

    try {
      setTrainingProviderLoading(true);

      const { data, error } = await supabase
        .from('training_provider_campus_options')
        .select(
          'provider_id, provider_name, campus_id, campus_name, city, address_line_1, display_name, academic_year'
        )
        .eq('trade_name', profile.trade)
        .eq('period_number', periodNumber)
        .order('provider_name', { ascending: true })
        .order('campus_name', { ascending: true });

      if (error) {
        console.error('Training provider/campus load error:', error);
        setTrainingProviderSuggestions([]);
        return;
      }

      const deduped = Array.from(
        new Map(
          ((data || []) as TrainingProviderSuggestion[]).map((option) => [
            `${option.provider_id}:${option.campus_id}`,
            option,
          ])
        ).values()
      );

      setTrainingProviderSuggestions(deduped);
    } finally {
      setTrainingProviderLoading(false);
    }
  }

  function openTraining(periodNumber: number) {
    if (
      currentPeriodNumber !== null &&
      periodNumber > currentPeriodNumber
    ) {
      return;
    }

    const existing = trainingEntries.find(
      (entry) => entry.period_number === periodNumber
    );

    setTrainingPeriod(periodNumber);
    setTrainingStatus(existing?.status || 'Not Started');
    setTrainingSchool(existing?.school_name || '');
    setTrainingStartDate(existing?.start_date || '');
    setTrainingEndDate(existing?.end_date || '');
    setTrainingGrade(existing?.grade || '');
    setTrainingTheoryAverage(
      existing?.theory_average === null || existing?.theory_average === undefined
        ? ''
        : String(existing.theory_average)
    );
    setTrainingPracticalAverage(
      existing?.practical_average === null ||
        existing?.practical_average === undefined
        ? ''
        : String(existing.practical_average)
    );
    setTrainingExamMark(
      existing?.period_exam_mark === null ||
        existing?.period_exam_mark === undefined
        ? ''
        : String(existing.period_exam_mark)
    );
    setTrainingNote(existing?.note || '');
    setTrainingProviderId(existing?.training_provider_id || null);
    setTrainingCampusId(existing?.training_campus_id || null);
    setTrainingClassroomHours(
      existing?.classroom_hours === null || existing?.classroom_hours === undefined
        ? ''
        : String(existing.classroom_hours)
    );
    setTrainingProgramVersion(existing?.program_version || '');
    setTrainingImportSource(existing?.import_source || null);
    setTrainingImportedDocumentDate(existing?.imported_document_date || '');
    setTrainingSubjectBreakdown(existing?.subject_breakdown || []);
    setTrainingExamBreakdown(existing?.exam_breakdown || []);
    setTrainingProviderSelectionMethod(existing?.provider_selection_method || null);
    setTrainingMessage('');
    setAitLetterFileName('');
    setAitLetterMessage('');
    setShowTrainingProviderSuggestions(false);
    setShowTrainingModal(true);
    loadTrainingProviders(periodNumber);
  }

  async function resolveImportedTrainingProvider(
    importedSchoolName: string
  ): Promise<TrainingProviderSuggestion[]> {
    if (!profile?.trade || !trainingPeriod) {
      return [];
    }

    const { data, error } = await supabase
      .from('training_provider_campus_options')
      .select(
        'provider_id, provider_name, campus_id, campus_name, city, address_line_1, display_name, academic_year'
      )
      .eq('trade_name', profile.trade)
      .eq('period_number', trainingPeriod)
      .order('provider_name', { ascending: true })
      .order('campus_name', { ascending: true });

    if (error) {
      console.error('Imported provider/campus resolution error:', error);
      return [];
    }

    const options = Array.from(
      new Map(
        ((data || []) as TrainingProviderSuggestion[]).map((option) => [
          `${option.provider_id}:${option.campus_id}`,
          option,
        ])
      ).values()
    );

    // Keep the visible picker in sync with the exact trade/period options
    // we just used to resolve the imported Progress Report.
    setTrainingProviderSuggestions(options);

    const raw = normalizeTrainingProviderSearchText(importedSchoolName);
    if (!raw) return [];

    const providerMatches = options.filter((option) => {
      const providerName = normalizeTrainingProviderSearchText(option.provider_name);
      const displayName = normalizeTrainingProviderSearchText(option.display_name);

      const aliases = getProviderSearchAliases(option.provider_name).map(
        normalizeTrainingProviderSearchText
      );

      return (
        raw === providerName ||
        raw === displayName ||
        providerName.includes(raw) ||
        raw.includes(providerName) ||
        aliases.some(
          (alias) =>
            alias &&
            (raw === alias || raw.includes(alias) || alias.includes(raw))
        )
      );
    });

    if (providerMatches.length === 0) {
      return [];
    }

    // If the imported report also names a campus, narrow to that campus.
    const campusMatches = providerMatches.filter((option) => {
      const campus = normalizeTrainingProviderSearchText(option.campus_name);
      return campus && raw.includes(campus);
    });

    return campusMatches.length > 0 ? campusMatches : providerMatches;
  }

  async function handleAitLetterUpload() {
    setAitLetterMessage('');

    if (typeof document === 'undefined') {
      setAitLetterMessage(
        'Progress Report upload is currently available in the web app.'
      );
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/png,image/jpeg,image/webp';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        setAitLetterMessage('Use a PDF or image smaller than 10 MB.');
        return;
      }

      try {
        setAitLetterScanning(true);
        setAitLetterFileName(file.name);
        setAitLetterMessage('Scanning Progress Report...');

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const base64Data = dataUrl.includes(',')
          ? dataUrl.split(',')[1]
          : dataUrl;

        const { data, error } = await supabase.functions.invoke(
          'scan-ait-letter',
          {
            body: {
              fileName: file.name,
              mimeType: file.type,
              base64Data,
              expectedTrade: profile?.trade || null,
              expectedPeriod: trainingPeriod,
            },
          }
        );

        if (error) {
          throw error;
        }

        const extracted =
          data?.extracted && typeof data.extracted === 'object'
            ? data.extracted
            : data && typeof data === 'object'
              ? data
              : null;

        if (!extracted) {
          throw new Error(
            data?.message ||
              data?.error ||
              'The Progress Report could not be read.'
          );
        }

        const hasReadableTrainingData =
          extracted.school_name ||
          extracted.start_date ||
          extracted.end_date ||
          extracted.theory_average !== null &&
            extracted.theory_average !== undefined ||
          extracted.practical_average !== null &&
            extracted.practical_average !== undefined ||
          extracted.period_exam_mark !== null &&
            extracted.period_exam_mark !== undefined ||
          extracted.status ||
          extracted.note;

        if (!hasReadableTrainingData) {
          throw new Error(
            data?.message ||
              data?.error ||
              'The Progress Report could not be read.'
          );
        }

        let providerResolutionMessage = '';
        let showProviderChoicesAfterImport = false;

        if (extracted.school_name) {
          const importedSchoolName = String(extracted.school_name).trim();
          const matches = await resolveImportedTrainingProvider(importedSchoolName);

          if (matches.length === 1) {
            const match = matches[0];

            setTrainingSchool(match.display_name);
            setTrainingProviderId(match.provider_id);
            setTrainingCampusId(match.campus_id);
            setTrainingProviderSelectionMethod('document_import');

            providerResolutionMessage =
              ` Training location matched to ${match.display_name}.`;
          } else if (matches.length > 1) {
            setTrainingSchool(importedSchoolName);
            setTrainingProviderId(null);
            setTrainingCampusId(null);
            setTrainingProviderSelectionMethod('document_import');
            showProviderChoicesAfterImport = true;

            providerResolutionMessage =
              ' The provider was recognized, but more than one campus matches this trade/period. Choose the exact campus before saving.';
          } else {
            setTrainingSchool(importedSchoolName);
            setTrainingProviderId(null);
            setTrainingCampusId(null);
            setTrainingProviderSelectionMethod('document_import');
            showProviderChoicesAfterImport = true;

            providerResolutionMessage =
              ' The school name was imported, but Trades Hub could not match it to one exact catalogue campus. Review the provider/campus before saving.';
          }
        } else {
          setTrainingSchool('');
          setTrainingProviderId(null);
          setTrainingCampusId(null);
          setTrainingProviderSelectionMethod(null);
        }

        if (extracted.start_date) {
          setTrainingStartDate(String(extracted.start_date));
        } else {
          setTrainingStartDate('');
        }

        const importedEndDate = extracted.class_completion_date || extracted.end_date;
        if (importedEndDate) {
          setTrainingEndDate(String(importedEndDate));
        }

        if (
          extracted.theory_average !== null &&
          extracted.theory_average !== undefined
        ) {
          setTrainingTheoryAverage(String(extracted.theory_average));
        }

        if (
          extracted.practical_average !== null &&
          extracted.practical_average !== undefined
        ) {
          setTrainingPracticalAverage(String(extracted.practical_average));
        }

        if (
          extracted.period_exam_mark !== null &&
          extracted.period_exam_mark !== undefined
        ) {
          setTrainingExamMark(String(extracted.period_exam_mark));
        }

        if (
          extracted.status === 'Passed' ||
          extracted.status === 'Failed' ||
          extracted.status === 'In Progress' ||
          extracted.status === 'Not Started'
        ) {
          setTrainingStatus(extracted.status);
        }

        if (extracted.note) {
          setTrainingNote(String(extracted.note));
        }

        setTrainingProgramVersion(
          extracted.program_version ? String(extracted.program_version) : ''
        );
        setTrainingClassroomHours(
          extracted.classroom_hours !== null && extracted.classroom_hours !== undefined
            ? String(extracted.classroom_hours)
            : ''
        );
        setTrainingImportedDocumentDate(
          extracted.document_date ? String(extracted.document_date) : ''
        );
        setTrainingSubjectBreakdown(
          Array.isArray(extracted.subject_breakdown) ? extracted.subject_breakdown : []
        );
        setTrainingExamBreakdown(
          Array.isArray(extracted.exam_breakdown) ? extracted.exam_breakdown : []
        );
        setTrainingImportSource('progress_report');

        setShowTrainingProviderSuggestions(showProviderChoicesAfterImport);
        setAitLetterMessage(
          'Progress Report scanned. Review the autofilled information before saving.' +
            providerResolutionMessage
        );
      } catch (error: any) {
        console.error('AIT letter scan error:', error);
        setAitLetterMessage(
          error?.message ||
            'Could not scan the Progress Report. You can still enter the information manually.'
        );
      } finally {
        setAitLetterScanning(false);
      }
    };

    input.click();
  }

  function parseOptionalPercent(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
      return undefined;
    }

    return parsed;
  }


  function normalizeTrainingDate(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const [year, month, day] = trimmed.split('-').map(Number);
      const candidate = new Date(Date.UTC(year, month - 1, day));
      if (
        candidate.getUTCFullYear() === year &&
        candidate.getUTCMonth() === month - 1 &&
        candidate.getUTCDate() === day
      ) {
        return trimmed;
      }
      return null;
    }

    if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(trimmed)) {
      return null;
    }

    const cleaned = trimmed.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const monthMatch = cleaned.match(
      /^(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})\s+(\d{4})$/i
    );

    if (!monthMatch) return null;

    const monthNames = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    ];
    const monthIndex = monthNames.findIndex((month) =>
      monthMatch[1].toLowerCase().startsWith(month)
    );
    const day = Number(monthMatch[2]);
    const year = Number(monthMatch[3]);
    const candidate = new Date(Date.UTC(year, monthIndex, day));

    if (
      monthIndex < 0 ||
      candidate.getUTCFullYear() !== year ||
      candidate.getUTCMonth() !== monthIndex ||
      candidate.getUTCDate() !== day
    ) {
      return null;
    }

    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function normalizeDateField(value: string, setter: (value: string) => void) {
    if (!value.trim()) return;
    const normalized = normalizeTrainingDate(value);
    if (normalized) setter(normalized);
  }

  function parseOptionalWholeNumber(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    if (!Number.isInteger(parsed) || parsed < 0) return undefined;
    return parsed;
  }

  async function handleSaveTraining() {
    if (!trainingPeriod) return;

    if (
      currentPeriodNumber !== null &&
      trainingPeriod > currentPeriodNumber
    ) {
      setTrainingMessage(
        'Future apprenticeship periods are locked.'
      );
      return;
    }

    if (trainingStatus !== 'Not Started' && !trainingSchool.trim()) {
      setTrainingMessage('Enter the school or training provider.');
      return;
    }

    const theoryAverage = parseOptionalPercent(trainingTheoryAverage);
    const practicalAverage = parseOptionalPercent(trainingPracticalAverage);
    const examMark = parseOptionalPercent(trainingExamMark);
    const classroomHours = parseOptionalWholeNumber(trainingClassroomHours);

    if (
      theoryAverage === undefined ||
      practicalAverage === undefined ||
      examMark === undefined
    ) {
      setTrainingMessage('Marks must be numbers from 0 to 100.');
      return;
    }

    if (classroomHours === undefined) {
      setTrainingMessage('Classroom hours must be a whole number of 0 or more.');
      return;
    }

    const normalizedStartDate = normalizeTrainingDate(trainingStartDate);
    const normalizedEndDate = normalizeTrainingDate(trainingEndDate);
    const normalizedDocumentDate = normalizeTrainingDate(trainingImportedDocumentDate);

    if (trainingStartDate.trim() && !normalizedStartDate) {
      setTrainingMessage('Enter a valid start date, such as Oct 27, 2025 or 2025-10-27.');
      return;
    }
    if (trainingEndDate.trim() && !normalizedEndDate) {
      setTrainingMessage('Enter a valid end date, such as Oct 27, 2025 or 2025-10-27.');
      return;
    }
    if (trainingImportedDocumentDate.trim() && !normalizedDocumentDate) {
      setTrainingMessage('The imported report date is not valid.');
      return;
    }

    const selectedProvider = trainingProviderSuggestions.find(
      (provider) =>
        provider.display_name.toLowerCase() === trainingSchool.trim().toLowerCase()
    );

    const providerSelectionMethod = trainingSchool.trim()
      ? trainingProviderSelectionMethod === 'document_import' && selectedProvider
        ? 'document_import'
        : selectedProvider
          ? 'user_selected'
          : 'manual_entry'
      : null;

    try {
      setSavingTraining(true);
      setTrainingMessage('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTrainingMessage('You must be signed in.');
        return;
      }

      const { data, error } = await supabase
        .from('technical_training')
        .upsert({
          user_id: user.id,
          period_number: trainingPeriod,
          status: trainingStatus,
          school_name: selectedProvider?.display_name || trainingSchool.trim() || null,
          start_date: normalizedStartDate || null,
          end_date: normalizedEndDate || null,
          grade: trainingGrade.trim() || null,
          theory_average: theoryAverage,
          practical_average: practicalAverage,
          period_exam_mark: examMark,
          provider_verified: Boolean(selectedProvider),
          note: trainingNote.trim() || null,
          training_provider_id: selectedProvider?.provider_id || trainingProviderId || null,
          training_campus_id: selectedProvider?.campus_id || trainingCampusId || null,
          classroom_hours: classroomHours,
          program_version: trainingProgramVersion.trim() || null,
          import_source: trainingImportSource || 'manual',
          imported_document_date: normalizedDocumentDate || null,
          subject_breakdown: trainingSubjectBreakdown,
          exam_breakdown: trainingExamBreakdown,
          provider_selection_method: providerSelectionMethod,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,period_number' })
        .select('id, period_number, status, school_name, start_date, end_date, grade, theory_average, practical_average, period_exam_mark, provider_verified, note, training_provider_id, training_campus_id, classroom_hours, program_version, import_source, imported_document_date, subject_breakdown, exam_breakdown, provider_selection_method')
        .single();

      if (error) {
        setTrainingMessage(error.message);
        return;
      }

      const saved = { ...data, period_number: Number(data.period_number) } as TechnicalTrainingEntry;
      setTrainingEntries((current) => {
        const exists = current.some((entry) => entry.period_number === saved.period_number);
        return exists
          ? current.map((entry) => entry.period_number === saved.period_number ? saved : entry)
          : [...current, saved].sort((a, b) => a.period_number - b.period_number);
      });
      setShowTrainingModal(false);
    } catch (error) {
      console.error('Technical training save error:', error);
      setTrainingMessage('Something went wrong. Please try again.');
    } finally {
      setSavingTraining(false);
    }
  }

  async function loadJobTradeOptions() {
    const { data, error } = await supabase
      .from('training_provider_campus_options')
      .select('trade_name')
      .order('trade_name', { ascending: true })
      .range(0, 1999);

    if (error) {
      return;
    }

    const names = Array.from(
      new Set(
        (data || [])
          .map((row: any) => String(row.trade_name || '').trim())
          .filter(Boolean)
      )
    );

    if (names.length > 0) {
      setAvailableJobTrades(names);
    }
  }

  function getJobLevelOptions(): string[] {
    if (jobCareerType === 'journeyperson') {
      return JOURNEYPERSON_EXPERIENCE_OPTIONS;
    }

    if (jobCareerType === 'other') {
      return OTHER_LEVEL_OPTIONS;
    }

    if (!jobTrade.trim()) {
      return [
        '1st Period Apprentice',
        '2nd Period Apprentice',
        '3rd Period Apprentice',
        '4th Period Apprentice',
      ];
    }

    const levels = getApprenticeshipLevels(jobTrade)
      .filter((level) => level.includes('Apprentice'));

    return levels.length > 0
      ? levels
      : [
          '1st Period Apprentice',
          '2nd Period Apprentice',
          '3rd Period Apprentice',
          '4th Period Apprentice',
        ];
  }

  function parseJobMoney(value: string): number | null {
    const cleaned = value.replace(/[^0-9.]/g, '').trim();
    if (!cleaned) return null;

    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatJobMoney(value: string): string {
    const parsed = parseJobMoney(value);
    return parsed === null ? '' : `$${parsed.toFixed(2)}`;
  }

  async function loadJobs() {
    try {
      setJobsLoading(true);

      const { data, error } = await supabase
        .from('job_posts')
        .select(
          'id, created_by, company_id, company_name, title, trade, minimum_level, city, province, employment_type, wage_min, wage_max, wage_unit, description, requirements, status, source_type, authorized_listing, published_at, created_at'
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Jobs load error:', error);
        return;
      }

      setJobPosts(
        (data || []).map((job: any) => ({
          ...job,
          wage_min:
            job.wage_min === null ? null : Number(job.wage_min),
          wage_max:
            job.wage_max === null ? null : Number(job.wage_max),
        })) as JobPost[]
      );
    } finally {
      setJobsLoading(false);
    }
  }

  function openCreateJob() {
    setJobMessage('');
    setJobTitle('');
    setJobTrade(profile?.trade || '');
    setJobLevel('');
    setJobCity(profile?.city || 'Edmonton');
    setJobCompany('');
    setJobEmploymentType('full_time');
    setJobWageMin('');
    setJobWageMax('');
    setJobWageUnit('hour');
    setJobDescription('');
    setJobRequirements('');
    setJobWorkTypes([]);
    setJobRequirementChips([]);
    setJobCareerType('apprentice');
    setShowJobTradeSuggestions(false);
    setJobCompanySuggestions([]);
    setShowJobCompanySuggestions(false);
    setShowJobCitySuggestions(false);
    setJobStatus('active');
    setShowJobModal(true);
  }

  function toggleJobWorkType(value: string) {
    setJobWorkTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function toggleJobRequirement(value: string) {
    setJobRequirementChips((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function applyJobTemplate(
    trade: string,
    level: string,
    title: string
  ) {
    setJobTrade(trade);
    setJobLevel(level);
    setJobTitle(title);
    setJobWageUnit('hour');

    if (!jobDescription.trim()) {
      setJobDescription(
        `We are looking for a reliable ${title.toLowerCase()} to join our team in ${jobCity || 'Edmonton'}.`
      );
    }
  }

  async function handleSaveJob() {
    setJobMessage('');

    if (!jobCompany.trim()) {
      setJobMessage('Enter the company name.');
      return;
    }

    if (!jobTitle.trim()) {
      setJobMessage('Enter a job title.');
      return;
    }

    if (!jobTrade.trim()) {
      setJobMessage('Enter the required trade.');
      return;
    }

    if (!jobCity.trim()) {
      setJobMessage('Enter the job location.');
      return;
    }

    if (
      containsBlockedContent(
        jobTitle,
        jobDescription,
        jobRequirements
      )
    ) {
      setJobMessage(moderationMessage());
      return;
    }

    const wageMin = parseJobMoney(jobWageMin);
    const wageMax = parseJobMoney(jobWageMax);

    if (
      (wageMin !== null &&
        (!Number.isFinite(wageMin) || wageMin < 0)) ||
      (wageMax !== null &&
        (!Number.isFinite(wageMax) || wageMax < 0))
    ) {
      setJobMessage('Enter a valid wage range.');
      return;
    }

    if (
      wageMin !== null &&
      wageMax !== null &&
      wageMax < wageMin
    ) {
      setJobMessage(
        'Maximum wage cannot be lower than minimum wage.'
      );
      return;
    }

    try {
      setSavingJob(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setJobMessage('You must be signed in.');
        return;
      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('job_posts')
        .insert({
          created_by: user.id,
          company_name: jobCompany.trim(),
          title: jobTitle.trim(),
          trade: jobTrade.trim(),
          minimum_level: jobLevel.trim() || null,
          city: jobCity.trim(),
          province: 'Alberta',
          employment_type: jobEmploymentType,
          wage_min: wageMin,
          wage_max: wageMax,
          wage_unit: jobWageUnit,
          description:
            [
              jobDescription.trim(),
              jobWorkTypes.length
                ? `Work types: ${jobWorkTypes.join(', ')}`
                : '',
            ]
              .filter(Boolean)
              .join('\n\n') || null,
          requirements:
            [
              ...jobRequirementChips,
              jobRequirements.trim(),
            ]
              .filter(Boolean)
              .join(', ') || null,
          status: jobStatus,
          source_type: 'contractor',
          authorized_listing: true,
          published_at:
            jobStatus === 'active' ? now : null,
        })
        .select(
          'id, created_by, company_id, company_name, title, trade, minimum_level, city, province, employment_type, wage_min, wage_max, wage_unit, description, requirements, status, source_type, authorized_listing, published_at, created_at'
        )
        .single();

      if (error) {
        setJobMessage(error.message);
        return;
      }

      const saved: JobPost = {
        ...data,
        wage_min:
          data.wage_min === null ? null : Number(data.wage_min),
        wage_max:
          data.wage_max === null ? null : Number(data.wage_max),
      };

      setJobPosts((current) => [saved, ...current]);
      setShowJobModal(false);
    } catch (error) {
      console.error('Create job error:', error);
      setJobMessage('Something went wrong. Please try again.');
    } finally {
      setSavingJob(false);
    }
  }

  async function handleSignOut() {
    setSessionPersistence(true);
    await supabase.auth.signOut();
    router.replace('/');
  }

  function renderRoleOnboarding() {
    return (
      <View style={styles.roleOnboardingScreen}>
        <View style={styles.roleOnboardingHeader}>
          <Text style={styles.roleOnboardingEyebrow}>
            WELCOME TO TRADES HUB
          </Text>

          <Text style={styles.roleOnboardingTitle}>
            Choose your role
          </Text>

          <Text style={styles.roleOnboardingSubtitle}>
            Select every role that applies to you. You can have more than one and switch workspaces anytime.
          </Text>
        </View>

        <View style={styles.roleOnboardingGrid}>
          {(Object.keys(ROLE_CONFIG) as TradesHubRole[]).map(
            (role) => {
              const config = ROLE_CONFIG[role];
              const selected = onboardingRoles.includes(role);
              const primary = onboardingPrimaryRole === role;

              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOnboardingCard,
                    { borderColor: config.color },
                    selected && {
                      backgroundColor: `${config.color}14`,
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => toggleOnboardingRole(role)}
                  activeOpacity={0.85}
                >
                  <View style={styles.roleOnboardingCardTop}>
                    <View
                      style={[
                        styles.roleOnboardingIcon,
                        { backgroundColor: `${config.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={config.icon}
                        size={28}
                        color={config.color}
                      />
                    </View>

                    <Ionicons
                      name={
                        selected
                          ? 'checkmark-circle'
                          : 'ellipse-outline'
                      }
                      size={24}
                      color={selected ? config.color : '#536476'}
                    />
                  </View>

                  <Text style={styles.roleOnboardingCardTitle}>
                    {config.label}
                  </Text>

                  <Text style={styles.roleOnboardingCardText}>
                    {config.description}
                  </Text>

                  {selected ? (
                    <TouchableOpacity
                      style={[
                        styles.rolePrimaryChoice,
                        primary && {
                          borderColor: config.color,
                          backgroundColor: `${config.color}18`,
                        },
                      ]}
                      onPress={(event) => {
                        event.stopPropagation();
                        setOnboardingPrimaryRole(role);
                      }}
                    >
                      <Ionicons
                        name={
                          primary
                            ? 'radio-button-on'
                            : 'radio-button-off'
                        }
                        size={16}
                        color={primary ? config.color : '#7C8796'}
                      />

                      <Text
                        style={[
                          styles.rolePrimaryChoiceText,
                          primary && { color: config.color },
                        ]}
                      >
                        {primary
                          ? 'Opens first'
                          : 'Make primary'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </TouchableOpacity>
              );
            }
          )}
        </View>

        <View style={styles.roleOnboardingVerification}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color="#D2B95B"
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.roleOnboardingVerificationTitle}>
              Verification
            </Text>

            <Text style={styles.roleOnboardingVerificationText}>
              For now, roles are self-declared. Stronger trade, employment and business checks will be added as Trades Hub grows.
            </Text>
          </View>
        </View>

        {roleOnboardingMessage ? (
          <Text style={styles.roleOnboardingError}>
            {roleOnboardingMessage}
          </Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.roleOnboardingContinue,
            onboardingRoles.length === 0 &&
              styles.disabledButton,
          ]}
          onPress={saveRoleOnboarding}
          disabled={
            onboardingRoles.length === 0 ||
            savingRoleOnboarding
          }
        >
          {savingRoleOnboarding ? (
            <ActivityIndicator color="#0B1623" />
          ) : (
            <>
              <Text style={styles.roleOnboardingContinueText}>
                CONTINUE TO TRADES HUB
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#0B1623"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  function renderFeed() {
    const role = ROLE_CONFIG[activeRole];

    const currentPeriodProgress =
      currentPeriodNumber !== null
        ? periodProgress.find(
            (period) => period.periodNumber === currentPeriodNumber
          )
        : undefined;

    const currentTraining =
      currentPeriodNumber !== null
        ? trainingEntries.find(
            (entry) => entry.period_number === currentPeriodNumber
          )
        : undefined;

    const currentPeriodPercentage =
      currentPeriodProgress?.requiredHours
        ? Math.min(
            (currentPeriodProgress.loggedHours /
              currentPeriodProgress.requiredHours) *
              100,
            100
          )
        : 0;

    const currentPeriodRemaining =
      currentPeriodProgress?.requiredHours
        ? Math.max(
            currentPeriodProgress.requiredHours -
              currentPeriodProgress.loggedHours,
            0
          )
        : null;

    const recentCareerActivity = completedHoursEntries
      .slice()
      .sort((a, b) => b.work_date.localeCompare(a.work_date))
      .slice(0, 3);

    const contractorJobs = jobPosts.filter(
      (job) => job.source_type === 'contractor'
    );
    const contractorActiveJobs = contractorJobs.filter(
      (job) => job.status === 'active'
    );
    const contractorDraftJobs = contractorJobs.filter(
      (job) => job.status === 'draft'
    );

    const roleActions: Record<
      TradesHubRole,
      { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }[]
    > = {
      tradesperson: [
        {
          icon: 'time-outline',
          title: 'Career Hours',
          text: 'Keep your apprenticeship experience current.',
        },
        {
          icon: 'school-outline',
          title: 'Technical Training',
          text: 'Track periods, schools, marks and progress.',
        },
        {
          icon: 'briefcase-outline',
          title: 'Trade Jobs',
          text: 'Find opportunities matched to your trade.',
        },
      ],
      contractor: [
        {
          icon: 'person-add-outline',
          title: 'Hiring',
          text: 'Find apprentices and experienced tradespeople.',
        },
        {
          icon: 'briefcase-outline',
          title: 'Job Posts',
          text: 'Create and manage trade-specific openings.',
        },
        {
          icon: 'business-outline',
          title: 'Company Profile',
          text: 'Build a trusted presence for your business.',
        },
      ],
      supplier: [
        {
          icon: 'pricetag-outline',
          title: 'Listings',
          text: 'Show tools, equipment and trade inventory.',
        },
        {
          icon: 'people-outline',
          title: 'Trade Reach',
          text: 'Connect with the people who use your products.',
        },
        {
          icon: 'storefront-outline',
          title: 'Store Profile',
          text: 'Build your supplier presence on Trades Hub.',
        },
      ],
      homeowner: [
        {
          icon: 'search-outline',
          title: 'Find a Pro',
          text: 'Discover trade professionals for your project.',
        },
        {
          icon: 'document-text-outline',
          title: 'Service Requests',
          text: 'Organize the work you need completed.',
        },
        {
          icon: 'bookmark-outline',
          title: 'Saved Pros',
          text: 'Keep trusted tradespeople easy to find.',
        },
      ],
    };

    return (
      <View>
        <View
          style={[
            styles.roleHero,
            { borderColor: role.color },
          ]}
        >
          <View
            style={[
              styles.roleHeroIcon,
              { backgroundColor: role.color },
            ]}
          >
            <Ionicons
              name={role.icon}
              size={25}
              color="#0B1623"
            />
          </View>

          <View style={styles.roleHeroCopy}>
            <Text style={styles.roleHeroEyebrow}>
              {role.label.toUpperCase()}
            </Text>

            <Text style={styles.roleHeroTitle}>
              {role.headline}
            </Text>

            <Text style={styles.roleHeroText}>
              {role.description}
            </Text>
          </View>
        </View>

        {activeRole === 'tradesperson' ? (
          <TradespersonCareerOverview
            profile={profile}
            careerOverviewExpanded={careerOverviewExpanded}
            setCareerOverviewExpanded={setCareerOverviewExpanded}
            currentPeriodNumber={currentPeriodNumber}
            periodNumbers={periodNumbers}
            currentPeriodProgress={currentPeriodProgress}
            currentPeriodPercentage={currentPeriodPercentage}
            currentPeriodRemaining={currentPeriodRemaining}
            currentTraining={currentTraining}
            totalHours={totalHours}
            assignedHours={assignedHours}
            totalRequiredHours={totalRequiredHours}
            setActiveTab={setActiveTab}
            setHoursMessage={setHoursMessage}
            setNewCompany={setNewCompany}
            setNewPeriod={setNewPeriod}
            setNewWorkType={setNewWorkType}
            setShowHoursModal={setShowHoursModal}
          />
        ) : null}

        {activeRole === 'tradesperson' ? (
          <TradespersonShiftTracker
            activeClockEntry={activeClockEntry}
            clockActionLoading={clockActionLoading}
            handleClockIn={handleClockIn}
            handleClockOut={handleClockOut}
            recentCareerActivity={recentCareerActivity}
            setActiveTab={setActiveTab}
          />
        ) : activeRole === 'contractor' ? (
          <ContractorWorkspace
            role={role}
            contractorJobs={contractorJobs}
            contractorActiveJobs={contractorActiveJobs}
            contractorDraftJobs={contractorDraftJobs}
            openCreateJob={openCreateJob}
            setActiveTab={setActiveTab}
          />
        ) : activeRole === 'supplier' ? (
          <SupplierDashboard
            roleColor={role.color}
            businessName={roleProfiles.supplier?.business_name}
            onOpenMarketplace={() => setActiveTab('Marketplace' as any)}
            onOpenProducts={() => setActiveTab('Jobs')}
            onOpenProfile={() => setActiveTab('Profile')}
          />
        ) : (
          <>
            <Text style={styles.dashboardSectionTitle}>
              Your workspace
            </Text>

            <View style={styles.dashboardGrid}>
              {roleActions[activeRole].map((item) => (
                <View key={item.title} style={styles.dashboardCard}>
                  <View
                    style={[
                      styles.dashboardIcon,
                      { borderColor: role.color },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={role.color}
                    />
                  </View>

                  <Text style={styles.dashboardCardTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.dashboardCardText}>
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  }

  function renderJobs() {
    const role = ROLE_CONFIG[activeRole];

    if (activeRole === 'contractor') {
      const contractorJobs = jobPosts.filter(
        (job) => job.source_type === 'contractor'
      );

      return (
        <View>
          <View style={styles.jobsHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pageTitle}>Hiring</Text>
              <Text style={styles.pageSubtitle}>
                Create trade-specific job posts and manage hiring activity.
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.createJobButton,
                { backgroundColor: role.color },
              ]}
              onPress={openCreateJob}
            >
              <Ionicons
                name="add"
                size={18}
                color="#0B1623"
              />
              <Text style={styles.createJobButtonText}>
                POST JOB
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.jobStatRow}>
            <View style={styles.jobStatCard}>
              <Text style={styles.jobStatValue}>
                {
                  contractorJobs.filter(
                    (job) => job.status === 'active'
                  ).length
                }
              </Text>
              <Text style={styles.jobStatLabel}>ACTIVE</Text>
            </View>

            <View style={styles.jobStatCard}>
              <Text style={styles.jobStatValue}>
                {
                  contractorJobs.filter(
                    (job) => job.status === 'draft'
                  ).length
                }
              </Text>
              <Text style={styles.jobStatLabel}>DRAFTS</Text>
            </View>

            <View style={styles.jobStatCard}>
              <Text style={styles.jobStatValue}>
                {contractorJobs.length}
              </Text>
              <Text style={styles.jobStatLabel}>TOTAL</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Your Job Posts</Text>

          {jobsLoading ? (
            <ActivityIndicator color={role.color} />
          ) : contractorJobs.length === 0 ? (
            <View style={styles.placeholderCard}>
              <Ionicons
                name="briefcase-outline"
                size={28}
                color={role.color}
              />
              <Text style={styles.cardTitle}>
                No job posts yet
              </Text>
              <Text style={styles.cardText}>
                Create your first trade-specific opening and start building your candidate pipeline.
              </Text>
            </View>
          ) : (
            contractorJobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <View style={styles.jobCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>
                      {job.title}
                    </Text>
                    <Text style={styles.jobCompany}>
                      {job.company_name}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.jobStatusBadge,
                      job.status === 'active'
                        ? styles.jobStatusActive
                        : styles.jobStatusDraft,
                    ]}
                  >
                    <Text style={styles.jobStatusText}>
                      {job.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobMetaWrap}>
                  <Text style={styles.jobMeta}>
                    {job.trade}
                  </Text>
                  {job.minimum_level ? (
                    <Text style={styles.jobMeta}>
                      {job.minimum_level}
                    </Text>
                  ) : null}
                  <Text style={styles.jobMeta}>
                    {job.city}, {job.province}
                  </Text>
                  <Text style={styles.jobMeta}>
                    {
                      EMPLOYMENT_TYPES.find(
                        (item) =>
                          item.value === job.employment_type
                      )?.label
                    }
                  </Text>
                </View>

                {job.wage_min !== null ||
                job.wage_max !== null ? (
                  <Text style={styles.jobWage}>
                    $
                    {job.wage_min !== null
                      ? job.wage_min.toFixed(2)
                      : '—'}
                    {' – $'}
                    {job.wage_max !== null
                      ? job.wage_max.toFixed(2)
                      : '—'}
                    {' '}
                    {
                      WAGE_UNITS.find(
                        (item) => item.value === job.wage_unit
                      )?.label
                    }
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      );
    }

    if (activeRole === 'tradesperson') {
      const activeJobs = jobPosts.filter(
        (job) => job.status === 'active'
      );

      return (
        <View>
          <Text style={styles.pageTitle}>Jobs</Text>
          <Text style={styles.pageSubtitle}>
            Find trade-specific opportunities from employers on Trades Hub.
          </Text>

          {jobsLoading ? (
            <ActivityIndicator color={role.color} />
          ) : activeJobs.length === 0 ? (
            <View style={styles.placeholderCard}>
              <Ionicons
                name="briefcase-outline"
                size={28}
                color={role.color}
              />
              <Text style={styles.cardTitle}>
                No active jobs yet
              </Text>
              <Text style={styles.cardText}>
                Matching trade opportunities will appear here as contractors post them.
              </Text>
            </View>
          ) : (
            activeJobs.map((job) => (
              <View key={job.id} style={styles.jobCard}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCompany}>
                  {job.company_name}
                </Text>

                <View style={styles.jobMetaWrap}>
                  <Text style={styles.jobMeta}>{job.trade}</Text>
                  {job.minimum_level ? (
                    <Text style={styles.jobMeta}>
                      {job.minimum_level}
                    </Text>
                  ) : null}
                  <Text style={styles.jobMeta}>
                    {job.city}, {job.province}
                  </Text>
                </View>

                {job.wage_min !== null ||
                job.wage_max !== null ? (
                  <Text style={styles.jobWage}>
                    $
                    {job.wage_min !== null
                      ? job.wage_min.toFixed(2)
                      : '—'}
                    {' – $'}
                    {job.wage_max !== null
                      ? job.wage_max.toFixed(2)
                      : '—'}
                    {' '}
                    {
                      WAGE_UNITS.find(
                        (item) => item.value === job.wage_unit
                      )?.label
                    }
                  </Text>
                ) : null}

                {job.description ? (
                  <Text style={styles.jobDescription}>
                    {job.description}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      );
    }

    const page =
      activeRole === 'supplier'
        ? {
            title: 'Products',
            subtitle: 'Manage tools, equipment and supplier listings.',
            cardTitle: 'Product Listings',
            cardText:
              'Your store inventory, tool listings and supplier offers will live here.',
            icon: 'pricetag-outline' as const,
          }
        : {
            title: 'Find a Pro',
            subtitle:
              'Find trade professionals for your home or project.',
            cardTitle: 'Trade Professional Search',
            cardText:
              'Search, compare and contact trusted trade professionals here.',
            icon: 'search-outline' as const,
          };

    return (
      <View>
        <Text style={styles.pageTitle}>{page.title}</Text>
        <Text style={styles.pageSubtitle}>{page.subtitle}</Text>

        <View
          style={[
            styles.placeholderCard,
            { borderColor: role.color },
          ]}
        >
          <Ionicons
            name={page.icon}
            size={28}
            color={role.color}
          />
          <Text style={styles.cardTitle}>{page.cardTitle}</Text>
          <Text style={styles.cardText}>{page.cardText}</Text>
        </View>
      </View>
    );
  }

  function renderCareer() {
    if (activeRole !== 'tradesperson') {
      return renderFeed();
    }

    if (profileLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#CAAE53"
          />

          <Text style={styles.loadingText}>
            Loading career...
          </Text>
        </View>
      );
    }

    return (
      <CareerSection
        profile={profile}
        careerLevels={careerLevels}
        periodNumbers={periodNumbers}
        currentPeriodNumber={currentPeriodNumber}
        careerProgressExpanded={careerProgressExpanded}
        setCareerProgressExpanded={setCareerProgressExpanded}
        careerHoursExpanded={careerHoursExpanded}
        setCareerHoursExpanded={setCareerHoursExpanded}
        careerMilestonesExpanded={careerMilestonesExpanded}
        setCareerMilestonesExpanded={setCareerMilestonesExpanded}
        periodRequirements={periodRequirements}
        periodProgress={periodProgress}
        totalHours={totalHours}
        totalRequiredHours={totalRequiredHours}
        assignedHours={assignedHours}
        unassignedHours={unassignedHours}
        overallProgressPercentage={overallProgressPercentage}
        activeClockEntry={activeClockEntry}
        completedHoursEntries={completedHoursEntries}
        clockActionLoading={clockActionLoading}
        clockMessage={clockMessage}
        handleClockIn={handleClockIn}
        handleClockOut={handleClockOut}
        hoursLoading={hoursLoading}
        hoursView={hoursView}
        setHoursView={setHoursView}
        hoursViewData={hoursViewData}
        hoursBreakdown={hoursBreakdown}
        isHistoricalBulkEntry={isHistoricalBulkEntry}
        openEntryMenu={openEntryMenu}
        setHoursMessage={setHoursMessage}
        setNewCompany={setNewCompany}
        setNewPeriod={setNewPeriod}
        setNewWorkType={setNewWorkType}
        setShowHoursModal={setShowHoursModal}
        trainingEntries={trainingEntries}
        trainingLoading={trainingLoading}
        openTraining={openTraining}
      />
    );
  }

  function renderProfile() {
    if (profileLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#CAAE53" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.pageTitle}>
          {activeRole === 'contractor'
            ? 'Company'
            : activeRole === 'supplier'
              ? 'Store'
              : 'Profile'}
        </Text>

        <Text style={styles.pageSubtitle}>
          {activeRole === 'tradesperson'
            ? 'Your trade identity, account roles and career information.'
            : activeRole === 'contractor'
              ? 'Manage your company identity, account roles and employer profile.'
              : activeRole === 'supplier'
                ? 'Manage your store identity, account roles and supplier profile.'
                : 'Manage your homeowner profile and account roles.'}
        </Text>

        <View style={styles.profileCard}>
          <View style={styles.profileCardTopRow}>
            <View style={styles.avatar}>
              <Ionicons
                name={
                  activeRole === 'contractor'
                    ? 'business'
                    : activeRole === 'supplier'
                      ? 'storefront'
                      : activeRole === 'homeowner'
                        ? 'home'
                        : 'person'
                }
                size={34}
                color="#0D1B2A"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.editRoleProfileButton,
                {
                  backgroundColor: ROLE_CONFIG[activeRole].color,
                  borderColor: ROLE_CONFIG[activeRole].color,
                },
              ]}
              onPress={openRoleProfileEditor}
            >
              <Ionicons
                name="create-outline"
                size={16}
                color="#0B1623"
              />
              <Text style={styles.editRoleProfileButtonText}>
                {activeRole === 'contractor'
                  ? 'EDIT COMPANY'
                  : activeRole === 'supplier'
                    ? 'EDIT STORE'
                    : activeRole === 'homeowner'
                      ? 'EDIT HOMEOWNER PROFILE'
                      : 'EDIT TRADESPERSON PROFILE'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {roleProfiles[activeRole]?.display_name || profile?.fullName}
          </Text>

          <Text
            style={[
              styles.profileTrade,
              { color: ROLE_CONFIG[activeRole].color },
            ]}
          >
            {activeRole === 'tradesperson'
              ? roleProfiles.tradesperson?.trade || profile?.trade
              : activeRole === 'contractor'
                ? roleProfiles.contractor?.business_name || 'Company not set'
                : activeRole === 'supplier'
                  ? roleProfiles.supplier?.business_name || 'Store not set'
                  : ROLE_CONFIG[activeRole].label}
          </Text>

          <View style={styles.profileDivider} />

          {activeRole === 'tradesperson' ? (
            <>
              <ProfileRow
                icon="ribbon-outline"
                label="Apprenticeship Level"
                value={roleProfiles.tradesperson?.career_level || profile?.apprenticeshipLevel || ''}
              />

              <ProfileRow
                icon="location-outline"
                label="City"
                value={roleProfiles.tradesperson?.city || profile?.city || ''}
              />

              <ProfileRow
                icon="mail-outline"
                label={profile?.emailVerified ? "Verified Email" : "Email (Unverified)"}
                value={profile?.email || ''}
              />
            </>
          ) : activeRole === 'contractor' ? (
            <>
              <ProfileRow
                icon="business-outline"
                label="Workspace"
                value="Contractor / Employer"
              />

              <ProfileRow
                icon="location-outline"
                label="City"
                value={roleProfiles.contractor?.city || profile?.city || ''}
              />

              <ProfileRow
                icon="call-outline"
                label="Phone"
                value={roleProfiles.contractor?.phone || 'Not set'}
              />

              <ProfileRow
                icon="globe-outline"
                label="Website"
                value={roleProfiles.contractor?.website || 'Not set'}
              />

              <ProfileRow
                icon="mail-outline"
                label={profile?.emailVerified ? "Verified Email" : "Email (Unverified)"}
                value={profile?.email || ''}
              />
            </>
          ) : activeRole === 'supplier' ? (
            <>
              <ProfileRow
                icon="storefront-outline"
                label="Workspace"
                value="Tool Shop / Supplier"
              />

              <ProfileRow
                icon="location-outline"
                label="City"
                value={roleProfiles.supplier?.city || profile?.city || ''}
              />

              <ProfileRow
                icon="call-outline"
                label="Phone"
                value={roleProfiles.supplier?.phone || 'Not set'}
              />

              <ProfileRow
                icon="globe-outline"
                label="Website"
                value={roleProfiles.supplier?.website || 'Not set'}
              />

              <ProfileRow
                icon="mail-outline"
                label={profile?.emailVerified ? "Verified Email" : "Email (Unverified)"}
                value={profile?.email || ''}
              />
            </>
          ) : (
            <>
              <ProfileRow
                icon="home-outline"
                label="Workspace"
                value="Homeowner"
              />

              <ProfileRow
                icon="location-outline"
                label="City"
                value={roleProfiles.homeowner?.city || profile?.city || ''}
              />

              <ProfileRow
                icon="mail-outline"
                label={profile?.emailVerified ? "Verified Email" : "Email (Unverified)"}
                value={profile?.email || ''}
              />
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Account Roles</Text>

        <View style={styles.roleManagementCard}>
          <View style={styles.roleManagementHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.roleManagementTitle}>
                Your Trades Hub roles
              </Text>
              <Text style={styles.roleManagementSubtitle}>
                Add roles as your career changes. One role must always remain primary.
              </Text>
            </View>

            <Ionicons name="layers-outline" size={22} color="#D2B95B" />
          </View>

          {userRoles.map((row) => {
            const config = ROLE_CONFIG[row.role];
            const verificationColor = getVerificationColor(
              row.verification_status
            );

            return (
              <View
                key={row.id}
                style={[
                  styles.profileRoleRow,
                  { borderLeftColor: config.color },
                ]}
              >
                <View
                  style={[
                    styles.profileRoleIcon,
                    {
                      borderColor: config.color,
                      backgroundColor: `${config.color}20`,
                    },
                  ]}
                >
                  <Ionicons
                    name={config.icon}
                    size={20}
                    color={config.color}
                  />
                </View>

                <View style={styles.profileRoleCopy}>
                  <View style={styles.profileRoleTitleRow}>
                    <Text style={styles.profileRoleTitle}>
                      {config.label}
                    </Text>

                    {row.is_primary ? (
                      <View
                        style={[
                          styles.profilePrimaryBadge,
                          { backgroundColor: config.color },
                        ]}
                      >
                        <Text style={styles.profilePrimaryBadgeText}>
                          PRIMARY
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.profileVerificationRow}>
                    <View
                      style={[
                        styles.profileVerificationDot,
                        { backgroundColor: verificationColor },
                      ]}
                    />
                    <Text
                      style={[
                        styles.profileVerificationText,
                        { color: verificationColor },
                      ]}
                    >
                      {formatVerificationStatus(row.verification_status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.profileRoleActions}>
                  {!row.is_primary ? (
                    <TouchableOpacity
                      style={styles.profileRoleActionButton}
                      onPress={() => switchPrimaryRole(row.role)}
                      disabled={managingRoles || switchingRole}
                    >
                      <Text style={styles.profileRoleActionText}>
                        Make primary
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {userRoles.length > 1 ? (
                    <TouchableOpacity
                      style={styles.profileRoleRemoveButton}
                      onPress={() => requestRemoveUserRole(row.role)}
                      disabled={
                        managingRoles ||
                        switchingRole ||
                        deletingRole
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={17}
                        color="#E56B6B"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}

          <View style={styles.availableRolesDivider} />

          <Text style={styles.availableRolesTitle}>Add another role</Text>

          <Text style={styles.availableRolesHelp}>
            Re-added roles start as self-declared. Any previous verified status must be verified again.
          </Text>

          <View style={styles.availableRolesGrid}>
            {(Object.keys(ROLE_CONFIG) as TradesHubRole[])
              .filter(
                (role) =>
                  !userRoles.some((row) => row.role === role)
              )
              .map((role) => {
                const config = ROLE_CONFIG[role];

                return (
                  <TouchableOpacity
                    key={role}
                    style={[
                      styles.availableRoleButton,
                      { borderColor: config.color },
                    ]}
                    onPress={() => addUserRole(role)}
                    disabled={managingRoles}
                  >
                    <View
                      style={[
                        styles.availableRoleIcon,
                        { backgroundColor: `${config.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={config.icon}
                        size={18}
                        color={config.color}
                      />
                    </View>

                    <Text style={styles.availableRoleText}>
                      {config.label}
                    </Text>

                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color={config.color}
                    />
                  </TouchableOpacity>
                );
              })}

            {(Object.keys(ROLE_CONFIG) as TradesHubRole[]).every(
              (role) =>
                userRoles.some((row) => row.role === role)
            ) ? (
              <Text style={styles.allRolesAddedText}>
                All Trades Hub roles are already on this account.
              </Text>
            ) : null}
          </View>

          {roleMessage ? (
            <Text style={styles.roleMessage}>{roleMessage}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>
          Verification
        </Text>

        <View style={styles.verificationCenterCard}>
          <View style={styles.verificationCenterHeader}>
            <View>
              <Text style={styles.verificationCenterTitle}>
                Role verification
              </Text>
              <Text style={styles.verificationCenterSubtitle}>
                For now, roles are self-declared. Verified status will require supporting information as Trades Hub grows.
              </Text>
            </View>

            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#D2B95B"
            />
          </View>

          {userRoles.map((row) => {
            const config = ROLE_CONFIG[row.role];
            const color = getVerificationColor(
              row.verification_status
            );

            const laterCheck =
              row.role === 'tradesperson'
                ? 'Later: trade registration, apprenticeship level and credentials.'
                : row.role === 'contractor'
                  ? 'Later: business identity, employer authority and company details.'
                  : row.role === 'supplier'
                    ? 'Later: business/store identity and supplier information.'
                    : 'Later: stronger account and contact verification when needed.';

            return (
              <View
                key={`verification-${row.id}`}
                style={styles.verificationCenterRow}
              >
                <View
                  style={[
                    styles.verificationCenterIcon,
                    { borderColor: config.color },
                  ]}
                >
                  <Ionicons
                    name={config.icon}
                    size={18}
                    color={config.color}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.verificationCenterRole}>
                    {config.label}
                  </Text>

                  <Text style={styles.verificationCenterLater}>
                    {laterCheck}
                  </Text>
                </View>

                <View style={styles.verificationCenterStatus}>
                  <View
                    style={[
                      styles.profileVerificationDot,
                      { backgroundColor: color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.profileVerificationText,
                      { color },
                    ]}
                  >
                    {formatVerificationStatus(
                      row.verification_status
                    )}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {activeRole === 'tradesperson' ? (
          <>
        <Text style={styles.sectionTitle}>Career Profile</Text>

        <ActionCard
          icon="construct-outline"
          title="Skills"
          subtitle="Add the work you know how to do."
        />

        <ActionCard
          icon="shield-checkmark-outline"
          title="Credentials"
          subtitle="Certificates, Red Seal and trade qualifications."
        />

        <ActionCard
          icon="hammer-outline"
          title="Experience"
          subtitle="Build your trade experience history."
        />
          </>
        ) : null}

      </View>
    );
  }

  function renderContent() {
    if (activeTab === 'Feed') {
      return renderFeed();
    }

    if (activeTab === 'Jobs') {
      if (activeRole === 'supplier') {
        return <SupplierProducts roleColor={ROLE_CONFIG.supplier.color} />;
      }

      if (activeRole === 'homeowner') {
        return <HomeownerFindPro roleColor={ROLE_CONFIG.homeowner.color} />;
      }

      return renderJobs();
    }

    if (activeTab === 'Career') {
      return activeRole === 'tradesperson'
        ? renderCareer()
        : renderFeed();
    }

    if ((activeTab as any) === 'Marketplace') {
      return <MarketplaceScreen profileTrade={profile?.trade} />;
    }

    return renderProfile();
  }

  if (
    roleOnboardingComplete === null ||
    rolesLoading
  ) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D2B95B" />
          <Text style={styles.loadingText}>
            Loading Trades Hub...
          </Text>
        </View>
      </View>
    );
  }

  if (!roleOnboardingComplete) {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.roleOnboardingContent}
        >
          {renderRoleOnboarding()}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader
        isMobile={isMobile}
        rolesLoading={rolesLoading}
        userRoles={userRoles}
        activeRole={activeRole}
        showRoleSwitcher={showRoleSwitcher}
        setShowRoleSwitcher={setShowRoleSwitcher}
        handleSignOut={handleSignOut}
      />

      {showRoleSwitcher && userRoles.length > 0 ? (
        <RoleSwitcherPanel
          isMobile={isMobile}
          userRoles={userRoles}
          activeRole={activeRole}
          switchingRole={switchingRole}
          managingRoles={managingRoles}
          deletingRole={deletingRole}
          setShowRoleSwitcher={setShowRoleSwitcher}
          switchPrimaryRole={switchPrimaryRole}
          requestRemoveUserRole={requestRemoveUserRole}
          addUserRole={addUserRole}
        />
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
      >
        {renderContent()}
      </ScrollView>

      <HomeBottomNav
        activeRole={activeRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* EDIT ROLE PROFILE */}

      <Modal
        visible={rolePendingDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deletingRole) {
            setRolePendingDelete(null);
          }
        }}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.roleDeleteConfirmCard}>
            <View style={styles.roleDeleteConfirmIcon}>
              <Ionicons
                name="warning-outline"
                size={28}
                color="#E56B6B"
              />
            </View>

            <Text style={styles.roleDeleteConfirmTitle}>
              Delete this role?
            </Text>

            <Text style={styles.roleDeleteConfirmQuestion}>
              Confirm you want to delete{' '}
              {rolePendingDelete
                ? ROLE_CONFIG[rolePendingDelete].label
                : 'this role'}
              .
            </Text>

            <View style={styles.roleDeleteWarningBox}>
              <Text style={styles.roleDeleteWarningTitle}>
                Before you continue
              </Text>

              <Text style={styles.roleDeleteWarningText}>
                • You will immediately lose access to this workspace.
              </Text>

              {rolePendingDelete === 'contractor' ? (
                <Text style={styles.roleDeleteWarningText}>
                  • Any active job posts from this account will be paused.
                </Text>
              ) : null}

              <Text style={styles.roleDeleteWarningText}>
                • Existing profile and history data will stay saved so it can be restored later.
              </Text>

              <Text style={styles.roleDeleteWarningText}>
                • If you add this role again, it returns as self-declared and any previous verified status must be verified again.
              </Text>

              {rolePendingDelete &&
              userRoles.find(
                (row) => row.role === rolePendingDelete
              )?.is_primary ? (
                <Text style={styles.roleDeleteWarningText}>
                  • This is your primary role. Another role will automatically become primary.
                </Text>
              ) : null}
            </View>

            <View style={styles.roleDeleteConfirmActions}>
              <TouchableOpacity
                style={styles.roleDeleteCancelButton}
                onPress={() => setRolePendingDelete(null)}
                disabled={deletingRole}
              >
                <Text style={styles.roleDeleteCancelText}>
                  NO, KEEP ROLE
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleDeleteConfirmButton,
                  deletingRole && styles.disabledButton,
                ]}
                onPress={confirmRemoveUserRole}
                disabled={deletingRole}
              >
                {deletingRole ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.roleDeleteConfirmText}>
                    YES, DELETE ROLE
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <RoleProfileEditorModal
        showRoleProfileModal={showRoleProfileModal}
        setShowRoleProfileModal={setShowRoleProfileModal}
        activeRole={activeRole}
        profile={profile}
        editDisplayName={editDisplayName}
        setEditDisplayName={setEditDisplayName}
        editBusinessName={editBusinessName}
        setEditBusinessName={setEditBusinessName}
        showRoleBusinessSuggestions={showRoleBusinessSuggestions}
        setShowRoleBusinessSuggestions={setShowRoleBusinessSuggestions}
        roleBusinessSearchLoading={roleBusinessSearchLoading}
        roleBusinessSuggestions={roleBusinessSuggestions}
        editRoleTrade={editRoleTrade}
        setEditRoleTrade={setEditRoleTrade}
        editCareerLevel={editCareerLevel}
        setEditCareerLevel={setEditCareerLevel}
        showRoleTradeSuggestions={showRoleTradeSuggestions}
        setShowRoleTradeSuggestions={setShowRoleTradeSuggestions}
        availableJobTrades={availableJobTrades}
        editRoleCity={editRoleCity}
        setEditRoleCity={setEditRoleCity}
        showRoleCitySuggestions={showRoleCitySuggestions}
        setShowRoleCitySuggestions={setShowRoleCitySuggestions}
        editPhone={editPhone}
        setEditPhone={setEditPhone}
        editWebsite={editWebsite}
        setEditWebsite={setEditWebsite}
        editBio={editBio}
        setEditBio={setEditBio}
        roleProfileMessage={roleProfileMessage}
        savingRoleProfile={savingRoleProfile}
        saveRoleProfile={saveRoleProfile}
      />

      {/* CREATE JOB */}

      <Modal
        visible={showJobModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJobModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Create Job Post
                </Text>

                <TouchableOpacity
                  onPress={() => setShowJobModal(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Quick Start</Text>
              <View style={styles.jobOptionGrid}>
                {(
                  [
                    ['apprentice', 'APPRENTICE'],
                    ['journeyperson', 'JOURNEYPERSON'],
                    ['other', 'OTHER'],
                  ] as const
                ).map(([value, label]) => {
                  const selected = jobCareerType === value;

                  return (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.jobOptionButton,
                        selected && styles.jobOptionButtonSelected,
                      ]}
                      onPress={() => {
                        setJobCareerType(value);
                        setJobLevel('');
                      }}
                    >
                      <Text
                        style={[
                          styles.jobOptionText,
                          selected && styles.jobOptionTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Company</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Start typing a company..."
                placeholderTextColor="#7C8796"
                value={jobCompany}
                onChangeText={(value) => {
                  setJobCompany(value);
                  setShowJobCompanySuggestions(value.trim().length >= 2);
                }}
                onFocus={() => setShowJobCompanySuggestions(true)}
              />

              {showJobCompanySuggestions && jobCompany.trim().length >= 2 ? (
                <View style={styles.suggestionBox}>
                  {jobCompanySearchLoading ? (
                    <View style={styles.companySearchStatus}>
                      <ActivityIndicator size="small" color="#4D9DE0" />
                      <Text style={styles.companySearchStatusText}>
                        Searching Edmonton-area companies...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {jobCompanySuggestions.map((company) => (
                        <TouchableOpacity
                          key={company.place_id}
                          style={styles.suggestionOption}
                          onPress={() => {
                            setJobCompany(company.name);
                            setShowJobCompanySuggestions(false);
                          }}
                        >
                          <View style={styles.companySuggestionText}>
                            <Text style={styles.suggestionText}>
                              {company.name}
                            </Text>
                            <Text style={styles.companySuggestionMeta}>
                              {company.secondary_text}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}

                      <TouchableOpacity
                        style={styles.addCompanyOption}
                        onPress={() =>
                          setShowJobCompanySuggestions(false)
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color="#4D9DE0"
                        />
                        <Text style={styles.addCompanyOptionText}>
                          Use "{jobCompany.trim()}" as entered
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : null}

              <Text style={styles.modalLabel}>Job Title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Example: Service Plumber"
                placeholderTextColor="#7C8796"
                value={jobTitle}
                onChangeText={setJobTitle}
              />

              <Text style={styles.modalLabel}>Trade</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Start typing a trade..."
                placeholderTextColor="#7C8796"
                value={jobTrade}
                onChangeText={(value) => {
                  setJobTrade(value);
                  setJobLevel('');
                  setJobWorkTypes([]);
                  setShowJobTradeSuggestions(true);
                }}
                onFocus={() => setShowJobTradeSuggestions(true)}
              />

              {showJobTradeSuggestions && jobTrade.trim().length >= 1 ? (
                <View style={styles.suggestionBox}>
                  {availableJobTrades
                    .filter((trade) =>
                      trade.toLowerCase().includes(jobTrade.toLowerCase())
                    )
                    .slice(0, 10)
                    .map((trade) => (
                      <TouchableOpacity
                        key={trade}
                        style={styles.suggestionOption}
                        onPress={() => {
                          setJobTrade(trade);
                          setJobLevel('');
                          setJobWorkTypes([]);
                          setShowJobTradeSuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{trade}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ) : null}

              <Text style={styles.modalLabel}>
                {jobCareerType === 'apprentice'
                  ? 'Apprenticeship Level'
                  : jobCareerType === 'journeyperson'
                    ? 'Journeyperson Experience'
                    : 'Experience Level'}
              </Text>
              <View style={styles.jobOptionGrid}>
                {getJobLevelOptions().map((item) => {
                  const selected = jobLevel === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.jobOptionButton,
                        selected && styles.jobOptionButtonSelected,
                      ]}
                      onPress={() => setJobLevel(item)}
                    >
                      <Text
                        style={[
                          styles.jobOptionText,
                          selected && styles.jobOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>City</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Start typing a city..."
                placeholderTextColor="#7C8796"
                value={jobCity}
                onChangeText={(value) => {
                  setJobCity(value);
                  setShowJobCitySuggestions(true);
                }}
                onFocus={() => setShowJobCitySuggestions(true)}
              />

              {showJobCitySuggestions && jobCity.trim().length >= 1 ? (
                <View style={styles.suggestionBox}>
                  {JOB_CITY_OPTIONS
                    .filter((city) =>
                      city.toLowerCase().includes(jobCity.toLowerCase())
                    )
                    .slice(0, 8)
                    .map((city) => (
                      <TouchableOpacity
                        key={city}
                        style={styles.suggestionOption}
                        onPress={() => {
                          setJobCity(city);
                          setShowJobCitySuggestions(false);
                        }}
                      >
                        <Text style={styles.suggestionText}>{city}</Text>
                      </TouchableOpacity>
                    ))}
                </View>
              ) : null}

              <Text style={styles.modalLabel}>Employment Type</Text>
              <View style={styles.jobOptionGrid}>
                {EMPLOYMENT_TYPES.map((item) => {
                  const selected = jobEmploymentType === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.jobOptionButton,
                        selected && styles.jobOptionButtonSelected,
                      ]}
                      onPress={() => setJobEmploymentType(item.value)}
                    >
                      <Text
                        style={[
                          styles.jobOptionText,
                          selected && styles.jobOptionTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Work Type</Text>
              <Text style={styles.tradeAwareHint}>
                Only work types relevant to {jobTrade || 'the selected trade'} are shown.
              </Text>
              <View style={styles.jobOptionGrid}>
                {getTradeWorkTypes(jobTrade).map((item) => {
                  const selected = jobWorkTypes.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.jobOptionButton,
                        selected && styles.jobOptionButtonSelected,
                      ]}
                      onPress={() => toggleJobWorkType(item)}
                    >
                      <Text
                        style={[
                          styles.jobOptionText,
                          selected && styles.jobOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Wage Range</Text>
              <View style={styles.jobWageInputRow}>
                <TextInput
                  style={[styles.modalInput, styles.jobWageInput]}
                  placeholder="Min"
                  placeholderTextColor="#7C8796"
                  keyboardType="decimal-pad"
                  value={jobWageMin}
                  onChangeText={(value) =>
                    setJobWageMin(value.replace(/[^0-9.]/g, ''))
                  }
                  onBlur={() =>
                    setJobWageMin(formatJobMoney(jobWageMin))
                  }
                  onFocus={() =>
                    setJobWageMin(
                      jobWageMin.replace(/[^0-9.]/g, '')
                    )
                  }
                />

                <Text style={styles.jobWageDash}>–</Text>

                <TextInput
                  style={[styles.modalInput, styles.jobWageInput]}
                  placeholder="Max"
                  placeholderTextColor="#7C8796"
                  keyboardType="decimal-pad"
                  value={jobWageMax}
                  onChangeText={(value) =>
                    setJobWageMax(value.replace(/[^0-9.]/g, ''))
                  }
                  onBlur={() =>
                    setJobWageMax(formatJobMoney(jobWageMax))
                  }
                  onFocus={() =>
                    setJobWageMax(
                      jobWageMax.replace(/[^0-9.]/g, '')
                    )
                  }
                />
              </View>

              <View style={styles.jobOptionGrid}>
                {WAGE_UNITS.map((item) => {
                  const selected = jobWageUnit === item.value;
                  return (
                    <TouchableOpacity
                      key={item.value}
                      style={[
                        styles.jobOptionButton,
                        selected && styles.jobOptionButtonSelected,
                      ]}
                      onPress={() => setJobWageUnit(item.value)}
                    >
                      <Text
                        style={[
                          styles.jobOptionText,
                          selected && styles.jobOptionTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Common Requirements</Text>
              <View style={styles.jobOptionGrid}>
                {JOB_REQUIREMENT_OPTIONS.map((item) => {
                  const selected = jobRequirementChips.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.jobOptionButton,
                        selected && styles.jobOptionButtonSelected,
                      ]}
                      onPress={() => toggleJobRequirement(item)}
                    >
                      <Text
                        style={[
                          styles.jobOptionText,
                          selected && styles.jobOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Extra Requirements</Text>
              <TextInput
                style={[styles.modalInput, styles.noteInput]}
                placeholder="Anything else applicants should know?"
                placeholderTextColor="#7C8796"
                multiline
                value={jobRequirements}
                onChangeText={setJobRequirements}
              />

              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.noteInput]}
                placeholder="Describe the role, work and schedule."
                placeholderTextColor="#7C8796"
                multiline
                value={jobDescription}
                onChangeText={setJobDescription}
              />

              <Text style={styles.modalLabel}>Post Status</Text>
              <View style={styles.manualModeRow}>
                {(
                  [
                    ['active', 'POST LIVE'],
                    ['draft', 'SAVE DRAFT'],
                  ] as const
                ).map(([value, label]) => {
                  const selected = jobStatus === value;

                  return (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.manualModeButton,
                        selected && styles.manualModeButtonSelected,
                      ]}
                      onPress={() => setJobStatus(value)}
                    >
                      <Text
                        style={[
                          styles.manualModeButtonText,
                          selected && styles.manualModeButtonTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.jobAuthorizationNote}>
                Posting this job confirms you are authorized to
                represent this employer or publish this opening.
              </Text>

              {jobMessage ? (
                <Text style={styles.modalError}>
                  {jobMessage}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.saveHoursButton,
                  savingJob && styles.disabledButton,
                ]}
                onPress={handleSaveJob}
                disabled={savingJob}
              >
                {savingJob ? (
                  <ActivityIndicator color="#0D1B2A" />
                ) : (
                  <Text style={styles.saveHoursText}>
                    {jobStatus === 'active'
                      ? 'POST JOB'
                      : 'SAVE DRAFT'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ADD HOURS */}

      <Modal
        visible={showHoursModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowHoursModal(false)
        }
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={
              styles.modalScrollContent
            }
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Add Apprenticeship Hours
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setShowHoursModal(
                      false
                    )
                  }
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Entry Type</Text>

              <View style={styles.manualModeRow}>
                <TouchableOpacity
                  style={[
                    styles.manualModeButton,
                    manualEntryKind === 'shift' &&
                      styles.manualModeButtonSelected,
                  ]}
                  onPress={() => setManualEntryKind('shift')}
                >
                  <Ionicons
                    name="time-outline"
                    size={17}
                    color={
                      manualEntryKind === 'shift'
                        ? '#0D1B2A'
                        : '#CAAE53'
                    }
                  />
                  <Text
                    style={[
                      styles.manualModeButtonText,
                      manualEntryKind === 'shift' &&
                        styles.manualModeButtonTextSelected,
                    ]}
                  >
                    SHIFT
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.manualModeButton,
                    manualEntryKind === 'historical_bulk' &&
                      styles.manualModeButtonSelected,
                  ]}
                  onPress={() => {
                    setManualEntryKind('historical_bulk');
                    setManualEntryMode('duration');
                  }}
                >
                  <Ionicons
                    name="archive-outline"
                    size={17}
                    color={
                      manualEntryKind === 'historical_bulk'
                        ? '#0D1B2A'
                        : '#CAAE53'
                    }
                  />
                  <Text
                    style={[
                      styles.manualModeButtonText,
                      manualEntryKind === 'historical_bulk' &&
                        styles.manualModeButtonTextSelected,
                    ]}
                  >
                    PAST HOURS
                  </Text>
                </TouchableOpacity>
              </View>

              {manualEntryKind === 'historical_bulk' ? (
                <View style={styles.historicalDateCard}>
                  <Text style={styles.historicalDateTitle}>
                    Past hours date range
                  </Text>

                  <Text style={styles.historicalDateText}>
                    Enter apprenticeship hours you completed before tracking daily shifts in Trades Hub. These hours stay out of daily and weekly shift totals.
                  </Text>

                  <Text style={styles.modalLabel}>Start Date</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#7C8796"
                    value={historicalStartDate}
                    onChangeText={setHistoricalStartDate}
                    onBlur={() =>
                      normalizeDateField(
                        historicalStartDate,
                        setHistoricalStartDate
                      )
                    }
                  />

                  <Text style={styles.modalLabel}>End Date</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#7C8796"
                    value={historicalEndDate}
                    onChangeText={setHistoricalEndDate}
                    onBlur={() =>
                      normalizeDateField(
                        historicalEndDate,
                        setHistoricalEndDate
                      )
                    }
                  />
                </View>
              ) : (
                <>
              <Text style={styles.modalLabel}>Entry Method</Text>


              <View style={styles.manualModeRow}>
                <TouchableOpacity
                  style={[
                    styles.manualModeButton,
                    manualEntryMode === 'times' &&
                      styles.manualModeButtonSelected,
                  ]}
                  onPress={() => setManualEntryMode('times')}
                >
                  <Ionicons
                    name="time-outline"
                    size={17}
                    color={
                      manualEntryMode === 'times'
                        ? '#0D1B2A'
                        : '#CAAE53'
                    }
                  />
                  <Text
                    style={[
                      styles.manualModeButtonText,
                      manualEntryMode === 'times' &&
                        styles.manualModeButtonTextSelected,
                    ]}
                  >
                    START / END TIMES
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.manualModeButton,
                    manualEntryMode === 'duration' &&
                      styles.manualModeButtonSelected,
                  ]}
                  onPress={() => setManualEntryMode('duration')}
                >
                  <Ionicons
                    name="calculator-outline"
                    size={17}
                    color={
                      manualEntryMode === 'duration'
                        ? '#0D1B2A'
                        : '#CAAE53'
                    }
                  />
                  <Text
                    style={[
                      styles.manualModeButtonText,
                      manualEntryMode === 'duration' &&
                        styles.manualModeButtonTextSelected,
                    ]}
                  >
                    TOTAL HOURS
                  </Text>
                </TouchableOpacity>
              </View>

              {manualEntryMode === 'times' ? (
                <View style={styles.manualTimeCard}>
                  <Text style={styles.modalLabel}>Work Date</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#7C8796"
                    value={manualWorkDate}
                    onChangeText={setManualWorkDate}
                  />

                  <View style={styles.manualTimeRow}>
                    <View style={styles.manualTimeField}>
                      <Text style={styles.manualTimeLabel}>
                        Start Time
                      </Text>
                      <TextInput
                        style={styles.manualTimeInput}
                        placeholder="8 or 830"
                        placeholderTextColor="#7C8796"
                        keyboardType="numbers-and-punctuation"
                        value={manualStartTime}
                        onChangeText={setManualStartTime}
                        onBlur={() => {
                          const normalized =
                            normalizeClockText(manualStartTime);
                          if (normalized) {
                            setManualStartTime(normalized);
                          }
                        }}
                      />

                      <View style={styles.meridiemRow}>
                        {(['AM', 'PM'] as const).map((value) => (
                          <TouchableOpacity
                            key={value}
                            style={[
                              styles.meridiemButton,
                              manualStartMeridiem === value &&
                                styles.meridiemButtonSelected,
                            ]}
                            onPress={() =>
                              setManualStartMeridiem(value)
                            }
                          >
                            <Text
                              style={[
                                styles.meridiemText,
                                manualStartMeridiem === value &&
                                  styles.meridiemTextSelected,
                              ]}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.manualTimeField}>
                      <Text style={styles.manualTimeLabel}>
                        End Time
                      </Text>
                      <TextInput
                        style={styles.manualTimeInput}
                        placeholder="430 or 4:30"
                        placeholderTextColor="#7C8796"
                        keyboardType="numbers-and-punctuation"
                        value={manualEndTime}
                        onChangeText={setManualEndTime}
                        onBlur={() => {
                          const normalized =
                            normalizeClockText(manualEndTime);
                          if (normalized) {
                            setManualEndTime(normalized);
                          }
                        }}
                      />

                      <View style={styles.meridiemRow}>
                        {(['AM', 'PM'] as const).map((value) => (
                          <TouchableOpacity
                            key={value}
                            style={[
                              styles.meridiemButton,
                              manualEndMeridiem === value &&
                                styles.meridiemButtonSelected,
                            ]}
                            onPress={() =>
                              setManualEndMeridiem(value)
                            }
                          >
                            <Text
                              style={[
                                styles.meridiemText,
                                manualEndMeridiem === value &&
                                  styles.meridiemTextSelected,
                              ]}
                            >
                              {value}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <Text style={styles.manualTimeLabel}>
                    Unpaid Break (minutes)
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Example: 30"
                    placeholderTextColor="#7C8796"
                    keyboardType="number-pad"
                    value={manualBreakMinutes}
                    onChangeText={setManualBreakMinutes}
                  />

                  <View style={styles.calculatedHoursCard}>
                    <Text style={styles.calculatedHoursLabel}>
                      CALCULATED HOURS
                    </Text>
                    <Text style={styles.calculatedHoursValue}>
                      {getManualCalculatedHours() === null
                        ? '--'
                        : `${formatHours(
                            getManualCalculatedHours() as number
                          )} hrs`}
                    </Text>
                  </View>

                  <Text style={styles.manualTimeHint}>
                    Quick entry examples: 8 → 8:00, 830 → 8:30,
                    430 → 4:30. Choose AM or PM explicitly.
                  </Text>
                </View>
              ) : null}

                </>
              )}

              <Text style={styles.modalLabel}>
                Apprenticeship Period
              </Text>

              <PeriodSelector
                periods={periodNumbers}
                selectedPeriod={newPeriod}
                onSelect={setNewPeriod}
                maxSelectablePeriod={currentPeriodNumber}
              />

              {currentPeriodNumber && (
                <Text style={styles.currentPeriodHint}>
                  Period {currentPeriodNumber} is current. Past periods can be backfilled with hours and technical training; future periods are locked.
                </Text>
              )}

              <Text style={styles.modalLabel}>Company</Text>

              {frequentCompanies.length > 0 ? (
                <View style={styles.frequentCompanySection}>
                  <Text style={styles.frequentCompanyLabel}>
                    Recent / frequent
                  </Text>

                  <View style={styles.frequentCompanyChips}>
                    {frequentCompanies.map((company) => (
                      <TouchableOpacity
                        key={company.name.toLowerCase()}
                        style={[
                          styles.frequentCompanyChip,
                          newCompany.trim().toLowerCase() ===
                            company.name.toLowerCase() &&
                            styles.frequentCompanyChipSelected,
                        ]}
                        onPress={() => {
                          setNewCompany(company.name);
                          setShowCompanySuggestions(false);
                        }}
                      >
                        <Ionicons
                          name="business-outline"
                          size={14}
                          color="#CAAE53"
                        />
                        <Text style={styles.frequentCompanyChipText}>
                          {company.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              <TextInput
                style={styles.modalInput}
                placeholder="Start typing company name..."
                placeholderTextColor="#7C8796"
                value={newCompany}
                onChangeText={(v) => {
                  setNewCompany(v);
                  setShowCompanySuggestions(v.trim().length >= 2);
                }}
                onFocus={() =>
                  setShowCompanySuggestions(true)
                }
              />
              {showCompanySuggestions && newCompany.trim().length >= 2 && (
                <View style={styles.suggestionBox}>
                  {companySearchLoading ? (
                    <View style={styles.companySearchStatus}>
                      <ActivityIndicator size="small" color="#CAAE53" />
                      <Text style={styles.companySearchStatusText}>
                        Searching companies...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {companySuggestions.map((company) => (
                        <TouchableOpacity
                          key={company.id}
                          style={styles.suggestionOption}
                          onPress={() => {
                            setNewCompany(company.name);
                            setShowCompanySuggestions(false);
                          }}
                        >
                          <View style={styles.companySuggestionText}>
                            <Text style={styles.suggestionText}>{company.name}</Text>
                            <Text style={styles.companySuggestionMeta}>
                              {company.city}, {company.province}
                              {company.verified ? ' • Verified' : ''}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}

                      {hoursGoogleCompanySuggestions
                        .filter(
                          (googleCompany) =>
                            !companySuggestions.some(
                              (localCompany) =>
                                localCompany.name.toLowerCase() ===
                                googleCompany.name.toLowerCase()
                            )
                        )
                        .map((company) => (
                          <TouchableOpacity
                            key={`google-hours-${company.place_id}`}
                            style={styles.suggestionOption}
                            onPress={() => {
                              setNewCompany(company.name);
                              setShowCompanySuggestions(false);
                            }}
                          >
                            <View style={styles.companySuggestionText}>
                              <Text style={styles.suggestionText}>
                                {company.name}
                              </Text>
                              <Text style={styles.companySuggestionMeta}>
                                {company.secondary_text} • Business listing
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}

                      {!companySuggestions.some(
                        (company) =>
                          company.name.toLowerCase() ===
                          newCompany.trim().toLowerCase()
                      ) && (
                        <TouchableOpacity
                          style={styles.addCompanyOption}
                          onPress={() => setShowCompanySuggestions(false)}
                        >
                          <Ionicons
                            name="add-circle-outline"
                            size={18}
                            color="#CAAE53"
                          />
                          <Text style={styles.addCompanyOptionText}>
                            Add "{newCompany.trim()}"
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              )}

              <Text style={styles.modalLabel}>Type of Work</Text>
              <Text style={styles.tradeAwareHint}>
                Options are matched to {profile?.trade || 'your selected trade'}.
              </Text>
              <TouchableOpacity style={styles.selectInput} onPress={() => setShowWorkTypes(v => !v)}>
                <Text style={newWorkType ? styles.selectInputText : styles.selectPlaceholder}>{newWorkType || 'Select work type'}</Text>
                <Ionicons name={showWorkTypes ? 'chevron-up' : 'chevron-down'} size={18} color="#CAAE53" />
              </TouchableOpacity>
              {showWorkTypes && (
                <View style={styles.suggestionBox}>
                  {getTradeWorkTypes(profile?.trade || '').map(w => (
                    <TouchableOpacity key={w} style={styles.suggestionOption} onPress={() => { setNewWorkType(w); setShowWorkTypes(false); }}>
                      <Text style={styles.suggestionText}>{w}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {manualEntryMode === 'duration' ? (
                <>
                  <Text style={styles.modalLabel}>Hours</Text>

                  <TextInput
                    style={styles.modalInput}
                    placeholder="Example: 8"
                    placeholderTextColor="#7C8796"
                    keyboardType="decimal-pad"
                    value={newHours}
                    onChangeText={setNewHours}
                  />
                </>
              ) : null}

              <Text style={styles.modalLabel}>
                Work Performed / Notes
              </Text>

              <TextInput
                style={[
                  styles.modalInput,
                  styles.noteInput,
                ]}
                placeholder="Optional — what did you work on?"
                placeholderTextColor="#7C8796"
                multiline
                value={newHoursNote}
                onChangeText={
                  setNewHoursNote
                }
              />

              {hoursMessage ? (
                <Text
                  style={
                    styles.modalError
                  }
                >
                  {hoursMessage}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.saveHoursButton,
                  savingHours &&
                    styles.disabledButton,
                ]}
                onPress={handleAddHours}
                disabled={savingHours}
              >
                {savingHours ? (
                  <ActivityIndicator
                    color="#0D1B2A"
                  />
                ) : (
                  <Text
                    style={
                      styles.saveHoursText
                    }
                  >
                    SAVE HOURS
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* TECHNICAL TRAINING */}

      <Modal
        visible={showTrainingModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTrainingModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Period {trainingPeriod} Technical Training
                </Text>
                <TouchableOpacity onPress={() => setShowTrainingModal(false)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Status</Text>
              <View style={styles.periodSelector}>
                {(['Not Started', 'In Progress', 'Passed', 'Failed'] as const).map((status) => {
                  const selected = trainingStatus === status;

                  const selectedStatusColor =
                    status === 'Passed'
                      ? '#3FA66B'
                      : status === 'Failed'
                        ? '#C94B4B'
                        : status === 'In Progress'
                          ? '#CAAE53'
                          : '#667483';

                  return (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.periodButton,
                        selected && {
                          backgroundColor: selectedStatusColor,
                          borderColor: selectedStatusColor,
                        },
                      ]}
                      onPress={() => setTrainingStatus(status)}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          selected && {
                            color: status === 'In Progress' ? '#0D1B2A' : '#FFFFFF',
                          },
                        ]}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View
                style={[
                  styles.trainingStatusBanner,
                  trainingStatus === 'Passed' && styles.trainingStatusBannerPassed,
                  trainingStatus === 'Failed' && styles.trainingStatusBannerFailed,
                  trainingStatus === 'In Progress' && styles.trainingStatusBannerInProgress,
                  trainingStatus === 'Not Started' && styles.trainingStatusBannerNotStarted,
                ]}
              >
                <Text
                  style={[
                    styles.trainingStatusBannerText,
                    trainingStatus === 'Passed' && styles.trainingStatusBannerTextPassed,
                    trainingStatus === 'Failed' && styles.trainingStatusBannerTextFailed,
                    trainingStatus === 'In Progress' && styles.trainingStatusBannerTextInProgress,
                  ]}
                >
                  {trainingStatus === 'Passed'
                    ? 'PASSED — technical training completed'
                    : trainingStatus === 'Failed'
                      ? 'FAILED — action required'
                      : trainingStatus === 'In Progress'
                        ? 'IN PROGRESS — technical training underway'
                        : 'NOT STARTED'}
                </Text>
              </View>

              <View style={styles.aitUploadCard}>
                <View style={styles.aitUploadHeader}>
                  <View style={styles.aitUploadIcon}>
                    <Ionicons
                      name="document-text-outline"
                      size={21}
                      color="#F6C84C"
                    />
                  </View>

                  <View style={styles.aitUploadHeaderText}>
                    <Text style={styles.aitUploadTitle}>
                      Import Progress Report
                    </Text>
                    <Text style={styles.aitUploadSubtitle}>
                      Upload your apprenticeship Progress Report PDF or a clear screenshot. Trades Hub will autofill the training results it can read.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.progressReportGuideToggle}
                  onPress={() =>
                    setShowProgressReportGuide((current) => !current)
                  }
                >
                  <View style={styles.progressReportGuideToggleLeft}>
                    <Ionicons
                      name="help-circle-outline"
                      size={18}
                      color="#CAAE53"
                    />
                    <Text style={styles.progressReportGuideToggleText}>
                      How to upload your Progress Report
                    </Text>
                  </View>

                  <Ionicons
                    name={
                      showProgressReportGuide
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={17}
                    color="#CAAE53"
                  />
                </TouchableOpacity>

                {showProgressReportGuide ? (
                  <View style={styles.progressReportGuide}>
                    <Text style={styles.progressReportGuideStep}>
                      1. Sign in to MyTradesecrets.
                    </Text>
                    <Text style={styles.progressReportGuideStep}>
                      2. Open your apprenticeship or training results.
                    </Text>
                    <Text style={styles.progressReportGuideStep}>
                      3. Open or download your Progress Report.
                    </Text>
                    <Text style={styles.progressReportGuideStep}>
                      4. Upload the PDF or a clear screenshot here.
                    </Text>
                    <Text style={styles.progressReportGuideStep}>
                      5. Trades Hub will read the report and fill in available training results.
                    </Text>
                    <Text style={styles.progressReportGuideStep}>
                      6. Review everything, then confirm and save.
                    </Text>

                    <View style={styles.progressReportPrivacyNote}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={16}
                        color="#CAAE53"
                      />
                      <Text style={styles.progressReportPrivacyText}>
                        Upload only the Progress Report. Never upload your password or login information.
                      </Text>
                    </View>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.aitUploadButton,
                    aitLetterScanning && styles.disabledButton,
                  ]}
                  onPress={handleAitLetterUpload}
                  disabled={aitLetterScanning}
                >
                  {aitLetterScanning ? (
                    <ActivityIndicator color="#0D1B2A" />
                  ) : (
                    <>
                      <Ionicons
                        name="cloud-upload-outline"
                        size={19}
                        color="#0D1B2A"
                      />
                      <Text style={styles.aitUploadButtonText}>
                        UPLOAD PROGRESS REPORT
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {aitLetterFileName ? (
                  <Text style={styles.aitUploadFileName}>
                    {aitLetterFileName}
                  </Text>
                ) : null}

                {aitLetterFileName ? (
                  <View style={styles.progressReportSourceRow}>
                    <Ionicons
                      name="document-attach-outline"
                      size={15}
                      color="#CAAE53"
                    />
                    <Text style={styles.progressReportSourceText}>
                      Source: Progress Report Import
                    </Text>
                  </View>
                ) : null}

                {aitLetterMessage ? (
                  <Text
                    style={[
                      styles.aitUploadMessage,
                      aitLetterMessage.includes('scanned') &&
                        styles.aitUploadSuccess,
                    ]}
                  >
                    {aitLetterMessage}
                  </Text>
                ) : null}

                <Text style={styles.aitUploadReviewNote}>
                  Review all imported marks, dates and pass/fail results before saving.
                </Text>
              </View>

              <Text style={styles.modalLabel}>Training Provider / Campus</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={
                  trainingProviderLoading
                    ? 'Loading relevant providers...'
                    : 'Start typing a provider or campus'
                }
                placeholderTextColor="#7C8796"
                value={trainingSchool}
                onFocus={() => setShowTrainingProviderSuggestions(true)}
                onChangeText={(value) => {
                  setTrainingSchool(value);
                  setTrainingProviderId(null);
                  setTrainingCampusId(null);
                  setTrainingProviderSelectionMethod(value.trim() ? 'manual_entry' : null);
                  setShowTrainingProviderSuggestions(true);
                }}
              />

              {showTrainingProviderSuggestions ? (
                <View style={styles.trainingProviderList}>
                  {trainingProviderLoading ? (
                    <View style={styles.trainingProviderLoadingRow}>
                      <ActivityIndicator size="small" color="#CAAE53" />
                      <Text style={styles.trainingProviderMeta}>
                        Loading providers...
                      </Text>
                    </View>
                  ) : (
                    trainingProviderSuggestions
                      .filter((provider) => {
                        const query = trainingSchool.trim().toLowerCase();
                        if (!query) return true;
                        return [
                          provider.display_name,
                          provider.provider_name,
                          provider.campus_name,
                          provider.city || '',
                          ...getProviderSearchAliases(provider.provider_name),
                        ]
                          .join(' ')
                          .toLowerCase()
                          .includes(query);
                      })
                      .map((provider) => (
                        <TouchableOpacity
                          key={`${provider.provider_id}:${provider.campus_id}`}
                          style={styles.trainingProviderOption}
                          onPress={() => {
                            setTrainingSchool(provider.display_name);
                            setTrainingProviderId(provider.provider_id);
                            setTrainingCampusId(provider.campus_id);
                            setTrainingProviderSelectionMethod('user_selected');
                            setShowTrainingProviderSuggestions(false);
                          }}
                        >
                          <View style={styles.trainingProviderNameRow}>
                            <Text style={styles.trainingProviderName}>
                              {provider.display_name}
                            </Text>
                            <Ionicons
                              name="checkmark-circle"
                              size={17}
                              color="#4CAF75"
                            />
                          </View>

                          <Text style={styles.trainingProviderMeta}>
                            {[
                              provider.city ? `${provider.city}, Alberta` : 'Alberta',
                              provider.address_line_1,
                              `Period ${trainingPeriod}`,
                            ]
                              .filter(Boolean)
                              .join(' • ')}
                          </Text>
                        </TouchableOpacity>
                      ))
                  )}

                  {!trainingProviderLoading &&
                  trainingProviderSuggestions.length === 0 ? (
                    <View style={styles.trainingProviderEmpty}>
                      <Text style={styles.trainingProviderMeta}>
                        No exact provider/campus options are available for this trade and period. You can still enter the training location manually.
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <Text style={styles.modalLabel}>Start Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#7C8796"
                value={trainingStartDate}
                onChangeText={setTrainingStartDate}
                onBlur={() => normalizeDateField(trainingStartDate, setTrainingStartDate)}
              />

              <Text style={styles.modalLabel}>End Date</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#7C8796"
                value={trainingEndDate}
                onChangeText={setTrainingEndDate}
                onBlur={() => normalizeDateField(trainingEndDate, setTrainingEndDate)}
              />

              <Text style={styles.modalLabel}>Training Marks</Text>

              <View style={styles.trainingMarksRow}>
                <View style={styles.trainingMarkField}>
                  <Text style={styles.trainingMarkLabel}>Theory</Text>
                  <View style={styles.trainingPercentInputWrap}>
                    <TextInput
                      style={styles.trainingPercentInput}
                      placeholder="--"
                      placeholderTextColor="#7C8796"
                      keyboardType="decimal-pad"
                      value={trainingTheoryAverage}
                      onChangeText={setTrainingTheoryAverage}
                    />
                    <Text style={styles.trainingPercentSymbol}>%</Text>
                  </View>
                </View>

                <View style={styles.trainingMarkField}>
                  <Text style={styles.trainingMarkLabel}>Practical</Text>
                  <View style={styles.trainingPercentInputWrap}>
                    <TextInput
                      style={styles.trainingPercentInput}
                      placeholder="--"
                      placeholderTextColor="#7C8796"
                      keyboardType="decimal-pad"
                      value={trainingPracticalAverage}
                      onChangeText={setTrainingPracticalAverage}
                    />
                    <Text style={styles.trainingPercentSymbol}>%</Text>
                  </View>
                </View>

                <View style={styles.trainingMarkField}>
                  <Text style={styles.trainingMarkLabel}>AIT Exam</Text>
                  <View style={styles.trainingPercentInputWrap}>
                    <TextInput
                      style={styles.trainingPercentInput}
                      placeholder="--"
                      placeholderTextColor="#7C8796"
                      keyboardType="decimal-pad"
                      value={trainingExamMark}
                      onChangeText={setTrainingExamMark}
                    />
                    <Text style={styles.trainingPercentSymbol}>%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.trainingResultCard}>
                <Text style={styles.trainingResultTitle}>Mark Summary</Text>
                <Text style={styles.trainingResultText}>
                  {trainingExamMark.trim()
                    ? Number(trainingExamMark) >= 70
                      ? 'AIT exam mark is at or above 70%.'
                      : 'AIT exam mark is below 70%.'
                    : 'AIT exam mark not entered.'}
                </Text>
                <Text style={styles.trainingResultNote}>
                  Official training status remains separate because complete
                  classroom requirements can include section-level minimums.
                </Text>
              </View>

              {(trainingImportSource === 'progress_report' ||
                trainingProgramVersion ||
                trainingClassroomHours ||
                trainingImportedDocumentDate ||
                trainingSubjectBreakdown.length > 0 ||
                trainingExamBreakdown.length > 0) ? (
                <View style={styles.importedTrainingCard}>
                  <View style={styles.importedTrainingHeader}>
                    <Ionicons name="document-attach-outline" size={18} color="#CAAE53" />
                    <Text style={styles.importedTrainingTitle}>Imported Progress Report Details</Text>
                  </View>

                  {trainingProgramVersion ? (
                    <Text style={styles.importedTrainingMeta}>
                      Program: {trainingProgramVersion}
                    </Text>
                  ) : null}

                  {trainingClassroomHours ? (
                    <Text style={styles.importedTrainingMeta}>
                      Classroom hours: {trainingClassroomHours}
                    </Text>
                  ) : null}

                  {trainingImportedDocumentDate ? (
                    <Text style={styles.importedTrainingMeta}>
                      Report date: {trainingImportedDocumentDate}
                    </Text>
                  ) : null}

                  {trainingSubjectBreakdown.length > 0 ? (
                    <View style={styles.importedTrainingSection}>
                      <Text style={styles.importedTrainingSectionTitle}>Classroom subjects</Text>
                      {trainingSubjectBreakdown.map((item, index) => (
                        <Text key={`subject-${index}`} style={styles.importedTrainingBreakdownText}>
                          {item.subject}
                          {item.mark !== null && item.mark !== undefined ? ` — ${item.mark}%` : ''}
                          {item.weight !== null && item.weight !== undefined ? ` • ${item.weight}% weight` : ''}
                        </Text>
                      ))}
                    </View>
                  ) : null}

                  {trainingExamBreakdown.length > 0 ? (
                    <View style={styles.importedTrainingSection}>
                      <Text style={styles.importedTrainingSectionTitle}>Period exam breakdown</Text>
                      {trainingExamBreakdown.map((item, index) => (
                        <Text key={`exam-${index}`} style={styles.importedTrainingBreakdownText}>
                          {item.subject}
                          {item.score !== null && item.score !== undefined &&
                          item.possible !== null && item.possible !== undefined
                            ? ` — ${item.score}/${item.possible}`
                            : ''}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}

              <Text style={styles.modalLabel}>Notes</Text>
              <TextInput
                style={[styles.modalInput, styles.noteInput]}
                placeholder="Optional training notes"
                placeholderTextColor="#7C8796"
                multiline
                value={trainingNote}
                onChangeText={setTrainingNote}
              />

              {trainingMessage ? (
                <Text style={styles.modalError}>{trainingMessage}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.saveHoursButton, savingTraining && styles.disabledButton]}
                onPress={handleSaveTraining}
                disabled={savingTraining}
              >
                {savingTraining ? (
                  <ActivityIndicator color="#0D1B2A" />
                ) : (
                  <Text style={styles.saveHoursText}>SAVE TRAINING</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ENTRY MENU */}

      <Modal
        visible={showEntryMenu}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowEntryMenu(false)
        }
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>
              Hours Entry
            </Text>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={openEditEntry}
            >
              <Ionicons
                name="create-outline"
                size={21}
                color="#CAAE53"
              />

              <Text
                style={styles.menuOptionText}
              >
                Edit Entry
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuOption}
              onPress={openDeleteEntry}
            >
              <Ionicons
                name="trash-outline"
                size={21}
                color="#FF7B7B"
              />

              <Text
                style={
                  styles.deleteOptionText
                }
              >
                Delete Entry
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.cancelMenuButton
              }
              onPress={() =>
                setShowEntryMenu(false)
              }
            >
              <Text
                style={
                  styles.cancelMenuText
                }
              >
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT HOURS */}

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowEditModal(false)
        }
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={
              styles.modalScrollContent
            }
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Edit Hours Entry
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setShowEditModal(
                      false
                    )
                  }
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Entry Type</Text>

              <View style={styles.manualModeRow}>
                <TouchableOpacity
                  style={[
                    styles.manualModeButton,
                    editEntryKind === 'shift' &&
                      styles.manualModeButtonSelected,
                  ]}
                  onPress={() => setEditEntryKind('shift')}
                >
                  <Text
                    style={[
                      styles.manualModeButtonText,
                      editEntryKind === 'shift' &&
                        styles.manualModeButtonTextSelected,
                    ]}
                  >
                    SHIFT
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.manualModeButton,
                    editEntryKind === 'historical_bulk' &&
                      styles.manualModeButtonSelected,
                  ]}
                  onPress={() =>
                    setEditEntryKind('historical_bulk')
                  }
                >
                  <Text
                    style={[
                      styles.manualModeButtonText,
                      editEntryKind === 'historical_bulk' &&
                        styles.manualModeButtonTextSelected,
                    ]}
                  >
                    PAST HOURS
                  </Text>
                </TouchableOpacity>
              </View>

              {editEntryKind === 'historical_bulk' ? (
                <View style={styles.historicalDateCard}>
                  <Text style={styles.modalLabel}>Start Date</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#7C8796"
                    value={editHistoricalStartDate}
                    onChangeText={setEditHistoricalStartDate}
                    onBlur={() =>
                      normalizeDateField(
                        editHistoricalStartDate,
                        setEditHistoricalStartDate
                      )
                    }
                  />

                  <Text style={styles.modalLabel}>End Date</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#7C8796"
                    value={editHistoricalEndDate}
                    onChangeText={setEditHistoricalEndDate}
                    onBlur={() =>
                      normalizeDateField(
                        editHistoricalEndDate,
                        setEditHistoricalEndDate
                      )
                    }
                  />
                </View>
              ) : null}

              <Text style={styles.modalLabel}>
                Apprenticeship Period
              </Text>

              <PeriodSelector
                periods={periodNumbers}
                selectedPeriod={editPeriod}
                onSelect={setEditPeriod}
                maxSelectablePeriod={currentPeriodNumber}
              />

              <Text style={styles.modalLabel}>Company</Text>

              {frequentCompanies.length > 0 ? (
                <View style={styles.frequentCompanySection}>
                  <Text style={styles.frequentCompanyLabel}>
                    Recent / frequent
                  </Text>

                  <View style={styles.frequentCompanyChips}>
                    {frequentCompanies.map((company) => (
                      <TouchableOpacity
                        key={`edit-${company.name.toLowerCase()}`}
                        style={[
                          styles.frequentCompanyChip,
                          editCompany.trim().toLowerCase() ===
                            company.name.toLowerCase() &&
                            styles.frequentCompanyChipSelected,
                        ]}
                        onPress={() => setEditCompany(company.name)}
                      >
                        <Ionicons
                          name="business-outline"
                          size={14}
                          color="#CAAE53"
                        />
                        <Text style={styles.frequentCompanyChipText}>
                          {company.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null}

              <TextInput
                style={styles.modalInput}
                placeholder="Start typing company name..."
                placeholderTextColor="#7C8796"
                value={editCompany}
                onChangeText={(value) => {
                  setEditCompany(value);
                  setShowEditCompanySuggestions(
                    value.trim().length >= 2
                  );
                }}
                onFocus={() =>
                  setShowEditCompanySuggestions(
                    editCompany.trim().length >= 2
                  )
                }
              />

              {showEditCompanySuggestions &&
              editCompany.trim().length >= 2 ? (
                <View style={styles.suggestionBox}>
                  {editCompanySearchLoading ? (
                    <View style={styles.companySearchStatus}>
                      <ActivityIndicator
                        size="small"
                        color="#CAAE53"
                      />
                      <Text style={styles.companySearchStatusText}>
                        Searching companies...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {editCompanySuggestions.map((company) => (
                        <TouchableOpacity
                          key={`edit-google-${company.place_id}`}
                          style={styles.suggestionOption}
                          onPress={() => {
                            setEditCompany(company.name);
                            setShowEditCompanySuggestions(false);
                          }}
                        >
                          <View style={styles.companySuggestionText}>
                            <Text style={styles.suggestionText}>
                              {company.name}
                            </Text>
                            <Text style={styles.companySuggestionMeta}>
                              {company.secondary_text}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}

                      <TouchableOpacity
                        style={styles.addCompanyOption}
                        onPress={() =>
                          setShowEditCompanySuggestions(false)
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={18}
                          color="#CAAE53"
                        />
                        <Text style={styles.addCompanyOptionText}>
                          Use "{editCompany.trim()}" as entered
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : null}

              <Text style={styles.modalLabel}>Type of Work</Text>
              <Text style={styles.tradeAwareHint}>
                Options are matched to {profile?.trade || 'your selected trade'}.
              </Text>
              <View style={styles.periodSelector}>
                {getTradeWorkTypes(profile?.trade || '').map(w => {
                  const selected = editWorkType === w;
                  return (
                    <TouchableOpacity key={w} style={[styles.periodButton, selected && styles.periodButtonSelected]} onPress={() => setEditWorkType(w)}>
                      <Text style={[styles.periodButtonText, selected && styles.periodButtonTextSelected]}>{w}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Hours</Text>

              <TextInput
                style={styles.modalInput}
                keyboardType="decimal-pad"
                value={editHours}
                onChangeText={setEditHours}
              />

              <Text style={styles.modalLabel}>
                Note
              </Text>

              <TextInput
                style={[
                  styles.modalInput,
                  styles.noteInput,
                ]}
                multiline
                value={editNote}
                onChangeText={setEditNote}
              />

              {editMessage ? (
                <Text
                  style={
                    styles.modalError
                  }
                >
                  {editMessage}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.saveHoursButton,
                  editingEntry &&
                    styles.disabledButton,
                ]}
                onPress={handleEditEntry}
                disabled={editingEntry}
              >
                {editingEntry ? (
                  <ActivityIndicator
                    color="#0D1B2A"
                  />
                ) : (
                  <Text
                    style={
                      styles.saveHoursText
                    }
                  >
                    SAVE CHANGES
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* DELETE */}

      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowDeleteModal(false)
        }
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.menuCard}>
            <Ionicons
              name="trash-outline"
              size={34}
              color="#FF7B7B"
            />

            <Text style={styles.deleteTitle}>
              Delete this entry?
            </Text>

            <Text style={styles.deleteText}>
              This will permanently remove the hours from your career total.
            </Text>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                deletingEntry &&
                  styles.disabledButton,
              ]}
              onPress={handleDeleteEntry}
              disabled={deletingEntry}
            >
              {deletingEntry ? (
                <ActivityIndicator
                  color="#FFFFFF"
                />
              ) : (
                <Text
                  style={
                    styles.deleteButtonText
                  }
                >
                  DELETE ENTRY
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.cancelMenuButton
              }
              onPress={() =>
                setShowDeleteModal(false)
              }
            >
              <Text
                style={
                  styles.cancelMenuText
                }
              >
                CANCEL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
