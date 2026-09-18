import { X, MapPin, Building2, Landmark, Compass } from 'lucide-react';
import { SINGAPORE_DISTRICTS } from '../constants/singaporeDistricts';
import { MarketSegment } from '../types/property';

interface DistrictGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDistrict?: (districtCode: string) => void;
}

export function DistrictGuideModal({ isOpen, onClose, onSelectDistrict }: DistrictGuideModalProps) {
  if (!isOpen) return null;

  const ccrDistricts = SINGAPORE_DISTRICTS.filter((d) => d.segment === 'CCR');
  const rcrDistricts = SINGAPORE_DISTRICTS.filter((d) => d.segment === 'RCR');
  const ocrDistricts = SINGAPORE_DISTRICTS.filter((d) => d.segment === 'OCR');

  const renderDistrictList = (districts: typeof SINGAPORE_DISTRICTS, segment: MarketSegment) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {districts.map((d) => (
          <div
            key={d.code}
            onClick={() => {
              if (onSelectDistrict) {
                onSelectDistrict(d.code);
                onClose();
              }
            }}
            className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-xs transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded bg-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                {d.code}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Sectors: {d.postalSectors}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-800 line-clamp-2">
              {d.name}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="district-guide-modal"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Singapore Postal Districts &amp; Market Segments
              </h2>
              <p className="text-xs text-slate-500">
                URA's three residential market tiers: CCR (Prime), RCR (City Fringe), and OCR (Suburban)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="close-district-guide-button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* CCR */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-purple-600"></span>
              <h3 className="font-bold text-slate-900 text-sm">
                CCR &bull; Core Central Region (High-End &amp; Luxury)
              </h3>
              <span className="text-slate-500 text-xs">
                (Districts 01, 02, 04, 06, 09, 10, 11)
              </span>
            </div>
            <p className="text-slate-600 mb-3 text-xs">
              Prime luxury enclaves including Orchard Road, River Valley, Bukit Timah, Sentosa Cove, and Marina Bay financial core. Commands highest PSF valuations.
            </p>
            {renderDistrictList(ccrDistricts, 'CCR')}
          </div>

          {/* RCR */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <h3 className="font-bold text-slate-900 text-sm">
                RCR &bull; Rest of Central Region (City Fringe)
              </h3>
              <span className="text-slate-500 text-xs">
                (Districts 03, 05, 07, 08, 12, 13, 14, 15, 20, 21)
              </span>
            </div>
            <p className="text-slate-600 mb-3 text-xs">
              Directly adjacent to the city core, including Queenstown, East Coast (D15), Bishan, and Kallang. Extremely popular for balanced pricing and city proximity.
            </p>
            {renderDistrictList(rcrDistricts, 'RCR')}
          </div>

          {/* OCR */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <h3 className="font-bold text-slate-900 text-sm">
                OCR &bull; Outside Central Region (Mass Market &amp; Heartlands)
              </h3>
              <span className="text-slate-500 text-xs">
                (Districts 16, 17, 18, 19, 22, 23, 24, 25, 26, 27, 28)
              </span>
            </div>
            <p className="text-slate-600 mb-3 text-xs">
              Suburban Singapore heartlands and regional hubs like Jurong Lake District, Woodlands, Tampines, Punggol, and Lentor. Highest transaction volume.
            </p>
            {renderDistrictList(ocrDistricts, 'OCR')}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-xs">Click any district to filter property records</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
}
