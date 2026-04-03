import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Video, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export const TeleconsultHub = () => {
    const { user } = useAuthStore();
    const isDoctor = user?.role === 'DOCTOR';

    const { data: upcomingSessions, isLoading } = useQuery({
        queryKey: ['teleconsultAppointments'],
        queryFn: async () => {
            const res = await api.get('/appointments/my-schedule');
            // Filter to only show upcoming/ready PENDING or CONFIRMED teleconsult-ready appointments
            return res.data.data.appointments?.filter(app => 
                 app.status === 'PENDING' || app.status === 'CONFIRMED'
            ) || [];
        }
    });

    return (
        <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fade-in font-sans">
            <div className="bg-white rounded shadow-sm border border-slate-50 p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#14c39a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8244e0]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
                
                <div className="w-16 h-16 bg-[#14c39a]/10 text-[#14c39a] rounded-2xl flex items-center justify-center mb-6 shadow-sm z-10">
                    <Video size={30} strokeWidth={2.5}/>
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3 z-10">Teleconsultation Hub</h1>
                <p className="text-slate-500 font-medium max-w-[600px] leading-relaxed z-10">
                    {isDoctor ? "Manage your virtual patient queue and launch secure WebRTC medical portals directly from your browser." : "Connect directly with your pediatric doctors from the comfort of your home. Select an upcoming scheduled appointment to securely join the encrypted waiting room."}
                </p>
            </div>

            <h2 className="text-[#6c7293] font-bold text-sm tracking-wide mt-8 mb-[-12px]">Your Upcoming Virtual Appointments</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {isLoading ? (
                    <div className="col-span-1 md:col-span-2 text-center p-12 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Syncing Telemetry...</div>
                ) : upcomingSessions?.length > 0 ? (
                    upcomingSessions.map((session, idx) => (
                        <Card key={session.id} className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white rounded">
                            <div className={`absolute top-0 left-0 w-1 h-full ${session.status === 'CONFIRMED' ? 'bg-[#14c39a]' : 'bg-[#f5a623]'}`}></div>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="font-black text-lg text-slate-800 tracking-tight">
                                            {isDoctor ? `Patient: ${session.child?.firstName} ${session.child?.lastName}` : `Consultation: Dr. ${session.doctor?.lastName}`}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-xs font-bold text-slate-500">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#8244e0]"/> {new Date(session.scheduledAt).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#8244e0]"/> {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest ${session.status === 'CONFIRMED' ? 'bg-[#14c39a]/10 text-[#14c39a]' : 'bg-[#f5a623]/10 text-[#f5a623]'}`}>
                                        {session.status === 'CONFIRMED' ? 'READY' : 'WAITING'}
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    {session.status === 'CONFIRMED' ? (
                                        <Link to={`/teleconsult/${session.id}`} className="flex-1">
                                            <Button className="w-full font-bold shadow-sm bg-[#14c39a] hover:bg-[#10a884] text-white">
                                                <Video size={16} className="mr-2"/> Join Secure Call
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button className="flex-1 font-bold shadow-none bg-slate-100 text-slate-400 cursor-not-allowed border-none hover:bg-slate-100">
                                            <AlertCircle size={16} className="mr-2"/> Call Not Ready
                                        </Button>
                                    )}
                                    <Button variant="outline" className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50">Manage</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 text-center p-12 bg-white rounded border border-slate-100">
                         <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4"><Calendar size={32} /></div>
                         <h3 className="text-lg font-black text-slate-700">No Virtual Calls</h3>
                         <p className="text-sm text-slate-500 font-medium">Your teleconsultation queue is completely clear.</p>
                    </div>
                )}
            </div>
            
            {!isDoctor && (
                 <div className="mt-8 text-center pt-6">
                     <Link to="/appointments">
                         <Button className="bg-[#8244e0] hover:bg-[#6c34c4] text-white font-bold shadow-sm px-8 py-6 rounded-xl"><Calendar size={18} className="mr-2"/> Schedule New Virtual Appointment</Button>
                     </Link>
                 </div>
            )}
        </div>
    );
}
