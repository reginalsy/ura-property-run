import { Server, Database, ArrowUpDown, Calendar, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { PropertyTransaction, MarketSegment } from '../types/property';

interface TransactionsTableProps {
  transactions: PropertyTransaction[];
  isLoading: boolean;
  onOpenApiModal: () => void;
  onPreviewSampleData?: () => void;
  isPreviewingSample?: boolean;
}

export function TransactionsTable({
  transactions,
  isLoading,
  onOpenApiModal,
  onPreviewSampleData,
  isPreviewingSample,
}: TransactionsTableProps) {
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

  const getSegmentBadge = (segment: MarketSegment) => {
    switch (segment) {
      case 'CCR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
            CCR (Core)
          </span>
        );
      case 'RCR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            RCR (City Fringe)
          </span>
        );
      case 'OCR':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            OCR (Suburban)
          </span>
        );
      default:
        return null;
    }
  };

  const getSaleTypeBadge = (saleType: string) => {
    switch (saleType) {
      case 'New Sale':
        return <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-200">New Sale</span>;
      case 'Sub Sale':
        return <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">Sub Sale</span>;
      default:
        return <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200">Resale</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Table Title Bar */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Transacted Property Records</span>
            {transactions.length > 0 && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {transactions.length} items
              </span>
            )}
            {isPreviewingSample && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Preview Schema Mode
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Individual private residential caveats registered in Singapore
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          {onPreviewSampleData && (
            <button
              type="button"
              onClick={onPreviewSampleData}
              id="toggle-preview-sample-button"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
            >
              {isPreviewingSample ? 'Clear Preview' : 'Test Layout with Sample Schema'}
            </button>
          )}
          <button
            type="button"
            onClick={onOpenApiModal}
            id="table-api-specs-button"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <span>Endpoint Specs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Table or Empty Placeholder */}
      {isLoading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-800 mb-3" />
          <p className="text-sm font-medium text-slate-600">Querying private property backend...</p>
          <p className="text-xs text-slate-400 mt-1">Calling configured API endpoint</p>
        </div>
      ) : transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="property-transactions-table">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Project &amp; Location</th>
                <th className="py-3 px-4">District / Segment</th>
                <th className="py-3 px-4">Type &amp; Tenure</th>
                <th className="py-3 px-4">Floor &amp; Size</th>
                <th className="py-3 px-4 text-right">Transacted Price</th>
                <th className="py-3 px-4 text-right">Unit PSF</th>
                <th className="py-3 px-4 text-right">Sale Type / Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Project & Location */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-sm">{tx.projectName}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{tx.streetName}</div>
                  </td>

                  {/* District & Segment */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1">
                      <span className="font-mono font-semibold text-slate-800">{tx.postalDistrict}</span>
                      {getSegmentBadge(tx.marketSegment)}
                    </div>
                  </td>

                  {/* Type & Tenure */}
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{tx.propertyType}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{tx.tenure}</div>
                  </td>

                  {/* Floor & Size */}
                  <td className="py-3 px-4">
                    <div className="text-slate-900 font-medium">{tx.floorRange}</div>
                    <div className="text-slate-500 text-[11px]">
                      {formatNumber(tx.areaSqft)} sqft ({formatNumber(tx.areaSqm)} sqm)
                    </div>
                  </td>

                  {/* Transacted Price */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900 text-sm">
                      {formatCurrency(tx.transactedPrice)}
                    </div>
                  </td>

                  {/* Unit PSF */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="font-bold text-emerald-700 font-mono">
                      S$ {formatNumber(tx.unitPricePsf)}
                    </div>
                    <div className="text-[10px] text-slate-400">per sq ft</div>
                  </td>

                  {/* Sale Type / Date */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div>{getSaleTypeBadge(tx.typeOfSale)}</div>
                    <div className="text-slate-500 text-[11px] mt-1 flex items-center justify-end gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {tx.contractDate}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State: Clear placeholder awaiting backend integration */
        <div className="p-8 sm:p-12 text-center" id="empty-state-awaiting-backend">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4 border border-slate-200">
            <Server className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Awaiting Backend API Connection
          </h3>

          <p className="max-w-md mx-auto text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            The frontend interface and data models are ready to state Singapore private property prices. 
            Connect your backend service or URA API proxy to stream live transaction records.
          </p>

          {/* Placeholder API Endpoint Display */}
          <div className="mt-6 max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-left font-mono text-xs">
            <div className="flex items-center justify-between text-slate-500 pb-2 mb-2 border-b border-slate-200 text-[11px]">
              <span className="font-sans font-semibold text-slate-700">Configured Integration Hook</span>
              <span className="bg-slate-200/80 px-1.5 py-0.5 rounded text-[10px]">REST / JSON</span>
            </div>
            <div className="text-slate-800 break-all">
              <span className="text-purple-600 font-bold">GET</span> /api/properties/transactions
            </div>
            <div className="text-slate-500 text-[11px] mt-1">
              Supports: <code className="text-slate-700">q</code>, <code className="text-slate-700">segment</code>, <code className="text-slate-700">district</code>, <code className="text-slate-700">propertyType</code>, <code className="text-slate-700">page</code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onOpenApiModal}
              id="empty-state-open-specs-button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Database className="w-4 h-4" />
              <span>View API Endpoints &amp; Schema</span>
            </button>

            {onPreviewSampleData && (
              <button
                type="button"
                onClick={onPreviewSampleData}
                id="empty-state-preview-sample-button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Preview Schema Layout</span>
              </button>
            )}
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Adheres to Singapore URA REALIS transaction structure</span>
          </div>
        </div>
      )}
    </div>
  );
}
