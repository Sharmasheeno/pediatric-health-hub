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

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Activity className="animate-spin text-primary-600" /></div>;
    if (isError) return <div className="p-8 text-danger font-medium text-center">Failed to load medical records. Do you have correct permissions?</div>;

    const { baseline, consultations } = data;
    const isParent = user?.role === 'PARENT' || user?.role === 'ADMIN';
    const isDoctor = user?.role === 'DOCTOR';

    return (
        <div className="space-y-6 animate-fade-in relative">
            <h1 className="text-2xl font-bold text-[--text-primary]">Child Medical History</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Allergies Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-[--surface-soft] border-b border-[--border]">
                        <CardTitle className="flex items-center gap-2 text-md text-[--text-primary]"><ShieldAlert size={18} className="text-danger" /> Allergies</CardTitle>
                        {isParent && <button onClick={() => setModalConfig({isOpen:true, type:'allergy'})} className="text-danger hover:text-danger hover:bg-danger/10 p-1.5 rounded transition-colors"><Plus size={16}/></button>}
                    </CardHeader>
                    <CardContent className="pt-4">
                        {baseline.allergies.length === 0 ? <p className="text-sm text-[--text-secondary] italic">No known allergies</p> : (
                            <ul className="space-y-3">
                                {baseline.allergies.map(a => (
                                    <li key={a.id} className="border-b border-[--border] pb-2 last:border-0">
                                        <div className="font-medium text-[--text-primary]">{a.allergen} <span className="text-[10px] font-black bg-danger/10 text-danger px-2 py-0.5 rounded-full uppercase ml-1 tracking-wider">{a.severity}</span></div>
                                        {a.notes && <p className="text-xs text-[--text-secondary] mt-1">{a.notes}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Medications Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-[--surface-soft] border-b border-[--border]">
                        <CardTitle className="flex items-center gap-2 text-md text-[--text-primary]"><Pill size={18} className="text-primary-500" /> Medications</CardTitle>
                        {isParent && <button onClick={() => setModalConfig({isOpen:true, type:'medication'})} className="text-primary-500 hover:text-primary-700 hover:bg-primary-50 dark:bg-primary-950 p-1.5 rounded transition-colors"><Plus size={16}/></button>}
                    </CardHeader>
                    <CardContent className="pt-4">
                         {baseline.medications.length === 0 ? <p className="text-sm text-[--text-secondary] italic">No active medications</p> : (
                            <ul className="space-y-3">
                                {baseline.medications.map(m => (
                                    <li key={m.id} className="border-b border-[--border] pb-2 last:border-0">
                                        <div className="font-bold text-[--text-primary]">{m.name}</div>
                                        <div className="text-xs font-semibold text-[--text-secondary] tracking-wide">{m.dosage}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Past Illnesses Widget */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-[--surface-soft] border-b border-[--border]">
                        <CardTitle className="flex items-center gap-2 text-md text-[--text-primary]"><Activity size={18} className="text-warning" /> Illnesses</CardTitle>
                        {isParent && <button onClick={() => setModalConfig({isOpen:true, type:'illness'})} className="text-warning hover:text-warning hover:bg-warning/10 p-1.5 rounded transition-colors"><Plus size={16}/></button>}
                    </CardHeader>
                    <CardContent className="pt-4">
                        {baseline.illnesses.length === 0 ? <p className="text-sm text-[--text-secondary] italic">Clean history</p> : (
                            <ul className="space-y-3">
                                {baseline.illnesses.map(i => (
                                    <li key={i.id} className="flex flex-col border-b border-[--border] pb-2 last:border-0">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold text-[--text-primary]">{i.illnessName}</span>
                                            <span className="text-[--text-muted] font-bold uppercase tracking-widest text-[10px]">{new Date(i.diagnosisDate).toLocaleDateString()}</span>
                                        </div>
                                        {i.notes && <p className="text-xs text-[--text-secondary] mt-1">{i.notes}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Official Doctor Consultation Notes */}
            <Card className="mt-8 border-l-4 border-l-primary-600 shadow-md">
                <CardHeader className="bg-[--surface-soft] flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[--text-primary]"><FileText size={20} className="text-primary-600" /> Official Consultation Notes</CardTitle>
                    {isDoctor && (
                        <Button onClick={() => setModalConfig({isOpen:true, type:'consultation'})} className="bg-primary-600 hover:bg-primary-700 flex gap-2">
                            <Plus size={16} /> Log Consultation
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="pt-6">
                     {consultations.length === 0 ? <p className="text-[--text-secondary] italic text-sm">No formal doctor notes recorded yet.</p> : (
                        <div className="space-y-6">
                            {consultations.map(note => (
                                <div key={note.id} className="bg-[--surface] p-5 rounded-xl border border-[--border] shadow-sm hover:border-primary-300 transition-colors group">
                                    <div className="flex justify-between items-start mb-4 border-b border-[--border] pb-3">
                                        <div>
                                            <div className="font-black text-[--text-primary] text-lg">Dr. {note.doctor.lastName}</div>
                                            <div className="text-xs font-black tracking-widest uppercase text-primary-500 mt-1">{note.doctor.specialization}</div>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[--text-muted] bg-[--surface-soft] px-3 py-1.5 rounded-lg border border-[--border] group-hover:bg-primary-50 dark:bg-primary-950 group-hover:text-primary-600 transition-colors">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-sm text-[--text-primary] whitespace-pre-wrap leading-relaxed">{note.notes}</p>
                                    
                                    {note.treatmentPlan && (
                                        <div className="mt-5 pt-4 border-t border-dashed border-[--border]">
                                            <div className="text-[10px] font-black tracking-widest text-teal uppercase mb-2 flex items-center gap-2"><Activity size={12}/> Treatment Protocol</div>
                                            <p className="text-sm text-[--text-primary] bg-teal/10 p-4 rounded-lg border border-teal/20">{note.treatmentPlan}</p>
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
                    <div className="bg-[--surface] rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[--border] flex justify-between items-center bg-[--surface-soft]">
                            <h2 className="text-xl font-bold text-[--text-primary] capitalize">Add {modalConfig.type}</h2>
                            <button onClick={closeModal} className="text-[--text-muted] hover:text-danger font-bold transition-colors">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            
                            {modalConfig.type === 'allergy' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">Allergen (e.g. Peanuts, Penicillin)</label>
                                        <input required type="text" value={formData.allergen || ''} onChange={e => setFormData({...formData, allergen: e.target.value})} className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">Severity</label>
                                        <select value={formData.severity || ''} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold">
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
                                        <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">Medication Name</label>
                                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">Dosage Details</label>
                                        <input required type="text" value={formData.dosage || ''} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold" placeholder="e.g. 5ml twice daily" />
                                    </div>
                                </>
                            )}

                            {modalConfig.type === 'illness' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">Diagnosis Name</label>
                                        <input required type="text" value={formData.illnessName || ''} onChange={e => setFormData({...formData, illnessName: e.target.value})} className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">Date Diagnosed</label>
                                        <input required type="date" value={formData.diagnosisDate || ''} onChange={e => setFormData({...formData, diagnosisDate: e.target.value})} className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold" />
                                    </div>
                                </>
                            )}

                            {(modalConfig.type === 'allergy' || modalConfig.type === 'illness' || modalConfig.type === 'consultation') && (
                                <div>
                                    <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">{modalConfig.type === 'consultation' ? 'Consultation Notes (Required)' : 'Additional Context (Optional)'}</label>
                                    <textarea required={modalConfig.type === 'consultation'} value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} rows="4" className="w-full bg-[--surface] text-[--text-primary] border-2 border-[--border] rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary-500 text-sm font-bold"></textarea>
                                </div>
                            )}

                            {modalConfig.type === 'consultation' && (
                                <div>
                                    <label className="block text-xs font-bold text-[--text-secondary] uppercase tracking-wide mb-1">Treatment Protocol (Optional)</label>
                                    <textarea value={formData.treatmentPlan || ''} onChange={e => setFormData({...formData, treatmentPlan: e.target.value})} rows="3" className="w-full bg-teal/10 text-[--text-primary] border-2 border-teal/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-teal text-sm font-bold placeholder-teal/50"></textarea>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <Button type="button" onClick={closeModal} variant="secondary" className="flex-1 font-bold py-6 rounded-xl">Discard</Button>
                                <Button type="submit" isLoading={submitRecord.isPending} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-6 rounded-xl">Submit to System</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
