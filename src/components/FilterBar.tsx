import { Search, RotateCcw, Filter } from 'lucide-react';
import { PropertyFilterState, MarketSegment, PropertyCategory, SaleType } from '../types/property';
import { SINGAPORE_DISTRICTS, PROPERTY_TYPES, MARKET_SEGMENTS } from '../constants/singaporeDistricts';

interface FilterBarProps {
  filters: PropertyFilterState;
  onChange: (newFilters: PropertyFilterState) => void;
  onReset: () => void;
  totalResults: number;
}

export function FilterBar({ filters, onChange, onReset, totalResults }: FilterBarProps) {
  const isFiltered = Boolean(
    filters.searchQuery ||
    filters.marketSegment !== 'ALL' ||
    filters.postalDistrict !== 'ALL' ||
    filters.propertyType !== 'ALL' ||
    filters.saleType !== 'ALL' ||
    filters.minPrice !== null ||
    filters.maxPrice !== null
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 mb-6 shadow-xs">
      {/* Top row: Search & Market Segment Pills */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between mb-4">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="property-search-input"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by project name or street (e.g. Marina Bay, Leedon, Amber Road)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ ...filters, searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Market Segment Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
          {MARKET_SEGMENTS.map((seg) => {
            const isActive = filters.marketSegment === seg.id;
            return (
              <button
                key={seg.id}
                type="button"
                id={`segment-tab-${seg.id.toLowerCase()}`}
                onClick={() => onChange({ ...filters, marketSegment: seg.id as 'ALL' | MarketSegment })}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={seg.description}
              >
                {seg.id === 'ALL' ? 'All Segments' : seg.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Row: Selectors (District, Property Type, Sale Type, Sort) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
        {/* District Selector */}
        <div>
          <label htmlFor="district-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Postal District
          </label>
          <select
            id="district-select"
            value={filters.postalDistrict}
            onChange={(e) => onChange({ ...filters, postalDistrict: e.target.value })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          >
            <option value="ALL">All Districts (D01 - D28)</option>
            {SINGAPORE_DISTRICTS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} - {d.name.length > 25 ? `${d.name.slice(0, 25)}...` : d.name} ({d.segment})
              </option>
            ))}
          </select>
        </div>

        {/* Property Category */}
        <div>
          <label htmlFor="property-type-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Property Type
          </label>
          <select
            id="property-type-select"
            value={filters.propertyType}
            onChange={(e) => onChange({ ...filters, propertyType: e.target.value as 'ALL' | PropertyCategory })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          >
            <option value="ALL">All Property Types</option>
            {PROPERTY_TYPES.map((pt) => (
              <option key={pt} value={pt}>
                {pt}
              </option>
            ))}
          </select>
        </div>

        {/* Sale Type */}
        <div>
          <label htmlFor="sale-type-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Sale Type
          </label>
          <select
            id="sale-type-select"
            value={filters.saleType}
            onChange={(e) => onChange({ ...filters, saleType: e.target.value as 'ALL' | SaleType })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          >
            <option value="ALL">All Sale Types</option>
            <option value="New Sale">New Sale (Direct Developer)</option>
            <option value="Resale">Resale (Secondary Market)</option>
            <option value="Sub Sale">Sub Sale (Pre-completion)</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Sort Order
          </label>
          <select
            id="sort-select"
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as PropertyFilterState['sortBy'] })}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          >
            <option value="date_desc">Contract Date: Newest First</option>
            <option value="date_asc">Contract Date: Oldest First</option>
            <option value="psf_desc">Unit PSF: High to Low</option>
            <option value="psf_asc">Unit PSF: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
          </select>
        </div>

        {/* Status / Reset Action */}
        <div className="flex items-end justify-between sm:justify-start gap-2">
          {isFiltered ? (
            <button
              type="button"
              onClick={onReset}
              id="reset-filters-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors w-full justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          ) : (
            <div className="text-xs text-slate-500 py-1.5 flex items-center gap-1.5 w-full">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalResults > 0 ? `${totalResults} found` : 'Filters ready'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
