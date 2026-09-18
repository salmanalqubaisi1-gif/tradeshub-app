const TRAINING_PROVIDER_SEARCH_ALIASES: Record<string, string[]> = {
  'Northern Alberta Institute of Technology': ['NAIT'],
  'Southern Alberta Institute of Technology': ['SAIT'],
  'Northern Lakes College': ['NLC'],
  'Northwestern Polytechnic': ['NWP'],
  'Medicine Hat College': ['MHC'],
  'Lethbridge Polytechnic': ['LP'],
  'Lakeland College': ['LC'],
  'Keyano College': ['KC'],
  'Edmonton Pipe Trades Educational Trust': [
    'EPTET',
    'Alberta Pipe Trades College',
    'APTC',
  ],
  'CLAC Career Development College Inc.': ['CLAC'],
};

export function getProviderSearchAliases(providerName: string): string[] {
  const explicitAliases = TRAINING_PROVIDER_SEARCH_ALIASES[providerName] || [];

  const acronym = providerName
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !['of', 'the', 'and', 'inc', 'ltd'].includes(word.toLowerCase()))
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return Array.from(new Set([...explicitAliases, acronym].filter(Boolean)));
}

export function normalizeTrainingProviderSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatPhoneNumber(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith('+') && !trimmed.startsWith('+1')) {
    const digits = trimmed.replace(/[^\d]/g, '').slice(0, 15);
    return digits ? `+${digits}` : '+';
  }

  let digits = value.replace(/\D/g, '');

  if (digits.length > 10 && digits.startsWith('1')) {
    digits = digits.slice(1, 11);
  } else {
    digits = digits.slice(0, 10);
  }

  if (!digits) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isValidPhoneNumber(value: string): boolean {
  if (!value.trim()) return true;

  if (value.trim().startsWith('+') && !value.trim().startsWith('+1')) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  }

  const digits = value.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

export function isValidEmailFormat(value: string): boolean {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

const BLOCKED_CONTENT_PATTERNS: RegExp[] = [
  /\bf+u+c+k+\b/i,
  /\bs+h+i+t+\b/i,
  /\bc+u+n+t+\b/i,
  /\bb+i+t+c+h+\b/i,
  /\bn+[i1]+g+g+[e3]+r+\b/i,
  /\bf+a+g+g+o+t+\b/i,
  /\bk+y+s+\b/i,
  /\bkill\s+yourself\b/i,
  /\bgo\s+kill\s+yourself\b/i,
  /\bi[' ]?ll\s+kill\s+you\b/i,
  /\bi\s+will\s+kill\s+you\b/i,
];

export function containsBlockedContent(
  ...values: (string | null | undefined)[]
): boolean {
  const combined = values
    .filter(Boolean)
    .join(' ')
    .normalize('NFKC');

  return BLOCKED_CONTENT_PATTERNS.some((pattern) => pattern.test(combined));
}

export function moderationMessage(): string {
  return 'Please remove profanity, slurs, threats or abusive language.';
}

export function getTradeWorkTypes(trade: string): string[] {
  const value = trade.trim().toLowerCase();

  if (!value) {
    return ['Service','New Construction','Commercial','Residential','Industrial','Maintenance','Renovation','Other'];
  }

  if (value.includes('plumb')) return ['Service Plumbing','New Construction','Residential','Commercial','Industrial','Hydronics / Boilers','Underground','Rough-In','Finishing','Renovation','Maintenance'];
  if (value.includes('gasfit')) return ['Gas Service','Gas Installation','Residential','Commercial','Industrial','Appliance Installation','Boilers / Hydronics','Maintenance'];
  if (value.includes('electric')) return ['Service','New Construction','Residential','Commercial','Industrial','Controls','Lighting','Maintenance','Renovation'];
  if (value.includes('refriger') || value.includes('hvac') || value.includes('air conditioning')) return ['Service','Installation','Residential HVAC','Commercial HVAC','Industrial HVAC','Refrigeration','Controls','Commissioning','Maintenance'];
  if (value.includes('welder')) return ['Shop Fabrication','Field Welding','Structural Welding','Pipe Welding','Industrial','Fabrication','Repair / Maintenance','Shutdown / Turnaround','Rig / Field Work'];
  if (value.includes('pipefitter') || value.includes('steamfitter')) return ['Industrial Piping','Commercial Piping','Fabrication','Pipe Installation','Steam Systems','Maintenance','Shutdown / Turnaround','Field Work'];
  if (value.includes('carpenter')) return ['Framing','Formwork','Residential','Commercial','New Construction','Renovation','Finishing Carpentry','Maintenance'];
  if (value.includes('millwright') || value.includes('industrial mechanic')) return ['Installation','Preventive Maintenance','Breakdown Repair','Alignment','Conveyors','Pumps / Rotating Equipment','Industrial','Shutdown / Turnaround'];
  if (value.includes('heavy duty') || value.includes('heavy equipment technician')) return ['Diagnostics','Preventive Maintenance','Engine Repair','Hydraulics','Electrical Diagnostics','Shop Work','Field Service','Fleet Maintenance'];
  if (value.includes('sheet metal')) return ['Duct Installation','Fabrication','Commercial','Industrial','Residential','HVAC Installation','Shop Work','Service / Maintenance'];
  if (value.includes('instrument')) return ['Instrumentation','Controls','Calibration','Commissioning','Industrial','Maintenance','Process Controls','Shutdown / Turnaround'];
  if (value.includes('insulator')) return ['Mechanical Insulation','Industrial','Commercial','Pipe Insulation','Equipment Insulation','Maintenance','Shutdown / Turnaround'];
  if (value.includes('roofer')) return ['Residential Roofing','Commercial Roofing','New Construction','Repair','Maintenance','Flat Roofing','Shingles'];
  if (value.includes('painter')) return ['Residential','Commercial','Industrial','Interior','Exterior','New Construction','Renovation','Spray Application'];
  if (value.includes('labour')) return ['General Construction','Site Cleanup','Material Handling','Demolition','Commercial','Residential','Industrial','Other'];

  return ['Service','New Construction','Commercial','Residential','Industrial','Maintenance','Renovation','Other'];
}
