import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Calendar, Clock, Video, User, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const DoctorSchedule = () => {
    const { data: schedule, isLoading } = useQuery({
        queryKey: ['doctorSchedule'],
        queryFn: async () => {
            const res = await api.get('/appointments/my-schedule');
            return res.data.data.appointments || [];
        }
    });

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl shadow-sm p-8 text-white flex flex-col md:flex-row justify-between items-center relative overflow-hidden">
                <div className="z-10 w-full">
                    <h1 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3"><Calendar size={28} className="text-[#a7f3df]" /> Clinical Schedule</h1>
                    <p className="text-white/80 font-medium max-w-2xl">Manage your daily appointments, tele-consultation slots, and in-person patient reviews.</p>
                </div>
            </div>

            <Card className="shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Syncing Scheduling Matrix...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <th className="p-4 rounded-tl-lg">Patient Information</th>
                                        <th className="p-4">Time Slot</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-right rounded-tr-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedule?.map(appointment => (
                                        <tr key={appointment.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800 flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">{appointment.child?.firstName?.charAt(0) || 'P'}</div>
                                                    <div>
                                                        {appointment.child?.firstName} {appointment.child?.lastName}
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">ID: {appointment.id?.slice(0,6)} • {appointment.reason || 'General Routine'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Clock size={16} className="text-slate-400"/> {new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="text-xs font-semibold tracking-wide text-slate-500">{new Date(appointment.scheduledAt).toLocaleDateString()}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5 w-max">
                                                    <Video size={12}/> Tele-Consult
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                                                    <CheckCircle size={14} /> Confirmed
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg">Initialize Session</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {schedule?.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                    <Calendar size={32} />
                                                </div>
                                                <h3 className="text-lg font-black text-slate-700 tracking-tight">No Pending Appointments</h3>
                                                <p className="text-sm text-slate-500 font-medium mt-1">Your schedule matrix is completely clear for the upcoming periods.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
