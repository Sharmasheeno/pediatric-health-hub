import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Activity, Syringe, LineChart, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';

export const MyChildren = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', bloodGroup: 'O+' });

    // Fetch dynamic real DB array via authorization layer
    const { data: children, isLoading } = useQuery({
        queryKey: ['myChildren'],
        queryFn: async () => {
            const res = await api.get('/children/my-children');
            return res.data.data;
        }
    });

    const mutation = useMutation({
        mutationFn: async (newChild) => await api.post('/children', newChild),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myChildren'] });
            setIsModalOpen(false);
            setFormData({ firstName: '', lastName: '', dateOfBirth: '', gender: 'MALE', bloodGroup: 'O+' });
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Transform the HTML form payload into the strict Zod validator DB schema
        let isoDate;
        try { isoDate = new Date(formData.dateOfBirth).toISOString(); } catch(e) { isoDate = formData.dateOfBirth; }

        const strictPayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: isoDate,
            gender: formData.gender,
            bloodType: formData.bloodGroup // Maps React state to Zod schema
        };

        mutation.mutate(strictPayload);
    };

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const diff = Date.now() - birthDate.getTime();
        const ageDT = new Date(diff); 
        const year = ageDT.getUTCFullYear() - 1970;
        const month = ageDT.getUTCMonth();
        if (year > 0) return `${year} years${month > 0 ? `, ${month} mos` : ''}`;
        return `${month} months`;
    };

    return (
        <div className="w-full mx-auto space-y-6 animate-fade-in font-sans relative">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-8 border-b border-slate-100 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Registered Children</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage health profiles, log developmental growth points, and review clinical histories.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="bg-[#14c39a] hover:bg-[#10a884] shadow-sm font-bold text-white"><Plus size={16} className="mr-2"/> Register New Child</Button>
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-slate-400 font-bold tracking-widest uppercase animate-pulse">Synchronizing clinical data...</div>
            ) : children?.length === 0 ? (
                <div className="p-16 mt-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><Plus size={24}/></div>
                    <h2 className="text-xl font-bold text-slate-600 mb-2 tracking-tight">No Children Registered</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">Click the <span className="font-bold text-[#14c39a]">Register New Child</span> button above to securely map your first child to your authorization identity.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {children?.map((child) => (
                        <Card key={child.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden relative bg-white">
                             <div className="h-28 bg-gradient-to-r from-[#8244e0]/10 to-[#14c39a]/10 w-full absolute top-0 left-0 border-b border-slate-50"></div>
                             <CardContent className="p-6 pt-14 relative z-10 flex flex-col items-center">
                                 <div className="w-24 h-24 bg-white rounded-full p-1 shadow-sm mb-4 border-2 border-white ring-4 ring-slate-50/50">
                                     <div className="w-full h-full bg-[#8244e0] rounded-full flex items-center justify-center text-white font-black text-3xl">
                                         {child.firstName?.charAt(0)}
                                     </div>
                                 </div>
                                 <h2 className="text-2xl font-black text-slate-800 tracking-tight">{child.firstName} {child.lastName}</h2>
                                 <div className="flex items-center justify-center gap-3 mt-2 text-sm font-bold text-slate-400 w-full">
                                      <span>{calculateAge(child.dateOfBirth)}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      <span className="text-[#ff4d4f]">Blood: {child.bloodGroup || 'Unrecorded'}</span>
                                 </div>

                                 <div className="grid grid-cols-3 gap-3 w-full mt-8">
                                      <Link to={`/child/${child.id}`}>
                                          <div className="bg-[#f8f9fa] hover:bg-slate-100 transition-colors rounded-lg p-3 flex flex-col items-center text-center cursor-pointer border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow">
                                              <Activity size={20} className="text-[#8244e0] mb-2"/>
                                              <span className="text-[10px] font-black uppercase tracking-widest text-[#aeb1c4]">Records</span>
                                          </div>
                                      </Link>
                                      <Link to={`/child/${child.id}/growth`}>
                                          <div className="bg-[#f8f9fa] hover:bg-slate-100 transition-colors rounded-lg p-3 flex flex-col items-center text-center cursor-pointer border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow">
                                              <LineChart size={20} className="text-[#14c39a] mb-2"/>
                                              <span className="text-[10px] font-black uppercase tracking-widest text-[#aeb1c4]">Growth</span>
                                          </div>
                                      </Link>
                                      <Link to={`/child/${child.id}/vaccines`}>
                                          <div className="bg-[#f8f9fa] hover:bg-slate-100 transition-colors rounded-lg p-3 flex flex-col items-center text-center cursor-pointer border border-slate-100 hover:border-slate-200 shadow-sm hover:shadow">
                                              <Syringe size={20} className="text-[#ffb020] mb-2"/>
                                              <span className="text-[10px] font-black uppercase tracking-widest text-[#aeb1c4]">Vaccines</span>
                                          </div>
                                      </Link>
                                 </div>
                             </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Registration Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in relative">
                        <div className="bg-[#8244e0] p-6 text-white flex justify-between items-center shadow-inner">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Plus size={20} strokeWidth={3}/> Register Child Record</h2>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1.5 rounded transition-colors"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">First Name</label>
                                    <input required value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} type="text" className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-bold text-slate-700"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Last Name</label>
                                    <input required value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} type="text" className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-bold text-slate-700"/>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date of Birth</label>
                                <input required value={formData.dateOfBirth} onChange={e=>setFormData({...formData, dateOfBirth: e.target.value})} type="date" className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-bold text-slate-700"/>
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assigned Sex</label>
                                    <select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-bold text-slate-700">
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Blood Group</label>
                                    <select value={formData.bloodGroup} onChange={e=>setFormData({...formData, bloodGroup: e.target.value})} className="w-full border-2 border-slate-100 rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#8244e0] text-sm font-bold text-slate-700">
                                        <option value="O+">O+</option> <option value="O-">O-</option>
                                        <option value="A+">A+</option> <option value="A-">A-</option>
                                        <option value="B+">B+</option> <option value="B-">B-</option>
                                        <option value="AB+">AB+</option> <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={() => setIsModalOpen(false)} variant="outline" className="flex-1 border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 py-6 rounded-xl">Cancel</Button>
                                <Button type="submit" disabled={mutation.isPending} className="flex-1 bg-[#8244e0] hover:bg-[#6830be] text-white font-bold shadow-sm border-none py-6 rounded-xl">
                                    {mutation.isPending ? 'Registering...' : 'Register Child'}
                                </Button>
                            </div>
                            {mutation.isError && <div className="text-[#ff4d4f] text-[11px] font-black tracking-widest uppercase text-center mt-2">Action Failed: Clinical Validation Error</div>}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
