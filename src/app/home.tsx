// @ts-nocheck
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
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
import { supabase } from '../lib/supabase';
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

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
          <View style={styles.careerOverviewCard}>
            <View style={styles.careerOverviewHeader}>
              <View style={styles.careerOverviewHeadingWrap}>
                <Text style={styles.careerOverviewEyebrow}>
                  CAREER OVERVIEW
                </Text>
                <Text style={styles.careerOverviewTrade}>
                  {profile?.trade || 'Trade not set'}
                </Text>
                <Text style={styles.careerOverviewLevel}>
                  {profile?.apprenticeshipLevel || 'Apprenticeship level not set'}
                </Text>
              </View>

              <View style={styles.careerOverviewBadge}>
                <Ionicons
                  name="construct-outline"
                  size={20}
                  color="#D2B95B"
                />
              </View>
            </View>

            <View style={styles.careerOverviewStatsRow}>
              <View style={styles.careerOverviewStat}>
                <Text style={styles.careerOverviewStatLabel}>
                  TRACKED HOURS
                </Text>
                <Text style={styles.careerOverviewStatValue}>
                  {formatHours(totalHours)}
                </Text>
              </View>

              <View style={styles.careerOverviewStatDivider} />

              <View style={styles.careerOverviewStat}>
                <Text style={styles.careerOverviewStatLabel}>
                  CURRENT PERIOD
                </Text>
                <Text style={styles.careerOverviewStatValue}>
                  {currentPeriodNumber ? `Period ${currentPeriodNumber}` : '—'}
                </Text>
              </View>

              <View style={styles.careerOverviewStatDivider} />

              <View style={styles.careerOverviewStat}>
                <Text style={styles.careerOverviewStatLabel}>
                  TRAINING
                </Text>
                <Text
                  style={[
                    styles.careerOverviewStatValue,
                    currentTraining?.status === 'Passed' && {
                      color: '#62B77A',
                    },
                    currentTraining?.status === 'Failed' && {
                      color: '#E56B6B',
                    },
                  ]}
                >
                  {currentTraining?.status || 'Not Started'}
                </Text>
              </View>
            </View>

            {currentPeriodProgress ? (
              <View style={styles.careerOverviewProgressSection}>
                <View style={styles.careerOverviewProgressHeader}>
                  <Text style={styles.careerOverviewProgressLabel}>
                    PERIOD {currentPeriodNumber} HOURS
                  </Text>
                  <Text style={styles.careerOverviewProgressPercent}>
                    {formatPercentage(currentPeriodPercentage)}
                  </Text>
                </View>

                <Text style={styles.careerOverviewProgressValue}>
                  {formatHours(currentPeriodProgress.loggedHours)} /{' '}
                  {formatNumber(currentPeriodProgress.requiredHours)} hours
                </Text>

                <View style={styles.careerOverviewProgressTrack}>
                  <View
                    style={[
                      styles.careerOverviewProgressFill,
                      { width: `${currentPeriodPercentage}%` },
                    ]}
                  />
                </View>

                <Text style={styles.careerOverviewMilestone}>
                  {currentPeriodRemaining === 0
                    ? 'Required period hours reached.'
                    : currentPeriodRemaining !== null
                      ? `${formatNumber(currentPeriodRemaining)} hours remaining in this period`
                      : 'Add hours to start tracking this period.'}
                </Text>
              </View>
            ) : (
              <View style={styles.careerOverviewEmptyProgress}>
                <Text style={styles.careerOverviewEmptyText}>
                  Add apprenticeship hours to start tracking your current period.
                </Text>
              </View>
            )}

            <View style={styles.careerOverviewTrainingRow}>
              <View style={styles.careerOverviewTrainingIcon}>
                <Ionicons
                  name="school-outline"
                  size={18}
                  color="#D2B95B"
                />
              </View>

              <View style={styles.careerOverviewTrainingCopy}>
                <Text style={styles.careerOverviewTrainingTitle}>
                  Technical Training
                </Text>
                <Text style={styles.careerOverviewTrainingText}>
                  {currentTraining?.school_name ||
                    (currentTraining?.status
                      ? `Period ${currentPeriodNumber} — ${currentTraining.status}`
                      : 'No training provider added for this period yet.')}
                </Text>
              </View>
            </View>

            <View style={styles.careerOverviewActions}>
              <TouchableOpacity
                style={styles.careerOverviewPrimaryButton}
                onPress={() => {
                  setHoursMessage('');
                  setNewPeriod(
                    currentPeriodNumber ?? periodNumbers[0] ?? null
                  );
                  setNewCompany('');
                  setNewWorkType('');
                  setShowHoursModal(true);
                }}
              >
                <Ionicons name="add" size={18} color="#0B1623" />
                <Text style={styles.careerOverviewPrimaryButtonText}>
                  LOG HOURS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.careerOverviewSecondaryButton}
                onPress={() => setActiveTab('Career')}
              >
                <Text style={styles.careerOverviewSecondaryButtonText}>
                  VIEW CAREER
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#D2B95B"
                />
              </TouchableOpacity>
            </View>

            {totalRequiredHours ? (
              <Text style={styles.careerOverviewOverallNote}>
                Overall: {formatHours(assignedHours)} /{' '}
                {formatNumber(totalRequiredHours)} assigned apprenticeship hours
              </Text>
            ) : null}
          </View>
        ) : null}

        {activeRole === 'tradesperson' ? (
          <>
            <View style={styles.homeClockSectionHeader}>
              <Text style={styles.homeClockSectionTitle}>Shift Tracker</Text>
              <Text style={styles.homeClockSectionHint}>
                Track today’s work hours
              </Text>
            </View>

            <View
              style={[
                styles.homeClockCard,
                activeClockEntry && styles.homeClockCardActive,
              ]}
            >
              <View style={styles.homeClockCopy}>
                <View style={styles.homeClockTitleRow}>
                  <View
                    style={[
                      styles.homeClockDot,
                      activeClockEntry && styles.homeClockDotActive,
                    ]}
                  />
                  <Text style={styles.homeClockEyebrow}>SHIFT TRACKING</Text>
                </View>

                <Text style={styles.homeClockTitle}>
                  {activeClockEntry ? 'Shift in progress' : 'Ready for work?'}
                </Text>

                <Text style={styles.homeClockMeta}>
                  {activeClockEntry?.clock_in
                    ? `Clocked in at ${new Date(
                        activeClockEntry.clock_in
                      ).toLocaleTimeString('en-CA', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`
                    : 'Start tracking your apprenticeship hours.'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.homeClockButton,
                  activeClockEntry && styles.homeClockButtonActive,
                  clockActionLoading && styles.disabledButton,
                ]}
                onPress={
                  activeClockEntry ? handleClockOut : handleClockIn
                }
                disabled={clockActionLoading}
              >
                {clockActionLoading ? (
                  <ActivityIndicator
                    color={activeClockEntry ? '#FFFFFF' : '#0B1623'}
                  />
                ) : (
                  <>
                    <Ionicons
                      name={
                        activeClockEntry
                          ? 'stop-circle-outline'
                          : 'play-circle-outline'
                      }
                      size={19}
                      color={activeClockEntry ? '#FFFFFF' : '#0B1623'}
                    />
                    <Text
                      style={[
                        styles.homeClockButtonText,
                        activeClockEntry &&
                          styles.homeClockButtonTextActive,
                      ]}
                    >
                      {activeClockEntry ? 'CLOCK OUT' : 'CLOCK IN'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.dashboardSectionTitle}>
              Quick actions
            </Text>

            <View style={styles.quickActionGrid}>
              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => setActiveTab('Career')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="school-outline" size={18} color="#D2B95B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickActionTitle}>Training</Text>
                  <Text style={styles.quickActionText}>
                    Update technical training
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#6F8091" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => setActiveTab('Jobs')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="briefcase-outline" size={18} color="#D2B95B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickActionTitle}>Trade Jobs</Text>
                  <Text style={styles.quickActionText}>
                    Browse current openings
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#6F8091" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionCard}
                onPress={() => setActiveTab('Profile')}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name="person-outline" size={18} color="#D2B95B" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickActionTitle}>Profile</Text>
                  <Text style={styles.quickActionText}>
                    Trade identity and credentials
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#6F8091" />
              </TouchableOpacity>
            </View>

            <View style={styles.dashboardSectionHeaderRow}>
              <Text style={styles.dashboardSectionTitle}>
                Recent activity
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('Career')}>
                <Text style={styles.dashboardSectionLink}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.recentActivityCard}>
              {recentCareerActivity.length > 0 ? (
                recentCareerActivity.map((entry, index) => (
                  <View
                    key={entry.id}
                    style={[
                      styles.recentActivityRow,
                      index < recentCareerActivity.length - 1 &&
                        styles.recentActivityRowBorder,
                    ]}
                  >
                    <View style={styles.recentActivityIcon}>
                      <Ionicons name="time-outline" size={16} color="#D2B95B" />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentActivityTitle}>
                        {formatHours(entry.hours)} hours logged
                      </Text>
                      <Text style={styles.recentActivityMeta}>
                        {entry.company_name || 'Company not set'}
                        {entry.work_type ? ` · ${entry.work_type}` : ''}
                      </Text>
                    </View>

                    <Text style={styles.recentActivityDate}>
                      {formatDate(entry.work_date)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.recentActivityEmpty}>
                  <Ionicons name="time-outline" size={18} color="#6F8091" />
                  <Text style={styles.recentActivityEmptyText}>
                    No hours logged yet.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : activeRole === 'contractor' ? (
          <>
            <View style={styles.contractorOverviewGrid}>
              <View style={styles.contractorStatCard}>
                <Text style={styles.contractorStatLabel}>ACTIVE JOBS</Text>
                <Text style={styles.contractorStatValue}>
                  {contractorActiveJobs.length}
                </Text>
                <Text style={styles.contractorStatHint}>
                  Currently visible to tradespeople
                </Text>
              </View>

              <View style={styles.contractorStatCard}>
                <Text style={styles.contractorStatLabel}>DRAFTS</Text>
                <Text style={styles.contractorStatValue}>
                  {contractorDraftJobs.length}
                </Text>
                <Text style={styles.contractorStatHint}>
                  Job posts waiting to publish
                </Text>
              </View>

              <View style={styles.contractorStatCard}>
                <Text style={styles.contractorStatLabel}>TOTAL POSTS</Text>
                <Text style={styles.contractorStatValue}>
                  {contractorJobs.length}
                </Text>
                <Text style={styles.contractorStatHint}>
                  All contractor-created jobs
                </Text>
              </View>
            </View>

            <View style={styles.contractorActionRow}>
              <TouchableOpacity
                style={styles.contractorPrimaryAction}
                onPress={openCreateJob}
              >
                <Ionicons name="add" size={18} color="#0B1623" />
                <Text style={styles.contractorPrimaryActionText}>
                  POST A JOB
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contractorSecondaryAction}
                onPress={() => setActiveTab('Jobs')}
              >
                <Ionicons name="briefcase-outline" size={18} color={role.color} />
                <Text
                  style={[
                    styles.contractorSecondaryActionText,
                    { color: role.color },
                  ]}
                >
                  MANAGE JOBS
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contractorSecondaryAction}
                onPress={() => setActiveTab('Profile')}
              >
                <Ionicons name="business-outline" size={18} color={role.color} />
                <Text
                  style={[
                    styles.contractorSecondaryActionText,
                    { color: role.color },
                  ]}
                >
                  COMPANY PROFILE
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dashboardSectionHeaderRow}>
              <Text style={styles.dashboardSectionTitle}>
                Recent job posts
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('Jobs')}>
                <Text
                  style={[
                    styles.dashboardSectionLink,
                    { color: role.color },
                  ]}
                >
                  VIEW ALL
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contractorRecentCard}>
              {contractorJobs.length > 0 ? (
                contractorJobs.slice(0, 3).map((job, index) => (
                  <TouchableOpacity
                    key={job.id}
                    style={[
                      styles.contractorRecentRow,
                      index < Math.min(contractorJobs.length, 3) - 1 &&
                        styles.contractorRecentRowBorder,
                    ]}
                    onPress={() => setActiveTab('Jobs')}
                    activeOpacity={0.85}
                  >
                    <View
                      style={[
                        styles.contractorRecentIcon,
                        { borderColor: role.color },
                      ]}
                    >
                      <Ionicons
                        name="briefcase-outline"
                        size={17}
                        color={role.color}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.contractorRecentTitle}>
                        {job.title}
                      </Text>
                      <Text style={styles.contractorRecentMeta}>
                        {job.trade} · {job.city}, {job.province}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.contractorStatusBadge,
                        job.status === 'active'
                          ? styles.contractorStatusActive
                          : styles.contractorStatusDraft,
                      ]}
                    >
                      <Text style={styles.contractorStatusText}>
                        {job.status.toUpperCase()}
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#6F8091"
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.contractorEmptyState}>
                  <Ionicons
                    name="briefcase-outline"
                    size={22}
                    color={role.color}
                  />
                  <Text style={styles.contractorEmptyTitle}>
                    No job posts yet
                  </Text>
                  <Text style={styles.contractorEmptyText}>
                    Create your first opening and start building your hiring pipeline.
                  </Text>
                </View>
              )}
            </View>
          </>
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
      <View>
        <Text style={styles.pageTitle}>
          Career
        </Text>

        <Text style={styles.pageSubtitle}>
          Track your apprenticeship and career progress.
        </Text>

        <View style={styles.careerHeaderCard}>
          <View style={styles.careerIcon}>
            <Ionicons
              name="hammer-outline"
              size={28}
              color="#0D1B2A"
            />
          </View>

          <View>
            <Text style={styles.careerTrade}>
              {profile?.trade}
            </Text>

            <Text style={styles.careerLevel}>
              {profile?.apprenticeshipLevel}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.careerSectionHeader}
          onPress={() => setCareerProgressExpanded((current) => !current)}
          activeOpacity={0.85}
        >
          <View style={styles.careerSectionHeaderLeft}>
            <View style={styles.careerSectionHeaderIcon}>
              <Ionicons name="trending-up-outline" size={19} color="#D2B95B" />
            </View>
            <View>
              <Text style={styles.careerSectionHeaderTitle}>
                Apprenticeship Progress
              </Text>
              <Text style={styles.careerSectionHeaderMeta}>
                Period status and advancement
              </Text>
            </View>
          </View>
          <Ionicons
            name={careerProgressExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#D2B95B"
          />
        </TouchableOpacity>

        {careerProgressExpanded ? (
          <>
        <View style={styles.progressCard}>
          {careerLevels.map(
            (level, index) => {
              const isJourneyperson = level === 'Journeyperson';
              const periodNumber = isJourneyperson ? null : index + 1;

              const periodData =
                periodNumber !== null
                  ? periodProgress.find(
                      (period) => period.periodNumber === periodNumber
                    )
                  : undefined;

              const trainingData =
                periodNumber !== null
                  ? trainingEntries.find(
                      (entry) => entry.period_number === periodNumber
                    )
                  : undefined;

              const hoursComplete =
                periodData !== undefined &&
                periodData.requiredHours > 0 &&
                periodData.loggedHours >= periodData.requiredHours;

              const trainingPassed = trainingData?.status === 'Passed';
              const trainingFailed = trainingData?.status === 'Failed';

              const historical =
                !isJourneyperson &&
                periodNumber !== null &&
                currentPeriodNumber !== null &&
                periodNumber < currentPeriodNumber;

              const verifiedCompleted =
                !isJourneyperson &&
                hoursComplete &&
                trainingPassed;

              const journeypersonCompleted =
                isJourneyperson &&
                periodProgress.length > 0 &&
                periodProgress.every(
                  (period) =>
                    period.requiredHours > 0 &&
                    period.loggedHours >= period.requiredHours
                ) &&
                periodNumbers.every(
                  (period) =>
                    trainingEntries.find(
                      (entry) => entry.period_number === period
                    )?.status === 'Passed'
                );

              const completed =
                verifiedCompleted ||
                journeypersonCompleted;

              const current =
                !completed &&
                !isJourneyperson &&
                periodNumber === currentPeriodNumber;

              const technicalTrainingRequired =
                !completed &&
                historical &&
                !trainingFailed;

              const failed =
                !completed &&
                !isJourneyperson &&
                trainingFailed &&
                periodNumber !== null &&
                currentPeriodNumber !== null &&
                periodNumber <= currentPeriodNumber;

              const locked =
                !completed &&
                !current &&
                !failed &&
                !technicalTrainingRequired;

              return (
                <View
                  key={level}
                  style={styles.progressRow}
                >
                  <View
                    style={
                      styles.progressIndicatorColumn
                    }
                  >
                    <View
                      style={[
                        styles.progressCircle,
                        completed &&
                          styles.progressCircleCompleted,
                        current &&
                          styles.progressCircleCurrent,
                        failed &&
                          styles.progressCircleFailed,
                        technicalTrainingRequired &&
                          styles.progressCircleHistorical,
                        locked &&
                          styles.progressCircleLocked,
                      ]}
                    >
                      {completed ? (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#FFFFFF"
                        />
                      ) : failed ? (
                        <Ionicons
                          name="close"
                          size={16}
                          color="#FFFFFF"
                        />
                      ) : current ? (
                        <View
                          style={
                            styles.currentDot
                          }
                        />
                      ) : technicalTrainingRequired ? (
                        <Ionicons
                          name="document-text-outline"
                          size={14}
                          color="#CAAE53"
                        />
                      ) : locked ? (
                        <Ionicons
                          name="lock-closed"
                          size={13}
                          color="#7C8796"
                        />
                      ) : null}
                    </View>

                    {index <
                      careerLevels.length -
                        1 && (
                      <View
                        style={[
                          styles.progressLine,
                          completed &&
                            styles.progressLineCompleted,
                        ]}
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.progressTextContainer
                    }
                  >
                    <Text
                      style={[
                        styles.progressLabel,
                        current &&
                          styles.progressLabelCurrent,
                        completed &&
                          styles.progressLabelCompleted,
                        failed &&
                          styles.progressLabelFailed,
                        technicalTrainingRequired &&
                          styles.progressLabelHistorical,
                        locked &&
                          styles.progressLabelLocked,
                      ]}
                    >
                      {formatCareerLevel(
                        level
                      )}
                    </Text>

                    {current && (
                      <Text
                        style={
                          styles.currentLabel
                        }
                      >
                        CURRENT
                      </Text>
                    )}

                    {completed && (
                      <Text
                        style={
                          styles.completedLabel
                        }
                      >
                        COMPLETED
                      </Text>
                    )}

                    {failed && (
                      <Text
                        style={
                          styles.failedLabel
                        }
                      >
                        ACTION REQUIRED
                      </Text>
                    )}

                    {technicalTrainingRequired && (
                      <Text
                        style={
                          styles.historicalLabel
                        }
                      >
                        TECHNICAL TRAINING REQUIRED
                      </Text>
                    )}

                    {locked && (
                      <Text
                        style={
                          styles.lockedLabel
                        }
                      >
                        LOCKED
                      </Text>
                    )}
                  </View>
                </View>
              );
            }
          )}
        </View>

          </>
        ) : null}

        <TouchableOpacity
          style={styles.careerSectionHeader}
          onPress={() => setCareerHoursExpanded((current) => !current)}
          activeOpacity={0.85}
        >
          <View style={styles.careerSectionHeaderLeft}>
            <View style={styles.careerSectionHeaderIcon}>
              <Ionicons name="time-outline" size={19} color="#D2B95B" />
            </View>
            <View>
              <Text style={styles.careerSectionHeaderTitle}>
                Hours & Apprenticeship
              </Text>
              <Text style={styles.careerSectionHeaderMeta}>
                {formatHours(totalHours)} tracked · {formatPercentage(overallProgressPercentage)} overall
              </Text>
            </View>
          </View>
          <Ionicons
            name={careerHoursExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#D2B95B"
          />
        </TouchableOpacity>

        {careerHoursExpanded ? (
          <>
        <View style={styles.hoursCard}>
          <View style={styles.hoursTopRow}>
            <View>
              <Text style={styles.hoursLabel}>
                Apprenticeship Hours
              </Text>

              {hoursLoading ? (
                <ActivityIndicator
                  color="#CAAE53"
                  style={styles.hoursLoader}
                />
              ) : (
                <Text style={styles.hoursValue}>
                  {formatHours(totalHours)} hours
                </Text>
              )}
            </View>

            <View style={styles.hoursIcon}>
              <Ionicons
                name="time-outline"
                size={24}
                color="#CAAE53"
              />
            </View>
          </View>

          <Text style={styles.hoursHint}>
            Track hours worked throughout your apprenticeship.
          </Text>

          <View
            style={[
              styles.clockCard,
              activeClockEntry && styles.clockCardActive,
            ]}
          >
            <View style={styles.clockCardHeader}>
              <View>
                <Text style={styles.clockEyebrow}>
                  LIVE SHIFT TRACKING
                </Text>

                <Text style={styles.clockStatusTitle}>
                  {activeClockEntry
                    ? 'You are clocked in'
                    : 'Ready to start your shift'}
                </Text>

                <Text style={styles.clockStatusMeta}>
                  {activeClockEntry?.clock_in
                    ? `Started ${new Date(
                        activeClockEntry.clock_in
                      ).toLocaleTimeString('en-CA', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}`
                    : 'Clock in when your workday begins.'}
                </Text>
              </View>

              <View
                style={[
                  styles.clockLiveDot,
                  activeClockEntry && styles.clockLiveDotActive,
                ]}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.clockButton,
                activeClockEntry
                  ? styles.clockOutButton
                  : styles.clockInButton,
                clockActionLoading && styles.disabledButton,
              ]}
              onPress={
                activeClockEntry
                  ? handleClockOut
                  : handleClockIn
              }
              disabled={clockActionLoading}
            >
              {clockActionLoading ? (
                <ActivityIndicator
                  color={
                    activeClockEntry
                      ? '#FFFFFF'
                      : '#0D1B2A'
                  }
                />
              ) : (
                <>
                  <Ionicons
                    name={
                      activeClockEntry
                        ? 'stop-circle-outline'
                        : 'play-circle-outline'
                    }
                    size={20}
                    color={
                      activeClockEntry
                        ? '#FFFFFF'
                        : '#0D1B2A'
                    }
                  />

                  <Text
                    style={[
                      styles.clockButtonText,
                      activeClockEntry &&
                        styles.clockOutButtonText,
                    ]}
                  >
                    {activeClockEntry
                      ? 'CLOCK OUT'
                      : 'CLOCK IN'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {clockMessage ? (
              <Text style={styles.clockMessage}>
                {clockMessage}
              </Text>
            ) : null}

            <Text style={styles.clockDisclaimer}>
              Tracked time is not automatically official apprenticeship credit.
              Reconcile it with your pay stub before confirming qualifying hours.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addHoursButton}
            onPress={() => {
              setHoursMessage('');
              setNewPeriod(currentPeriodNumber ?? periodNumbers[0] ?? null);
              setNewCompany('');
              setNewWorkType('');
              setShowHoursModal(true);
            }}
          >
            <Ionicons
              name="add"
              size={20}
              color="#0D1B2A"
            />

            <Text style={styles.addHoursText}>
              ADD HOURS
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.overallSectionTitle}>
          Overall Apprenticeship
        </Text>

        {periodRequirements.length > 0 && totalRequiredHours ? (
          <View style={styles.officialProgressCard}>
            <View style={styles.overallProgressHeader}>
              <View style={styles.overallProgressText}>
                <Text style={styles.officialProgressLabel}>
                  Overall Apprenticeship
                </Text>
                <Text style={styles.overallProgressSubLabel}>
                  Total confirmed apprenticeship hours
                </Text>

                <Text style={styles.officialProgressValue}>
                  {formatHours(assignedHours)} / {formatNumber(totalRequiredHours)} hours
                </Text>
              </View>

              <Text style={styles.officialProgressPercent}>
                {formatPercentage(overallProgressPercentage)}
              </Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${overallProgressPercentage}%` },
                ]}
              />
            </View>

            {unassignedHours > 0 && (
              <View style={styles.unassignedWarning}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#CAAE53"
                />

                <Text style={styles.unassignedWarningText}>
                  {formatHours(unassignedHours)} unassigned hours are not included in official period progress. Edit those entries and choose a period.
                </Text>
              </View>
            )}

            <View style={styles.periodProgressDivider} />

            {periodProgress.map((period, index) => {
              const training = trainingEntries.find(
                (entry) => entry.period_number === period.periodNumber
              );

              const hoursComplete =
                period.requiredHours > 0 &&
                period.loggedHours >= period.requiredHours;

              const verifiedCompleted =
                hoursComplete &&
                training?.status === 'Passed';

              const historical =
                currentPeriodNumber !== null &&
                period.periodNumber < currentPeriodNumber;

              const completed =
                verifiedCompleted;

              const current =
                !completed &&
                period.periodNumber === currentPeriodNumber;

              const previousPeriod =
                period.periodNumber > 1
                  ? periodProgress.find(
                      (item) =>
                        item.periodNumber === period.periodNumber - 1
                    )
                  : undefined;

              const tentativeCarryoverHours =
                previousPeriod &&
                previousPeriod.requiredHours > 0
                  ? Math.max(
                      previousPeriod.loggedHours -
                        previousPeriod.requiredHours,
                      0
                    )
                  : 0;

              const confirmedPercentage =
                period.requiredHours > 0
                  ? Math.min(
                      (period.loggedHours / period.requiredHours) * 100,
                      100
                    )
                  : 0;

              const tentativePercentage =
                period.requiredHours > 0
                  ? Math.min(
                      (tentativeCarryoverHours /
                        period.requiredHours) *
                        100,
                      Math.max(100 - confirmedPercentage, 0)
                    )
                  : 0;

              const failed =
                !completed &&
                training?.status === 'Failed' &&
                currentPeriodNumber !== null &&
                period.periodNumber <= currentPeriodNumber;

              const technicalTrainingRequired =
                !completed &&
                historical &&
                !failed;

              const locked =
                !completed &&
                !current &&
                !failed &&
                !technicalTrainingRequired;

              const statusLabel = completed
                ? 'COMPLETED'
                : failed
                  ? 'ACTION REQUIRED'
                  : current
                    ? 'CURRENT'
                    : technicalTrainingRequired
                      ? 'TECHNICAL TRAINING REQUIRED'
                      : 'LOCKED';

              const remainingHours = Math.max(
                period.requiredHours - period.loggedHours,
                0
              );

              return (
                <View
                  key={period.periodNumber}
                  style={[
                    styles.periodProgressItem,
                    completed && styles.periodProgressItemCompleted,
                    current && styles.periodProgressItemCurrent,
                    failed && styles.periodProgressItemFailed,
                    locked && styles.periodProgressItemLocked,
                    index < periodProgress.length - 1 &&
                      styles.periodProgressItemBorder,
                  ]}
                >
                  <View style={styles.periodProgressHeader}>
                    <View style={styles.periodProgressTitleBlock}>
                      <View style={styles.periodProgressTitleRow}>
                        <Ionicons
                          name={
                            completed
                              ? 'checkmark-circle'
                              : failed
                                ? 'close-circle'
                                : current
                                  ? 'ellipse'
                                  : technicalTrainingRequired
                                    ? 'document-text-outline'
                                    : 'lock-closed'
                          }
                          size={21}
                          color={
                            completed
                              ? '#3FA66B'
                              : failed
                                ? '#E56B6B'
                                : current
                                  ? '#CAAE53'
                                  : technicalTrainingRequired
                                    ? '#CAAE53'
                                    : '#667483'
                          }
                        />

                        <Text
                          style={[
                            styles.periodProgressTitle,
                            completed && styles.periodProgressTitleCompleted,
                            locked && styles.periodProgressTitleLocked,
                          ]}
                        >
                          Period {period.periodNumber}
                        </Text>

                        <View
                          style={[
                            styles.periodStatusBadge,
                            completed && styles.periodStatusBadgeCompleted,
                            current && styles.periodStatusBadgeCurrent,
                            failed && styles.periodStatusBadgeFailed,
                            technicalTrainingRequired && styles.periodStatusBadgeHistorical,
                            locked && styles.periodStatusBadgeLocked,
                          ]}
                        >
                          <Text
                            style={[
                              styles.periodStatusBadgeText,
                              completed && styles.periodStatusTextCompleted,
                              current && styles.periodStatusTextCurrent,
                              failed && styles.periodStatusTextFailed,
                              technicalTrainingRequired && styles.periodStatusTextHistorical,
                              locked && styles.periodStatusTextLocked,
                            ]}
                          >
                            {statusLabel}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.periodProgressHours}>
                        {formatHours(period.loggedHours)} / {formatNumber(period.requiredHours)} confirmed hours
                      </Text>

                      {tentativeCarryoverHours > 0 ? (
                        <View style={styles.carryoverRow}>
                          <View style={styles.carryoverDot} />
                          <Text style={styles.carryoverText}>
                            +{formatHours(tentativeCarryoverHours)} pending carryover
                          </Text>
                        </View>
                      ) : null}

                      {!completed && period.requiredHours > 0 ? (
                        <Text style={styles.periodRemainingHours}>
                          {formatNumber(remainingHours)} confirmed hours remaining
                        </Text>
                      ) : null}
                    </View>

                    <Text
                      style={[
                        styles.periodProgressPercent,
                        completed && { color: '#3FA66B' },
                        failed && { color: '#E56B6B' },
                        locked && { color: '#7C8796' },
                      ]}
                    >
                      {formatPercentage(period.percentage)}
                    </Text>
                  </View>

                  <View style={styles.periodProgressBarTrack}>
                    <View
                      style={[
                        styles.periodProgressBarFill,
                        completed && styles.periodProgressBarCompleted,
                        current && styles.periodProgressBarCurrent,
                        failed && styles.periodProgressBarFailed,
                        locked && styles.periodProgressBarLocked,
                        { width: `${confirmedPercentage}%` },
                      ]}
                    />
                    {tentativePercentage > 0 ? (
                      <View
                        style={[
                          styles.periodProgressBarTentative,
                          {
                            left: `${confirmedPercentage}%`,
                            width: `${tentativePercentage}%`,
                          },
                        ]}
                      />
                    ) : null}
                  </View>

                  {tentativeCarryoverHours > 0 ? (
                    <Text style={styles.carryoverNote}>
                      Blue = pending carryover only. It does not count as confirmed progress until accepted.
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.requirementsUnavailableCard}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#CAAE53"
            />

            <View style={styles.requirementsUnavailableText}>
              <Text style={styles.requirementsUnavailableTitle}>
                Official hour requirements coming soon
              </Text>

              <Text style={styles.requirementsUnavailableSubtitle}>
                Your logged hours are saved, but verified period-hour requirements have not been added for this trade yet.
              </Text>
            </View>
          </View>
        )}

        {completedHoursEntries.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Hours History
            </Text>

            <View style={styles.hoursHistoryCard}>
              <View style={styles.hoursViewTabs}>
                {(
                  [
                    ['week', 'WEEK'],
                    ['month', 'MONTH'],
                    ['year', 'YEAR'],
                    ['all', 'ALL'],
                  ] as [HoursView, string][]
                ).map(([value, label]) => {
                  const selected = hoursView === value;

                  return (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.hoursViewTab,
                        selected && styles.hoursViewTabSelected,
                      ]}
                      onPress={() => setHoursView(value)}
                    >
                      <Text
                        style={[
                          styles.hoursViewTabText,
                          selected &&
                            styles.hoursViewTabTextSelected,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.hoursViewSummary}>
                <View>
                  <Text style={styles.hoursViewSummaryLabel}>
                    {hoursView === 'week'
                      ? 'THIS WEEK'
                      : hoursView === 'month'
                        ? 'THIS MONTH'
                        : hoursView === 'year'
                          ? 'THIS YEAR'
                          : 'ALL-TIME TRACKED'}
                  </Text>

                  <Text style={styles.hoursViewSummaryValue}>
                    {formatHours(hoursViewData.total)} hrs
                  </Text>
                </View>

                <Ionicons
                  name="bar-chart-outline"
                  size={24}
                  color="#CAAE53"
                />
              </View>

              <View style={styles.hoursBreakdownList}>
                {hoursBreakdown.map((row, index) => (
                  <View
                    key={row.key}
                    style={[
                      styles.hoursBreakdownRow,
                      index < hoursBreakdown.length - 1 &&
                        styles.hoursBreakdownRowBorder,
                    ]}
                  >
                    <Text style={styles.hoursBreakdownLabel}>
                      {row.label}
                    </Text>

                    <Text style={styles.hoursBreakdownValue}>
                      {formatHours(row.total)} hrs
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.hoursHistoryDivider} />

              <Text style={styles.hoursEntriesTitle}>
                {hoursView === 'week'
                  ? 'This week’s entries'
                  : hoursView === 'month'
                    ? 'This month’s entries'
                    : hoursView === 'year'
                      ? 'This year’s entries'
                      : 'All entries'}
              </Text>

              {hoursViewData.entries.length > 0 ? (
                hoursViewData.entries
                  .slice()
                  .sort((a, b) =>
                    b.work_date.localeCompare(a.work_date)
                  )
                  .slice(0, hoursView === 'all' ? 25 : 15)
                  .map((entry, index, array) => {
                    const historical =
                      isHistoricalBulkEntry(entry);

                    return (
                      <View
                        key={entry.id}
                        style={[
                          styles.hoursEntry,
                          index < array.length - 1 &&
                            styles.hoursEntryBorder,
                        ]}
                      >
                        <View style={styles.hoursEntryText}>
                          <View style={styles.hoursEntryTitleRow}>
                            <Text style={styles.hoursEntryAmount}>
                              {formatHours(entry.hours)} hours
                            </Text>

                            {historical ? (
                              <View
                                style={
                                  styles.historicalHoursBadge
                                }
                              >
                                <Text
                                  style={
                                    styles.historicalHoursBadgeText
                                  }
                                >
                                  PAST HOURS
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          <Text style={styles.periodBadgeText}>
                            {entry.period_number
                              ? `Period ${entry.period_number}`
                              : 'Unassigned'}
                          </Text>

                          <Text style={styles.hoursEntryDate}>
                            {historical &&
                            entry.historical_start_date &&
                            entry.historical_end_date
                              ? `${formatDate(
                                  entry.historical_start_date
                                )} – ${formatDate(
                                  entry.historical_end_date
                                )}`
                              : formatDate(entry.work_date)}
                          </Text>

                          <View style={styles.hoursEntryMetaRow}>
                            <Text style={styles.hoursEntrySource}>
                              {historical
                                ? 'PAST HOURS'
                                : entry.entry_source === 'clock'
                                  ? 'CLOCKED'
                                  : 'MANUAL'}
                            </Text>

                            <Text style={styles.hoursEntryStatus}>
                              {(
                                entry.reconciliation_status ||
                                'tracked'
                              ).toUpperCase()}
                            </Text>
                          </View>

                          {entry.company_name ? (
                            <Text style={styles.hoursEntryCompany}>
                              {entry.company_name}
                            </Text>
                          ) : null}

                          {entry.note ? (
                            <Text style={styles.hoursEntryNote}>
                              {entry.note}
                            </Text>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          style={styles.entryMenuButton}
                          onPress={() => openEntryMenu(entry)}
                        >
                          <Ionicons
                            name="ellipsis-horizontal"
                            size={22}
                            color="#CAAE53"
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })
              ) : (
                <View style={styles.hoursEmptyState}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color="#7C8796"
                  />
                  <Text style={styles.hoursEmptyStateText}>
                    No tracked hours in this period yet.
                  </Text>
                </View>
              )}

              {hoursView === 'all' &&
              hoursViewData.entries.length > 25 ? (
                <Text style={styles.hoursHistoryLimitNote}>
                  Showing the latest 25 entries. Full searchable history
                  can be added later.
                </Text>
              ) : null}
            </View>
          </>
        )}

          </>
        ) : null}

        <TouchableOpacity
          style={styles.careerSectionHeader}
          onPress={() => setCareerMilestonesExpanded((current) => !current)}
          activeOpacity={0.85}
        >
          <View style={styles.careerSectionHeaderLeft}>
            <View style={styles.careerSectionHeaderIcon}>
              <Ionicons name="school-outline" size={19} color="#D2B95B" />
            </View>
            <View>
              <Text style={styles.careerSectionHeaderTitle}>
                Training & Credentials
              </Text>
              <Text style={styles.careerSectionHeaderMeta}>
                Technical training, marks and qualifications
              </Text>
            </View>
          </View>
          <Ionicons
            name={careerMilestonesExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#D2B95B"
          />
        </TouchableOpacity>

        {careerMilestonesExpanded ? (
          <>
        <View style={styles.trainingCard}>
          {trainingLoading ? (
            <ActivityIndicator color="#CAAE53" />
          ) : (
            periodNumbers.map((period, index) => {
              const training = trainingEntries.find((entry) => entry.period_number === period);
              const status = training?.status || 'Not Started';
              const passed = status === 'Passed';
              const failed = status === 'Failed';
              const inProgress = status === 'In Progress';
              const futureLocked =
                currentPeriodNumber !== null &&
                period > currentPeriodNumber;

              return (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.trainingRow,
                    passed && styles.trainingRowPassed,
                    failed && styles.trainingRowFailed,
                    inProgress && styles.trainingRowInProgress,
                    futureLocked && styles.trainingRowLocked,
                    index < periodNumbers.length - 1 && styles.trainingRowBorder,
                  ]}
                  onPress={() => openTraining(period)}
                  disabled={futureLocked}
                >
                  <View style={[
                    styles.trainingStatusIcon,
                    passed && styles.trainingStatusPassed,
                    failed && {
                      backgroundColor: '#C94B4B',
                      borderColor: '#C94B4B',
                    },
                    inProgress && styles.trainingStatusCurrent,
                  ]}>
                    <Ionicons
                      name={
                        futureLocked
                          ? 'lock-closed'
                          : passed
                            ? 'checkmark'
                            : failed
                              ? 'close'
                              : 'school-outline'
                      }
                      size={18}
                      color={
                        futureLocked
                          ? '#7C8796'
                          : passed || failed
                            ? '#FFFFFF'
                            : '#CAAE53'
                      }
                    />
                  </View>

                  <View style={styles.trainingRowText}>
                    <Text style={styles.trainingPeriodTitle}>Period {period} Technical Training</Text>
                    <Text style={[
                      styles.trainingStatusText,
                      passed && styles.trainingPassedText,
                      failed && { color: '#E56B6B' },
                      inProgress && { color: '#CAAE53' },
                    ]}>
                      {futureLocked ? 'LOCKED' : status.toUpperCase()}
                    </Text>
                    {training?.school_name ? (
                      <Text style={styles.trainingMeta}>{training.school_name}</Text>
                    ) : null}
                  </View>

                  <Ionicons name="chevron-forward" size={20} color="#7C8796" />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#CAAE53"
            />
          </View>

          <View
            style={
              styles.milestoneTextContainer
            }
          >
            <Text
              style={
                styles.milestoneTitle
              }
            >
              Credentials
            </Text>

            <Text
              style={
                styles.milestoneSubtitle
              }
            >
              Red Seal, certifications and future trade qualifications.
            </Text>
          </View>
        </View>
          </>
        ) : null}
      </View>
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
      <View
        style={[
          styles.header,
          isMobile && styles.headerMobile,
          {
            paddingTop:
              (isMobile ? styles.headerMobile.paddingTop : styles.header.paddingVertical) +
              insets.top,
          },
        ]}
      >
        <View style={[styles.headerBrand, isMobile && styles.headerBrandMobile]}>
          <Image
            source={require('../../assets/images/trades-hub-logo.png')}
            style={[
              styles.headerLogoImage,
              isMobile && styles.headerLogoImageMobile,
            ]}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
          {!rolesLoading && userRoles.length > 0 ? (
            <TouchableOpacity
              style={[
                styles.roleSwitcherButton,
                { borderColor: ROLE_CONFIG[activeRole].color },
              ]}
              onPress={() =>
                setShowRoleSwitcher((current) => !current)
              }
            >
              <View
                style={[
                  styles.roleDot,
                  { backgroundColor: ROLE_CONFIG[activeRole].color },
                ]}
              />

              <Text style={styles.roleSwitcherText}>
                {ROLE_CONFIG[activeRole].shortLabel}
              </Text>

              <Ionicons
                name={
                  showRoleSwitcher
                    ? 'chevron-up-outline'
                    : 'chevron-down-outline'
                }
                size={16}
                color="#A9B3BF"
              />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#D2B95B"
            />
          </TouchableOpacity>
        </View>
      </View>

      {showRoleSwitcher && userRoles.length > 0 ? (
        <>
          <TouchableOpacity
            style={styles.roleSwitcherBackdrop}
            activeOpacity={1}
            onPress={() => setShowRoleSwitcher(false)}
          />

          <View
            style={[
              styles.roleSwitcherPanel,
              isMobile && styles.roleSwitcherPanelMobile,
            ]}
          >
          <Text style={styles.roleSwitcherTitle}>
            Switch workspace
          </Text>

          <Text style={styles.roleSwitcherSubtitle}>
            Choose which workspace you want to use.
          </Text>

          {userRoles.map((row) => {
            const config = ROLE_CONFIG[row.role];
            const selected = row.role === activeRole;

            return (
              <View
                key={row.id}
                style={[
                  styles.roleSwitcherOption,
                  selected && {
                    borderColor: config.color,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.roleSwitcherMainAction}
                  onPress={() => switchPrimaryRole(row.role)}
                  disabled={switchingRole}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.roleSwitcherOptionIcon,
                      {
                        backgroundColor: selected
                          ? config.color
                          : '#152536',
                        borderColor: config.color,
                      },
                    ]}
                  >
                    <Ionicons
                      name={config.icon}
                      size={19}
                      color={selected ? '#0B1623' : config.color}
                    />
                  </View>

                  <View style={styles.roleSwitcherOptionCopy}>
                    <Text style={styles.roleSwitcherOptionTitle}>
                      {config.label}
                    </Text>

                    <Text style={styles.roleSwitcherOptionStatus}>
                      {selected ? 'Current workspace' : 'Switch to this role'}
                    </Text>
                  </View>

                  {selected ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={config.color}
                    />
                  ) : null}
                </TouchableOpacity>

                {userRoles.length > 1 ? (
                  <TouchableOpacity
                    style={styles.roleSwitcherDeleteButton}
                    onPress={() => requestRemoveUserRole(row.role)}
                    disabled={
                      switchingRole ||
                      managingRoles ||
                      deletingRole
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color="#E56B6B"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}

          {(['tradesperson', 'contractor', 'supplier', 'homeowner'] as TradesHubRole[]).some(
            (role) => !userRoles.some((row) => row.role === role)
          ) ? (
            <>
              <View style={styles.roleSwitcherAddDivider} />

              <Text style={styles.roleSwitcherAddTitle}>
                Add role
              </Text>

              <Text style={styles.roleSwitcherAddHelp}>
                Add another workspace to this account. New roles start as self-declared and can be verified later.
              </Text>

              {(['tradesperson', 'contractor', 'supplier', 'homeowner'] as TradesHubRole[])
                .filter(
                  (role) => !userRoles.some((row) => row.role === role)
                )
                .map((role) => {
                  const config = ROLE_CONFIG[role];

                  return (
                    <TouchableOpacity
                      key={`add-${role}`}
                      style={styles.roleSwitcherAddOption}
                      onPress={() => addUserRole(role)}
                      disabled={
                        managingRoles ||
                        switchingRole ||
                        deletingRole
                      }
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.roleSwitcherOptionIcon,
                          {
                            backgroundColor: Brand.navy800,
                            borderColor: config.color,
                          },
                        ]}
                      >
                        <Ionicons
                          name={config.icon}
                          size={19}
                          color={config.color}
                        />
                      </View>

                      <View style={styles.roleSwitcherOptionCopy}>
                        <Text style={styles.roleSwitcherOptionTitle}>
                          {config.label}
                        </Text>

                        <Text style={styles.roleSwitcherOptionStatus}>
                          Add to your account
                        </Text>
                      </View>

                      <Ionicons
                        name="add-circle-outline"
                        size={22}
                        color={config.color}
                      />
                    </TouchableOpacity>
                  );
                })}
            </>
          ) : null}
        </View>
        </>
      ) : null}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={
          styles.content
        }
      >
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}>
        {[
          ...ROLE_TABS[activeRole],
          {
            name: 'Marketplace' as any,
            label: 'Market',
            icon: 'storefront-outline' as const,
          },
        ].map((tab) => {
          const selected = activeTab === tab.name;

          return (
            <TouchableOpacity
              key={`${activeRole}-${tab.name}`}
              style={styles.navItem}
              onPress={() => setActiveTab(tab.name)}
            >
              <Ionicons
                name={tab.icon}
                size={23}
                color={
                  selected
                    ? ROLE_CONFIG[activeRole].color
                    : '#7C8796'
                }
              />

              <Text
                style={[
                  styles.navText,
                  selected && styles.navTextSelected,
                  selected && {
                    color: ROLE_CONFIG[activeRole].color,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

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

      <Modal
        visible={showRoleProfileModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRoleProfileModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Edit {ROLE_CONFIG[activeRole].label}
                </Text>

                <TouchableOpacity
                  onPress={() => setShowRoleProfileModal(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

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
            </View>
          </ScrollView>
        </View>
      </Modal>

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

function PeriodSelector({
  periods,
  selectedPeriod,
  onSelect,
  maxSelectablePeriod,
}: {
  periods: number[];
  selectedPeriod: number | null;
  onSelect: (period: number) => void;
  maxSelectablePeriod?: number | null;
}) {
  return (
    <View style={styles.periodSelector}>
      {periods.map((period) => {
        const selected =
          selectedPeriod === period;

        const locked =
          maxSelectablePeriod !== null &&
          maxSelectablePeriod !== undefined &&
          period > maxSelectablePeriod;

        return (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selected &&
                styles.periodButtonSelected,
              locked &&
                styles.periodButtonLocked,
            ]}
            onPress={() =>
              onSelect(period)
            }
            disabled={locked}
          >
            <Text
              style={[
                styles.periodButtonText,
                selected &&
                  styles.periodButtonTextSelected,
                locked &&
                  styles.periodButtonTextLocked,
              ]}
            >
              {locked ? `🔒 Period ${period}` : `Period ${period}`}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function formatCareerLevel(
  level: string
) {
  if (level === 'Journeyperson') {
    return 'Journeyperson';
  }

  return level.replace(
    ' Apprentice',
    ''
  );
}

function formatHours(hours: number) {
  return Number.isInteger(hours)
    ? hours.toString()
    : hours.toFixed(1);
}

function formatNumber(value: number) {
  return value.toLocaleString('en-CA');
}

function formatPercentage(value: number) {
  if (value <= 0) return '0%';
  if (value >= 100) return '100%';

  return `${value.toFixed(1)}%`;
}

function formatDate(date: string) {
  const parsed = new Date(
    `${date}T00:00:00`
  );

  return parsed.toLocaleDateString(
    'en-CA',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );
}

function ProfileRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;

  label: string;
  value: string;
}) {
  return (
    <View style={styles.profileRow}>
      <Ionicons
        name={icon}
        size={20}
        color="#CAAE53"
      />

      <View style={styles.profileRowText}>
        <Text style={styles.profileLabel}>
          {label}
        </Text>

        <Text style={styles.profileValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
}: {
  icon:
    | 'construct-outline'
    | 'shield-checkmark-outline'
    | 'hammer-outline';

  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.actionCard}>
      <View style={styles.actionIcon}>
        <Ionicons
          name={icon}
          size={22}
          color="#CAAE53"
        />
      </View>

      <View
        style={
          styles.actionTextContainer
        }
      >
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text
          style={styles.actionSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#7C8796"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },

  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1D3042',
  },

  headerMobile: {
    minHeight: 116,
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    rowGap: 10,
  },

  headerBrand: {
    flexShrink: 1,
    justifyContent: 'center',
  },

  headerBrandMobile: {
    width: '100%',
    alignItems: 'flex-start',
  },

  headerLogoImage: {
    width: 210,
    height: 44,
  },

  headerLogoImageMobile: {
    width: 168,
    height: 38,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  headerActionsMobile: {
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },

  roleSwitcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 8,
    backgroundColor: '#111F2E',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  roleSwitcherText: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },

  signOutButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#111F2E',
    borderWidth: 1,
    borderColor: '#26394C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleSwitcherBackdrop: {
    position: 'absolute',
    top: 72,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 90,
    backgroundColor: 'transparent',
  },

  roleSwitcherPanel: {
    position: 'absolute',
    top: 64,
    right: 24,
    zIndex: 100,
    width: 340,
    maxWidth: '88%',
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#30475B',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  roleSwitcherPanelMobile: {
    top: 108,
    right: 16,
    left: 16,
    width: 'auto',
    maxWidth: 'none',
  },

  roleSwitcherTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  roleSwitcherSubtitle: {
    color: '#8391A0',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 11,
  },

  roleSwitcherOption: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#25394B',
    borderRadius: 9,
    marginTop: 7,
    overflow: 'hidden',
  },

  roleSwitcherAddDivider: {
    height: 1,
    backgroundColor: '#25394B',
    marginTop: 10,
    marginBottom: 14,
  },

  roleSwitcherAddTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
    marginBottom: 4,
  },

  roleSwitcherAddHelp: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 10,
  },

  roleSwitcherAddOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#25394B',
    borderRadius: 9,
    padding: 10,
    marginTop: 7,
    gap: 10,
    backgroundColor: Brand.navy800,
  },

  roleSwitcherMainAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },

  roleSwitcherDeleteButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#25394B',
    backgroundColor: 'rgba(229, 107, 107, 0.04)',
  },

  roleSwitcherOptionIcon: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleSwitcherOptionCopy: {
    flex: 1,
    marginLeft: 10,
  },

  roleSwitcherOptionTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },

  roleSwitcherOptionStatus: {
    color: '#748494',
    fontSize: 10,
    marginTop: 2,
  },

  roleHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#111F2E',
    borderWidth: 1,
    borderRadius: 11,
    padding: 14,
    marginBottom: 16,
  },

  roleHeroIcon: {
    width: 42,
    height: 42,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleHeroCopy: {
    flex: 1,
  },

  roleHeroEyebrow: {
    color: '#82909E',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 1.2,
    marginBottom: 5,
  },

  roleHeroTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
  },

  roleHeroText: {
    color: '#9BA7B4',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },

  careerOverviewCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#3A4652',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  careerOverviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },

  careerOverviewHeadingWrap: {
    flex: 1,
  },

  careerOverviewEyebrow: {
    color: '#D2B95B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 1.3,
    marginBottom: 5,
  },

  careerOverviewTrade: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.heading,
  },

  careerOverviewLevel: {
    color: '#9BA7B4',
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    marginTop: 2,
  },

  careerOverviewBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#182435',
    alignItems: 'center',
    justifyContent: 'center',
  },

  careerOverviewStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    flexWrap: 'wrap',
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#25384A',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
  },

  careerOverviewStat: {
    flexGrow: 1,
    flexBasis: 92,
    minWidth: 82,
    paddingHorizontal: 8,
  },

  careerOverviewStatDivider: {
    width: 1,
    minHeight: 42,
    backgroundColor: '#26394C',
  },

  careerOverviewStatLabel: {
    color: '#728294',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.9,
    marginBottom: 5,
  },

  careerOverviewStatValue: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  careerOverviewProgressSection: {
    marginBottom: 12,
  },

  careerOverviewProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  careerOverviewProgressLabel: {
    color: '#A9B3BF',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  careerOverviewProgressPercent: {
    color: '#D2B95B',
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  careerOverviewProgressValue: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.display,
    marginTop: 5,
  },

  careerOverviewProgressTrack: {
    height: 7,
    backgroundColor: '#1A2A3A',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 7,
  },

  careerOverviewProgressFill: {
    height: '100%',
    backgroundColor: '#D2B95B',
    borderRadius: 999,
  },

  careerOverviewMilestone: {
    color: '#82909E',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  careerOverviewEmptyProgress: {
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#25384A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },

  careerOverviewEmptyText: {
    color: '#82909E',
    fontSize: 12,
    lineHeight: 18,
  },

  careerOverviewTrainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#0D1B2A',
    borderWidth: 1,
    borderColor: '#25384A',
    borderRadius: 11,
    padding: 10,
  },

  careerOverviewTrainingIcon: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
  },

  careerOverviewTrainingCopy: {
    flex: 1,
  },

  careerOverviewTrainingTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  careerOverviewTrainingText: {
    color: '#82909E',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },

  careerOverviewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },

  careerOverviewPrimaryButton: {
    minHeight: 38,
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 9,
    backgroundColor: '#D2B95B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
  },

  careerOverviewPrimaryButtonText: {
    color: '#0B1623',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },

  careerOverviewSecondaryButton: {
    minHeight: 38,
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D2B95B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
  },

  careerOverviewSecondaryButtonText: {
    color: '#D2B95B',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },

  careerOverviewOverallNote: {
    color: '#667788',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
    textAlign: 'center',
  },

  homeClockSectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },

  homeClockSectionTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  homeClockSectionHint: {
    color: '#718193',
    fontSize: 10,
    fontFamily: FontFamily.bodyBold,
  },

  homeClockCard: {
    backgroundColor: '#151F2B',
    borderWidth: 1.5,
    borderColor: '#D2B95B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  homeClockCardActive: {
    borderColor: '#62B77A',
    backgroundColor: '#10251F',
  },

  homeClockCopy: {
    flex: 1,
  },

  homeClockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },

  homeClockDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: '#6F8091',
  },

  homeClockDotActive: {
    backgroundColor: '#62B77A',
  },

  homeClockEyebrow: {
    color: '#D2B95B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 1.0,
  },

  homeClockTitle: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.heading,
  },

  homeClockMeta: {
    color: '#9AA7B4',
    fontSize: 11,
    marginTop: 4,
  },

  homeClockButton: {
    minWidth: 190,
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#D2B95B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },

  homeClockButtonActive: {
    backgroundColor: '#C94B4B',
  },

  homeClockButtonText: {
    color: '#0B1623',
    fontSize: 13,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  homeClockButtonTextActive: {
    color: '#FFFFFF',
  },

  careerSectionHeader: {
    width: '100%',
    minHeight: 68,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#304457',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },

  careerSectionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  careerSectionHeaderIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  careerSectionHeaderTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  careerSectionHeaderMeta: {
    color: '#7F8C99',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  contractorOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },

  contractorStatCard: {
    flexGrow: 1,
    flexBasis: 180,
    minWidth: 160,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    padding: 14,
  },

  contractorStatLabel: {
    color: '#7F8C99',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  contractorStatValue: {
    color: Brand.white,
    fontSize: 26,
    fontFamily: FontFamily.display,
    marginTop: 5,
  },

  contractorStatHint: {
    color: '#718193',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },

  contractorActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },

  contractorPrimaryAction: {
    minHeight: 44,
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: 9,
    backgroundColor: '#4D9DE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
  },

  contractorPrimaryActionText: {
    color: '#0B1623',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },

  contractorSecondaryAction: {
    minHeight: 44,
    flexGrow: 1,
    flexBasis: 180,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#4D9DE0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    backgroundColor: '#101F30',
  },

  contractorSecondaryActionText: {
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
  },

  contractorRecentCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
  },

  contractorRecentRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  contractorRecentRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#223547',
  },

  contractorRecentIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contractorRecentTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
  },

  contractorRecentMeta: {
    color: '#7F8C99',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  contractorStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  contractorStatusActive: {
    backgroundColor: 'rgba(98, 183, 122, 0.15)',
  },

  contractorStatusDraft: {
    backgroundColor: 'rgba(124, 135, 150, 0.15)',
  },

  contractorStatusText: {
    color: '#A9B3BF',
    fontSize: 8,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  contractorEmptyState: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },

  contractorEmptyTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    marginTop: 8,
  },

  contractorEmptyText: {
    color: '#7F8C99',
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    maxWidth: 360,
    marginTop: 4,
  },

  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },

  quickActionCard: {
    flexGrow: 1,
    flexBasis: 210,
    minHeight: 64,
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  quickActionIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A4330',
    backgroundColor: '#162536',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickActionTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
  },

  quickActionText: {
    color: '#7F8C99',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  dashboardSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  dashboardSectionLink: {
    color: '#D2B95B',
    fontSize: 9,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
    marginBottom: 9,
  },

  recentActivityCard: {
    backgroundColor: '#101F30',
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
  },

  recentActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  recentActivityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#223547',
  },

  recentActivityIcon: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#162536',
    borderWidth: 1,
    borderColor: '#4A4330',
    alignItems: 'center',
    justifyContent: 'center',
  },

  recentActivityTitle: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  recentActivityMeta: {
    color: '#7F8C99',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },

  recentActivityDate: {
    color: '#69798A',
    fontSize: 9,
    fontFamily: FontFamily.bodyBold,
    textAlign: 'right',
    maxWidth: 105,
  },

  recentActivityEmpty: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
  },

  recentActivityEmptyText: {
    color: '#7F8C99',
    fontSize: 10,
  },

  dashboardSectionTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
    marginBottom: 9,
  },

  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  dashboardCard: {
    flexGrow: 1,
    flexBasis: 190,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    padding: 13,
  },

  dashboardIcon: {
    width: 32,
    height: 32,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  dashboardCardTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  dashboardCardText: {
    color: '#8F9CAA',
    fontSize: 10,
    lineHeight: 18,
    marginTop: 6,
  },

  feedSection: {
    marginTop: 28,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },

  pageTitle: {
    color: Brand.white,
    fontSize: 30,
    fontFamily: FontFamily.heading,
  },

  pageSubtitle: {
    color: '#A9B3BF',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 24,
  },

  placeholderCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 22,
    marginTop: 8,
  },

  cardTitle: {
    color: Brand.white,
    fontSize: 18,
    fontFamily: FontFamily.bodyBold,
    marginTop: 14,
  },

  cardText: {
    color: '#A9B3BF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },

  loadingText: {
    color: '#A9B3BF',
    marginTop: 12,
  },

  careerHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  careerIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#CAAE53',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  careerTrade: {
    color: Brand.white,
    fontSize: 19,
    fontFamily: FontFamily.heading,
  },

  careerLevel: {
    color: '#CAAE53',
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    marginTop: 4,
  },

  sectionTitle: {
    color: Brand.white,
    fontSize: 19,
    fontFamily: FontFamily.heading,
    marginTop: 28,
    marginBottom: 12,
  },

  progressCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 20,
  },

  progressRow: {
    flexDirection: 'row',
    minHeight: 64,
  },

  progressIndicatorColumn: {
    width: 32,
    alignItems: 'center',
  },

  progressCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#46576A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.navy800,
  },

  progressCircleCompleted: {
    backgroundColor: '#3FA66B',
    borderColor: '#3FA66B',
  },

  progressCircleCurrent: {
    borderColor: '#CAAE53',
  },

  progressCircleFailed: {
    backgroundColor: '#C94B4B',
    borderColor: '#C94B4B',
  },

  progressCircleHistorical: {
    backgroundColor: Brand.navy800,
    borderColor: '#CAAE53',
  },

  progressCircleLocked: {
    backgroundColor: Brand.navy800,
    borderColor: '#46576A',
  },

  currentDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#CAAE53',
  },

  progressLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#33465A',
  },

  progressLineCompleted: {
    backgroundColor: '#3FA66B',
  },

  progressTextContainer: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 2,
  },

  progressLabel: {
    color: '#7C8796',
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  progressLabelCompleted: {
    color: Brand.white,
    textDecorationLine: 'line-through',
    textDecorationColor: '#3FA66B',
  },

  progressLabelCurrent: {
    color: Brand.white,
  },

  progressLabelFailed: {
    color: Brand.white,
  },

  progressLabelHistorical: {
    color: Brand.white,
  },

  progressLabelLocked: {
    color: '#7C8796',
  },

  currentLabel: {
    color: '#CAAE53',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.8,
  },

  completedLabel: {
    color: '#3FA66B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  failedLabel: {
    color: '#E56B6B',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  historicalLabel: {
    color: '#CAAE53',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  lockedLabel: {
    color: '#667483',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    marginTop: 4,
    letterSpacing: 0.7,
  },

  hoursCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 20,
  },

  hoursTopRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  hoursLabel: {
    color: '#A9B3BF',
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },

  hoursValue: {
    color: Brand.white,
    fontSize: 28,
    fontFamily: FontFamily.heading,
    marginTop: 4,
  },

  hoursLoader: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },

  hoursIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  hoursHint: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 12,
  },

  addHoursButton: {
    marginTop: 18,
    backgroundColor: '#CAAE53',
    borderRadius: 9,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  addHoursText: {
    color: '#0D1B2A',
    fontSize: 13,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  clockCard: {
    marginTop: 18,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 12,
    padding: 15,
  },

  clockCardActive: {
    borderColor: '#62B77A',
    backgroundColor: 'rgba(98, 183, 122, 0.06)',
  },

  clockCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  clockEyebrow: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.8,
  },

  clockStatusTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.heading,
    marginTop: 4,
  },

  clockStatusMeta: {
    color: '#8F9CAA',
    fontSize: 11,
    marginTop: 4,
  },

  clockLiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#46576A',
    marginTop: 3,
  },

  clockLiveDotActive: {
    backgroundColor: '#62B77A',
  },

  clockButton: {
    minHeight: 46,
    borderRadius: 9,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  clockInButton: {
    backgroundColor: '#62B77A',
  },

  clockOutButton: {
    backgroundColor: '#C94B4B',
  },

  clockButtonText: {
    color: '#0D1B2A',
    fontSize: 13,
    fontFamily: FontFamily.display,
    letterSpacing: 0.8,
  },

  clockOutButtonText: {
    color: Brand.white,
  },

  clockMessage: {
    color: Brand.gold500,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },

  clockDisclaimer: {
    color: '#718092',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 7,
  },

  hoursEntryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  hoursEntrySource: {
    color: '#78A9FF',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  hoursEntryStatus: {
    color: Brand.gold500,
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  overallSectionTitle: {
    color: Brand.white,
    fontSize: 23,
    fontFamily: FontFamily.display,
    marginTop: 30,
    marginBottom: 12,
    letterSpacing: 0.2,
  },

  officialProgressCard: {
    backgroundColor: '#121C27',
    borderWidth: 2,
    borderColor: '#CAAE53',
    borderRadius: 16,
    padding: 24,
  },

  overallProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  overallProgressText: {
    flex: 1,
  },

  officialProgressLabel: {
    color: Brand.white,
    fontSize: 19,
    fontFamily: FontFamily.display,
  },

  overallProgressSubLabel: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginTop: 4,
  },

  officialProgressValue: {
    color: Brand.white,
    fontSize: 30,
    fontFamily: FontFamily.display,
    marginTop: 7,
  },

  officialProgressPercent: {
    color: '#CAAE53',
    fontSize: 24,
    fontFamily: FontFamily.display,
  },

  progressBarTrack: {
    height: 10,
    backgroundColor: '#101D2B',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
  },

  progressBarFill: {
    height: '100%',
    backgroundColor: '#CAAE53',
    borderRadius: 999,
  },

  unassignedWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    backgroundColor: '#1B2A37',
    borderWidth: 1,
    borderColor: '#564B2A',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
  },

  unassignedWarningText: {
    flex: 1,
    color: '#C7CED6',
    fontSize: 12,
    lineHeight: 18,
  },

  periodProgressDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginTop: 20,
  },

  periodProgressItem: {
    paddingVertical: 17,
    paddingHorizontal: 14,
    marginHorizontal: -6,
    borderRadius: 10,
  },

  periodProgressItemCompleted: {
    backgroundColor: 'rgba(63, 166, 107, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#3FA66B',
  },

  periodProgressItemCurrent: {
    backgroundColor: 'rgba(202, 174, 83, 0.06)',
    borderLeftWidth: 4,
    borderLeftColor: '#CAAE53',
  },

  periodProgressItemFailed: {
    backgroundColor: 'rgba(201, 75, 75, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#C94B4B',
  },

  periodProgressItemLocked: {
    opacity: 0.72,
  },

  periodProgressItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  periodProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },

  periodProgressTitleBlock: {
    flex: 1,
  },

  periodProgressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  periodProgressTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.heading,
  },

  periodProgressTitleCompleted: {
    textDecorationLine: 'line-through',
    textDecorationColor: '#3FA66B',
  },

  periodProgressTitleLocked: {
    color: '#7C8796',
  },

  periodStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  periodStatusBadgeCompleted: {
    backgroundColor: '#3FA66B',
  },

  periodStatusBadgeCurrent: {
    backgroundColor: '#CAAE53',
  },

  periodStatusBadgeFailed: {
    backgroundColor: '#C94B4B',
  },

  periodStatusBadgeHistorical: {
    backgroundColor: '#6A5A23',
  },

  periodStatusBadgeLocked: {
    backgroundColor: '#33465A',
  },

  periodStatusBadgeText: {
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  periodStatusTextCompleted: {
    color: Brand.white,
  },

  periodStatusTextCurrent: {
    color: '#0D1B2A',
  },

  periodStatusTextFailed: {
    color: Brand.white,
  },

  periodStatusTextHistorical: {
    color: '#FFE8A3',
  },

  periodStatusTextLocked: {
    color: '#C7CED6',
  },

  periodProgressHours: {
    color: '#A9B3BF',
    fontSize: 12,
    marginTop: 6,
  },

  periodRemainingHours: {
    color: '#7C8796',
    fontSize: 11,
    marginTop: 3,
  },

  periodProgressPercent: {
    color: '#CAAE53',
    fontSize: 14,
    fontFamily: FontFamily.display,
  },

  periodProgressBarTrack: {
    height: 8,
    backgroundColor: '#101D2B',
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 11,
    position: 'relative',
  },

  periodProgressBarFill: {
    height: '100%',
    backgroundColor: '#CAAE53',
    borderRadius: 999,
  },

  periodProgressBarCompleted: {
    backgroundColor: '#3FA66B',
  },

  periodProgressBarCurrent: {
    backgroundColor: '#CAAE53',
  },

  periodProgressBarFailed: {
    backgroundColor: '#C94B4B',
  },

  periodProgressBarLocked: {
    backgroundColor: '#46576A',
  },

  periodProgressBarTentative: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: '#4C8DFF',
    opacity: 0.75,
  },

  carryoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },

  carryoverDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4C8DFF',
  },

  carryoverText: {
    color: '#78A9FF',
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  carryoverNote: {
    color: '#78A9FF',
    fontSize: 10,
    lineHeight: 14,
    marginTop: 7,
  },

  requirementsUnavailableCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  requirementsUnavailableText: {
    flex: 1,
  },

  requirementsUnavailableTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.heading,
  },

  requirementsUnavailableSubtitle: {
    color: '#A9B3BF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  recentHoursCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    paddingHorizontal: 18,
  },

  hoursEntry: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  hoursEntryBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  hoursEntryText: {
    flex: 1,
  },

  hoursEntryAmount: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  periodBadgeText: {
    color: '#CAAE53',
    fontSize: 12,
    fontFamily: FontFamily.heading,
    marginTop: 4,
  },

  hoursEntryDate: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 3,
  },

  hoursEntryNote: {
    color: '#A9B3BF',
    fontSize: 13,
    marginTop: 5,
  },

  entryMenuButton: {
    padding: 12,
  },

  hoursHistoryCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  hoursViewTabs: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 16,
  },

  hoursViewTab: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#33465A',
    backgroundColor: '#101D2B',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hoursViewTabSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  hoursViewTabText: {
    color: '#8E9BA8',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  hoursViewTabTextSelected: {
    color: '#0D1B2A',
  },

  hoursViewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 10,
    padding: 10,
  },

  hoursViewSummaryLabel: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.7,
  },

  hoursViewSummaryValue: {
    color: Brand.white,
    fontSize: 25,
    fontFamily: FontFamily.display,
    marginTop: 4,
  },

  hoursBreakdownList: {
    marginTop: 7,
  },

  hoursBreakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
  },

  hoursBreakdownRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  hoursBreakdownLabel: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },

  hoursBreakdownValue: {
    color: '#CAAE53',
    fontSize: 12,
    fontFamily: FontFamily.display,
  },

  hoursHistoryDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginVertical: 16,
  },

  hoursEntriesTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
    marginBottom: 4,
  },

  hoursEntryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },

  historicalHoursBadge: {
    backgroundColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  historicalHoursBadgeText: {
    color: '#C7CED6',
    fontSize: 8,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  hoursEntryCompany: {
    color: '#A9B3BF',
    fontSize: 12,
    marginTop: 5,
  },

  hoursEmptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
  },

  hoursEmptyStateText: {
    color: '#7C8796',
    fontSize: 12,
  },

  hoursHistoryLimitNote: {
    color: '#718092',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 12,
  },

  trainingCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    paddingHorizontal: 18,
  },

  trainingRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginHorizontal: -10,
    borderRadius: 10,
  },

  trainingRowPassed: {
    backgroundColor: 'rgba(63, 166, 107, 0.08)',
  },

  trainingRowFailed: {
    backgroundColor: 'rgba(201, 75, 75, 0.08)',
  },

  trainingRowInProgress: {
    backgroundColor: 'rgba(202, 174, 83, 0.08)',
  },

  trainingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
  },

  trainingRowLocked: {
    opacity: 0.45,
  },

  trainingStatusBanner: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: -6,
    marginBottom: 18,
  },

  trainingStatusBannerPassed: {
    backgroundColor: 'rgba(63, 166, 107, 0.12)',
    borderColor: '#3FA66B',
  },

  trainingStatusBannerFailed: {
    backgroundColor: 'rgba(201, 75, 75, 0.12)',
    borderColor: '#C94B4B',
  },

  trainingStatusBannerInProgress: {
    backgroundColor: 'rgba(202, 174, 83, 0.12)',
    borderColor: '#CAAE53',
  },

  trainingStatusBannerNotStarted: {
    backgroundColor: '#101D2B',
    borderColor: '#33465A',
  },

  trainingStatusBannerText: {
    color: '#A9B3BF',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
  },

  trainingStatusBannerTextPassed: {
    color: '#5FBF82',
  },

  trainingStatusBannerTextFailed: {
    color: '#E56B6B',
  },

  trainingStatusBannerTextInProgress: {
    color: '#CAAE53',
  },

  aitUploadCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  aitUploadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  aitUploadIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#172B3F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aitUploadHeaderText: {
    flex: 1,
  },

  aitUploadTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  aitUploadSubtitle: {
    color: '#AEB9C6',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  progressReportGuideToggle: {
    marginTop: 13,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#13263A',
  },

  progressReportGuideToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },

  progressReportGuideToggleText: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.heading,
  },

  progressReportGuide: {
    marginTop: 10,
    backgroundColor: '#0F1F30',
    borderWidth: 1,
    borderColor: '#263B50',
    borderRadius: 10,
    padding: 12,
  },

  progressReportGuideStep: {
    color: '#AEB9C6',
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 5,
  },

  progressReportPrivacyNote: {
    marginTop: 7,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#263B50',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },

  progressReportPrivacyText: {
    color: '#CAAE53',
    fontSize: 10,
    lineHeight: 15,
    flex: 1,
    fontFamily: FontFamily.bodyBold,
  },

  progressReportSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 7,
  },

  progressReportSourceText: {
    color: '#CAAE53',
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  aitUploadButton: {
    marginTop: 13,
    backgroundColor: '#F6C84C',
    borderRadius: 9,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 14,
  },

  aitUploadButtonText: {
    color: '#0D1B2A',
    fontSize: 12,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  aitUploadFileName: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    marginTop: 7,
  },

  aitUploadMessage: {
    color: '#F59E0B',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 7,
  },

  aitUploadSuccess: {
    color: '#34D399',
  },

  aitUploadReviewNote: {
    color: '#8F9DAD',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 8,
  },

  trainingProviderList: {
    backgroundColor: '#13263A',
    borderWidth: 1,
    borderColor: '#263B50',
    borderRadius: 12,
    marginTop: -6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  trainingProviderOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#263B50',
  },
  trainingProviderNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  trainingProviderName: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.bodyBold,
    flexShrink: 1,
  },
  trainingProviderMeta: {
    color: '#97A5B5',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  trainingProviderLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  trainingProviderEmpty: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trainingMarksRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  trainingMarkField: {
    flex: 1,
  },
  trainingMarkLabel: {
    color: '#AEB9C6',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginBottom: 6,
  },
  trainingPercentInputWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 10,
    backgroundColor: '#102236',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  trainingPercentInput: {
    flex: 1,
    color: Brand.white,
    fontSize: 15,
    paddingVertical: 10,
  },
  trainingPercentSymbol: {
    color: '#CAAE53',
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },
  trainingResultCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  trainingResultTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    marginBottom: 5,
  },
  trainingResultText: {
    color: '#CAAE53',
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },
  trainingResultNote: {
    color: '#8F9DAD',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },

  importedTrainingCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 13,
    marginBottom: 16,
  },

  importedTrainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },

  importedTrainingTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  importedTrainingMeta: {
    color: '#AEB9C6',
    fontSize: 11,
    lineHeight: 17,
  },

  importedTrainingSection: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#263B50',
  },

  importedTrainingSectionTitle: {
    color: '#CAAE53',
    fontSize: 11,
    fontFamily: FontFamily.heading,
    marginBottom: 5,
  },

  importedTrainingBreakdownText: {
    color: '#AEB9C6',
    fontSize: 10,
    lineHeight: 16,
  },

  trainingStatusIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trainingStatusPassed: {
    backgroundColor: '#5FBF82',
    borderColor: '#5FBF82',
  },

  trainingStatusCurrent: {
    borderColor: '#CAAE53',
  },

  trainingRowText: {
    flex: 1,
    marginLeft: 13,
  },

  trainingPeriodTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
  },

  trainingStatusText: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.6,
    marginTop: 4,
  },

  trainingPassedText: {
    color: '#5FBF82',
  },

  trainingMeta: {
    color: '#A9B3BF',
    fontSize: 11,
    marginTop: 4,
  },

  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  milestoneIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  milestoneTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  milestoneTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  milestoneSubtitle: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 3,
  },

  profileCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 22,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#CAAE53',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  profileName: {
    color: Brand.white,
    fontSize: 24,
    fontFamily: FontFamily.heading,
  },

  profileTrade: {
    color: '#CAAE53',
    fontSize: 16,
    fontFamily: FontFamily.bodyBold,
    marginTop: 4,
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginVertical: 20,
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  profileRowText: {
    marginLeft: 12,
  },

  profileLabel: {
    color: '#7C8796',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  profileValue: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodySemiBold,
    marginTop: 3,
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#101D2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionTextContainer: {
    flex: 1,
    marginLeft: 13,
  },

  actionTitle: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  actionSubtitle: {
    color: '#7C8796',
    fontSize: 12,
    marginTop: 3,
  },

  jobsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },

  createJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 9,
    paddingHorizontal: 13,
    minHeight: 42,
    marginTop: 2,
  },

  createJobButtonText: {
    color: '#0B1623',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  jobStatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },

  jobStatCard: {
    flex: 1,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 10,
    padding: 13,
  },

  jobStatValue: {
    color: Brand.white,
    fontSize: 22,
    fontFamily: FontFamily.display,
  },

  jobStatLabel: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.7,
    marginTop: 3,
  },

  jobCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },

  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  jobTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.display,
  },

  jobCompany: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginTop: 3,
  },

  jobStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  jobStatusActive: {
    backgroundColor: 'rgba(98, 183, 122, 0.16)',
  },

  jobStatusDraft: {
    backgroundColor: 'rgba(210, 185, 91, 0.16)',
  },

  jobStatusText: {
    color: '#D7DEE6',
    fontSize: 8,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  jobMetaWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 11,
  },

  jobMeta: {
    color: '#91A1B2',
    fontSize: 10,
    fontFamily: FontFamily.bodyBold,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  jobWage: {
    color: '#62B77A',
    fontSize: 13,
    fontFamily: FontFamily.display,
    marginTop: 11,
  },

  jobDescription: {
    color: '#A9B3BF',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
  },

  jobOptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 14,
  },

  jobOptionButton: {
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 9,
    backgroundColor: '#101D2B',
  },

  jobOptionButtonSelected: {
    backgroundColor: '#4D9DE0',
    borderColor: '#4D9DE0',
  },

  jobOptionText: {
    color: '#A9B3BF',
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  jobOptionTextSelected: {
    color: '#0B1623',
  },

  jobWageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  jobWageInput: {
    flex: 1,
  },

  jobWageDash: {
    color: '#7C8796',
    fontSize: 18,
    marginBottom: 12,
  },

  jobAuthorizationNote: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 12,
  },

  tradeAwareHint: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginTop: -4,
    marginBottom: 9,
  },

  profileCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    marginBottom: 18,
  },

  editRoleProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 13,
    minHeight: 40,
    maxWidth: 220,
  },

  editRoleProfileButtonText: {
    color: '#0B1623',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  roleOnboardingContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 42,
    justifyContent: 'center',
  },

  roleOnboardingScreen: {
    width: '100%',
    maxWidth: 920,
    alignSelf: 'center',
  },

  roleOnboardingHeader: {
    marginBottom: 26,
  },

  roleOnboardingEyebrow: {
    color: Brand.gold500,
    fontSize: 11,
    fontFamily: FontFamily.display,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  roleOnboardingTitle: {
    color: Brand.white,
    fontSize: 34,
    fontFamily: FontFamily.display,
    marginBottom: 8,
  },

  roleOnboardingSubtitle: {
    color: '#9EABB9',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 650,
  },

  roleOnboardingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },

  roleOnboardingCard: {
    width: '48%',
    minWidth: 260,
    flexGrow: 1,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
  },

  roleOnboardingCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  roleOnboardingIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleOnboardingCardTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.display,
    marginBottom: 7,
  },

  roleOnboardingCardText: {
    color: '#93A1B1',
    fontSize: 12,
    lineHeight: 18,
    minHeight: 38,
  },

  rolePrimaryChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 14,
  },

  rolePrimaryChoiceText: {
    color: '#7C8796',
    fontSize: 9,
    fontFamily: FontFamily.display,
    letterSpacing: 0.4,
  },

  roleOnboardingVerification: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#2B3D50',
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
  },

  roleOnboardingVerificationTitle: {
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.display,
    marginBottom: 4,
  },

  roleOnboardingVerificationText: {
    color: '#8E9BAA',
    fontSize: 11,
    lineHeight: 17,
  },

  roleOnboardingError: {
    color: '#E56B6B',
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
    marginTop: 12,
  },

  roleOnboardingContinue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D2B95B',
    borderRadius: 11,
    minHeight: 52,
    marginTop: 18,
    paddingHorizontal: 18,
  },

  roleOnboardingContinueText: {
    color: '#0B1623',
    fontSize: 11,
    fontFamily: FontFamily.display,
    letterSpacing: 0.7,
  },

  verificationCenterCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  verificationCenterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 14,
  },

  verificationCenterTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.display,
    marginBottom: 4,
  },

  verificationCenterSubtitle: {
    color: '#8E9BAA',
    fontSize: 10,
    lineHeight: 15,
    maxWidth: 600,
  },

  verificationCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderTopWidth: 1,
    borderTopColor: '#26394C',
    paddingVertical: 13,
  },

  verificationCenterIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101D2B',
  },

  verificationCenterRole: {
    color: Brand.white,
    fontSize: 11,
    fontFamily: FontFamily.display,
    marginBottom: 3,
  },

  verificationCenterLater: {
    color: '#7C8796',
    fontSize: 9,
    lineHeight: 13,
  },

  verificationCenterStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  roleManagementCard: {
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#26394C',
    borderRadius: 14,
    padding: 18,
  },

  roleManagementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },

  roleManagementTitle: {
    color: Brand.white,
    fontSize: 16,
    fontFamily: FontFamily.heading,
  },

  roleManagementSubtitle: {
    color: '#8F9CAA',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  profileRoleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26394C',
    borderLeftWidth: 4,
    borderRadius: 10,
    padding: 12,
    marginTop: 9,
    backgroundColor: '#101D2B',
  },

  profileRoleIcon: {
    width: 40,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileRoleCopy: {
    flex: 1,
    marginLeft: 11,
  },

  profileRoleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },

  profileRoleTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  profilePrimaryBadge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  profilePrimaryBadgeText: {
    color: '#0B1623',
    fontSize: 8,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  profileVerificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },

  profileVerificationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  profileVerificationText: {
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  profileRoleActions: {
    alignItems: 'flex-end',
    gap: 7,
    marginLeft: 8,
  },

  profileRoleActionButton: {
    borderWidth: 1,
    borderColor: '#405568',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  profileRoleActionText: {
    color: '#D6DEE6',
    fontSize: 10,
    fontFamily: FontFamily.heading,
  },

  profileRoleRemoveButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#5A3338',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  availableRolesDivider: {
    height: 1,
    backgroundColor: '#26394C',
    marginVertical: 18,
  },

  availableRolesTitle: {
    color: Brand.white,
    fontSize: 14,
    fontFamily: FontFamily.heading,
    marginBottom: 9,
  },

  availableRolesHelp: {
    color: '#7C8796',
    fontSize: 10,
    lineHeight: 15,
    marginTop: -4,
    marginBottom: 12,
  },

  emailVerificationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#2B3D50',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  emailVerificationTitle: {
    color: Brand.white,
    fontSize: 10,
    fontFamily: FontFamily.display,
    marginBottom: 3,
  },

  emailVerificationText: {
    color: '#7C8796',
    fontSize: 9,
    lineHeight: 14,
  },

  roleDeleteConfirmCard: {
    width: '92%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: '#172638',
    borderWidth: 1,
    borderColor: '#4A2F36',
    borderRadius: 14,
    padding: 22,
  },

  roleDeleteConfirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 107, 107, 0.12)',
    marginBottom: 14,
  },

  roleDeleteConfirmTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.display,
    marginBottom: 7,
  },

  roleDeleteConfirmQuestion: {
    color: '#A9B3BF',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },

  roleDeleteWarningBox: {
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#34475A',
    borderRadius: 10,
    padding: 14,
    gap: 8,
  },

  roleDeleteWarningTitle: {
    color: '#E7ECF2',
    fontSize: 11,
    fontFamily: FontFamily.display,
    marginBottom: 2,
  },

  roleDeleteWarningText: {
    color: '#91A0AF',
    fontSize: 10,
    lineHeight: 16,
  },

  roleDeleteConfirmActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  roleDeleteCancelButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#3A4A5B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  roleDeleteCancelText: {
    color: '#C0CAD4',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  roleDeleteConfirmButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 9,
    backgroundColor: '#B84F5A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  roleDeleteConfirmText: {
    color: Brand.white,
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.5,
  },

  availableRolesGrid: {
    gap: 8,
  },

  availableRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    padding: 10,
    backgroundColor: '#101D2B',
  },

  availableRoleIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  availableRoleText: {
    flex: 1,
    color: Brand.white,
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },

  allRolesAddedText: {
    color: '#7C8796',
    fontSize: 12,
    lineHeight: 18,
  },

  roleMessage: {
    color: Brand.gold500,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },

  bottomNav: {
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1D3042',
    backgroundColor: '#101D2B',
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  navText: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.bodySemiBold,
  },

  navTextSelected: {
    color: '#CAAE53',
  },

  modalBackdrop: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.72)',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 24,
  },

  modalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 16,
    padding: 22,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 22,
  },

  modalTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
  },

  modalLabel: {
    color: '#A9B3BF',
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
    marginBottom: 8,
  },

  modalInput: {
    backgroundColor: '#101D2B',
    color: Brand.white,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    marginBottom: 16,
  },

  noteInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },

  periodButton: {
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  periodButtonSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  periodButtonLocked: {
    backgroundColor: '#13202D',
    borderColor: '#2F4153',
    opacity: 0.55,
  },

  periodButtonText: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.bodyBold,
  },

  periodButtonTextSelected: {
    color: '#0D1B2A',
  },

  periodButtonTextLocked: {
    color: '#7C8796',
  },

  currentPeriodHint: { color: '#CAAE53', fontSize: 11, marginTop: -8, marginBottom: 16 },
  frequentCompanySection: {
    marginTop: -2,
    marginBottom: 12,
  },

  frequentCompanyLabel: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.5,
    marginBottom: 7,
    textTransform: 'uppercase',
  },

  frequentCompanyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  frequentCompanyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#101D2B',
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  frequentCompanyChipSelected: {
    borderColor: '#CAAE53',
    backgroundColor: '#1A2530',
  },

  frequentCompanyChipText: {
    color: '#D7DEE6',
    fontSize: 11,
    fontFamily: FontFamily.bodyBold,
  },

  suggestionBox: { backgroundColor: '#101D2B', borderWidth: 1, borderColor: '#33465A', borderRadius: 9, marginTop: -10, marginBottom: 16, overflow: 'hidden' },
  suggestionOption: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#26394C' },
  suggestionText: { color: Brand.white, fontSize: 14, fontFamily: FontFamily.bodySemiBold },
  companySuggestionText: { flex: 1 },
  companySuggestionMeta: { color: '#7C8796', fontSize: 11, marginTop: 3 },
  companySearchStatus: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 14 },
  companySearchStatusText: { color: '#A9B3BF', fontSize: 13 },
  addCompanyOption: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#142334' },
  addCompanyOptionText: { color: '#CAAE53', fontSize: 13, fontFamily: FontFamily.bodyBold },
  selectInput: { backgroundColor: '#101D2B', borderWidth: 1, borderColor: '#33465A', borderRadius: 9, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectInputText: { color: Brand.white, fontSize: 15 },
  selectPlaceholder: { color: '#7C8796', fontSize: 15 },

  manualModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },

  manualModeButton: {
    flex: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 9,
    backgroundColor: '#101D2B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },

  manualModeButtonSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  manualModeButtonText: {
    color: '#CAAE53',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.4,
  },

  manualModeButtonTextSelected: {
    color: '#0D1B2A',
  },

  historicalDateCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  historicalDateTitle: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    marginBottom: 4,
  },

  historicalDateText: {
    color: '#8F9CAA',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 14,
  },

  manualTimeCard: {
    backgroundColor: '#102236',
    borderWidth: 1,
    borderColor: '#31465B',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },

  manualTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  manualTimeField: {
    flex: 1,
  },

  manualTimeLabel: {
    color: '#A9B3BF',
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
    marginBottom: 7,
  },

  manualTimeInput: {
    backgroundColor: '#101D2B',
    color: Brand.white,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },

  meridiemRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 7,
  },

  meridiemButton: {
    flex: 1,
    minHeight: 34,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101D2B',
  },

  meridiemButtonSelected: {
    backgroundColor: '#CAAE53',
    borderColor: '#CAAE53',
  },

  meridiemText: {
    color: '#A9B3BF',
    fontSize: 11,
    fontFamily: FontFamily.heading,
  },

  meridiemTextSelected: {
    color: '#0D1B2A',
  },

  calculatedHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1F30',
    borderWidth: 1,
    borderColor: '#3A5267',
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginTop: -4,
  },

  calculatedHoursLabel: {
    color: '#7C8796',
    fontSize: 10,
    fontFamily: FontFamily.display,
    letterSpacing: 0.6,
  },

  calculatedHoursValue: {
    color: '#CAAE53',
    fontSize: 17,
    fontFamily: FontFamily.display,
  },

  manualTimeHint: {
    color: '#748494',
    fontSize: 10,
    lineHeight: 15,
    marginTop: 9,
  },

  modalError: {
    color: '#FF7B7B',
    fontSize: 13,
    marginBottom: 12,
  },

  saveHoursButton: {
    backgroundColor: '#CAAE53',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
  },

  saveHoursText: {
    color: '#0D1B2A',
    fontSize: 14,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  menuCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: Brand.navy800,
    borderWidth: 1,
    borderColor: '#33465A',
    borderRadius: 16,
    padding: 22,
  },

  menuTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
    marginBottom: 16,
  },

  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#26394C',
    gap: 12,
  },

  menuOptionText: {
    color: Brand.white,
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  deleteOptionText: {
    color: '#FF7B7B',
    fontSize: 15,
    fontFamily: FontFamily.bodyBold,
  },

  cancelMenuButton: {
    marginTop: 18,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelMenuText: {
    color: '#CAAE53',
    fontSize: 13,
    fontFamily: FontFamily.heading,
  },

  deleteTitle: {
    color: Brand.white,
    fontSize: 20,
    fontFamily: FontFamily.heading,
    marginTop: 16,
  },

  deleteText: {
    color: '#A9B3BF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
  },

  deleteButton: {
    backgroundColor: '#C44949',
    borderRadius: 9,
    paddingVertical: 14,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: Brand.white,
    fontSize: 13,
    fontFamily: FontFamily.heading,
    letterSpacing: 0.7,
  },
});// @ts-nocheck
// @ts-nocheck
