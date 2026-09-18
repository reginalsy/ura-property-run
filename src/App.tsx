import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { MarketStatsBar } from './components/MarketStatsBar';
import { FilterBar } from './components/FilterBar';
import { TransactionsTable } from './components/TransactionsTable';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { DistrictGuideModal } from './components/DistrictGuideModal';
import {
  PropertyTransaction,
  PropertyMarketSummary,
  PropertyFilterState,
  BackendConnectionStatus,
} from './types/property';
import {
  fetchPropertyTransactions,
  fetchPropertyMarketSummary,
  testBackendConnection,
  getApiBaseUrl,
  SAMPLE_SPEC_ITEMS,
} from './services/propertyApi';

const DEFAULT_FILTERS: PropertyFilterState = {
  searchQuery: '',
  marketSegment: 'ALL',
  propertyType: 'ALL',
  postalDistrict: 'ALL',
  saleType: 'ALL',
  minPrice: null,
  maxPrice: null,
  minPsf: null,
  maxPsf: null,
  sortBy: 'date_desc',
};

export default function App() {
  // Empty data by default - strictly as requested:
  // "Do not include any data as of now, I will connect to the backend after for now, but include placeholders for the API integration."
  const [transactions, setTransactions] = useState<PropertyTransaction[]>([]);
  const [marketSummary, setMarketSummary] = useState<PropertyMarketSummary | null>(null);
  const [filters, setFilters] = useState<PropertyFilterState>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPreviewingSample, setIsPreviewingSample] = useState<boolean>(false);

  // Modals state
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isDistrictGuideOpen, setIsDistrictGuideOpen] = useState<boolean>(false);

  // Connection diagnostics
  const [connectionStatus, setConnectionStatus] = useState<BackendConnectionStatus>({
    status: 'idle',
    baseUrl: getApiBaseUrl(),
    message: 'Awaiting backend API connection',
  });
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  // Check backend health
  const runConnectionCheck = useCallback(async (urlOverride?: string) => {
    setIsTestingConnection(true);
    try {
      const status = await testBackendConnection(urlOverride);
      setConnectionStatus(status);
    } finally {
      setIsTestingConnection(false);
    }
  }, []);

  // Fetch transactions from configured API endpoint
  const loadData = useCallback(async (currentFilters: PropertyFilterState) => {
    if (isPreviewingSample) {
      return;
    }

    setIsLoading(true);
    try {
      // Calls placeholder API client which queries the configured backend
      const [txResult, statsResult] = await Promise.all([
        fetchPropertyTransactions(currentFilters),
        fetchPropertyMarketSummary(currentFilters),
      ]);

      if (txResult.success && txResult.data.length > 0) {
        setTransactions(txResult.data);
      } else {
        // Keeps transactions empty when no backend returns data
        setTransactions([]);
      }

      if (statsResult.success && statsResult.data) {
        setMarketSummary(statsResult.data);
      } else if (txResult.data.length > 0) {
        // Fallback compute summary if transactions exist
        const items = txResult.data;
        const prices = items.map((i) => i.transactedPrice);
        const psfs = items.map((i) => i.unitPricePsf);
        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / items.length);
        const avgPsf = Math.round(psfs.reduce((a, b) => a + b, 0) / items.length);
        const sortedPsfs = [...psfs].sort((a, b) => a - b);
        const medianPsf = sortedPsfs[Math.floor(sortedPsfs.length / 2)] || 0;

        setMarketSummary({
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
        });
      } else {
        setMarketSummary(null);
      }
    } catch {
      setTransactions([]);
      setMarketSummary(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isPreviewingSample]);

  // Initial check on mount
  useEffect(() => {
    runConnectionCheck();
    loadData(filters);
  }, [runConnectionCheck, loadData, filters]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    runConnectionCheck();
    loadData(filters);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Developer toggle to preview schema layout with mock items
  const handleTogglePreviewSample = () => {
    if (isPreviewingSample) {
      setIsPreviewingSample(false);
      setTransactions([]);
      setMarketSummary(null);
    } else {
      setIsPreviewingSample(true);
      setTransactions(SAMPLE_SPEC_ITEMS);
      setMarketSummary({
        totalTransactions: SAMPLE_SPEC_ITEMS.length,
        avgPrice: 2528333,
        medianPrice: 2615000,
        avgPsf: 2579,
        medianPsf: 2557,
        minPsf: 2254,
        maxPsf: 2854,
        ccrTransactions: 2,
        rcrTransactions: 3,
        ocrTransactions: 1,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Application Bar */}
      <Header
        connectionStatus={connectionStatus}
        onOpenApiModal={() => setIsApiModalOpen(true)}
        onOpenDistrictGuide={() => setIsDistrictGuideOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
      />

      {/* Main Analytical Dashboard Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI / Price Metrics Bar */}
        <MarketStatsBar
          summary={marketSummary}
          isLoading={isLoading}
          onOpenApiModal={() => setIsApiModalOpen(true)}
        />

        {/* Filter & Search Bar */}
        <FilterBar
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={handleResetFilters}
          totalResults={transactions.length}
        />

        {/* Transactions Table / Awaiting Backend Empty State */}
        <TransactionsTable
          transactions={transactions}
          isLoading={isLoading}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          onPreviewSampleData={handleTogglePreviewSample}
          isPreviewingSample={isPreviewingSample}
        />
      </main>

      {/* Footer with Singapore Property Standards Notice */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Singapore Private Property Prices</span>
            <span>&bull;</span>
            <span>API Hook: <code className="font-mono text-slate-600">{getApiBaseUrl()}</code></span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDistrictGuideOpen(true)}
              className="hover:text-slate-800 transition-colors"
            >
              Districts Guide (D01-D28)
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              className="hover:text-slate-800 font-medium text-indigo-600 transition-colors"
            >
              API Integration Docs
            </button>
          </div>
        </div>
      </footer>

      {/* API Integration Specs Modal */}
      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        connectionStatus={connectionStatus}
        onTestConnection={async (url) => {
          await runConnectionCheck(url);
          loadData(filters);
        }}
        isTesting={isTestingConnection}
      />

      {/* Singapore Districts & Market Segments Reference Modal */}
      <DistrictGuideModal
        isOpen={isDistrictGuideOpen}
        onClose={() => setIsDistrictGuideOpen(false)}
        onSelectDistrict={(districtCode) => {
          setFilters((prev) => ({ ...prev, postalDistrict: districtCode }));
        }}
      />
    </div>
  );
}
