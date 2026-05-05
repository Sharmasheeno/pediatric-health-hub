import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Plus, X, Trash2, Building, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminFacilities = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [createModal, setCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editModal, setEditModal] = useState(null);

    const [formData, setFormData] = useState({ 
        name: '', 
        address: '', 
        phoneNumber: '' 
    });

    const { data: facilities, isLoading } = useQuery({
        queryKey: ['adminFacilities'],
        queryFn: async () => {
            const res = await api.get('/facilities');
            return res.data.data.data || [];
        }
    });

    const { data: usersInfo } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data.data.data || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (payload) => await api.post('/facilities', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFacilities'] });
            setCreateModal(false);
            setFormData({ name: '', address: '', phoneNumber: '', email: '', password: '' });
            alert("Facility registered successfully!");
        },
        onError: (error) => {
            let errorMsg = error.response?.data?.message || "Failed to register facility. Ensure email is not already taken.";
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const zErr = error.response.data.errors[0];
                errorMsg = `Validation failed on '${zErr.path?.join('.')}': ${zErr.message}`;
            }
            alert(errorMsg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await api.delete(`/facilities/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFacilities'] });
            setDeleteModal(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (payload) => await api.put(`/facilities/${payload.id}`, payload.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminFacilities'] });
            setEditModal(null);
        }
    });

    const displayFacilities = facilities?.filter(f => (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())) || [];
    
    // Filter users who are FACILITY but don't have a profile yet (for dropdown)
    const availableUsers = (usersInfo || []).filter(u => u.role === 'FACILITY' && !facilities?.some(f => f.userId === u.id));

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-xl shadow-sm p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3"><Building size={28} className="text-[#a7f3df]" /> Facility Registry</h1>
                        <p className="text-white/60 font-medium max-w-2xl">Manage clinical institutions, partnered clinics, and physical care locations.</p>
                    </div>
                    <Button onClick={() => setCreateModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shrink-0 whitespace-nowrap border-none"><Plus size={16} className="mr-2"/> Register Facility</Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <div className="p-4 border-b border-[--border] flex items-center bg-[--surface-soft] gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by facility name..." 
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[--border] text-sm focus:outline-none focus:border-emerald-500 shadow-inner" 
                        />
                        <Search size={16} className="absolute left-3.5 top-2.5 text-[--text-muted]" />
                    </div>
                </div>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-[--text-muted] font-bold uppercase tracking-widest animate-pulse">Syncing Facility Database...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[--surface-soft] border-b border-[--border] text-[10px] font-black uppercase tracking-widest text-[--text-secondary]">
                                        <th className="p-4 rounded-tl-lg">Facility Name</th>
                                        <th className="p-4">Contact Info</th>
                                        <th className="p-4">Location</th>
                                        <th className="p-4 text-right rounded-tr-lg">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayFacilities.map(fac => (
                                        <tr key={fac.id} className="border-b border-[--border] hover:bg-[--surface-soft] transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-[--text-primary]">{fac.name}</div>
                                                <div className="text-[10px] font-bold text-[--text-muted] uppercase tracking-widest mt-0.5">ID: {fac.id.slice(0,8)}...</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-semibold text-[--text-primary]">{fac.phoneNumber}</div>
                                                <div className="text-xs text-[--text-muted] mt-0.5">{fac.user?.email || 'N/A'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-xs font-semibold text-[--text-secondary] truncate max-w-xs">{fac.address}</div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setFormData({ name: fac.name, address: fac.address, phoneNumber: fac.phoneNumber }); setEditModal(fac); }} className="text-[--text-muted] hover:text-emerald-500 hover:bg-emerald-50 transition-colors p-2 rounded-lg">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button onClick={() => setDeleteModal(fac)} className="text-[--text-muted] hover:text-danger hover:bg-danger/10 transition-colors p-2 rounded-lg"><Trash2 size={16} strokeWidth={2.5}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayFacilities.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-[--text-muted] font-bold uppercase tracking-widest">No Facilities Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {createModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[--surface] rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shadow-inner">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Plus size={20} /> Register Facility</h2>
                            <button onClick={() => setCreateModal(false)} className="hover:bg-white/20 p-1.5 rounded"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-8 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Link to Existing Identity (Optional)</label>
                                <select value={formData.userId || ''} onChange={e=>{
                                    const val = e.target.value;
                                    setFormData(prev => ({...prev, userId: val, email: val ? undefined : '', password: val ? undefined : ''}))
                                }} className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary] bg-[--surface]">
                                    <option value="">-- Create New User Identity --</option>
                                    {(availableUsers || []).map(u => (
                                        <option key={u.id} value={u.id}>{u.email} (Pending Profile)</option>
                                    ))}
                                </select>
                            </div>

                            {!formData.userId && (
                                <div className="flex gap-4">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-black uppercase text-[--text-muted]">Account Email</label>
                                        <input required={!formData.userId} value={formData.email || ''} onChange={e=>setFormData({...formData, email: e.target.value})} type="email" placeholder="clinic@example.com" className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-black uppercase text-[--text-muted]">Temporary Password</label>
                                        <input required={!formData.userId} value={formData.password || ''} onChange={e=>setFormData({...formData, password: e.target.value})} type="password" minLength="6" placeholder="Min 6 characters" className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Facility Name</label>
                                <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Physical Address</label>
                                <input required value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Contact Number</label>
                                <input required value={formData.phoneNumber} onChange={e=>setFormData({...formData, phoneNumber: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setCreateModal(false)} variant="outline" className="flex-1 py-6 rounded-xl border-2 font-bold">Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending} className="flex-1 py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                    {createMutation.isPending ? 'Registering...' : 'Register Profile'}
                                </Button>
                            </div>
                            {createMutation.isError && <div className="text-danger text-xs font-bold text-center mt-2 p-2 bg-danger/10 rounded border border-danger/30">{createMutation.error?.response?.data?.message || 'Registration failed.'}</div>}
                        </form>
                    </div>
                </div>
            )}

            {deleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[--surface] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative text-center">
                        <div className="p-8 pb-0">
                            <div className="mx-auto w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50"><Trash2 size={32} /></div>
                            <h2 className="text-2xl font-black text-[--text-primary] tracking-tight">Archive Facility</h2>
                            <p className="text-[--text-secondary] font-medium text-sm mt-3">You are about to archive the {deleteModal.name} registry record.</p>
                        </div>
                        <div className="p-8 flex gap-3">
                            <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1 rounded-xl py-6 font-bold border-2">Cancel</Button>
                            <Button onClick={() => deleteMutation.mutate(deleteModal.id)} disabled={deleteMutation.isPending} className="flex-1 rounded-xl py-6 bg-danger/100 hover:bg-red-600 text-white font-bold">
                                Archive
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {editModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[--surface] rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="bg-emerald-600 p-6 text-white flex justify-between items-center shadow-inner">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> 
                                Edit Facility
                            </h2>
                            <button onClick={() => setEditModal(null)} className="hover:bg-white/20 p-1.5 rounded"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editModal.id, data: { name: formData.name, address: formData.address, phoneNumber: formData.phoneNumber } }); }} className="p-8 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Facility Name</label>
                                <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Physical Address</label>
                                <input required value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Contact Number</label>
                                <input required value={formData.phoneNumber} onChange={e=>setFormData({...formData, phoneNumber: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setEditModal(null)} variant="outline" className="flex-1 py-6 rounded-xl border-2 font-bold">Cancel</Button>
                                <Button type="submit" disabled={updateMutation.isPending} className="flex-1 py-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                    {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
