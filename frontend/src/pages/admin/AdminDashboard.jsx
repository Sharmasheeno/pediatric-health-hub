import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users, Activity, ShieldAlert, Video, RefreshCw, StopCircle, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [tab, setTab] = useState('overview');

    const { data: telemetry, isLoading: telLoading } = useQuery({
        queryKey: ['admin-telemetry'],
        queryFn: async () => (await api.get('/admin/telemetry')).data.data
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ['admin-users'],
        queryFn: async () => (await api.get('/admin/users')).data.data,
        enabled: tab === 'users'
    });

    const { data: auditsData, isLoading: auditsLoading } = useQuery({
        queryKey: ['admin-audits'],
        queryFn: async () => (await api.get('/admin/audits?limit=50')).data.data,
        enabled: tab === 'audits'
    });

    const toggleSuspension = useMutation({
        mutationFn: async ({ userId, suspend }) => api.post('/admin/users/suspend', { userId, suspend }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    });

    if (user?.role !== 'ADMIN') {
        return <div className="p-20 text-center text-danger font-bold text-2xl uppercase tracking-widest animate-pulse">403 FORBIDDEN: Authorization Matrix Locked</div>;
    }

    return (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-100px)]">
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0 h-full overflow-y-auto">
                <div className="p-5 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-lg mb-2 z-10">
                    <h2 className="font-extrabold text-lg tracking-widest text-slate-100">COMMAND HUB</h2>
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-2 uppercase tracking-wide"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div> Real-Time Uplink</div>
                </div>
                
                <button onClick={() => setTab('overview')} className={`p-4 rounded-xl text-left font-bold transition-all shadow-sm flex items-center gap-3 ${tab === 'overview' ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2' : 'bg-[--surface] text-[--text-secondary] border border-[--border] hover:border-blue-300 hover:bg-[--surface-soft]'}`}>
                    <Activity size={18} /> Global Telemetry
                </button>
                <button onClick={() => setTab('users')} className={`p-4 rounded-xl text-left font-bold transition-all shadow-sm flex items-center gap-3 ${tab === 'users' ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2' : 'bg-[--surface] text-[--text-secondary] border border-[--border] hover:border-blue-300 hover:bg-[--surface-soft]'}`}>
                    <Users size={18} /> Identity Mapping
                </button>
                <button onClick={() => setTab('audits')} className={`p-4 rounded-xl text-left font-bold transition-all shadow-sm flex items-center gap-3 ${tab === 'audits' ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-2' : 'bg-[--surface] text-[--text-secondary] border border-[--border] hover:border-red-300 hover:bg-danger/10'}`}>
                    <ShieldAlert size={18} className={tab === 'audits' ? "text-white" : "text-danger"}/> Security Audit Matrix
                </button>
            </div>

            <div className="flex-1 space-y-6 h-full overflow-y-auto pr-2 pb-10">
                {tab === 'overview' && (
                    <>
                        <div className="flex justify-between items-center bg-[--surface] p-6 rounded-xl border border-[--border] shadow-sm">
                            <div>
                                <h1 className="text-2xl font-extrabold text-[--text-primary] tracking-tight">System Telemetry</h1>
                                <p className="text-[--text-secondary] font-medium text-sm mt-1">Real-time aggregate data pulling from primary indexing engines globally.</p>
                            </div>
                            <Button variant="outline" className="gap-2 text-[--text-primary] font-bold bg-[--surface-soft] border-[--border] hover:bg-[--surface]" onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-telemetry'] })}>
                                <RefreshCw size={16} /> Sync Indexes
                            </Button>
                        </div>

                        {telLoading ? <div className="p-16 text-center animate-pulse text-blue-500 font-bold tracking-widest text-lg">AGGREGATING DB VECTORS...</div> : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Card className="shadow-md border-t-4 border-t-blue-500 hover:-translate-y-1 transition-transform">
                                    <CardContent className="pt-8 pb-8">
                                        <div className="text-[--text-secondary] text-sm font-extrabold tracking-widest uppercase mb-3">Total Unified Users</div>
                                        <div className="text-5xl font-black text-[--text-primary] flex items-center gap-4"><Users className="text-blue-500" size={32} /> {telemetry?.totalUsers}</div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-md border-t-4 border-t-emerald-500 hover:-translate-y-1 transition-transform">
                                    <CardContent className="pt-8 pb-8">
                                        <div className="text-[--text-secondary] text-sm font-extrabold tracking-widest uppercase mb-3">Verified Providers</div>
                                        <div className="text-5xl font-black text-[--text-primary] flex items-center gap-4"><CheckCircle className="text-emerald-500" size={32} /> {telemetry?.totalDoctors}</div>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-md border-t-4 border-t-purple-500 hover:-translate-y-1 transition-transform">
                                    <CardContent className="pt-8 pb-8">
                                        <div className="text-[--text-secondary] text-sm font-extrabold tracking-widest uppercase mb-3">Active WebRTC Links</div>
                                        <div className="text-5xl font-black text-[--text-primary] flex items-center gap-4"><Video className="text-purple-500" size={32} /> {telemetry?.activeTeleconsults}</div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </>
                )}

                {tab === 'users' && (
                    <Card className="shadow-md border-t-[6px] border-t-blue-600 overflow-hidden">
                        <CardHeader className="bg-[--surface-soft] border-b border-[--border] py-5"><CardTitle className="tracking-tight text-[--text-primary] font-black">Identity Indexing Array</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            {usersLoading ? <div className="p-16 text-center text-[--text-muted] font-bold tracking-widest">LOADING IDENTITIES...</div> : (
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-[--surface-soft] text-[--text-secondary] font-extrabold tracking-widest uppercase text-[11px]">
                                            <tr>
                                                <th className="px-6 py-4">Account UUID</th>
                                                <th className="px-6 py-4">Email Bound</th>
                                                <th className="px-6 py-4">Role Matrix</th>
                                                <th className="px-6 py-4">Clearance</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-[--surface]">
                                            {usersData?.map(u => (
                                                <tr key={u.id} className="hover:bg-primary-50 dark:bg-primary-950/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono text-xs text-[--text-muted]">{u.id}</td>
                                                    <td className="px-6 py-4 font-bold text-[--text-primary]">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-3 py-1.5 bg-[--surface-soft] text-[--text-primary] rounded-md font-bold text-[11px] uppercase tracking-wider">{u.role}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {u.isActive ? <span className="text-emerald-600 font-bold flex items-center gap-2"><CheckCircle size={14}/> ACTIVE</span> : <span className="text-danger font-bold flex items-center gap-2"><StopCircle size={14}/> SUSPENDED</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {u.role !== 'ADMIN' && (
                                                            <Button 
                                                                size="sm" 
                                                                variant={u.isActive ? "destructive" : "outline"} 
                                                                className={`font-semibold shadow-sm ${!u.isActive ? "bg-[--surface] text-emerald-600 border-emerald-200 hover:bg-emerald-50" : ""}`}
                                                                onClick={() => toggleSuspension.mutate({ userId: u.id, suspend: u.isActive })}
                                                                isLoading={toggleSuspension.isPending}
                                                            >
                                                                {u.isActive ? 'Revoke Access' : 'Restore Login'}
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {tab === 'audits' && (
                    <Card className="shadow-2xl border border-red-200 overflow-hidden">
                        <CardHeader className="bg-danger/10/80 border-b border-red-100 py-6">
                            <CardTitle className="text-red-900 flex items-center gap-3 font-black tracking-tight text-xl">
                                <span className="p-2 bg-red-100 rounded-lg shadow-sm"><ShieldAlert size={22} className="text-red-600" /></span> 
                                Immutable System Audits
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {auditsLoading ? <div className="p-20 text-center text-danger/50 font-bold tracking-widest text-lg animate-pulse">PULLING COMPLIANCE MATRICES...</div> : (
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-xs text-left font-mono">
                                        <thead className="bg-[#0f172a] text-[--text-muted] font-bold uppercase tracking-widest text-[10px]">
                                            <tr>
                                                <th className="px-5 py-4">Timestamp Sequence</th>
                                                <th className="px-5 py-4">Identity Matrix</th>
                                                <th className="px-5 py-4 text-emerald-400">Vector Action</th>
                                                <th className="px-5 py-4">Entity Target</th>
                                                <th className="px-5 py-4">Raw Parameters</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[--border] bg-[--surface] text-[--text-secondary]">
                                            {auditsData?.map(a => (
                                                <tr key={a.id} className="hover:bg-danger/10/30 transition-colors">
                                                    <td className="px-5 py-4 whitespace-nowrap font-medium text-[--text-secondary]">{new Date(a.createdAt).toLocaleString()}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-blue-600 dark:text-blue-400">{a.user?.email || 'SYSTEM_CORE'}</div>
                                                        <div className="text-[10px] bg-[--surface-soft] border border-[--border] px-1.5 py-0.5 rounded text-[--text-secondary] inline-block mt-1.5 font-bold">{a.user?.role}</div>
                                                    </td>
                                                    <td className="px-5 py-4 font-black tracking-wide text-[--text-primary] shrink-0">{a.action}</td>
                                                    <td className="px-5 py-4"><span className="bg-[--surface] border border-[--border] shadow-sm px-2.5 py-1 rounded-md text-[--text-primary] font-bold">{a.entity}</span> <br/> <span className="text-[10px] text-[--text-muted] mt-2 block tracking-wider">{a.entityId?.substring(0,8)}...</span></td>
                                                    <td className="px-5 py-4 max-w-[250px] truncate text-[--text-muted] font-medium" title={a.details}>{a.details || '[VOID]'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};
