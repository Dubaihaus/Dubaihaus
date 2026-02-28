'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Globe,
    Database,
    Clock,
    ChevronDown,
    Filter,
    BarChart3,
    Search,
    RefreshCw,
    ExternalLink,
    X,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Copy,
    ChevronLeft
} from 'lucide-react';

export default function AIUsageSection() {
    // --- State: Filters ---
    const [range, setRange] = useState('all');
    const [source, setSource] = useState('');
    const [locale, setLocale] = useState('');
    const [status, setStatus] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // --- State: Tabs ---
    const [activeTab, setActiveTab] = useState('overview'); // overview, entities, logs

    // --- State: Data ---
    const [summaryData, setSummaryData] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // --- UI State: Drawer ---
    const [selectedEntity, setSelectedEntity] = useState(null);

    // --- Fetch Summary ---
    const fetchSummary = useCallback(async () => {
        setLoadingSummary(true);
        try {
            const params = new URLSearchParams({
                range,
                source,
                locale,
                status
            });
            const res = await fetch(`/api/admin/system/ai-usage/summary?${params.toString()}`);
            const result = await res.json();
            setSummaryData(result);
        } catch (err) {
            console.error("Failed to fetch AI usage summary:", err);
        } finally {
            setLoadingSummary(false);
        }
    }, [range, source, locale, status]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary, refreshTrigger]);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    return (
        <div className="space-y-6 mt-10">
            {/* --- Header & Filters --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-50 rounded-lg">
                        <Activity className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-none">AI Translation Usage</h2>
                        <p className="text-xs text-gray-500 mt-1">Monitor costs and performance of dynamic translations</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Range */}
                    <FilterSelect
                        value={range}
                        onChange={setRange}
                        icon={<Clock className="w-4 h-4" />}
                        options={[
                            { label: 'All Time', value: 'all' },
                            { label: 'Last 24h', value: '24h' },
                            { label: 'Last 7 Days', value: '7d' },
                            { label: 'Last 30 Days', value: '30d' },
                        ]}
                    />

                    {/* Source */}
                    <FilterSelect
                        value={source}
                        onChange={setSource}
                        icon={<Filter className="w-4 h-4" />}
                        options={[
                            { label: 'All Sources', value: '' },
                            { label: 'Project Details', value: 'project_details' },
                            { label: 'Unknown', value: 'unknown' },
                        ]}
                    />

                    {/* Locale */}
                    <FilterSelect
                        value={locale}
                        onChange={setLocale}
                        icon={<Globe className="w-4 h-4" />}
                        options={[
                            { label: 'All Locales', value: '' },
                            { label: 'English (en)', value: 'en' },
                            { label: 'German (de)', value: 'de' },
                        ]}
                    />

                    {/* Status */}
                    <FilterSelect
                        value={status}
                        onChange={setStatus}
                        icon={<Activity className="w-4 h-4" />}
                        options={[
                            { label: 'All Status', value: '' },
                            { label: 'Success', value: 'success' },
                            { label: 'Failed', value: 'failed' },
                        ]}
                    />

                    <button
                        onClick={handleRefresh}
                        className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 ${loadingSummary ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* --- KPI Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    label="Total Calls"
                    value={summaryData?.totals?.count ?? 0}
                    icon={<Globe className="w-5 h-5 text-blue-600" />}
                    loading={loadingSummary}
                />
                <KPICard
                    label="Total Tokens"
                    value={(summaryData?.totals?.totalTokens ?? 0).toLocaleString()}
                    icon={<Database className="w-5 h-5 text-purple-600" />}
                    loading={loadingSummary}
                />
                <KPICard
                    label="Avg Latency"
                    value={`${summaryData?.totals?.avgDurationMs ?? 0}ms`}
                    icon={<Clock className="w-5 h-5 text-orange-600" />}
                    loading={loadingSummary}
                />
                <KPICard
                    label="Success Rate"
                    value={`${Math.round(summaryData?.totals?.successRate ?? 100)}%`}
                    icon={<Activity className="w-5 h-5 text-green-600" />}
                    loading={loadingSummary}
                />
            </div>

            {/* --- Navigation Tabs --- */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'overview' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('entities')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'entities' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Entities Translated
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'logs' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Raw Logs
                </button>
            </div>

            {/* --- Tab Content --- */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <OverviewTab summaryData={summaryData} loading={loadingSummary} />
                )}
                {activeTab === 'entities' && (
                    <EntitiesTab
                        range={range}
                        source={source}
                        onSelectEntity={(e) => setSelectedEntity(e)}
                    />
                )}
                {activeTab === 'logs' && (
                    <LogsTab
                        range={range}
                        source={source}
                        locale={locale}
                        status={status}
                    />
                )}
            </div>

            {/* --- Entity Detail Drawer --- */}
            {selectedEntity && (
                <EntityDetailDrawer
                    entity={selectedEntity}
                    onClose={() => setSelectedEntity(null)}
                />
            )}
        </div>
    );
}

// --- Sub-Components ---

function FilterSelect({ value, onChange, icon, options }) {
    return (
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-sky-500 transition-colors pointer-events-none">
                {icon}
            </div>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium text-gray-700 hover:border-gray-300 min-w-[120px]"
            >
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600" />
        </div>
    );
}

function KPICard({ label, value, icon, loading }) {
    return (
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-50 rounded-lg p-2.5">
                    {icon}
                </div>
                <div className="ml-4 w-0 flex-1">
                    <dl>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</dt>
                        <dd className="flex items-baseline mt-0.5">
                            {loading ? (
                                <div className="h-7 w-20 bg-gray-50 animate-pulse rounded"></div>
                            ) : (
                                <div className="text-xl font-bold text-gray-900 tracking-tight">{value}</div>
                            )}
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
}

function OverviewTab({ summaryData, loading }) {
    const breakdowns = summaryData?.breakdowns || {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <BreakdownCard
                title="Requests by Source"
                items={breakdowns.source?.map(s => ({
                    label: s.source,
                    count: s._count._all,
                    tokens: s._sum.totalTokens
                })) || []}
                loading={loading}
            />
            <BreakdownCard
                title="Requests by Locale"
                items={breakdowns.locale?.map(l => ({
                    label: l.locale,
                    count: l._count._all
                })) || []}
                loading={loading}
            />
        </div>
    );
}

function BreakdownCard({ title, items, loading }) {
    return (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/30">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    {title}
                </h3>
            </div>
            <div className="p-5">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-4 bg-gray-50 animate-pulse rounded"></div>)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-6 italic">No data available for this range</div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                                    {item.tokens && (
                                        <span className="text-[10px] text-gray-400 font-mono tracking-tighter">
                                            {item.tokens.toLocaleString()} tokens
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                        <div
                                            className="h-full bg-sky-500 rounded-full opacity-60"
                                            style={{ width: `${Math.min(100, (item.count / 100) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 min-w-[64px] text-center">
                                        {item.count} calls
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function EntitiesTab({ range, source, onSelectEntity }) {
    const [entities, setEntities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchEntities = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                range,
                source: source || 'project_details',
                page: page.toString(),
                pageSize: '20'
            });
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/system/ai-usage/entities?${params.toString()}`);
            const result = await res.json();
            setEntities(result.entities || []);
            setPagination(result.pagination);
        } catch (err) {
            console.error("Failed to fetch AI usage entities:", err);
        } finally {
            setLoading(false);
        }
    }, [range, source, page, search]);

    useEffect(() => {
        fetchEntities();
    }, [fetchEntities]);

    return (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 transition-all animate-in slide-in-from-bottom-2 duration-300">
            <div className="px-6 py-4 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search Entity ID..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:border-sky-300 focus:ring-0 rounded-lg text-sm transition-all"
                    />
                </div>
                <div className="text-xs text-gray-400 font-medium">
                    Showing {entities.length} entities
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">ID / Route</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tracking</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Calls</th>
                            <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Consumption</th>
                            <th className="px-6 py-3 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan="5" className="px-6 py-4 h-16 bg-gray-50/5 text-center">
                                        <div className="h-4 bg-gray-50 rounded w-1/2 mx-auto"></div>
                                    </td>
                                </tr>
                            ))
                        ) : entities.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center">
                                        <Database className="w-8 h-8 text-gray-200 mb-2" />
                                        <p className="text-gray-400 text-sm italic">No entities tracked yet matching filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            entities.map((e) => (
                                <tr
                                    key={`${e.entityType}-${e.entityId}`}
                                    className="hover:bg-sky-50/30 transition-colors cursor-pointer group"
                                    onClick={() => onSelectEntity(e)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded group-hover:bg-sky-100 transition-colors">
                                                <Database className="w-4 h-4 text-gray-400 group-hover:text-sky-600" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-sky-700">#{e.entityId}</span>
                                                <span className="text-[10px] text-gray-400 line-clamp-1">{e.routePath}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> First: {new Date(e.firstSeenAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <RefreshCw className="w-3 h-3" /> Last: {new Date(e.lastSeenAt).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="font-bold text-gray-700 text-sm">{e.totalCalls}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-sm font-bold text-purple-600 font-mono tracking-tight">{e.totalTokens.toLocaleString()}</span>
                                            <span className="text-[10px] text-gray-400 italic">Avg: {e.avgLatency}ms</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-gray-400 group-hover:text-sky-500">
                                        <ChevronRight className="w-5 h-5 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination for Entities */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 border border-gray-200 rounded-md disabled:opacity-50 hover:bg-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-gray-500">
                        Page {page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="p-1.5 border border-gray-200 rounded-md disabled:opacity-50 hover:bg-white transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function LogsTab({ range, source, locale, status }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                range,
                source,
                locale,
                status,
                page: page.toString(),
                pageSize: '20'
            });
            const res = await fetch(`/api/admin/system/ai-usage/logs?${params.toString()}`);
            const result = await res.json();
            setLogs(result.logs || []);
            setPagination(result.pagination);
        } catch (err) {
            console.error("Failed to fetch AI usage logs:", err);
        } finally {
            setLoading(false);
        }
    }, [range, source, locale, status, page]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-2 duration-300">
            <div className="overflow-x-auto font-sans">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        <tr>
                            <th className="px-6 py-3 text-left">Timestamp</th>
                            <th className="px-6 py-3 text-left">Source / Entity</th>
                            <th className="px-6 py-3 text-left">Field</th>
                            <th className="px-6 py-3 text-left">Status</th>
                            <th className="px-6 py-3 text-right">Tokens / Latency</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50 text-sm">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse h-16">
                                    <td colSpan="5" className="px-6 bg-gray-50/5"></td>
                                </tr>
                            ))
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">No logs found for selected filters</td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                            <span className="text-[10px] text-gray-400 font-mono italic">{new Date(log.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-gray-700 font-semibold">{log.source}</span>
                                            <span className="text-[10px] text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded w-fit mt-1">
                                                {log.entityType || 'system'}:{log.entityId || 'NA'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            {log.fieldKey || 'generic'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {log.status === 'success' ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}
                                            <span className={`text-[10px] font-bold uppercase ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="font-mono text-xs">
                                            <span className="text-gray-900 font-bold">{log.totalTokens || 0}</span>
                                            <span className="text-gray-400 mx-1">/</span>
                                            <span className="text-gray-500">{log.durationMs}ms</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination for Logs */}
            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1.5 border border-gray-200 rounded-md disabled:opacity-50 hover:bg-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-gray-500 italic">
                        Logs {((page - 1) * pagination.pageSize) + 1} — {Math.min(page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="p-1.5 border border-gray-200 rounded-md disabled:opacity-50 hover:bg-white transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function EntityDetailDrawer({ entity, onClose }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetail() {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/system/ai-usage/entities/${entity.entityType}/${entity.entityId}`);
                const result = await res.json();
                setDetail(result);
            } catch (err) {
                console.error("Failed to fetch entity detail:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchDetail();
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, [entity]);

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto flex flex-col">
                {/* Drawer Header */}
                <div className="px-6 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-sky-50 rounded-xl">
                            <Database className="w-6 h-6 text-sky-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">Entity Detail</h3>
                            <p className="text-xs font-mono text-gray-400 mt-0.5 uppercase tracking-wider">#{entity.entityId} — {entity.entityType}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8 flex-1">
                    {loading ? (
                        <div className="space-y-6">
                            <div className="h-24 bg-gray-50 animate-pulse rounded-xl"></div>
                            <div className="h-64 bg-gray-50 animate-pulse rounded-xl"></div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Summary Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Calls</span>
                                    <span className="text-xl font-bold text-gray-900">{detail.totals.count}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Tokens</span>
                                    <span className="text-xl font-bold text-purple-600 font-mono">{detail.totals.totalTokens.toLocaleString()}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Avg Latency</span>
                                    <span className="text-xl font-bold text-orange-600">{detail.totals.avgDurationMs}ms</span>
                                </div>
                            </div>

                            {/* Info Rows */}
                            <div className="space-y-4 mb-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50">
                                    <span className="text-sm font-semibold text-gray-500">Resource Path</span>
                                    <div className="flex items-center gap-2 group mt-1 sm:mt-0">
                                        <code className="text-xs text-sky-600 bg-sky-50 px-2 py-1 rounded truncate max-w-xs">{entity.routePath}</code>
                                        <a href={entity.routePath} target="_blank" rel="noreferrer" className="p-1 hover:text-sky-600 transition-colors">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-50">
                                    <span className="text-sm font-semibold text-gray-500">Lifetime Tracking</span>
                                    <div className="text-xs text-gray-700 mt-1 sm:mt-0">
                                        {new Date(detail.totals.firstSeenAt).toLocaleDateString()} — {new Date(detail.totals.lastSeenAt).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Field Breakdown Table */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-sky-500" />
                                    Consumption by Field
                                </h4>
                                <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-50 text-xs">
                                        <thead className="bg-gray-50 font-bold text-gray-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Field Key</th>
                                                <th className="px-4 py-3 text-center">Calls</th>
                                                <th className="px-4 py-3 text-right">Tokens (Avg)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {detail.fieldBreakdown.map((f) => (
                                                <tr key={f.fieldKey} className="hover:bg-gray-50/50">
                                                    <td className="px-4 py-3 font-mono font-medium text-sky-600">{f.fieldKey}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-gray-700">{f.count}</td>
                                                    <td className="px-4 py-3 text-right font-mono">
                                                        <span className="text-purple-600 font-bold">{f.totalTokens.toLocaleString()}</span>
                                                        <span className="text-gray-400 ml-1">({Math.round(f.totalTokens / f.count)})</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Recent Calls List */}
                            <div className="space-y-4 mt-8">
                                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" />
                                    Recent Translation Calls
                                </h4>
                                <div className="space-y-3">
                                    {detail.recentLogs.map((log) => (
                                        <div key={log.id} className="p-4 rounded-xl border border-gray-100 bg-white flex justify-between items-center group hover:border-gray-200 transition-colors">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-gray-700 font-mono italic">{log.fieldKey}</span>
                                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${log.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1">{new Date(log.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className="text-right flex flex-col">
                                                <span className="text-xs font-bold text-gray-900">{log.totalTokens || 0} tokens</span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-tighter">{log.durationMs}ms latency</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/20 text-center">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Close Detail
                    </button>
                </div>
            </div>
        </div>
    );
}
