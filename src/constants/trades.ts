export type TradeOption = {
  name: string;
  aliases?: string[];
  periods: number | null;
  periodHours?: number[];
  apprenticeshipProgram: boolean;
  relatedCredentials?: string[];
  notes?: string[];
};

export const ALBERTA_TRADES: TradeOption[] = [
  {
    name: 'Agricultural Equipment Technician',
    periods: 4,
    apprenticeshipProgram: true,
  },
  {
    name: 'Appliance Service Technician',
    periods: 3,
    apprenticeshipProgram: true,
  },
  {
    name: 'Commercial Appliance Service Technician',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Auto Body Technician',
    periods: 4,
    apprenticeshipProgram: true,
  },
  {
    name: 'Auto Body Prepper',
    periods: 2,
    apprenticeshipProgram: true,
  },
  {
    name: 'Auto Body Refinisher',
    periods: 2,
    apprenticeshipProgram: true,
  },
  {
    name: 'Auto Body Repairer',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Automotive Service Technician',
    aliases: ['Auto Mechanic', 'Mechanic'],
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Baker',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Barber',
    periods: 1,
    apprenticeshipProgram: true,
  },

  {
    name: 'Boilermaker',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Bricklayer',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Cabinetmaker',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Carpenter',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Communication Technician',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Concrete Finisher',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Cook',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Crane and Hoisting Equipment Operator - Boom Truck',
    aliases: ['Boom Truck Operator'],
    periods: 1,
    apprenticeshipProgram: true,
  },

  {
    name: 'Crane and Hoisting Equipment Operator - Mobile Crane',
    aliases: ['Mobile Crane Operator'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Crane and Hoisting Equipment Operator - Tower Crane',
    aliases: ['Tower Crane Operator'],
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Crane and Hoisting Equipment Operator - Wellhead Boom Truck',
    aliases: ['Wellhead Boom Truck Operator'],
    periods: 1,
    apprenticeshipProgram: true,
  },

  {
    name: 'Electric Motor Systems Technician',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Electrician',
    aliases: ['Construction Electrician', 'Industrial Electrician'],
    periods: 4,
    apprenticeshipProgram: true,
    relatedCredentials: [
      'Construction Electrician Journeyperson Certificate',
      'Industrial Electrician Journeyperson Certificate',
      'Red Seal Endorsement',
    ],
    notes: [
      'Alberta issues both Construction Electrician and Industrial Electrician journeyperson certificates to apprentices completing the Alberta program as of May 1, 2026.',
    ],
  },

  {
    name: 'Elevator Constructor',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Floorcovering Installer',
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Gasfitter - Class A',
    aliases: ['Gas A', 'Gasfitter A'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Gasfitter - Class B',
    aliases: ['Gas B', 'Gasfitter B'],
    periods: 2,
    apprenticeshipProgram: true,
    relatedCredentials: ['Red Seal Endorsement'],
  },

  {
    name: 'Glazier',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Hairstylist',
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Heavy Equipment Technician',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Heavy Duty Equipment Mechanic (Off Road)',
    aliases: ['Heavy Duty Mechanic', 'Off Road Mechanic'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Transport Trailer Mechanic',
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Truck and Transport Mechanic',
    aliases: ['Truck Mechanic'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Industrial Mechanic (Millwright)',
    aliases: ['Millwright'],
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Instrumentation and Control Technician',
    aliases: ['Instrumentation Technician'],
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Insulator (Heat and Frost)',
    aliases: ['Insulator'],
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Ironworker (Metal Building Systems Erector)',
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Ironworker (Reinforcing)',
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Ironworker (Structural/Ornamental)',
    aliases: ['Structural Ironworker', 'Ornamental Ironworker'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Landscape Horticulturist',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Lather (Interior Systems Mechanic)',
    aliases: ['Interior Systems Mechanic'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Locksmith',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Machinist',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Metal Fabricator (Fitter)',
    aliases: ['Metal Fabricator', 'Fitter'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Motorcycle Mechanic',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Natural Gas Compression Technician',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Outdoor Power Equipment Technician - Power Equipment',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Outdoor Power Equipment Technician - Recreational Equipment',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Painter and Decorator',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Parts Technician - Materials Technician',
    aliases: ['Materials Technician'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Parts Technician',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Plumber',
    aliases: ['Plumbing'],
    periods: 4,
    periodHours: [1560, 1560, 1560, 1560],
    apprenticeshipProgram: true,
    relatedCredentials: [
      'Plumber Journeyperson Certificate',
      'Gasfitter - Class B Journeyperson Certificate',
      'Plumber Red Seal Endorsement',
      'Gasfitter - Class B Red Seal Endorsement',
    ],
    notes: [
      'Alberta plumber apprenticeship training includes Gasfitter - Class B certification.',
    ],
  },

  {
    name: 'Powerline Technician',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Power System Electrician',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Recreation Vehicle Service Technician',
    aliases: ['RV Technician'],
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Refrigeration and Air Conditioning Mechanic',
    aliases: [
      'HVAC',
      'HVACR',
      'HVAC/R',
      'Refrigeration Mechanic',
      'Air Conditioning Mechanic',
    ],
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Roofer',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Sheet Metal Worker',
    periods: 4,
    apprenticeshipProgram: true,
    relatedCredentials: [
      'Gasfitter - Class B Certification',
    ],
    notes: [
      'Alberta Sheet Metal Worker apprenticeship training includes Gasfitter - Class B certification.',
    ],
  },

  {
    name: 'Sprinkler Systems Installer',
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Steamfitter-Pipefitter',
    aliases: ['Pipefitter', 'Steamfitter'],
    periods: 4,
    apprenticeshipProgram: true,
  },

  {
    name: 'Transport Refrigeration Technician',
    periods: 3,
    apprenticeshipProgram: true,
  },

  {
    name: 'Water Well Driller',
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Earth Loop Technician',
    periods: 2,
    apprenticeshipProgram: true,
  },

  {
    name: 'Welder',
    aliases: ['Welding'],
    periods: 3,
    periodHours: [1560, 1560, 1560],
    apprenticeshipProgram: true,
    relatedCredentials: ['Red Seal Endorsement'],
  },

  {
    name: 'Wire Process Operator',
    periods: 2,
    periodHours: [1500, 1800],
    apprenticeshipProgram: true,
  },

  // Alberta-designated trades that may not use the standard
  // apprenticeship education progression above.
  {
    name: 'Cathodic Protection Technician - Level One',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Cathodic Protection Technician - Level Two',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Construction Craft Worker',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Field Heat Treatment Technician',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Gas Utility Operator',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Industrial Construction Crew Supervisor',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Oil and Gas Transportation Services (All Levels)',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Overhead Door Technician - Level One',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Overhead Door Technician - Level Two',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Residential Construction Site Manager',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Slickline Services (All Levels)',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Snubbing Services (All Levels)',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Steel Detailer (All Levels)',
    periods: null,
    apprenticeshipProgram: false,
  },

  {
    name: 'Well Testing Services Supervisor (All Levels)',
    periods: null,
    apprenticeshipProgram: false,
  },
];

export function getTradeByName(name: string) {
  return ALBERTA_TRADES.find((trade) => trade.name === name);
}

export function getApprenticeshipLevels(tradeName: string): string[] {
  const trade = getTradeByName(tradeName);

  if (!trade) {
    return [];
  }

  if (!trade.apprenticeshipProgram || trade.periods === null) {
    return ['Journeyperson', 'Other'];
  }

  const levels = Array.from(
    { length: trade.periods },
    (_, index) => `${index + 1}${getOrdinal(index + 1)} Period Apprentice`
  );

  return [...levels, 'Journeyperson', 'Other'];
}


export function getPeriodHours(tradeName: string): number[] {
  const trade = getTradeByName(tradeName);

  if (!trade?.periodHours) {
    return [];
  }

  return [...trade.periodHours];
}

export function getTotalRequiredHours(tradeName: string): number | null {
  const periodHours = getPeriodHours(tradeName);

  if (periodHours.length === 0) {
    return null;
  }

  return periodHours.reduce((total, hours) => total + hours, 0);
}

function getOrdinal(number: number): string {
  if (number === 1) return 'st';
  if (number === 2) return 'nd';
  if (number === 3) return 'rd';

  return 'th';
}