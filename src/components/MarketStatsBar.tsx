import { TrendingUp, Building, DollarSign, PieChart } from 'lucide-react';
import { PropertyMarketSummary } from '../types/property';

interface MarketStatsBarProps {
  summary: PropertyMarketSummary | null;
  isLoading: boolean;
  onOpenApiModal: () => void;
}

export function MarketStatsBar({ summary, isLoading, onOpenApiModal }: MarketStatsBarProps) {
  const hasData = summary && summary.totalTransactions > 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-SG').format(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Median PSF */}
      <div 
        id="metric-median-psf"
        className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Median Transacted PSF</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          {isLoading ? (
            <div className="h-8 w-28 bg-slate-100 rounded animate-pulse" />
          ) : hasData ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                S$ {formatNumber(summary.medianPsf)}
              </span>
              <span className="text-xs font-medium text-slate-500">/ sqft</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-slate-300">S$ —</span>
              <span className="text-xs text-slate-400 font-mono">PSF</span>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>{hasData ? `Range: S$ ${formatNumber(summary.minPsf)} - S$ ${formatNumber(summary.maxPsf)}` : 'Awaiting API connection'}</span>
          {!hasData && (
            <button 
              type="button" 
              onClick={onOpenApiModal}
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline text-[11px]"
            >
              Connect &rarr;
            </button>
          )}
        </div>
      </div>

      {/* Average Price */}
      <div 
        id="metric-avg-price"
        className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Transacted Price</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          {isLoading ? (
            <div className="h-8 w-32 bg-slate-100 rounded animate-pulse" />
          ) : hasData ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrency(summary.avgPrice)}
              </span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-slate-300">S$ —</span>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>{hasData ? `Median: ${formatCurrency(summary.medianPrice)}` : 'Awaiting API stream'}</span>
          {!hasData && (
            <span className="font-mono text-[10px] text-slate-400">/stats endpoint</span>
          )}
        </div>
      </div>

      {/* Total Volume */}
      <div 
        id="metric-volume"
        className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Transacted Units</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
            <Building className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          {isLoading ? (
            <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
          ) : hasData ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {formatNumber(summary.totalTransactions)}
              </span>
              <span className="text-xs font-medium text-slate-500">records</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-slate-300">0</span>
              <span className="text-xs text-slate-400">records</span>
            </div>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>{hasData ? 'Active filter selection' : '0 records loaded'}</span>
          {!hasData && (
            <span className="text-amber-600 font-medium text-[11px]">Backend ready</span>
          )}
        </div>
      </div>

      {/* Market Segments Share */}
      <div 
        id="metric-market-segments"
        className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-xs relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Market Region Split</span>
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <PieChart className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-1">
          {isLoading ? (
            <div className="h-8 w-full bg-slate-100 rounded animate-pulse" />
          ) : hasData ? (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex flex-col flex-1">
                <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-slate-100">
                  <div 
                    style={{ width: `${(summary.ccrTransactions / summary.totalTransactions) * 100}%` }} 
                    className="bg-purple-600" 
                    title="CCR" 
                  />
                  <div 
                    style={{ width: `${(summary.rcrTransactions / summary.totalTransactions) * 100}%` }} 
                    className="bg-blue-500" 
                    title="RCR" 
                  />
                  <div 
                    style={{ width: `${(summary.ocrTransactions / summary.totalTransactions) * 100}%` }} 
                    className="bg-emerald-500" 
                    title="OCR" 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono">
                  <span>CCR {Math.round((summary.ccrTransactions / summary.totalTransactions) * 100)}%</span>
                  <span>RCR {Math.round((summary.rcrTransactions / summary.totalTransactions) * 100)}%</span>
                  <span>OCR {Math.round((summary.ocrTransactions / summary.totalTransactions) * 100)}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1 text-slate-400">
              <div className="h-2.5 w-full rounded-full bg-slate-100" />
            </div>
          )}
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>CCR
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 ml-1"></span>RCR
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>OCR
          </span>
          <span className="text-slate-400 font-mono text-[10px]">Singapore Realis</span>
        </div>
      </div>
    </div>
  );
}
