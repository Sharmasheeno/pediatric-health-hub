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
        <div className="mx-auto w-full max-w-7xl space-y-6 animate-fade-in font-sans">
            <div className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div className="flex min-w-0 items-start gap-4">
                    <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                        <Stethoscope size={23} />
                    </span>
                    <div className="min-w-0">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-300">Clinical directory</p>
                        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">Doctor Registry</h1>
                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Manage physician profiles, licensure details, and specialties for your organization.</p>
                    </div>
                </div>
                <Button onClick={() => setCreateModal(true)} className="w-full shrink-0 whitespace-nowrap border-none sm:w-auto"><Plus size={16} className="mr-2"/> Register Doctor</Button>
            </div>

            <Card className="shadow-sm">
                <div className="p-4 border-b border-[var(--border)] flex items-center bg-[var(--surface-soft)] gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by last name..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] text-sm focus:outline-none focus:border-primary-500 shadow-inner"
                        />
                        <Search size={16} className="absolute left-3.5 top-2.5 text-[var(--text-muted)]" />
                    </div>
                </div>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest animate-pulse">Syncing Medical Database...</div>
                    ) : (
                        <>
                            <div className="divide-y divide-[var(--border)] md:hidden">
                                {displayDoctors.map(doctor => (
                                    <article key={doctor.id} className="space-y-4 p-4">
                                        <div className="flex min-w-0 items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h2 className="break-words text-base font-bold text-[var(--text-primary)]">Dr. {doctor.firstName} {doctor.lastName}</h2>
                                                <p className="mt-1 text-xs text-[var(--text-muted)]">ID: {doctor.id.slice(0, 8)}...</p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button aria-label={`Edit Dr. ${doctor.firstName} ${doctor.lastName}`} onClick={() => { setFormData({ firstName: doctor.firstName, lastName: doctor.lastName, licenseNumber: doctor.licenseNumber, specialization: doctor.specialization, facilityId: doctor.facilityId || '' }); setEditModal(doctor); }} className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-primary-950 dark:hover:text-primary-300"><Edit3 size={17} /></button>
                                                <button aria-label={`Delete Dr. ${doctor.firstName} ${doctor.lastName}`} onClick={() => setDeleteModal(doctor)} className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-danger/10 hover:text-danger"><Trash2 size={17} /></button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="min-w-0">
                                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Specialization</p>
                                                <span className="inline-block max-w-full break-words rounded-md bg-primary-50 px-2 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">{doctor.specialization}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Facility / License</p>
                                                <p className="break-words text-xs font-semibold text-[var(--text-primary)]">{doctor.facility?.name || <span className="italic text-[var(--text-muted)]">Unassigned</span>}</p>
                                                <p className="mt-1 break-all text-xs text-[var(--text-secondary)]">Lic: {doctor.licenseNumber}</p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                                {displayDoctors.length === 0 && <p className="p-8 text-center text-sm text-[var(--text-muted)]">No doctor profiles found.</p>}
                            </div>
                            <div className="hidden overflow-x-auto md:block">
                            <table className="w-full min-w-[720px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--surface-soft)] border-b border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                                        <th className="p-4 rounded-tl-lg">Physician Name</th>
                                        <th className="p-4">Specialization</th>
                                        <th className="p-4">Facility / License</th>
                                        <th className="p-4 text-right rounded-tr-lg">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayDoctors.map(doctor => (
                                        <tr key={doctor.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-soft)] transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-[var(--text-primary)]">Dr. {doctor.firstName} {doctor.lastName}</div>
                                                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">ID: {doctor.id.slice(0,8)}...</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs font-bold bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                                                    {doctor.specialization}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-semibold text-[var(--text-primary)]">{doctor.facility?.name || <span className="text-[var(--text-muted)] italic">Unassigned</span>}</div>
                                                <div className="text-xs text-[var(--text-secondary)] mt-1">Lic: {doctor.licenseNumber}</div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => { setFormData({ firstName: doctor.firstName, lastName: doctor.lastName, licenseNumber: doctor.licenseNumber, specialization: doctor.specialization, facilityId: doctor.facilityId || '' }); setEditModal(doctor); }} className="text-[var(--text-muted)] hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors p-2 rounded-lg"><Edit3 size={16} strokeWidth={2.5}/></button>
                                                    <button onClick={() => setDeleteModal(doctor)} className="text-[var(--text-muted)] hover:text-danger hover:bg-danger/10 transition-colors p-2 rounded-lg"><Trash2 size={16} strokeWidth={2.5}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayDoctors.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest">No Profiles Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {createModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-primary-50 p-5 text-[var(--text-primary)] dark:bg-primary-950 sm:p-6">
                            <div className="flex items-center gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-[var(--color-primary-foreground)]"><Plus size={19} /></span>
                                <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">Clinical directory</p><h2 className="text-lg font-bold tracking-tight sm:text-xl">Register Doctor</h2></div>
                            </div>
                            <button onClick={() => setCreateModal(false)} aria-label="Close doctor registration" className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-primary-100 hover:text-primary-800 dark:hover:bg-primary-900 dark:hover:text-primary-100"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="space-y-5 p-5 sm:p-7">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Link to Existing Identity (Optional)</label>
                                <select value={formData.userId || ''} onChange={e=>{
                                    const val = e.target.value;
                                    setFormData(prev => ({...prev, userId: val, email: val ? undefined : '', password: val ? undefined : ''}))
                                }} className="w-full border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)] bg-[var(--surface)]">
                                    <option value="">-- Create New User Identity --</option>
                                    {(availableUsers || []).map(u => (
                                        <option key={u.id} value={u.id}>{u.email} (Pending Profile)</option>
                                    ))}
                                </select>
                            </div>

                            {!formData.userId && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Account Email</label>
                                        <input required={!formData.userId} value={formData.email || ''} onChange={e=>setFormData({...formData, email: e.target.value})} type="email" placeholder="dr@example.com" className="w-full border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Temporary Password</label>
                                        <input required={!formData.userId} value={formData.password || ''} onChange={e=>setFormData({...formData, password: e.target.value})} type="password" minLength="6" placeholder="Min 6 characters" className="w-full border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">First Name</label>
                                    <input required value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Last Name</label>
                                    <input required value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">License Number</label>
                                    <input required value={formData.licenseNumber} onChange={e=>setFormData({...formData, licenseNumber: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Specialization</label>
                                    <input required value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} type="text" placeholder="e.g. Pediatric Pulmonology" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Assign to Facility (Optional)</label>
                                <select value={formData.facilityId} onChange={e=>setFormData({...formData, facilityId: e.target.value})} className="w-full border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)] bg-[var(--surface)]">
                                    <option value="">-- No Facility Assigned --</option>
                                    {(facilities || []).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                                <Button type="button" onClick={() => setCreateModal(false)} variant="outline" className="flex-1 py-6 rounded-xl border-2 font-bold">Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending} className="flex-1 py-6 rounded-xl font-bold">
                                    {createMutation.isPending ? 'Registering...' : 'Register Profile'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[var(--surface)] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative text-center">
                        <div className="p-8 pb-0">
                            <div className="mx-auto w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50"><Trash2 size={32} /></div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">Archive Profile</h2>
                            <p className="text-[var(--text-secondary)] font-medium text-sm mt-3">You are about to archive Dr. {deleteModal.lastName}. This removes them from public scheduling.</p>
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
                    <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-primary-50 p-5 text-[var(--text-primary)] dark:bg-primary-950 sm:p-6">
                            <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-[var(--color-primary-foreground)]"><Edit3 size={18} /></span><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-700 dark:text-primary-300">Clinical directory</p><h2 className="text-lg font-bold tracking-tight sm:text-xl">Edit Profile</h2></div></div>
                            <button onClick={() => setEditModal(null)} aria-label="Close edit doctor profile" className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-primary-100 hover:text-primary-800 dark:hover:bg-primary-900 dark:hover:text-primary-100"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editModal.id, data: { firstName: formData.firstName, lastName: formData.lastName, licenseNumber: formData.licenseNumber, specialization: formData.specialization, facilityId: formData.facilityId || null } }); }} className="space-y-5 p-5 sm:p-7">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">First Name</label>
                                    <input required value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Last Name</label>
                                    <input required value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">License Number</label>
                                    <input required value={formData.licenseNumber} onChange={e=>setFormData({...formData, licenseNumber: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Specialization</label>
                                    <input required value={formData.specialization} onChange={e=>setFormData({...formData, specialization: e.target.value})} type="text" className="w-full bg-[var(--surface)] text-[var(--text-primary)] border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)]"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Assign to Facility</label>
                                <select value={formData.facilityId} onChange={e=>setFormData({...formData, facilityId: e.target.value})} className="w-full border-2 border-[var(--border)] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold text-[var(--text-primary)] bg-[var(--surface)]">
                                    <option value="">-- No Facility Assigned --</option>
                                    {(facilities || []).map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
                                <Button type="button" onClick={() => setEditModal(null)} variant="outline" className="flex-1 py-6 rounded-xl border-2 font-bold">Cancel</Button>
                                <Button type="submit" disabled={updateMutation.isPending} className="flex-1 py-6 rounded-xl font-bold">
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
