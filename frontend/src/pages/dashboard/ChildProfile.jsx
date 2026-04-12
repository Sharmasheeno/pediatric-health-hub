import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Activity, Pill, ShieldAlert, FileText, Plus } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export const ChildProfile = () => {
    const { id } = useParams();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '' });
    const [formData, setFormData] = useState({});

    const closeModal = () => { setModalConfig({ isOpen: false, type: '' }); setFormData({}); };

    const { data, isLoading, isError } = useQuery({
        queryKey: ['childRecords', id],
        queryFn: async () => {
            const [baseline, consultations] = await Promise.all([
                api.get(`/health-records/child/${id}/baseline`),
                api.get(`/health-records/child/${id}/consultations`)
            ]);
            return { baseline: baseline.data.data, consultations: consultations.data.data };
        }
    });

    const submitRecord = useMutation({
        mutationFn: async ({ endpoint, payload }) => await api.post(endpoint, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['childRecords', id] });
            closeModal();
        },
        onError: (err) => alert("Failed to save: " + (err.response?.data?.message || err.message))
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { childId: id, ...formData };
        let endpoint = '';
        if (modalConfig.type === 'allergy') endpoint = '/health-records/allergies';
        if (modalConfig.type === 'medication') { 
            endpoint = '/health-records/medications'; 
            payload.startDate = formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(); 
        }
        if (modalConfig.type === 'illness') { 
            endpoint = '/health-records/illnesses'; 
            payload.diagnosisDate = formData.diagnosisDate ? new Date(formData.diagnosisDate).toISOString() : new Date().toISOString(); 
        }
        if (modalConfig.type === 'consultation') endpoint = '/health-records/consultations';
        
        submitRecord.mutate({ endpoint, payload });
    };

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Activity className="animate-spin text-blue-600" /></div>;
    if (isError) return <div className="p-8 text-red-500 font-medium text-center">Failed to load medical records. Do you have correct permissions?</div>;

    const { baseline, consultations } = data;
    const isParent = user?.role === 'PARENT' || user?.role === 'ADMIN';
    const isDoctor = user?.role === 'DOCTOR';

    return (
        <div className="space-y-6 animate-fade-in relative">
            <h1 className="text-2xl font-bold text-slate-800">Child Medical History</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Allergies Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-md text-slate-700"><ShieldAlert size={18} className="text-red-500" /> Allergies</CardTitle>
                        {isParent && <button onClick={() => setModalConfig({isOpen:true, type:'allergy'})} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"><Plus size={16}/></button>}
                    </CardHeader>
                    <CardContent className="pt-4">
                        {baseline.allergies.length === 0 ? <p className="text-sm text-slate-500 italic">No known allergies</p> : (
                            <ul className="space-y-3">
                                {baseline.allergies.map(a => (
                                    <li key={a.id} className="border-b pb-2 last:border-0">
                                        <div className="font-medium text-slate-800">{a.allergen} <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase ml-1 tracking-wider">{a.severity}</span></div>
                                        {a.notes && <p className="text-xs text-slate-500 mt-1">{a.notes}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Medications Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-md text-slate-700"><Pill size={18} className="text-blue-500" /> Medications</CardTitle>
                        {isParent && <button onClick={() => setModalConfig({isOpen:true, type:'medication'})} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition-colors"><Plus size={16}/></button>}
                    </CardHeader>
                    <CardContent className="pt-4">
                         {baseline.medications.length === 0 ? <p className="text-sm text-slate-500 italic">No active medications</p> : (
                            <ul className="space-y-3">
                                {baseline.medications.map(m => (
                                    <li key={m.id} className="border-b pb-2 last:border-0">
                                        <div className="font-bold text-slate-700">{m.name}</div>
                                        <div className="text-xs font-semibold text-slate-500 tracking-wide">{m.dosage}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Past Illnesses Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50 border-b border-slate-100">
                        <CardTitle className="flex items-center gap-2 text-md text-slate-700"><Activity size={18} className="text-orange-500" /> Illnesses</CardTitle>
                        {isParent && <button onClick={() => setModalConfig({isOpen:true, type:'illness'})} className="text-orange-500 hover:text-orange-700 hover:bg-orange-50 p-1.5 rounded transition-colors"><Plus size={16}/></button>}
                    </CardHeader>
                    <CardContent className="pt-4">
                        {baseline.illnesses.length === 0 ? <p className="text-sm text-slate-500 italic">Clean history</p> : (
                            <ul className="space-y-3">
                                {baseline.illnesses.map(i => (
                                    <li key={i.id} className="flex flex-col border-b pb-2 last:border-0">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-slate-700">{i.illnessName}</span>
                                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{new Date(i.diagnosisDate).toLocaleDateString()}</span>
                                        </div>
                                        {i.notes && <p className="text-xs text-slate-500 mt-1">{i.notes}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Official Doctor Consultation Notes */}
            <Card className="mt-8 border-l-4 border-l-blue-600 shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-800"><FileText size={20} className="text-blue-600" /> Official Consultation Notes</CardTitle>
                    {isDoctor && (
                        <Button onClick={() => setModalConfig({isOpen:true, type:'consultation'})} className="bg-blue-600 hover:bg-blue-700 flex gap-2">
                            <Plus size={16} /> Log Consultation
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="pt-6">
                     {consultations.length === 0 ? <p className="text-slate-500 italic text-sm">No formal doctor notes recorded yet.</p> : (
                        <div className="space-y-6">
                            {consultations.map(note => (
                                <div key={note.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group">
                                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                                        <div>
                                            <div className="font-black text-slate-800 text-lg">Dr. {note.doctor.lastName}</div>
                                            <div className="text-xs font-black tracking-widest uppercase text-blue-500 mt-1">{note.doctor.specialization}</div>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{note.notes}</p>
                                    
                                    {note.treatmentPlan && (
                                        <div className="mt-5 pt-4 border-t border-dashed border-slate-200">
                                            <div className="text-[10px] font-black tracking-widest text-emerald-600 uppercase mb-2 flex items-center gap-2"><Activity size={12}/> Treatment Protocol</div>
                                            <p className="text-sm text-slate-800 bg-emerald-50/50 p-4 rounded-lg border border-emerald-100/50">{note.treatmentPlan}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                     )}
                </CardContent>
            </Card>

            {/* Dynamic Modals */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-xl font-bold text-slate-800 capitalize">Add {modalConfig.type}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-red-500 font-bold transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            
                            {modalConfig.type === 'allergy' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Allergen (e.g. Peanuts, Penicillin)</label>
                                        <input required type="text" value={formData.allergen || ''} onChange={e => setFormData({...formData, allergen: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Severity</label>
                                        <select value={formData.severity || ''} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">Select Priority</option>
                                            <option value="Mild">Mild</option>
                                            <option value="Moderate">Moderate</option>
                                            <option value="Severe">Severe (Anaphylaxis)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {modalConfig.type === 'medication' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Medication Name</label>
                                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Dosage Details</label>
                                        <input required type="text" value={formData.dosage || ''} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 5ml twice daily" />
                                    </div>
                                </>
                            )}

                            {modalConfig.type === 'illness' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Diagnosis Name</label>
                                        <input required type="text" value={formData.illnessName || ''} onChange={e => setFormData({...formData, illnessName: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Date Diagnosed</label>
                                        <input required type="date" value={formData.diagnosisDate || ''} onChange={e => setFormData({...formData, diagnosisDate: e.target.value})} className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </>
                            )}

                            {(modalConfig.type === 'allergy' || modalConfig.type === 'illness' || modalConfig.type === 'consultation') && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">{modalConfig.type === 'consultation' ? 'Consultation Notes (Required)' : 'Additional Context (Optional)'}</label>
                                    <textarea required={modalConfig.type === 'consultation'} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} rows="4" className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                                </div>
                            )}

                            {modalConfig.type === 'consultation' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Treatment Protocol (Optional)</label>
                                    <textarea value={formData.treatmentPlan || ''} onChange={e => setFormData({...formData, treatmentPlan: e.target.value})} rows="3" className="w-full border border-slate-200 rounded-lg px-4 py-2 bg-slate-50 focus:bg-white outline-none ring-1 ring-emerald-200 focus:ring-emerald-500 placeholder-emerald-800/30 font-medium text-emerald-900 bg-emerald-50/10"></textarea>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={closeModal} variant="outline" className="flex-1">Discard</Button>
                                <Button type="submit" isLoading={submitRecord.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">Submit to System</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
