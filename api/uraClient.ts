/**
 * URA (Urban Redevelopment Authority) DataService Client
 * 
 * Serverless helper that handles:
 * 1. Daily Token trading: Exchanging URA_ACCESS_KEY for today's daily token:
 *    GET https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1
 *    Header: AccessKey: <URA_ACCESS_KEY>
 * 
 * 2. Caching today's token in-memory with expiration so requests don't repeatedly trade tokens
 * 
 * 3. Calling URA DataService with BOTH AccessKey and Token headers:
 *    GET https://eservice.ura.gov.sg/uraDataService/invokeUraDS/v1?service=PMI_Resi_Transaction&batch=1
 */

interface URAStoredToken {
  token: string;
  expiresAt: number; // timestamp in ms
}

// In-memory cache for the serverless lifecycle / process
let cachedTokenInfo: URAStoredToken | null = null;

const URA_BASE_URL = 'https://eservice.ura.gov.sg/uraDataService';

export function getUraAccessKey(): string {
  const key = process.env.URA_ACCESS_KEY;
  if (!key) {
    throw new Error('URA_ACCESS_KEY environment variable is not defined.');
  }
  return key.trim();
}

/**
 * Trades URA_ACCESS_KEY for today's session Token.
 * URA tokens are typically valid for the day (up to 24 hours).
 */
export async function getOrRefreshUraToken(forceRefresh = false): Promise<string> {
  const now = Date.now();

  // If token exists and is valid for at least 5 more minutes, reuse it
  if (!forceRefresh && cachedTokenInfo && cachedTokenInfo.expiresAt > now + 5 * 60 * 1000) {
    return cachedTokenInfo.token;
  }

  const accessKey = getUraAccessKey();

  const tokenUrl = `${URA_BASE_URL}/insertNewToken/v1`;

  const response = await fetch(tokenUrl, {
    method: 'GET',
    headers: {
      'AccessKey': accessKey,
      'User-Agent': 'Singapore-Property-App/1.0',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`URA token acquisition failed (${response.status}): ${errText}`);
  }

  const json = await response.json() as {
    status?: string;
    message?: string;
    Result?: string;
    result?: string;
  };

  // URA returns { status: 'Success', Result: 'TOKEN_STRING' } or lowercase keys
  const token = json.Result || json.result;

  if (!token || json.status?.toLowerCase() === 'error') {
    throw new Error(`URA returned invalid token response: ${json.message || JSON.stringify(json)}`);
  }

  // Cache token for 23 hours (URA tokens expire daily at midnight or after 24 hours)
  cachedTokenInfo = {
    token,
    expiresAt: now + 23 * 60 * 60 * 1000,
  };

  return token;
}

/**
 * Raw call to URA invokeUraDS endpoint
 */
export async function callUraDataService<T = unknown>(
  service: string = 'PMI_Resi_Transaction',
  batch: number | string = 1
): Promise<T> {
  const accessKey = getUraAccessKey();
  let token = await getOrRefreshUraToken();

  const url = `${URA_BASE_URL}/invokeUraDS/v1?service=${encodeURIComponent(service)}&batch=${encodeURIComponent(batch)}`;

  let response = await fetch(url, {
    method: 'GET',
    headers: {
      'AccessKey': accessKey,
      'Token': token,
      'User-Agent': 'Singapore-Property-App/1.0',
    },
  });

  // If token expired, try one refresh
  if (response.status === 401 || response.status === 403) {
    token = await getOrRefreshUraToken(true);
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'AccessKey': accessKey,
        'Token': token,
        'User-Agent': 'Singapore-Property-App/1.0',
      },
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`URA invokeUraDS request failed (${response.status}): ${errText}`);
  }

  return response.json() as Promise<T>;
}
