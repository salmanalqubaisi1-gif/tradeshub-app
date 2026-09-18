import { RoleColors } from './theme';
import type { JobPost, RoleTab, TradesHubRole } from '../types/home';

export const ROLE_CONFIG: Record<
  TradesHubRole,
  {
    label: string;
    shortLabel: string;
    color: string;
    icon: string;
    headline: string;
    description: string;
  }
> = {
  tradesperson: {
    label: 'Tradesperson / Apprentice',
    shortLabel: 'Tradesperson',
    color: RoleColors.tradesperson,
    icon: 'construct-outline',
    headline: 'Build your trade career.',
    description: 'Hours, training, credentials, jobs and your career record in one place.',
  },
  contractor: {
    label: 'Contractor / Employer',
    shortLabel: 'Contractor',
    color: RoleColors.contractor,
    icon: 'business-outline',
    headline: 'Build your workforce.',
    description: 'Hiring, job posts, applicants and your company presence will live here.',
  },
  supplier: {
    label: 'Tool Shop / Supplier',
    shortLabel: 'Tool Shop',
    color: RoleColors.supplier,
    icon: 'storefront-outline',
    headline: 'Reach the trades.',
    description: 'Listings, tools, inventory and trade-focused customer reach will live here.',
  },
  homeowner: {
    label: 'Homeowner',
    shortLabel: 'Homeowner',
    color: RoleColors.homeowner,
    icon: 'home-outline',
    headline: 'Find the right trade professional.',
    description: 'Service requests, saved pros and trusted trade connections will live here.',
  },
};

export const ROLE_TABS: Record<TradesHubRole, RoleTab[]> = {
  tradesperson: [
    { name: 'Feed', label: 'Feed', icon: 'home-outline' },
    { name: 'Jobs', label: 'Jobs', icon: 'briefcase-outline' },
    { name: 'Career', label: 'Career', icon: 'trending-up-outline' },
    { name: 'Profile', label: 'Profile', icon: 'person-outline' },
  ],
  contractor: [
    { name: 'Feed', label: 'Dashboard', icon: 'grid-outline' },
    { name: 'Jobs', label: 'Hiring', icon: 'people-outline' },
    { name: 'Profile', label: 'Company', icon: 'business-outline' },
  ],
  supplier: [
    { name: 'Feed', label: 'Dashboard', icon: 'grid-outline' },
    { name: 'Jobs', label: 'Products', icon: 'pricetag-outline' },
    { name: 'Profile', label: 'Store', icon: 'storefront-outline' },
  ],
  homeowner: [
    { name: 'Feed', label: 'Home', icon: 'home-outline' },
    { name: 'Jobs', label: 'Find a Pro', icon: 'search-outline' },
    { name: 'Profile', label: 'Profile', icon: 'person-outline' },
  ],
};

export const EMPLOYMENT_TYPES: {
  value: JobPost['employment_type'];
  label: string;
}[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'contract', label: 'Contract' },
  { value: 'casual', label: 'Casual' },
];

export const WAGE_UNITS: {
  value: JobPost['wage_unit'];
  label: string;
}[] = [
  { value: 'hour', label: '/ hr' },
  { value: 'day', label: '/ day' },
  { value: 'week', label: '/ week' },
  { value: 'month', label: '/ month' },
  { value: 'year', label: '/ year' },
];

export const JOB_TRADE_OPTIONS = [
  'Plumber',
  'Electrician',
  'HVAC / Refrigeration',
  'Gasfitter',
  'Welder',
  'Carpenter',
  'Pipefitter / Steamfitter',
  'Millwright',
  'Heavy Duty Mechanic',
  'Sheet Metal',
  'Instrumentation',
  'Labourer',
  'Other',
];

export const JOURNEYPERSON_EXPERIENCE_OPTIONS = [
  'New Journeyperson',
  '1+ years experience',
  '3+ years experience',
  '5+ years experience',
  '10+ years experience',
];

export const OTHER_LEVEL_OPTIONS = [
  'Helper / Labourer',
  'Experienced Worker',
  'Open to all levels',
];

export const JOB_CITY_OPTIONS = [
  'Edmonton',
  'Calgary',
  'Red Deer',
  'Leduc',
  'St. Albert',
  'Sherwood Park',
  'Fort McMurray',
  'Airdrie',
  'Grande Prairie',
  'Medicine Hat',
  'Lethbridge',
  'Spruce Grove',
  'Fort Saskatchewan',
  'Beaumont',
];

export const JOB_REQUIREMENT_OPTIONS = [
  'Own tools',
  "Driver's licence",
  'Vehicle required',
  'Registered apprentice',
  'Safety tickets',
  'Service experience',
  'Commercial experience',
  'Residential experience',
];
