// Government Schemes Database
// Central schemes + Andhra Pradesh state schemes
// Source: myscheme.gov.in, AP government portal

export type Scheme = {
  id: string;
  name: string;
  ministry?: string;
  type: 'central' | 'state';
  state?: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  category: 'housing' | 'health' | 'agriculture' | 'employment' | 'welfare' | 'food' | 'education' | 'pension';
  status: 'active' | 'inactive' | 'pilot';
  applicationUrl?: string;
  launchYear?: number;
};

export const GOVERNMENT_SCHEMES: Scheme[] = [
  // CENTRAL SCHEMES
  {
    id: 'pm-awas-001',
    name: 'PM Awas Yojana (Pradhan Mantri Awas Yojana)',
    ministry: 'Ministry of Housing & Urban Affairs',
    type: 'central',
    state: 'All',
    description: 'Affordable housing scheme to provide housing for all by 2024',
    eligibility: [
      'Income between Rs. 3-12 lakhs annually',
      'No pucca house owned',
      'Both rural & urban applicants eligible',
    ],
    benefits: [
      'Partial subsidy on home loans',
      'Interest subsidy up to Rs. 2.67 lakhs',
      'Free land for construction in rural areas',
    ],
    category: 'housing',
    status: 'active',
    applicationUrl: 'https://pmawas.gov.in',
    launchYear: 2015,
  },
  {
    id: 'pmjay-001',
    name: 'PM-JAY (Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana)',
    ministry: 'Ministry of Labour & Employment',
    type: 'central',
    state: 'All',
    description: 'Health insurance scheme providing free treatment up to Rs. 5 lakhs per family per year',
    eligibility: [
      'BPL & SECC families',
      'Monthly income below Rs. 15,000 for urban workers',
      'Unorganized sector workers',
    ],
    benefits: [
      'Free hospitalization up to Rs. 5 lakhs/year',
      'Covers 1,355 health procedures',
      'Cashless treatment at 1,500+ hospitals',
    ],
    category: 'health',
    status: 'active',
    applicationUrl: 'https://pmjay.gov.in',
    launchYear: 2018,
  },
  {
    id: 'mgnregs-001',
    name: 'MGNREGS (Mahatma Gandhi National Rural Employment Guarantee Scheme)',
    ministry: 'Ministry of Rural Development',
    type: 'central',
    state: 'All',
    description: 'Rural employment guarantee providing 100 days of work per year',
    eligibility: [
      'Rural households members',
      'Age 18 and above',
      'Willing to do unskilled manual work',
    ],
    benefits: [
      '100 days of guaranteed work per year',
      'Minimum wage as per state norms',
      'Social security for workers',
    ],
    category: 'employment',
    status: 'active',
    applicationUrl: 'https://nrega.nic.in',
    launchYear: 2005,
  },
  {
    id: 'pm-kisan-001',
    name: 'PM Kisan Samman Nidhi Yojana',
    ministry: 'Ministry of Agriculture',
    type: 'central',
    state: 'All',
    description: 'Direct income support to farmers with three installments of Rs. 2,000 each',
    eligibility: [
      'Landholding farmers',
      'All agricultural land holders',
      'Self-cultivating farmers',
    ],
    benefits: [
      'Rs. 6,000 per year in three installments',
      'Direct bank transfer',
      'No income tax filing required',
    ],
    category: 'agriculture',
    status: 'active',
    applicationUrl: 'https://pmkisan.gov.in',
    launchYear: 2018,
  },
  {
    id: 'pds-001',
    name: 'Public Distribution System (PDS) - Ration Card',
    ministry: 'Ministry of Consumer Affairs',
    type: 'central',
    state: 'All',
    description: 'Subsidized food grains (rice, wheat) for BPL families',
    eligibility: [
      'BPL & APL families as per census',
      'Monthly income below state threshold',
      'Not engaged in government service',
    ],
    benefits: [
      'Subsidized rice at Rs. 2-3 per kg',
      'Subsidized wheat at Rs. 2 per kg',
      'Fair price shops access',
    ],
    category: 'food',
    status: 'active',
    applicationUrl: 'https://fcs.ap.gov.in',
    launchYear: 1944,
  },
  {
    id: 'mid-day-meal-001',
    name: 'Mid Day Meal Scheme',
    ministry: 'Ministry of Education',
    type: 'central',
    state: 'All',
    description: 'Free meals for school children to improve nutrition and attendance',
    eligibility: [
      'All children in government/aided schools',
      'Classes I-VIII',
    ],
    benefits: [
      'One cooked meal per day',
      'Improved nutritional status',
      'Better school attendance',
    ],
    category: 'education',
    status: 'active',
    applicationUrl: 'https://mdm.ap.gov.in',
    launchYear: 1925,
  },

  // ANDHRA PRADESH STATE SCHEMES
  {
    id: 'ap-ysr-rythu-bharosa-001',
    name: 'YSR Rythu Bharosa (Agricultural Support)',
    ministry: 'AP Department of Agriculture',
    type: 'state',
    state: 'Andhra Pradesh',
    description: 'Direct cash support to tenant farmers and agricultural laborers',
    eligibility: [
      'Tenant farmers in AP',
      'Agricultural laborers',
      'Landless farmers',
    ],
    benefits: [
      'Rs. 13,500 per year per agricultural household',
      'Six-monthly installments',
      'No land ownership required',
    ],
    category: 'agriculture',
    status: 'active',
    launchYear: 2019,
  },
  {
    id: 'ap-old-age-pension-001',
    name: 'Old Age Pension (AP Social Security)',
    ministry: 'AP Department of Social Welfare',
    type: 'state',
    state: 'Andhra Pradesh',
    description: 'Monthly pension for senior citizens aged 60+',
    eligibility: [
      'Age 60 and above',
      'AP resident for 10+ years',
      'Annual family income below Rs. 15,000 (rural) / Rs. 25,000 (urban)',
    ],
    benefits: [
      'Rs. 1,000-2,500 per month (based on category)',
      'Bank transfer on 1st of every month',
      'Free bus pass in some districts',
    ],
    category: 'pension',
    status: 'active',
    launchYear: 1975,
  },
  {
    id: 'ap-widow-pension-001',
    name: 'Widow/Widower Pension (AP Social Security)',
    ministry: 'AP Department of Social Welfare',
    type: 'state',
    state: 'Andhra Pradesh',
    description: 'Monthly pension for widows and widowers below poverty line',
    eligibility: [
      'Widow/Widower',
      'Annual family income below poverty line',
      'Age 18-60 years (not covered by old age)',
    ],
    benefits: [
      'Rs. 1,000-2,500 per month',
      'Bank transfer',
      'Assistance for children\'s education',
    ],
    category: 'pension',
    status: 'active',
    launchYear: 1978,
  },
  {
    id: 'ap-jagananna-amma-vodi-001',
    name: 'Jagananna Amma Vodi (School Lunch Assistance)',
    ministry: 'AP Department of Education',
    type: 'state',
    state: 'Andhra Pradesh',
    description: 'Cash assistance for parents of school children to enable meal attendance',
    eligibility: [
      'Parents of students in classes I-VI',
      'BPL families',
      'Government & aided schools',
    ],
    benefits: [
      'Rs. 15,000 per student per year',
      'Quarterly transfers',
      'Encourages enrollment & attendance',
    ],
    category: 'education',
    status: 'active',
    launchYear: 2019,
  },
  {
    id: 'ap-ntr-vaidya-seva-001',
    name: 'NTR Vaidya Seva (Health Scheme)',
    ministry: 'AP Department of Health',
    type: 'state',
    state: 'Andhra Pradesh',
    description: 'Comprehensive health insurance scheme for AP residents',
    eligibility: [
      'All AP residents',
      'Family income below Rs. 25,000/month (urban)',
      'Farm families with income below Rs. 20,000/month',
    ],
    benefits: [
      'Free treatment at government hospitals',
      'Cashless hospitalization',
      'Covers all diseases',
    ],
    category: 'health',
    status: 'active',
    launchYear: 2020,
  },
  {
    id: 'ap-housing-scheme-001',
    name: 'Pradhan Mantri Awas Yojana - AP (State Enhancement)',
    ministry: 'AP Department of Housing',
    type: 'state',
    state: 'Andhra Pradesh',
    description: 'Additional state subsidy on top of central PM Awas for AP residents',
    eligibility: [
      'Beneficiaries of PM Awas Yojana',
      'AP residents',
      'Lower income groups',
    ],
    benefits: [
      'Additional state subsidy up to Rs. 1,00,000',
      'Reduced interest rates',
      'Priority to SC/ST beneficiaries',
    ],
    category: 'housing',
    status: 'active',
    launchYear: 2020,
  },
];

// Get schemes by type
export function getSchemesByType(type: 'central' | 'state'): Scheme[] {
  return GOVERNMENT_SCHEMES.filter(s => s.type === type);
}

// Get schemes for AP specifically
export function getAPSchemes(): Scheme[] {
  return GOVERNMENT_SCHEMES.filter(s => s.state === 'Andhra Pradesh' || s.state === 'All');
}

// Get schemes by category
export function getSchemesByCategory(category: Scheme['category']): Scheme[] {
  return GOVERNMENT_SCHEMES.filter(s => s.category === category);
}

// Get all active schemes
export function getActiveSchemes(): Scheme[] {
  return GOVERNMENT_SCHEMES.filter(s => s.status === 'active');
}

// Get scheme by ID
export function getSchemeById(id: string): Scheme | undefined {
  return GOVERNMENT_SCHEMES.find(s => s.id === id);
}

// Get all scheme names (for checklist)
export function getAllSchemeNames(): { id: string; name: string; type: 'central' | 'state' }[] {
  return GOVERNMENT_SCHEMES.map(s => ({
    id: s.id,
    name: s.name,
    type: s.type,
  }));
}
