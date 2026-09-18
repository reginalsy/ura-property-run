/**
 * Singapore Private Property Types & Data Contracts
 * Structured according to Urban Redevelopment Authority (URA) REALIS standards
 */

export type MarketSegment = 'CCR' | 'RCR' | 'OCR';

export type PropertyCategory = 
  | 'Condominium'
  | 'Apartment'
  | 'Executive Condominium'
  | 'Detached House'
  | 'Semi-Detached House'
  | 'Terrace House';

export type SaleType = 'New Sale' | 'Sub Sale' | 'Resale';

export interface PropertyTransaction {
  id: string;
  projectName: string;
  streetName: string;
  postalDistrict: string; // e.g. "D09", "D15"
  marketSegment: MarketSegment;
  propertyType: PropertyCategory;
  tenure: string; // e.g. "Freehold", "99 years leasehold", "999 years leasehold"
  transactedPrice: number; // in SGD
  areaSqft: number;
  areaSqm: number;
  unitPricePsf: number; // in SGD/sqft
  floorRange: string; // e.g. "#11 to #15", "Ground", "B1 to B5"
  typeOfSale: SaleType;
  contractDate: string; // YYYY-MM-DD or MM/YY
  postalCode?: string;
  completionYear?: number | string;
}

export interface PropertyMarketSummary {
  totalTransactions: number;
  avgPrice: number;
  medianPrice: number;
  avgPsf: number;
  medianPsf: number;
  minPsf: number;
  maxPsf: number;
  ccrTransactions: number;
  rcrTransactions: number;
  ocrTransactions: number;
  lastUpdated?: string;
}

export interface PropertyFilterState {
  searchQuery: string;
  marketSegment: 'ALL' | MarketSegment;
  propertyType: 'ALL' | PropertyCategory;
  postalDistrict: string; // 'ALL' or 'D01'..'D28'
  saleType: 'ALL' | SaleType;
  minPrice: number | null;
  maxPrice: number | null;
  minPsf: number | null;
  maxPsf: number | null;
  sortBy: 'date_desc' | 'date_asc' | 'price_desc' | 'price_asc' | 'psf_desc' | 'psf_asc';
}

export interface DistrictInfo {
  code: string; // e.g. "D09"
  name: string; // e.g. "Orchard, Cairnhill, River Valley"
  segment: MarketSegment;
  postalSectors: string; // e.g. "22, 23"
}

export interface PropertyApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
  message?: string;
  timestamp?: string;
}

export interface BackendConnectionStatus {
  status: 'idle' | 'checking' | 'connected' | 'disconnected' | 'error';
  baseUrl: string;
  message: string;
  latencyMs?: number;
  checkedAt?: string;
}
