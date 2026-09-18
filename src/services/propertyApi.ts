/**
 * API Service Layer for Singapore Private Property Prices
 * 
 * ============================================================================
 * BACKEND INTEGRATION INSTRUCTIONS:
 * ============================================================================
 * This service contains the placeholders for connecting your private property
 * price backend (e.g. Node.js/Express, Python FastAPI, Go, or URA REALIS proxy).
 * 
 * Environment variables:
 * - VITE_PROPERTY_API_BASE_URL: Base URL for your API endpoints (default: '/api/properties')
 * - VITE_PROPERTY_API_KEY: Optional API token for requests
 * 
 * Expected Endpoints:
 * 1. GET /transactions?search=...&segment=...&district=...&page=1&limit=25
 *    Returns: { success: true, data: PropertyTransaction[], total: number }
 * 
 * 2. GET /stats?segment=...&district=...
 *    Returns: { success: true, data: PropertyMarketSummary }
 * 
 * 3. GET /health
 *    Returns: { status: 'ok', service: 'Singapore Property API' }
 * ============================================================================
 */

import { 
  PropertyTransaction, 
  PropertyMarketSummary, 
  PropertyFilterState, 
  PropertyApiResponse,
  BackendConnectionStatus
} from '../types/property';

// Default base URL from environment or standard REST path
const DEFAULT_API_BASE = (import.meta.env.VITE_PROPERTY_API_BASE_URL as string) || '/api/properties';
const API_KEY = (import.meta.env.VITE_PROPERTY_API_KEY as string) || '';

let customBaseUrl: string | null = null;

export const getApiBaseUrl = (): string => {
  if (customBaseUrl) return customBaseUrl;
  return localStorage.getItem('sg_property_api_base_url') || DEFAULT_API_BASE;
};

export const setApiBaseUrl = (url: string): void => {
  customBaseUrl = url.trim();
  localStorage.setItem('sg_property_api_base_url', customBaseUrl);
};

export const resetApiBaseUrl = (): void => {
  customBaseUrl = null;
  localStorage.removeItem('sg_property_api_base_url');
};

/**
 * Builds standard query parameters from current filter state
 */
function buildQueryParams(filters?: Partial<PropertyFilterState>, page: number = 1, pageSize: number = 20): URLSearchParams {
  const params = new URLSearchParams();
  params.set('page', page.toString());
  params.set('limit', pageSize.toString());

  if (!filters) return params;

  if (filters.searchQuery?.trim()) {
    params.set('q', filters.searchQuery.trim());
  }
  if (filters.marketSegment && filters.marketSegment !== 'ALL') {
    params.set('segment', filters.marketSegment);
  }
  if (filters.postalDistrict && filters.postalDistrict !== 'ALL') {
    params.set('district', filters.postalDistrict);
  }
  if (filters.propertyType && filters.propertyType !== 'ALL') {
    params.set('propertyType', filters.propertyType);
  }
  if (filters.saleType && filters.saleType !== 'ALL') {
    params.set('saleType', filters.saleType);
  }
  if (filters.minPrice !== null && filters.minPrice !== undefined) {
    params.set('minPrice', filters.minPrice.toString());
  }
  if (filters.maxPrice !== null && filters.maxPrice !== undefined) {
    params.set('maxPrice', filters.maxPrice.toString());
  }
  if (filters.minPsf !== null && filters.minPsf !== undefined) {
    params.set('minPsf', filters.minPsf.toString());
  }
  if (filters.maxPsf !== null && filters.maxPsf !== undefined) {
    params.set('maxPsf', filters.maxPsf.toString());
  }
  if (filters.sortBy) {
    params.set('sortBy', filters.sortBy);
  }

  return params;
}

/**
 * Common request headers for backend calls
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
    headers['X-Api-Key'] = API_KEY;
  }

  return headers;
}

/**
 * Placeholder Function: Fetch Property Transactions from Backend
 * When your backend is active, this requests real data from your endpoint.
 * In absence of a backend, it handles disconnection gracefully with an empty list.
 */
export async function fetchPropertyTransactions(
  filters?: Partial<PropertyFilterState>,
  page: number = 1,
  pageSize: number = 20
): Promise<PropertyApiResponse<PropertyTransaction[]>> {
  const baseUrl = getApiBaseUrl();
  const query = buildQueryParams(filters, page, pageSize);
  const endpoint = `${baseUrl}/transactions?${query.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        data: [],
        total: 0,
        page,
        pageSize,
        message: `HTTP ${response.status} from ${endpoint}. Awaiting backend implementation.`,
      };
    }

    const payload = await response.json();
    return {
      success: true,
      data: Array.isArray(payload.data) ? payload.data : [],
      total: payload.total || (Array.isArray(payload.data) ? payload.data.length : 0),
      page: payload.page || page,
      pageSize: payload.pageSize || pageSize,
      message: payload.message || 'Transactions loaded successfully',
    };
  } catch (err: unknown) {
    // Graceful fallback for developer: no data loaded until backend is attached
    const errorMessage = err instanceof Error ? err.message : 'Connection failed';
    return {
      success: false,
      data: [],
      total: 0,
      page,
      pageSize,
      message: `No active backend at ${baseUrl} (${errorMessage}). Frontend is ready for API connection.`,
    };
  }
}

/**
 * Placeholder Function: Fetch High-level Market Metrics
 */
export async function fetchPropertyMarketSummary(
  filters?: Partial<PropertyFilterState>
): Promise<PropertyApiResponse<PropertyMarketSummary | null>> {
  const baseUrl = getApiBaseUrl();
  const query = buildQueryParams(filters);
  const endpoint = `${baseUrl}/stats?${query.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        data: null,
        message: `HTTP ${response.status} from ${endpoint}.`,
      };
    }

    const payload = await response.json();
    return {
      success: true,
      data: payload.data || null,
      message: 'Market statistics loaded successfully',
    };
  } catch {
    return {
      success: false,
      data: null,
      message: `Backend awaiting integration at ${baseUrl}`,
    };
  }
}

/**
 * Diagnostic Function: Test connection to backend API
 */
export async function testBackendConnection(testUrl?: string): Promise<BackendConnectionStatus> {
  const targetUrl = testUrl || getApiBaseUrl();
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    // Try pinging health or transaction endpoint
    const response = await fetch(`${targetUrl}/health`, {
      method: 'GET',
      headers: getHeaders(),
      signal: controller.signal,
    }).catch(async () => {
      // Fallback try transactions query
      return await fetch(`${targetUrl}/transactions?limit=1`, {
        method: 'GET',
        headers: getHeaders(),
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);

    if (response.ok) {
      return {
        status: 'connected',
        baseUrl: targetUrl,
        message: `Connected successfully (HTTP ${response.status})`,
        latencyMs,
        checkedAt: new Date().toLocaleTimeString(),
      };
    } else {
      return {
        status: 'disconnected',
        baseUrl: targetUrl,
        message: `Server returned HTTP ${response.status}: ${response.statusText}`,
        latencyMs,
        checkedAt: new Date().toLocaleTimeString(),
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return {
      status: 'disconnected',
      baseUrl: targetUrl,
      message: `Unable to reach endpoint (${msg})`,
      checkedAt: new Date().toLocaleTimeString(),
    };
  }
}

/**
 * Developer Specification Reference
 * Provides the JSON contracts for the backend developer to implement
 */
export const API_SPECIFICATION = {
  endpoints: [
    {
      method: 'GET',
      path: '/transactions',
      description: 'Fetch list of Singapore private property transactions with filters',
      params: [
        { name: 'q', type: 'string', description: 'Search term for project name or street' },
        { name: 'segment', type: 'string', description: 'Market segment: CCR, RCR, or OCR' },
        { name: 'district', type: 'string', description: 'Postal district (e.g. D09, D15)' },
        { name: 'propertyType', type: 'string', description: 'Condominium, Apartment, Landed, etc.' },
        { name: 'saleType', type: 'string', description: 'New Sale, Sub Sale, or Resale' },
        { name: 'minPrice', type: 'number', description: 'Minimum price in SGD' },
        { name: 'maxPrice', type: 'number', description: 'Maximum price in SGD' },
        { name: 'minPsf', type: 'number', description: 'Minimum price per square foot' },
        { name: 'maxPsf', type: 'number', description: 'Maximum price per square foot' },
        { name: 'page', type: 'number', description: 'Page number (default: 1)' },
        { name: 'limit', type: 'number', description: 'Items per page (default: 20)' },
      ],
      responseExample: {
        success: true,
        total: 1240,
        page: 1,
        pageSize: 20,
        data: [
          {
            id: "tx-sg-001",
            projectName: "The Sail @ Marina Bay",
            streetName: "Marina Boulevard",
            postalDistrict: "D01",
            marketSegment: "CCR",
            propertyType: "Condominium",
            tenure: "99 years leasehold",
            transactedPrice: 2180000,
            areaSqft: 883,
            areaSqm: 82,
            unitPricePsf: 2469,
            floorRange: "#26 to #30",
            typeOfSale: "Resale",
            contractDate: "2024-05-12",
            completionYear: 2008
          }
        ]
      }
    },
    {
      method: 'GET',
      path: '/stats',
      description: 'Fetch aggregated price and PSF metrics for current selection',
      responseExample: {
        success: true,
        data: {
          totalTransactions: 1240,
          avgPrice: 2450000,
          medianPrice: 2150000,
          avgPsf: 2210,
          medianPsf: 2150,
          minPsf: 1250,
          maxPsf: 5800,
          ccrTransactions: 340,
          rcrTransactions: 510,
          ocrTransactions: 390
        }
      }
    },
    {
      method: 'GET',
      path: '/health',
      description: 'Health check endpoint to verify backend connectivity',
      responseExample: {
        status: "ok",
        service: "Singapore Property Realis API Gateway",
        timestamp: "2025-01-01T00:00:00.000Z"
      }
    }
  ]
};

/**
 * Sample Schema Preview Data
 * Used strictly for developer testing/inspection when toggling "Preview Schema"
 * so the developer can see how their data structure renders in the interface.
 */
export const SAMPLE_SPEC_ITEMS: PropertyTransaction[] = [
  {
    id: "spec-001",
    projectName: "Leedon Green",
    streetName: "Leedon Heights",
    postalDistrict: "D10",
    marketSegment: "CCR",
    propertyType: "Condominium",
    tenure: "Freehold",
    transactedPrice: 2890000,
    areaSqft: 1044,
    areaSqm: 97,
    unitPricePsf: 2768,
    floorRange: "#08 to #12",
    typeOfSale: "New Sale",
    contractDate: "2024-06-18",
    completionYear: 2023
  },
  {
    id: "spec-002",
    projectName: "Amber Park",
    streetName: "Amber Gardens",
    postalDistrict: "D15",
    marketSegment: "RCR",
    propertyType: "Condominium",
    tenure: "Freehold",
    transactedPrice: 3420000,
    areaSqft: 1302,
    areaSqm: 121,
    unitPricePsf: 2627,
    floorRange: "#16 to #20",
    typeOfSale: "Sub Sale",
    contractDate: "2024-06-14",
    completionYear: 2023
  },
  {
    id: "spec-003",
    projectName: "Grand Dunman",
    streetName: "Dunman Road",
    postalDistrict: "D15",
    marketSegment: "RCR",
    propertyType: "Condominium",
    tenure: "99 years leasehold",
    transactedPrice: 1980000,
    areaSqft: 796,
    areaSqm: 74,
    unitPricePsf: 2487,
    floorRange: "#11 to #15",
    typeOfSale: "New Sale",
    contractDate: "2024-06-10",
    completionYear: 2028
  },
  {
    id: "spec-004",
    projectName: "The Continuum",
    streetName: "Thiam Siew Avenue",
    postalDistrict: "D15",
    marketSegment: "RCR",
    propertyType: "Condominium",
    tenure: "Freehold",
    transactedPrice: 2650000,
    areaSqft: 1065,
    areaSqm: 99,
    unitPricePsf: 2488,
    floorRange: "#06 to #10",
    typeOfSale: "New Sale",
    contractDate: "2024-05-29",
    completionYear: 2027
  },
  {
    id: "spec-005",
    projectName: "Lentor Modern",
    streetName: "Lentor Central",
    postalDistrict: "D26",
    marketSegment: "OCR",
    propertyType: "Condominium",
    tenure: "99 years leasehold",
    transactedPrice: 1650000,
    areaSqft: 732,
    areaSqm: 68,
    unitPricePsf: 2254,
    floorRange: "#12 to #16",
    typeOfSale: "Sub Sale",
    contractDate: "2024-05-22",
    completionYear: 2026
  },
  {
    id: "spec-006",
    projectName: "Midtown Modern",
    streetName: "Tan Quee Lan Street",
    postalDistrict: "D07",
    marketSegment: "CCR",
    propertyType: "Condominium",
    tenure: "99 years leasehold",
    transactedPrice: 2580000,
    areaSqft: 904,
    areaSqm: 84,
    unitPricePsf: 2854,
    floorRange: "#21 to #25",
    typeOfSale: "Resale",
    contractDate: "2024-05-15",
    completionYear: 2024
  }
];
