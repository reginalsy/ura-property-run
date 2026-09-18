import { getOrRefreshUraToken, callUraDataService, getUraAccessKey } from './uraClient';

export interface URATransactionRecord {
  area: string; // in sqm
  floorRange: string;
  noOfUnits: string;
  contractDate: string; // e.g. "0524" (MMYY)
  typeOfSale: string; // "1" (New Sale), "2" (Sub Sale), "3" (Resale)
  price: string;
  nettPrice?: string;
  propertyType: string;
  district?: string;
  typeOfArea?: string;
  tenure?: string;
}

export interface URAProjectRecord {
  project: string;
  street: string;
  marketSegment: string; // "CCR", "RCR", "OCR"
  district?: string;
  transaction: URATransactionRecord[];
}

export interface URAApiResponse {
  status: string;
  message?: string;
  Result?: URAProjectRecord[];
}

// Map URA sale type code to human label
function mapSaleType(code: string): 'New Sale' | 'Sub Sale' | 'Resale' {
  if (code === '1') return 'New Sale';
  if (code === '2') return 'Sub Sale';
  return 'Resale';
}

// Map contractDate "0524" -> "2024-05"
function formatContractDate(mmyy: string): string {
  if (!mmyy || mmyy.length !== 4) return mmyy || '';
  const month = mmyy.substring(0, 2);
  const year = `20${mmyy.substring(2, 4)}`;
  return `${year}-${month}`;
}

/**
 * Standardized flat transaction structure used by the frontend
 */
export interface StandardTransaction {
  id: string;
  projectName: string;
  streetName: string;
  postalDistrict: string;
  marketSegment: 'CCR' | 'RCR' | 'OCR';
  propertyType: string;
  tenure: string;
  transactedPrice: number;
  areaSqft: number;
  areaSqm: number;
  unitPricePsf: number;
  floorRange: string;
  typeOfSale: 'New Sale' | 'Sub Sale' | 'Resale';
  contractDate: string;
}

/**
 * Transforms URA nested project/transaction response into standardized flat list
 */
export function normalizeUraTransactions(uraResult: URAProjectRecord[] = []): StandardTransaction[] {
  const transactions: StandardTransaction[] = [];
  let counter = 0;

  for (const proj of uraResult) {
    const rawSegment = (proj.marketSegment || 'OCR').toUpperCase();
    const segment: 'CCR' | 'RCR' | 'OCR' = (rawSegment === 'CCR' || rawSegment === 'RCR' || rawSegment === 'OCR') 
      ? rawSegment 
      : 'OCR';

    if (Array.isArray(proj.transaction)) {
      for (const tx of proj.transaction) {
        counter += 1;
        const price = parseFloat(tx.price || '0');
        const areaSqm = parseFloat(tx.area || '0');
        // 1 sqm = 10.7639 sqft
        const areaSqft = Math.round(areaSqm * 10.7639);
        const unitPricePsf = areaSqft > 0 ? Math.round(price / areaSqft) : 0;

        // District format e.g. "09" -> "D09"
        let district = tx.district || proj.district || '';
        if (district && !district.startsWith('D')) {
          district = `D${district.padStart(2, '0')}`;
        }

        transactions.push({
          id: `ura-${counter}-${formatContractDate(tx.contractDate)}-${Math.round(price)}`,
          projectName: proj.project || 'Private Residence',
          streetName: proj.street || '',
          postalDistrict: district || 'D00',
          marketSegment: segment,
          propertyType: tx.propertyType || 'Condominium',
          tenure: tx.tenure || 'Freehold / Leasehold',
          transactedPrice: price,
          areaSqft,
          areaSqm: Math.round(areaSqm * 10) / 10,
          unitPricePsf,
          floorRange: tx.floorRange ? `#${tx.floorRange}` : '-',
          typeOfSale: mapSaleType(tx.typeOfSale),
          contractDate: formatContractDate(tx.contractDate),
        });
      }
    }
  }

  return transactions;
}

/**
 * Serverless handler: GET /api/properties/token
 * Returns today's active URA token (for testing or downstream calls)
 */
export async function handleGetUraToken(req?: unknown, res?: unknown) {
  try {
    const token = await getOrRefreshUraToken();
    return {
      success: true,
      token,
      message: "Today's URA token acquired and active",
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: message,
      hint: 'Ensure URA_ACCESS_KEY is set in environment or Secrets panel.',
    };
  }
}

/**
 * Serverless handler: GET /api/properties/transactions
 * Fetches batch from URA DataService and returns normalized results
 */
export async function handleGetUraTransactions(query: {
  batch?: string | number;
  service?: string;
  q?: string;
  segment?: string;
  district?: string;
  propertyType?: string;
  limit?: string | number;
  page?: string | number;
}) {
  try {
    const batch = query.batch || 1;
    const service = query.service || 'PMI_Resi_Transaction';

    // 1. Fetch raw URA dataset
    const rawData = await callUraDataService<URAApiResponse>(service, batch);

    if (!rawData.Result) {
      return {
        success: false,
        message: rawData.message || 'No Result field returned by URA DataService',
        data: [],
        total: 0,
      };
    }

    // 2. Normalize to standard Singapore property transaction format
    let items = normalizeUraTransactions(rawData.Result);

    // 3. Apply optional server-side filters if requested
    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(
        (t) => t.projectName.toLowerCase().includes(q) || t.streetName.toLowerCase().includes(q)
      );
    }
    if (query.segment && query.segment !== 'ALL') {
      items = items.filter((t) => t.marketSegment === query.segment);
    }
    if (query.district && query.district !== 'ALL') {
      items = items.filter((t) => t.postalDistrict.toUpperCase() === query.district?.toUpperCase());
    }
    if (query.propertyType && query.propertyType !== 'ALL') {
      items = items.filter((t) => t.propertyType.toLowerCase() === query.propertyType?.toLowerCase());
    }

    const total = items.length;
    const page = parseInt(String(query.page || 1), 10);
    const limit = parseInt(String(query.limit || 50), 10);
    const startIndex = (page - 1) * limit;
    const paginated = items.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: paginated,
      total,
      page,
      pageSize: limit,
      service,
      batch,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      success: false,
      error: message,
      data: [],
      total: 0,
      hint: 'Verify that URA_ACCESS_KEY is set in environment secrets.',
    };
  }
}
