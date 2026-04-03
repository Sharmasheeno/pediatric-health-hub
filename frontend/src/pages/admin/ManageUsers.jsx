import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Users, Search, Settings, Plus, X, Trash2, Edit3, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const ManageUsers = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [createModal, setCreateModal] = useState(false);
    const [editModal, setEditModal] = useState(null); // stores user object
    const [deleteModal, setDeleteModal] = useState(null); // stores user object

    const [formData, setFormData] = useState({ email: '', password: '', role: 'PARENT' });

    const { data: users, isLoading } = useQuery({
        queryKey: ['adminUsers'],
        queryFn: async () => {
            const res = await api.get('/users');
            return res.data.data.data || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: async (payload) => await api.post('/users', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            setCreateModal(false);
            setFormData({ email: '', password: '', role: 'PARENT' });
        }
    });

    const roleMutation = useMutation({
        mutationFn: async ({ id, role }) => await api.put(`/users/${id}/role`, { role }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            setEditModal(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id) => await api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            setDeleteModal(null);
        }
    });

    const displayUsers = users?.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase())) || [];

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-sm p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3"><Users size={28} className="text-[#14c39a]" /> Identity Access Management</h1>
                        <p className="text-white/60 font-medium max-w-2xl">Monitor system telemetry and authorization statuses for all Parents, Doctors, and Administrators within the Pediatric Health Hub architecture.</p>
                    </div>
                    <Button onClick={() => setCreateModal(true)} className="bg-[#14c39a] hover:bg-[#10a884] text-white shadow-sm shrink-0 whitespace-nowrap border-none"><Plus size={16} className="mr-2"/> Create Identity</Button>
                </div>
            </div>

            <Card className="shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50 gap-4">
                    <div className="relative flex-1 max-w-md">
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by email..." 
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#8244e0] shadow-inner" 
                        />
                        <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                    </div>
                </div>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Synchronizing IAM database...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <th className="p-4 rounded-tl-lg">Authorization Identity</th>
                                        <th className="p-4">System Role</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right rounded-tr-lg">Operations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayUsers.map(user => (
                                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">{user.email}</div>
                                                <div className="text-xs text-slate-400 font-medium">SSO Linked • Database ID: {user.id.slice(0,8)}...</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1.5 rounded shadow-sm ${user.role === 'ADMIN' ? 'bg-[#8244e0]/10 text-[#8244e0]' : user.role === 'DOCTOR' ? 'bg-[#14c39a]/10 text-[#14c39a]' : 'bg-slate-100 text-slate-600 border border-slate-200/60'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-pulse"></div> Active
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => setEditModal(user)} className="text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors p-2 rounded-lg border border-transparent hover:border-blue-100 shadow-sm"><Edit3 size={16} strokeWidth={2.5} /></button>
                                                    <button onClick={() => setDeleteModal(user)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors p-2 rounded-lg border border-transparent hover:border-red-100 shadow-sm"><Trash2 size={16} strokeWidth={2.5}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest bg-slate-50 border-t border-slate-200 border-dashed">No Identities Found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create User Modal */}
            {createModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="bg-[#8244e0] p-6 text-white flex justify-between items-center shadow-inner">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Plus size={20} strokeWidth={3}/> Execute Creation</h2>
                            <button onClick={() => setCreateModal(false)} className="hover:bg-white/20 p-1.5 rounded transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(formData); }} className="p-8 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Address</label>
                                <input required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} type="email" className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-bold text-slate-700"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Temporary Password</label>
                                <input required value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} type="password" placeholder="Min 6 characters" minLength="6" className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-bold text-slate-700"/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Authority Role</label>
                                <select value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-black text-slate-700">
                                    <option value="PARENT">PARENT</option>
                                    <option value="DOCTOR">DOCTOR</option>
                                    <option value="FACILITY">FACILITY</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setCreateModal(false)} variant="outline" className="flex-1 py-6 rounded-xl border-2 text-slate-500 font-bold">Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending} className="flex-1 py-6 rounded-xl bg-[#8244e0] hover:bg-[#6a32bf] text-white border-0 shadow-sm font-bold">
                                    {createMutation.isPending ? 'Executing...' : 'Deploy Origin'}
                                </Button>
                            </div>
                            {createMutation.isError && <div className="text-red-500 text-[10px] uppercase font-black tracking-widest text-center mt-2">Email may already exist or constraint failure.</div>}
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Role Modal */}
            {editModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative text-center">
                        <div className="p-8 pb-0">
                            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50 shadow-inner">
                                <ShieldAlert size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Escalate Role</h2>
                            <p className="text-slate-500 font-medium text-sm mt-2">Targeting database identity: <br/><strong className="text-slate-800">{editModal.email}</strong></p>
                            
                            <div className="mt-6 text-left">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Select New Authority Configuration</label>
                                <select 
                                    value={editModal.role} 
                                    onChange={e => setEditModal({...editModal, role: e.target.value})} 
                                    className="w-full mt-1 border-2 border-slate-100 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 text-sm font-black text-slate-700 bg-slate-50"
                                >
                                    <option value="PARENT">PARENT</option>
                                    <option value="DOCTOR">DOCTOR</option>
                                    <option value="FACILITY">FACILITY</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-8 pt-6 flex gap-3">
                            <Button variant="outline" onClick={() => setEditModal(null)} className="flex-1 rounded-xl py-6 font-bold text-slate-500 border-2">Abort</Button>
                            <Button 
                                onClick={() => roleMutation.mutate({ id: editModal.id, role: editModal.role })} 
                                disabled={roleMutation.isPending} 
                                className="flex-1 rounded-xl py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold border-0 shadow-sm"
                            >
                                {roleMutation.isPending ? 'Saving...' : 'Apply Hierarchy'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hard Delete Modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative text-center">
                        <div className="p-8 pb-0">
                            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 ring-8 ring-slate-50 shadow-inner">
                                <Trash2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Hard Delete Protocol</h2>
                            <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed">
                                You are about to permanently purge the authentication profile <strong className="text-slate-800">{deleteModal.email}</strong>. This action cascades into MySQL and destroys all clinical bonds immediately. 
                            </p>
                        </div>
                        <div className="p-8 flex gap-3">
                            <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1 rounded-xl py-6 font-bold text-slate-500 border-2">Cancel</Button>
                            <Button 
                                onClick={() => deleteMutation.mutate(deleteModal.id)} 
                                disabled={deleteMutation.isPending} 
                                className="flex-1 rounded-xl py-6 bg-red-500 hover:bg-red-600 text-white font-bold border-0 shadow-sm"
                            >
                                {deleteMutation.isPending ? 'Purging...' : 'Execute Burn'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
