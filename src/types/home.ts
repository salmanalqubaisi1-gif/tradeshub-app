export type TabName = 'Feed' | 'Jobs' | 'Career' | 'Profile';

export type HoursView = 'week' | 'month' | 'year' | 'all';

export type TradesHubRole =
  | 'tradesperson'
  | 'contractor'
  | 'supplier'
  | 'homeowner';

export type VerificationStatus =
  | 'self_declared'
  | 'pending'
  | 'verified'
  | 'business_verified'
  | 'rejected'
  | null;

export type UserRoleRow = {
  id: string;
  role: TradesHubRole;
  is_primary: boolean;
  verification_status?: VerificationStatus;
};

export type RoleTab = {
  name: TabName;
  label: string;
  icon: string;
};

export type UserProfile = {
  fullName: string;
  trade: string;
  apprenticeshipLevel: string;
  city: string;
  email: string;
  emailVerified: boolean;
};

export type RoleProfile = {
  id?: string;
  user_id?: string;
  role: TradesHubRole;
  display_name: string | null;
  business_name: string | null;
  trade: string | null;
  career_level: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  bio: string | null;
};

export type HoursEntry = {
  id: string;
  hours: number;
  work_date: string;
  note: string | null;
  period_number: number | null;
  company_name: string | null;
  work_type: string | null;
  clock_in?: string | null;
  clock_out?: string | null;
  break_minutes?: number;
  entry_source?: 'manual' | 'clock';
  reconciliation_status?: 'tracked' | 'reconciled' | 'confirmed';
  qualifying_hours?: number | null;
  pay_period_id?: string | null;
  entry_kind?: 'shift' | 'historical_bulk';
  historical_start_date?: string | null;
  historical_end_date?: string | null;
};

export type JobPost = {
  id: string;
  created_by: string;
  company_id: string | null;
  company_name: string;
  title: string;
  trade: string;
  minimum_level: string | null;
  city: string;
  province: string;
  employment_type:
    | 'full_time'
    | 'part_time'
    | 'temporary'
    | 'contract'
    | 'casual';
  wage_min: number | null;
  wage_max: number | null;
  wage_unit: 'hour' | 'day' | 'week' | 'month' | 'year';
  description: string | null;
  requirements: string | null;
  status: 'draft' | 'active' | 'paused' | 'closed';
  source_type: 'contractor' | 'tradeshub_concierge' | 'external';
  authorized_listing: boolean;
  published_at: string | null;
  created_at: string;
};

export type TrainingBreakdownItem = {
  subject: string;
  mark?: number | null;
  weight?: number | null;
  score?: number | null;
  possible?: number | null;
};

export type TechnicalTrainingEntry = {
  id: string;
  period_number: number;
  status: 'Not Started' | 'In Progress' | 'Passed' | 'Failed';
  school_name: string | null;
  start_date: string | null;
  end_date: string | null;
  grade: string | null;
  theory_average: number | null;
  practical_average: number | null;
  period_exam_mark: number | null;
  provider_verified: boolean;
  note: string | null;
  training_provider_id: string | null;
  training_campus_id: string | null;
  classroom_hours: number | null;
  program_version: string | null;
  import_source: 'progress_report' | 'manual' | null;
  imported_document_date: string | null;
  subject_breakdown: TrainingBreakdownItem[] | null;
  exam_breakdown: TrainingBreakdownItem[] | null;
  provider_selection_method: 'document_import' | 'user_selected' | 'manual_entry' | null;
};

export type TrainingProviderSuggestion = {
  provider_id: string;
  provider_name: string;
  campus_id: string;
  campus_name: string;
  city: string | null;
  address_line_1: string | null;
  display_name: string;
  academic_year: string;
};

export type CompanySuggestion = {
  id: string;
  name: string;
  city: string;
  province: string;
  verified: boolean;
};

export type GoogleCompanySuggestion = {
  place_id: string;
  name: string;
  description: string;
  secondary_text: string;
};
