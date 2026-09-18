import { Database, Info, RefreshCw, Layers } from 'lucide-react';
import { BackendConnectionStatus } from '../types/property';

interface HeaderProps {
  connectionStatus: BackendConnectionStatus;
  onOpenApiModal: () => void;
  onOpenDistrictGuide: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function Header({
  connectionStatus,
  onOpenApiModal,
  onOpenDistrictGuide,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  const isConnected = connectionStatus.status === 'connected';

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3.5 gap-3">
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg tracking-tight shadow-xs">
              <span className="text-red-500 font-black mr-0.5">S</span>G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Singapore Private Property Prices
                </h1>
                <span className="hidden md:inline-flex text-xs px-2 py-0.5 font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  URA REALIS Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Private residential transacted prices, PSF valuations &amp; market segments (CCR, RCR, OCR)
              </p>
            </div>
          </div>

          {/* Actions & Status */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Backend Connection Indicator */}
            <button
              type="button"
              onClick={onOpenApiModal}
              id="api-connection-status-button"
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to view API integration specs & connection status"
            >
              <span className="relative flex h-2 w-2">
                {isConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                )}
              </span>
              <span className="font-semibold">
                {isConnected ? 'Backend: Connected' : 'API: Ready to Connect'}
              </span>
              <span className="text-slate-400 group-hover:text-slate-600 ml-1 font-mono text-[10px]">
                config &rarr;
              </span>
            </button>

            {/* District Guide Button */}
            <button
              type="button"
              onClick={onOpenDistrictGuide}
              id="district-guide-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Districts D01-D28</span>
            </button>

            {/* API Integration Drawer Trigger */}
            <button
              type="button"
              onClick={onOpenApiModal}
              id="open-api-specs-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Database className="w-3.5 h-3.5" />
              <span>API Specs</span>
            </button>

            {/* Refresh Data Button */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              id="refresh-data-button"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200 disabled:opacity-50"
              title="Query API"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
