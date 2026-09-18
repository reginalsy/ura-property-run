import { DistrictInfo } from '../types/property';

/**
 * Singapore 28 Postal Districts Reference Table
 * Categorized by URA Market Segments:
 * - CCR: Core Central Region (High-end, Prime)
 * - RCR: Rest of Central Region (Mid-tier, City Fringe)
 * - OCR: Outside Central Region (Suburban, Mass Market)
 */
export const SINGAPORE_DISTRICTS: DistrictInfo[] = [
  { code: 'D01', name: 'Raffles Place, Cecil, Marina Bay, People\'s Park', segment: 'CCR', postalSectors: '01, 02, 03, 04, 05, 06' },
  { code: 'D02', name: 'Anson, Tanjong Pagar, Chinatown', segment: 'CCR', postalSectors: '07, 08' },
  { code: 'D03', name: 'Queenstown, Tiong Bahru, Alexandra', segment: 'RCR', postalSectors: '14, 15, 16' },
  { code: 'D04', name: 'Telok Blangah, Harbourfront, Mount Faber, Sentosa', segment: 'CCR', postalSectors: '09, 10' },
  { code: 'D05', name: 'Buona Vista, West Coast, Clementi New Town', segment: 'RCR', postalSectors: '11, 12, 13' },
  { code: 'D06', name: 'City Hall, High Street, Beach Road', segment: 'CCR', postalSectors: '17' },
  { code: 'D07', name: 'Middle Road, Golden Mile, Bugis, Rochor', segment: 'RCR', postalSectors: '18, 19' },
  { code: 'D08', name: 'Little India, Farrer Park, Serangoon Road', segment: 'RCR', postalSectors: '20, 21' },
  { code: 'D09', name: 'Orchard, Cairnhill, River Valley', segment: 'CCR', postalSectors: '22, 23' },
  { code: 'D10', name: 'Ardmore, Bukit Timah, Holland Road, Tanglin', segment: 'CCR', postalSectors: '24, 25, 26, 27' },
  { code: 'D11', name: 'Watten Estate, Novena, Thomson', segment: 'CCR', postalSectors: '28, 29, 30' },
  { code: 'D12', name: 'Balestier, Toa Payoh, Serangoon', segment: 'RCR', postalSectors: '31, 32, 33' },
  { code: 'D13', name: 'Macpherson, Braddell, Potong Pasir', segment: 'RCR', postalSectors: '34, 35, 36, 37' },
  { code: 'D14', name: 'Geylang, Eunos, Paya Lebar', segment: 'RCR', postalSectors: '38, 39, 40, 41' },
  { code: 'D15', name: 'Katong, Joo Chiat, Amber Road, Marine Parade, Tanjong Rhu', segment: 'RCR', postalSectors: '42, 43, 44, 45' },
  { code: 'D16', name: 'Bedok, Upper East Coast, Eastwood, Kew Drive', segment: 'OCR', postalSectors: '46, 47, 48' },
  { code: 'D17', name: 'Loyang, Changi', segment: 'OCR', postalSectors: '49, 50' },
  { code: 'D18', name: 'Tampines, Pasir Ris', segment: 'OCR', postalSectors: '51, 52' },
  { code: 'D19', name: 'Serangoon Garden, Hougang, Punggol, Sengkang', segment: 'OCR', postalSectors: '53, 54, 55, 82' },
  { code: 'D20', name: 'Bishan, Ang Mo Kio, Thomson', segment: 'RCR', postalSectors: '56, 57' },
  { code: 'D21', name: 'Upper Bukit Timah, Clementi Park, Ulu Pandan', segment: 'RCR', postalSectors: '58, 59' },
  { code: 'D22', name: 'Jurong, Tuas', segment: 'OCR', postalSectors: '60, 61, 62, 63, 64' },
  { code: 'D23', name: 'Hillview, Dairy Farm, Bukit Panjang, Choa Chu Kang', segment: 'OCR', postalSectors: '65, 66, 67, 68' },
  { code: 'D24', name: 'Lim Chu Kang, Tengah', segment: 'OCR', postalSectors: '69, 70, 71' },
  { code: 'D25', name: 'Kranji, Woodgrove, Woodlands', segment: 'OCR', postalSectors: '72, 73' },
  { code: 'D26', name: 'Upper Thomson, Springleaf, Mandai', segment: 'OCR', postalSectors: '77, 78' },
  { code: 'D27', name: 'Yishun, Sembawang', segment: 'OCR', postalSectors: '75, 76' },
  { code: 'D28', name: 'Seletar, Yio Chu Kang', segment: 'OCR', postalSectors: '79, 80' },
];

export const PROPERTY_TYPES = [
  'Condominium',
  'Apartment',
  'Executive Condominium',
  'Detached House',
  'Semi-Detached House',
  'Terrace House',
] as const;

export const MARKET_SEGMENTS = [
  { id: 'ALL', label: 'All Segments', description: 'Islandwide Singapore' },
  { id: 'CCR', label: 'CCR (Core Central)', description: 'Prime Downtown & Orchard' },
  { id: 'RCR', label: 'RCR (Rest of Central)', description: 'City Fringe & East Coast' },
  { id: 'OCR', label: 'OCR (Outside Central)', description: 'Suburban & Heartlands' },
] as const;
