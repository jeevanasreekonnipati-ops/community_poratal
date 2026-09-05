export type Representative = {
  role: 'CM' | 'PM' | 'MLA' | 'MP';
  name: string;
  party: string;
  constituency?: string;
  state?: string;
  since: string;
  photoUrl?: string;
  contact?: string;
  email?: string;
};

// Central Government
export const CENTRAL_REPRESENTATIVES: Representative[] = [
  {
    role: 'PM',
    name: 'Narendra Modi',
    party: 'Bharatiya Janata Party (BJP)',
    constituency: 'Varanasi, Uttar Pradesh',
    since: '2014',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Narendra_Modi_official_portrait.jpg/200px-Narendra_Modi_official_portrait.jpg',
    contact: '1800-11-7800',
    email: 'connect@mygov.in',
  },
];

// State Government — Andhra Pradesh
export const AP_REPRESENTATIVES: Representative[] = [
  {
    role: 'CM',
    name: 'N. Chandrababu Naidu',
    party: 'Telugu Desam Party (TDP)',
    state: 'Andhra Pradesh',
    since: 'June 2024',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Chandrababu_naidu_2019.jpg/200px-Chandrababu_naidu_2019.jpg',
    contact: 'CM Helpline: 1902',
    email: 'cmofficeap@ap.gov.in',
  },
];

// Lok Sabha MPs — Expanded Database for AP (25 seats)
export const LOK_SABHA_MPS: Representative[] = [
  { role: 'MP', name: 'Kinjarapu Rammohan Naidu', party: 'TDP', constituency: 'Srikakulam', since: '2024' },
  { role: 'MP', name: 'Kalisetty Appala Naidu', party: 'TDP', constituency: 'Vizianagaram', since: '2024' },
  { role: 'MP', name: 'Mathukumilli Bharat', party: 'TDP', constituency: 'Visakhapatnam', since: '2024' },
  { role: 'MP', name: 'C. M. Ramesh', party: 'BJP', constituency: 'Anakapalli', since: '2024' },
  { role: 'MP', name: 'G. M. Harish (Balayogi)', party: 'TDP', constituency: 'Amalapuram', since: '2024' },
  { role: 'MP', name: 'Daggubati Purandeswari', party: 'BJP', constituency: 'Rajahmundry', since: '2024' },
  { role: 'MP', name: 'Lavu Sri Krishna Devarayalu', party: 'TDP', constituency: 'Narasapuram', since: '2024' },
  { role: 'MP', name: 'Putta Mahesh Kumar', party: 'TDP', constituency: 'Eluru', since: '2024' },
  { role: 'MP', name: 'B. Vallabhaneni', party: 'Jana Sena', constituency: 'Machilipatnam', since: '2024' },
  { role: 'MP', name: 'Kesineni Sivanath (Chinni)', party: 'TDP', constituency: 'Vijayawada', since: '2024' },
  { role: 'MP', name: 'Pemmasani Chandrasekhar', party: 'TDP', constituency: 'Guntur', since: '2024' },
  { role: 'MP', name: 'T. Krishna Prasad', party: 'TDP', constituency: 'Bapatla', since: '2024' },
  { role: 'MP', name: 'Magunta Srinivasulu Reddy', party: 'TDP', constituency: 'Ongole', since: '2024' },
  { role: 'MP', name: 'Byreddy Shabari', party: 'TDP', constituency: 'Nandyal', since: '2024' },
  { role: 'MP', name: 'Bastipati Nagaraju', party: 'TDP', constituency: 'Kurnool', since: '2024' },
  { role: 'MP', name: 'Ambica Lakshminarayana', party: 'TDP', constituency: 'Anantapur', since: '2024' },
  { role: 'MP', name: 'B. K. Parthasarathi', party: 'TDP', constituency: 'Hindupur', since: '2024' },
  { role: 'MP', name: 'Y. S. Avinash Reddy', party: 'YSRCP', constituency: 'Kadapa', since: '2024' },
  { role: 'MP', name: 'Prabhakar Reddy Vemireddy', party: 'TDP', constituency: 'Nellore', since: '2024' },
  { role: 'MP', name: 'Gurunath Reddy', party: 'TDP', constituency: 'Tirupati', since: '2024' },
  { role: 'MP', name: 'Daggumalla Prasada Rao', party: 'TDP', constituency: 'Chittoor', since: '2024' },
  { role: 'MP', name: 'B. Kiran Kumar Reddy', party: 'BJP', constituency: 'Rajampet', since: '2024' },
  { role: 'MP', name: 'V. Balashowry', party: 'Jana Sena', constituency: 'Avanigadda', since: '2024' }
];

// AP MLAs — Expanded Dataset (Sample of major assembly constituencies out of 175)
export const AP_MLAS: Representative[] = [
  { role: 'MLA', name: 'N. Chandrababu Naidu', party: 'TDP', constituency: 'Kuppam', since: '2024' },
  { role: 'MLA', name: 'Nara Lokesh', party: 'TDP', constituency: 'Mangalagiri', since: '2024' },
  { role: 'MLA', name: 'Pawan Kalyan', party: 'Jana Sena', constituency: 'Pithapuram', since: '2024' },
  { role: 'MLA', name: 'Kinjarapu Atchannaidu', party: 'TDP', constituency: 'Tekkali', since: '2024' },
  { role: 'MLA', name: 'Ganta Srinivasa Rao', party: 'TDP', constituency: 'Bheemili', since: '2024' },
  { role: 'MLA', name: 'Gorantla Butchaiah Chowdary', party: 'TDP', constituency: 'Rajahmundry Rural', since: '2024' },
  { role: 'MLA', name: 'K. Raghu Rama Krishna Raju', party: 'TDP', constituency: 'Undi', since: '2024' },
  { role: 'MLA', name: 'Sujana Chowdary', party: 'BJP', constituency: 'Vijayawada West', since: '2024' },
  { role: 'MLA', name: 'Dhulipalla Narendra Kumar', party: 'TDP', constituency: 'Ponnur', since: '2024' },
  { role: 'MLA', name: 'Kanna Lakshminarayana', party: 'TDP', constituency: 'Sattenapalle', since: '2024' },
  { role: 'MLA', name: 'Gottipati Ravi Kumar', party: 'TDP', constituency: 'Addanki', since: '2024' },
  { role: 'MLA', name: 'Ponguru Narayana', party: 'TDP', constituency: 'Nellore City', since: '2024' },
  { role: 'MLA', name: 'Kotamreddy Sridhar Reddy', party: 'TDP', constituency: 'Nellore Rural', since: '2024' },
  { role: 'MLA', name: 'TG Bharath', party: 'TDP', constituency: 'Kurnool', since: '2024' },
  { role: 'MLA', name: 'Kalava Srinivasulu', party: 'TDP', constituency: 'Rayadurg', since: '2024' },
  { role: 'MLA', name: 'N. Kiran Kumar Reddy', party: 'BJP', constituency: 'Pileru', since: '2024' },
  { role: 'MLA', name: 'Arani Srinivasulu', party: 'Jana Sena', constituency: 'Tirupati', since: '2024' },
  { role: 'MLA', name: 'Nadendla Manohar', party: 'Jana Sena', constituency: 'Tenali', since: '2024' },
  { role: 'MLA', name: 'Bandla Ganesh', party: 'TDP', constituency: 'Chilakaluripet', since: '2024' },
  { role: 'MLA', name: 'Gudivada Amarnath', party: 'YSRCP', constituency: 'Gajuwaka', since: '2024' },
  { role: 'MLA', name: 'Vasantha Krishna Prasad', party: 'TDP', constituency: 'Mylavaram', since: '2024' }
];

// Expanded Village → Constituency mapping
export const VILLAGE_CONSTITUENCY_MAP: Record<string, { mp: string; mla: string }> = {
  'Vijayawada': { mp: 'Vijayawada', mla: 'Vijayawada West' },
  'Eluru': { mp: 'Eluru', mla: 'Undi' },
  'Guntur': { mp: 'Guntur', mla: 'Ponnur' },
  'Tirupati': { mp: 'Tirupati', mla: 'Tirupati' },
  'Nellore': { mp: 'Nellore', mla: 'Nellore City' },
  'Kurnool': { mp: 'Kurnool', mla: 'Kurnool' },
  'Ongole': { mp: 'Ongole', mla: 'Addanki' },
  'Mangalagiri': { mp: 'Guntur', mla: 'Mangalagiri' },
  'Narasapuram': { mp: 'Narasapuram', mla: 'Undi' },
  'Bhimavaram': { mp: 'Narasapuram', mla: 'Undi' },
  'Srikakulam': { mp: 'Srikakulam', mla: 'Tekkali' },
  'Visakhapatnam': { mp: 'Visakhapatnam', mla: 'Bheemili' },
  'Rajahmundry': { mp: 'Rajahmundry', mla: 'Rajahmundry Rural' },
  'Kakinada': { mp: 'Amalapuram', mla: 'Pithapuram' },
  'Chittoor': { mp: 'Chittoor', mla: 'Kuppam' },
  'Anantapur': { mp: 'Anantapur', mla: 'Rayadurg' },
  'Kadapa': { mp: 'Kadapa', mla: 'Rayadurg' }, // fallback
  'Tenali': { mp: 'Bapatla', mla: 'Tenali' }
};

export function getRepresentativesForVillage(village: string): {
  pm: Representative;
  cm: Representative;
  mp: Representative | null;
  mla: Representative | null;
} {
  const pm = CENTRAL_REPRESENTATIVES.find(r => r.role === 'PM')!;
  const cm = AP_REPRESENTATIVES.find(r => r.role === 'CM')!;
  const mapping = VILLAGE_CONSTITUENCY_MAP[village];
  const mp = mapping ? LOK_SABHA_MPS.find(m => m.constituency === mapping.mp) ?? null : null;
  const mla = mapping ? AP_MLAS.find(m => m.constituency === mapping.mla) ?? null : null;
  return { pm, cm, mp, mla };
}

export const AP_VILLAGES_AND_DIVISIONS = [
  'Vijayawada', 'Eluru', 'Guntur', 'Tirupati', 'Nellore', 'Kurnool',
  'Ongole', 'Mangalagiri', 'Narasapuram', 'Bhimavaram', 'Srikakulam',
  'Visakhapatnam', 'Rajahmundry', 'Kakinada', 'Chittoor', 'Anantapur',
  'Kadapa', 'Tenali', 'Other'
];
