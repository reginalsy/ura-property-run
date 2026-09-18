import { handleGetUraTransactions, handleGetUraToken } from './properties';
import { getOrRefreshUraToken, callUraDataService } from './uraClient';

export interface ServerlessRequest {
  method?: string;
  url?: string;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string | undefined>;
}

export interface ServerlessResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

/**
 * Universal Serverless HTTP Gateway
 * Compatible with Vercel Serverless Functions, AWS Lambda, Cloud Functions, and Express router
 */
export default async function handler(req: any, res?: any) {
  // Support Express / Node req/res or Vercel serverless
  const method = req.method || 'GET';
  const query = req.query || {};
  const pathname = req.path || req.url || '';

  const sendJson = (status: number, data: unknown) => {
    if (res && typeof res.status === 'function') {
      return res.status(status).json(data);
    }
    return {
      statusCode: status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  };

  try {
    // Health / Diagnostics endpoint
    if (pathname.includes('/health')) {
      const hasKey = Boolean(process.env.URA_ACCESS_KEY);
      return sendJson(200, {
        status: 'ok',
        service: 'URA Property DataService Serverless Bridge',
        uraAccessKeyConfigured: hasKey,
        hint: hasKey ? 'AccessKey present in environment' : 'URA_ACCESS_KEY environment variable is missing',
        endpoints: {
          transactions: '/api/properties/transactions',
          token: '/api/properties/token',
          stats: '/api/properties/stats',
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Explicit Token Inspection endpoint
    if (pathname.includes('/token')) {
      const result = await handleGetUraToken(req, res);
      return sendJson(result.success ? 200 : 500, result);
    }

    // Stats endpoint
    if (pathname.includes('/stats')) {
      const txResult = await handleGetUraTransactions(query);
      if (!txResult.success) {
        return sendJson(500, txResult);
      }

      const items = txResult.data;
      if (items.length === 0) {
        return sendJson(200, {
          success: true,
          data: null,
          message: 'No transactions found for current filter',
        });
      }

      const prices = items.map((t) => t.transactedPrice);
      const psfs = items.map((t) => t.unitPricePsf);
      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / items.length);
      const avgPsf = Math.round(psfs.reduce((a, b) => a + b, 0) / items.length);
      const sortedPsfs = [...psfs].sort((a, b) => a - b);
      const medianPsf = sortedPsfs[Math.floor(sortedPsfs.length / 2)] || 0;

      return sendJson(200, {
        success: true,
        data: {
          totalTransactions: items.length,
          avgPrice,
          medianPrice: avgPrice,
          avgPsf,
          medianPsf,
          minPsf: Math.min(...psfs),
          maxPsf: Math.max(...psfs),
          ccrTransactions: items.filter((i) => i.marketSegment === 'CCR').length,
          rcrTransactions: items.filter((i) => i.marketSegment === 'RCR').length,
          ocrTransactions: items.filter((i) => i.marketSegment === 'OCR').length,
        },
      });
    }

    // Main Transactions endpoint
    const result = await handleGetUraTransactions(query);
    return sendJson(result.success ? 200 : 500, result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Serverless invocation error';
    return sendJson(500, {
      success: false,
      error: message,
    });
  }
}

export { getOrRefreshUraToken, callUraDataService, handleGetUraTransactions };
