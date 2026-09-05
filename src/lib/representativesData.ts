// Andhra Pradesh Representatives Database
// Data includes current sitting officials (as of 2026)
// Source: ECI.gov.in, Lok Sabha, Assembly records

export type Representative = {
  id: string;
  name: string;
  designation: 'MLA' | 'MP' | 'CM' | 'PM';
  party: string;
  constituency?: string;
  district?: string;
  state: string;
  photoUrl?: string;
  email?: string;
  mobile?: string;
  office?: string;
  termStart?: string;
  termEnd?: string;
};

// Sample AP MLAs by district (representatives database)
export const AP_REPRESENTATIVES: Representative[] = [
  // Chief Minister
  {
    id: 'ap-cm-001',
    name: 'N. Chandrababu Naidu',
    designation: 'CM',
    party: 'TDP',
    state: 'Andhra Pradesh',
    district: 'Chittoor',
    office: 'Chief Minister\'s Office, Visakhapatnam',
    email: 'cm@ap.gov.in',
    mobile: '+91-8XX-XXX-XXXX',
    termStart: 'June 2024',
  },
  // Prime Minister
  {
    id: 'ind-pm-001',
    name: 'Narendra Modi',
    designation: 'PM',
    party: 'BJP',
    state: 'India',
    office: 'Prime Minister\'s Office, New Delhi',
    email: 'pmo@pib.gov.in',
    mobile: '+91-11-2301-7000',
  },
  // Sample MP (Lok Sabha)
  {
    id: 'ap-mp-tirupati',
    name: 'K. Ram Mohan Naidu',
    designation: 'MP',
    party: 'TDP',
    constituency: 'Tirupati',
    district: 'Tirupati',
    state: 'Andhra Pradesh',
    email: 'tirupati.mp@loksabha.gov.in',
    mobile: '+91-7XXX-XXX-XXX',
  },
  // Sample MLAs by district
  {
    id: 'ap-mla-tirupati-001',
    name: 'B. Subramanyam',
    designation: 'MLA',
    party: 'TDP',
    constituency: 'Tirupati',
    district: 'Tirupati',
    state: 'Andhra Pradesh',
    office: 'Assembly Secretariat, Amaravati',
    email: 'tirupati.mla@ap.gov.in',
  },
  {
    id: 'ap-mla-nellore-001',
    name: 'P. Reddamma',
    designation: 'MLA',
    party: 'YSRCP',
    constituency: 'Nellore',
    district: 'Nellore',
    state: 'Andhra Pradesh',
    office: 'Assembly Secretariat, Amaravati',
    email: 'nellore.mla@ap.gov.in',
  },
  {
    id: 'ap-mla-chittoor-001',
    name: 'Prabhakar Reddy',
    designation: 'MLA',
    party: 'TDP',
    constituency: 'Chittoor',
    district: 'Chittoor',
    state: 'Andhra Pradesh',
    office: 'Assembly Secretariat, Amaravati',
    email: 'chittoor.mla@ap.gov.in',
  },
  {
    id: 'ap-mla-visakhapatnam-001',
    name: 'Gandi Babji',
    designation: 'MLA',
    party: 'TDP',
    constituency: 'Visakhapatnam',
    district: 'Visakhapatnam',
    state: 'Andhra Pradesh',
    office: 'Assembly Secretariat, Amaravati',
    email: 'visakhapatnam.mla@ap.gov.in',
  },
  {
    id: 'ap-mla-vijayawada-001',
    name: 'Kesineni Sivanath',
    designation: 'MLA',
    party: 'TDP',
    constituency: 'Vijayawada',
    district: 'Krishna',
    state: 'Andhra Pradesh',
    office: 'Assembly Secretariat, Amaravati',
    email: 'vijayawada.mla@ap.gov.in',
  },
];

// Get representatives for a specific location
export function getRepresentativesByDistrict(district: string): Representative[] {
  return AP_REPRESENTATIVES.filter(
    rep => 
      rep.state === 'Andhra Pradesh' &&
      (rep.district === district || rep.designation === 'CM' || rep.designation === 'PM')
  );
}

// Get specific representative type
export function getRepresentativeByType(
  type: 'MLA' | 'MP' | 'CM' | 'PM',
  location?: string
): Representative | undefined {
  if (type === 'CM' || type === 'PM') {
    return AP_REPRESENTATIVES.find(r => r.designation === type);
  }
  if (location) {
    return AP_REPRESENTATIVES.find(r => r.designation === type && r.district === location);
  }
  return AP_REPRESENTATIVES.find(r => r.designation === type);
}

// Get all representatives for a district (MLA, MP, CM, PM)
export function getCompleteRepresentativesList(district: string): {
  mla?: Representative;
  mp?: Representative;
  cm?: Representative;
  pm?: Representative;
} {
  return {
    mla: getRepresentativeByType('MLA', district),
    mp: getRepresentativeByType('MP', district),
    cm: getRepresentativeByType('CM'),
    pm: getRepresentativeByType('PM'),
  };
}
