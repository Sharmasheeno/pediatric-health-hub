import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Activity, Pill, ShieldAlert, FileText } from 'lucide-react';

export const ChildProfile = () => {
    const { id } = useParams();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['childRecords', id],
        queryFn: async () => {
            // Concurrently fetching decoupled Parent vs Doctor structures
            const [baseline, consultations] = await Promise.all([
                api.get(`/health-records/child/${id}/baseline`),
                api.get(`/health-records/child/${id}/consultations`)
            ]);
            return {
                baseline: baseline.data.data,
                consultations: consultations.data.data
            };
        }
    });

    if (isLoading) return <div className="p-8 flex items-center justify-center"><Activity className="animate-spin text-blue-600" /></div>;
    if (isError) return <div className="p-8 text-red-500 font-medium text-center">Failed to load medical records. Do you have correct permissions?</div>;

    const { baseline, consultations } = data;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Child Medical History</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Allergies Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldAlert size={20} className="text-red-500" /> Allergies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {baseline.allergies.length === 0 ? <p className="text-sm text-slate-500">No known allergies</p> : (
                            <ul className="space-y-3">
                                {baseline.allergies.map(a => (
                                    <li key={a.id} className="border-b pb-2 last:border-0">
                                        <div className="font-medium text-slate-800">{a.allergen} <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase ml-1">{a.severity}</span></div>
                                        {a.notes && <p className="text-xs text-slate-600 mt-1">{a.notes}</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Medications Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Pill size={20} className="text-blue-500" /> Current Medications</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {baseline.medications.length === 0 ? <p className="text-sm text-slate-500">No active medications</p> : (
                            <ul className="space-y-3">
                                {baseline.medications.map(m => (
                                    <li key={m.id} className="border-b pb-2 last:border-0">
                                        <div className="font-medium text-slate-800">{m.name}</div>
                                        <div className="text-sm text-slate-600">{m.dosage}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Past Illnesses Widget */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Activity size={20} className="text-orange-500" /> Past Illnesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {baseline.illnesses.length === 0 ? <p className="text-sm text-slate-500">Clean history</p> : (
                            <ul className="space-y-3">
                                {baseline.illnesses.map(i => (
                                    <li key={i.id} className="flex flex-col border-b pb-2 last:border-0">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-slate-700">{i.illnessName}</span>
                                            <span className="text-slate-500 text-xs">{new Date(i.diagnosisDate).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Compliance Layer: Official Doctor Consultation Notes */}
            <Card className="mt-8 border-l-4 border-l-blue-600">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText size={20} className="text-slate-600" /> Official Consultation Notes</CardTitle>
                </CardHeader>
                <CardContent>
                     {consultations.length === 0 ? <p className="text-slate-500 italic">No formal doctor notes recorded yet.</p> : (
                        <div className="space-y-6">
                            {consultations.map(note => (
                                <div key={note.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex justify-between items-start mb-3 border-b border-slate-200 pb-2">
                                        <div className="font-semibold text-slate-800">
                                            Dr. {note.doctor.lastName} - <span className="text-sm font-normal text-slate-500">{note.doctor.specialization}</span>
                                        </div>
                                        <div className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                                            {new Date(note.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{note.notes}</p>
                                    
                                    {note.treatmentPlan && (
                                        <div className="mt-4 pt-4 border-t border-slate-200/60">
                                            <div className="text-xs uppercase font-bold text-slate-500 mb-1">Prescribed Treatment Plan</div>
                                            <p className="text-sm text-slate-800 bg-white p-3 rounded border border-slate-100">{note.treatmentPlan}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                     )}
                </CardContent>
            </Card>

        </div>
    );
};
