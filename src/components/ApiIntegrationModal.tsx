import { useState } from 'react';
import { X, Check, Copy, Terminal, Server, ExternalLink, Activity, Globe } from 'lucide-react';
import { BackendConnectionStatus } from '../types/property';
import { API_SPECIFICATION, getApiBaseUrl, setApiBaseUrl, resetApiBaseUrl } from '../services/propertyApi';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionStatus: BackendConnectionStatus;
  onTestConnection: (url?: string) => Promise<void>;
  isTesting: boolean;
}

export function ApiIntegrationModal({
  isOpen,
  onClose,
  connectionStatus,
  onTestConnection,
  isTesting,
}: ApiIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'schema' | 'curl' | 'ura'>('endpoints');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(getApiBaseUrl());
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveUrl = () => {
    setApiBaseUrl(urlInput);
    setSaveMessage('Saved URL preference.');
    setTimeout(() => setSaveMessage(null), 3000);
    onTestConnection(urlInput);
  };

  const handleResetUrl = () => {
    resetApiBaseUrl();
    const defaultUrl = getApiBaseUrl();
    setUrlInput(defaultUrl);
    setSaveMessage('Reset to default.');
    setTimeout(() => setSaveMessage(null), 3000);
    onTestConnection(defaultUrl);
  };

  const sampleCurl = `curl -X GET "${urlInput}/transactions?segment=CCR&district=D09&page=1&limit=20" \\
  -H "Accept: application/json"`;

  const sampleStatsCurl = `curl -X GET "${urlInput}/stats?district=D09" \\
  -H "Accept: application/json"`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="api-integration-modal"
        className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Backend API Integration Placeholders</h2>
              <p className="text-xs text-slate-500">
                Specifications for connecting your Singapore private property data service
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            id="close-api-modal-button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Endpoint & Health Check Control */}
        <div className="px-6 py-3.5 bg-slate-100/70 border-b border-slate-200 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label htmlFor="api-base-url-input" className="font-semibold text-slate-700 whitespace-nowrap">
              API Base URL:
            </label>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                id="api-base-url-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="/api/properties or https://my-server.com/api"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                id="save-api-url-button"
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors text-xs whitespace-nowrap"
              >
                Save &amp; Test
              </button>
              <button
                type="button"
                onClick={handleResetUrl}
                className="px-2.5 py-1.5 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-xs"
                title="Reset to default"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Connection Status feedback */}
          <div className="mt-2.5 flex items-center justify-between text-slate-600 pt-2 border-t border-slate-200/60">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>Status:</span>
              <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                connectionStatus.status === 'connected'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {connectionStatus.status === 'connected' ? 'Connected' : 'Waiting for Backend'}
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                ({connectionStatus.message})
              </span>
            </div>

            <button
              type="button"
              onClick={() => onTestConnection(urlInput)}
              disabled={isTesting}
              id="ping-test-connection-button"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
            >
              {isTesting ? 'Pinging endpoint...' : 'Ping Test Now'}
            </button>
          </div>
          {saveMessage && <div className="mt-1 text-emerald-600 font-medium text-[11px]">{saveMessage}</div>}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-2 bg-white gap-2">
          <button
            type="button"
            id="tab-endpoints"
            onClick={() => setActiveTab('endpoints')}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'endpoints'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Endpoints &amp; Query Params
          </button>
          <button
            type="button"
            id="tab-schema"
            onClick={() => setActiveTab('schema')}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'schema'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. JSON Response Schema
          </button>
          <button
            type="button"
            id="tab-curl"
            onClick={() => setActiveTab('curl')}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'curl'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. cURL &amp; Testing
          </button>
          <button
            type="button"
            id="tab-ura"
            onClick={() => setActiveTab('ura')}
            className={`pb-2 px-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ura'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Singapore URA / REALIS
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-4">
          {activeTab === 'endpoints' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                The frontend service at <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">/src/services/propertyApi.ts</code> makes requests to these REST endpoints:
              </p>

              {API_SPECIFICATION.endpoints.map((ep) => (
                <div key={ep.path} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[11px]">
                      {ep.method}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {urlInput}{ep.path}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-3">{ep.description}</p>

                  {ep.params && (
                    <div>
                      <div className="font-semibold text-slate-700 mb-1.5 text-[11px] uppercase tracking-wide">
                        Query Parameters:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ep.params.map((p) => (
                          <div key={p.name} className="bg-white p-2 rounded border border-slate-200 text-[11px]">
                            <span className="font-mono font-bold text-slate-900">{p.name}</span>
                            <span className="text-slate-400 font-mono text-[10px] ml-1">({p.type})</span>
                            <div className="text-slate-500 text-[10px] mt-0.5">{p.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Expected Response for GET /transactions:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(API_SPECIFICATION.endpoints[0].responseExample, null, 2), 'schema')}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
                >
                  {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'schema' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(API_SPECIFICATION.endpoints[0].responseExample, null, 2)}
              </pre>

              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-slate-800">Expected Response for GET /stats:</span>
                <button
                  type="button"
                  onClick={() => handleCopy(JSON.stringify(API_SPECIFICATION.endpoints[1].responseExample, null, 2), 'stats-schema')}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
                >
                  {copiedSection === 'stats-schema' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSection === 'stats-schema' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(API_SPECIFICATION.endpoints[1].responseExample, null, 2)}
              </pre>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">1. Query Transactions:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleCurl, 'curl1')}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
                  >
                    {copiedSection === 'curl1' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'curl1' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
                  {sampleCurl}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-800">2. Query Market Summary:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleStatsCurl, 'curl2')}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-medium"
                  >
                    {copiedSection === 'curl2' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'curl2' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto">
                  {sampleStatsCurl}
                </pre>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-600">
                <span className="font-semibold text-slate-800 block mb-1">Environment Variables</span>
                You can set your production URL in <code className="bg-white px-1 py-0.5 rounded border border-slate-200">.env</code>:
                <pre className="bg-white p-2 rounded border border-slate-200 font-mono text-[11px] mt-1 text-slate-800">
                  VITE_PROPERTY_API_BASE_URL="https://your-api-domain.com/api/properties"
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'ura' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900">
                <div className="font-bold flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4" />
                  <span>Singapore Urban Redevelopment Authority (URA) REALIS API</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  In Singapore, official private residential property caveats and transaction prices are maintained by URA REALIS (Real Estate Information System).
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  <strong>How to connect URA DataService:</strong>
                </p>
                <ol className="list-decimal pl-5 space-y-1.5">
                  <li>Register for a URA developer account at <em>ura.gov.sg/maps/api/</em> to obtain your <code className="bg-slate-100 px-1 py-0.5 rounded">AccessKey</code>.</li>
                  <li>Call URA's token endpoint: <code className="bg-slate-100 px-1 py-0.5 rounded">GET /uraDataService/insertNewToken.action</code>.</li>
                  <li>Query private residential transactions with service name <code className="bg-slate-100 px-1 py-0.5 rounded">PMI_Resi_Transaction</code> (batches 1 to 4).</li>
                  <li>Map URA's response fields (<code className="font-mono text-slate-800">project</code>, <code className="font-mono text-slate-800">street</code>, <code className="font-mono text-slate-800">district</code>, <code className="font-mono text-slate-800">price</code>, <code className="font-mono text-slate-800">nettPrice</code>, <code className="font-mono text-slate-800">area</code>, <code className="font-mono text-slate-800">contractDate</code>) to our <code className="bg-slate-100 px-1 py-0.5 rounded">PropertyTransaction</code> schema!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Current target: <code className="font-mono text-slate-700">{urlInput}</code>
          </span>
          <button
            type="button"
            onClick={onClose}
            id="done-api-modal-button"
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
