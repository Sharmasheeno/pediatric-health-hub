import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { HeartPulse, FolderOpen, Activity, Syringe, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const PatientRecords = () => {
    const { data: patients, isLoading } = useQuery({
        queryKey: ['doctorPatients'],
        queryFn: async () => {
            const res = await api.get('/children');
            return res.data.data || [];
        }
    });

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-xl shadow-sm p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="z-10 w-full">
                    <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3"><HeartPulse size={28} className="text-teal-100" /> Patient Clinical Records</h1>
                    <p className="text-white/80 font-medium max-w-2xl">Access full longitudinal health records, immunization matrices, and growth trajectories for your registered patients.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patients?.map((patient, idx) => (
                    <Card key={idx} className="hover:shadow-md cursor-pointer transition-all border-slate-100 group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform">{patient.firstName.charAt(0)}</div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-lg leading-tight">{patient.firstName} {patient.lastName}</h3>
                                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">ID: {patient.id}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mb-6 relative">
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">D.O.B</div>
                                    <div className="font-bold text-slate-700 text-sm">{new Date(patient.dateOfBirth).toLocaleDateString()}</div>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Blood Map</div>
                                    <div className="font-black text-red-500 text-sm">{patient.bloodType}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                                <button className="flex-1 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 py-2 rounded transition-colors group/btn">
                                    <FolderOpen size={18} className="mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">History</span>
                                </button>
                                <button className="flex-1 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 py-2 rounded transition-colors group/btn">
                                    <Activity size={18} className="mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Growth</span>
                                </button>
                                <button className="flex-1 flex flex-col items-center justify-center text-slate-400 hover:text-purple-500 py-2 rounded transition-colors group/btn">
                                    <Syringe size={18} className="mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Vax</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
        </div>
    );
};
