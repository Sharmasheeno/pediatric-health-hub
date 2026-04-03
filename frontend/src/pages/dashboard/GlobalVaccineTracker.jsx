import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardContent } from '../../components/ui/Card';
import { Syringe, ChevronRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GlobalVaccineTracker = () => {
    const { data: children, isLoading } = useQuery({
        queryKey: ['myChildren'],
        queryFn: async () => {
            const res = await api.get('/children/my-children');
            return res.data.data;
        }
    });

    return (
        <div className="w-full mx-auto space-y-6 animate-fade-in font-sans">
            <div className="bg-[#ffb020] rounded-xl shadow-sm p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl translate-x-1/4"></div>
                <div className="z-10 w-full text-center md:text-left flex items-center md:items-start flex-col">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner shrink-0 mb-4">
                         <Syringe size={24} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 text-slate-800">Immunization Gateway</h1>
                    <p className="text-slate-800/80 font-black">Select a patient below to view, manage, and synchronize their formal vaccination schedules.</p>
                </div>
            </div>

            <h2 className="text-[#6c7293] font-bold text-[11px] uppercase tracking-widest mt-8 mb-4">Select Patient Profile</h2>

            {isLoading ? (
                <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading gateway profiles...</div>
            ) : children?.length === 0 ? (
                 <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-600 mb-2">No Children Registered</h2>
                    <p className="text-slate-400 font-medium max-w-sm mx-auto">Please return to Child Health Records to register your first child before generating a vaccine map.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {children.map(child => (
                        <Link to={`/child/${child.id}/vaccines`} key={child.id}>
                            <Card className="border-slate-100 hover:shadow-md hover:border-[#ffb020] transition-all cursor-pointer group bg-white">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-full bg-[#ffb020]/10 text-[#ffb020] flex items-center justify-center font-black text-2xl group-hover:bg-[#ffb020] group-hover:text-white transition-colors">
                                            {child.firstName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 text-lg tracking-tight mb-0.5">{child.firstName} {child.lastName}</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#aeb1c4] flex items-center gap-1.5">
                                                <Activity size={10}/> Open Immunization Matrix
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#ffb020]/10 transition-colors">
                                        <ChevronRight size={18} className="text-slate-400 group-hover:text-[#ffb020]" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
