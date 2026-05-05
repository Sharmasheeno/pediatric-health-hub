import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Plus, X, Trash2, Edit3, Stethoscope, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminDoctors = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [createModal, setCreateModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(null);
    const [editModal, setEditModal] = useState(null);

    const [formData, setFormData] = useState({ 
        firstName: '', 
        lastName: '', 
        licenseNumber: '', 
        specialization: '',
        facilityId: ''
    });

    const { data: doctors, isLoading } = useQuery({
        queryKey: ['adminDoctors'],
        queryFn: async () => {
            const res = await api.get('/doctors');
            return res.data.data.data || [];
        }
    });

    const { data: facilities } = useQuery({
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
        mutationFn: async (payload) => await api.post('/doctors', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
            setCreateModal(false);
            setFormData({ firstName: '', lastName: '', licenseNumber: '', specialization: '', facilityId: '', email: '', password: '' });
            alert("Doctor registered successfully!");
        },
        onError: (error) => {
            let errorMsg = error.response?.data?.message || "Failed to register doctor. Ensure email or license is not already taken.";
            // Parse Zod validation errors to give specific feedback (e.g. Weak Password)
            if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                const zErr = error.response.data.errors[0];
                errorMsg = `Validation failed on '${zErr.path?.join('.')}': ${zErr.message}`;
            }
            alert(errorMsg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await api.delete(`/doctors/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
            setDeleteModal(null);
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (payload) => await api.put(`/doctors/${payload.id}`, payload.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminDoctors'] });
            setEditModal(null);
        }
    });

    const displayDoctors = doctors?.filter(d => (d.lastName || '').toLowerCase().includes(searchQuery.toLowerCase())) || [];
    
    // Filter users who are DOCTOR but don't have a profile yet (for dropdown)
    const availableUsers = (usersInfo || []).filter(u => u.role === 'DOCTOR' && !doctors?.some(d => d.userId === u.id));

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 rounded-xl shadow-sm p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3"><Stethoscope size={28} className="text-[#a7f3df]" /> Doctor Registry</h1>
                        <p className="text-white/60 font-medium max-w-2xl">Manage clinical profiles, licensure data, and specializations for onboarding physicians.</p>
                    </div>
                    <Button onClick={() => setCreateModal(true)} className="bg-blue-600 hover:bg-primary-50 dark:bg-primary-9500 text-white shadow-sm shrink-0 whitespace-nowrap border-none"><Plus size={16} className="mr-2"/> Register Doctor</Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <div className="p-4 border-b border-[--border] flex items-center bg-[--surface-soft] gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by last name..." 
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[--border] text-sm focus:outline-none focus:border-blue-500 shadow-inner" 
                        />
                        <Search size={16} className="absolute left-3.5 top-2.5 text-[--text-muted]" />
                    </div>
                </div>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-[--text-muted] font-bold uppercase tracking-widest animate-pulse">Syncing Medical Database...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[--surface-soft] border-b border-[--border] text-[10px] font-black uppercase tracking-widest text-[--text-secondary]">
                                        <th className="p-4 rounded-tl-lg">Physician Name</th>
                                        <th className="p-4">Specialization</th>
                                        <th className="p-4">Facility / License</th>
                                        <th className="p-4 text-right rounded-tr-lg">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayDoctors.map(doctor => (
                                        <tr key={doctor.id} className="border-b border-[--border] hover:bg-[--surface-soft] transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-[--text-primary]">Dr. {doctor.firstName} {doctor.lastName}</div>
                                                <div className="text-[10px] font-bold text-[--text-muted] uppercase tracking-widest mt-0.5">ID: {doctor.id.slice(0,8)}...</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs font-bold bg-primary-50 dark:bg-primary-950 text-blue-600 px-2 py-1 rounded">
                                                    {doctor.specialization}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-semibold text-[--text-primary]">{doctor.facility?.name || <span className="text-[--text-muted] italic">Unassigned</span>}</div>
                                                <div className="text-xs text-[--text-secondary] mt-1">Lic: {doctor.licenseNumber}</div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setFormData({ firstName: doctor.firstName, lastName: doctor.lastName, licenseNumber: doctor.licenseNumber, specialization: doctor.specialization, facilityId: doctor.facilityId || '' }); setEditModal(doctor); }} className="text-[--text-muted] hover:text-blue-500 hover:bg-primary-50 dark:bg-primary-950 transition-colors p-2 rounded-lg"><Edit3 size={16} strokeWidth={2.5}/></button>
                                                    <button onClick={() => setDeleteModal(doctor)} className="text-[--text-muted] hover:text-danger hover:bg-danger/10 transition-colors p-2 rounded-lg"><Trash2 size={16} strokeWidth={2.5}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayDoctors.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-[--text-muted] font-bold uppercase tracking-widest">No Profiles Found</td>
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
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-center shadow-inner">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Plus size={20} /> Register Doctor</h2>
                            <button onClick={() => setCreateModal(false)} className="hover:bg-white/20 p-1.5 rounded"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-8 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Link to Existing Identity (Optional)</label>
                                <select value={formData.userId || ''} onChange={e=>{
                                    const val = e.target.value;
                                    setFormData(prev => ({...prev, userId: val, email: val ? undefined : '', password: val ? undefined : ''}))
                                }} className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary] bg-[--surface]">
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
                                        <input required={!formData.userId} value={formData.email || ''} onChange={e=>setFormData({...formData, email: e.target.value})} type="email" placeholder="dr@example.com" className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-black uppercase text-[--text-muted]">Temporary Password</label>
                                        <input required={!formData.userId} value={formData.password || ''} onChange={e=>setFormData({...formData, password: e.target.value})} type="password" minLength="6" placeholder="Min 6 characters" className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[--text-muted]">First Name</label>
                                    <input required value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[--text-muted]">Last Name</label>
                                    <input required value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">License Number</label>
                                <input required value={formData.licenseNumber} onChange={e=>setFormData({...formData, licenseNumber: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Specialization</label>
                                <input required value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} type="text" placeholder="e.g. Pediatric Pulmonology" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Assign to Facility (Optional)</label>
                                <select value={formData.facilityId} onChange={e=>setFormData({...formData, facilityId: e.target.value})} className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary] bg-[--surface]">
                                    <option value="">-- No Facility Assigned --</option>
                                    {(facilities || []).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setCreateModal(false)} variant="outline" className="flex-1 py-6 rounded-xl border-2 font-bold">Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending} className="flex-1 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                                    {createMutation.isPending ? 'Registering...' : 'Register Profile'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[--surface] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative text-center">
                        <div className="p-8 pb-0">
                            <div className="mx-auto w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50"><Trash2 size={32} /></div>
                            <h2 className="text-2xl font-black text-[--text-primary] tracking-tight">Archive Profile</h2>
                            <p className="text-[--text-secondary] font-medium text-sm mt-3">You are about to archive Dr. {deleteModal.lastName}. This removes them from public scheduling.</p>
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
                        <div className="bg-blue-600 p-6 text-white flex justify-between items-center shadow-inner">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Edit3 size={20} /> Edit Profile</h2>
                            <button onClick={() => setEditModal(null)} className="hover:bg-white/20 p-1.5 rounded"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editModal.id, data: { firstName: formData.firstName, lastName: formData.lastName, licenseNumber: formData.licenseNumber, specialization: formData.specialization, facilityId: formData.facilityId || null } }); }} className="p-8 space-y-4">
                            <div className="flex gap-4">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[--text-muted]">First Name</label>
                                    <input required value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[--text-muted]">Last Name</label>
                                    <input required value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">License Number</label>
                                <input required value={formData.licenseNumber} onChange={e=>setFormData({...formData, licenseNumber: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Specialization</label>
                                <input required value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} type="text" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary]"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[--text-muted]">Assign to Facility</label>
                                <select value={formData.facilityId} onChange={e=>setFormData({...formData, facilityId: e.target.value})} className="w-full border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm font-bold text-[--text-primary] bg-[--surface]">
                                    <option value="">-- No Facility Assigned --</option>
                                    {(facilities || []).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setEditModal(null)} variant="outline" className="flex-1 py-6 rounded-xl border-2 font-bold">Cancel</Button>
                                <Button type="submit" disabled={updateMutation.isPending} className="flex-1 py-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
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
