import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Video, Calendar, Clock, AlertCircle, Zap, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { DirectMessageClient } from '../../components/chat/DirectMessageClient';

export const TeleconsultHub = () => {
    const { user } = useAuthStore();
    const navigate  = useNavigate();
    const queryClient = useQueryClient();
    const isDoctor  = user?.role === 'DOCTOR';

    // Track which room is being activated (per appointment button)
    const [activatingId, setActivatingId] = useState(null);

    const { data: upcomingSessions, isLoading } = useQuery({
        queryKey: ['teleconsultAppointments'],
        queryFn: async () => {
            const res = await api.get('/appointments/my-schedule');
            return res.data.data.appointments?.filter(app =>
                app.status === 'PENDING' || app.status === 'CONFIRMED'
            ) || [];
        }
    });

    // Doctor-only: activate (generate) the WebRTC room for an appointment
    const startSession = useMutation({
        mutationFn: async (appointmentId) => {
            setActivatingId(appointmentId);
            const res = await api.post('/teleconsultations/generate', { appointmentId });
            return { appointmentId, ...res.data };
        },
        onSuccess: (data) => {
            // Navigate doctor directly into the room
            navigate(`/teleconsult/${data.appointmentId}`);
            queryClient.invalidateQueries(['teleconsultAppointments']);
        },
        onError: (err) => {
            console.error('[TeleconsultHub] Failed to start session:', err);
            setActivatingId(null);
        }
    });

    return (
        <div className="max-w-[1200px] w-full mx-auto space-y-6 animate-fade-in font-sans">

            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden mb-8">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#14c39a]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#8244e0]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="w-16 h-16 bg-[#14c39a]/10 text-[#14c39a] rounded-2xl flex items-center justify-center mb-6 shadow-sm z-10">
                    <Video size={30} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3 z-10">
                    Teleconsultation Hub
                </h1>
                <p className="text-slate-500 font-medium max-w-[620px] leading-relaxed z-10">
                    {isDoctor
                        ? "Start a secure, encrypted video session with your patient. Click \"Start Session\" on any confirmed appointment to open the live room — your patient will join from their portal."
                        : "Connect directly with your pediatric doctors from the comfort of your home. When the doctor opens the session, click \"Join Call\" to enter the encrypted video room."}
                </p>

                {isDoctor && (
                    <div className="flex items-center gap-2 mt-5 px-4 py-2 bg-[#14c39a]/10 rounded-full z-10">
                        <Zap size={14} className="text-[#14c39a]" />
                        <span className="text-[#14c39a] text-xs font-bold uppercase tracking-widest">
                            WebRTC · Peer-to-Peer · End-to-End Encrypted
                        </span>
                    </div>
                )}
            </div>

            {/* ── Direct Messaging Component ────────────────────────────── */}
            <DirectMessageClient />

            {/* ── Upcoming Sessions List ────────────────────────────────────── */}
            <h2 className="text-[#6c7293] font-bold text-sm tracking-wide mt-8 mb-[-12px]">
                Your Upcoming Virtual Appointments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {isLoading ? (
                    <div className="col-span-2 text-center p-12 text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                        Syncing Telemetry...
                    </div>
                ) : upcomingSessions?.length > 0 ? (
                    upcomingSessions.map((session) => {
                        const isConfirmed   = session.status === 'CONFIRMED';
                        const isActivating  = activatingId === session.id;

                        return (
                            <Card
                                key={session.id}
                                className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden bg-white rounded-xl group"
                            >
                                {/* Status stripe */}
                                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isConfirmed ? 'bg-[#14c39a]' : 'bg-[#f5a623]'}`} />

                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <h3 className="font-black text-lg text-slate-800 tracking-tight">
                                                {isDoctor
                                                    ? `Patient: ${session.child?.firstName} ${session.child?.lastName}`
                                                    : `Consultation: Dr. ${session.doctor?.lastName}`}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1.5 text-xs font-bold text-slate-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={13} className="text-[#8244e0]" />
                                                    {new Date(session.scheduledAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-[#8244e0]" />
                                                    {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                            isConfirmed
                                                ? 'bg-[#14c39a]/10 text-[#14c39a]'
                                                : 'bg-[#f5a623]/10 text-[#f5a623]'
                                        }`}>
                                            {isConfirmed
                                                ? <><CheckCircle2 size={11} /> Ready</>
                                                : <><AlertCircle size={11} /> Pending</>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {/* ── DOCTOR: Start Session button ── */}
                                        {isDoctor && isConfirmed && (
                                            <Button
                                                id={`btn-start-session-${session.id}`}
                                                className="flex-1 font-bold bg-[#14c39a] hover:bg-[#10a884] text-white shadow-sm shadow-[#14c39a]/20"
                                                onClick={() => startSession.mutate(session.id)}
                                                disabled={isActivating}
                                            >
                                                {isActivating ? (
                                                    <><Loader2 size={15} className="mr-2 animate-spin" /> Opening Room...</>
                                                ) : (
                                                    <><Zap size={15} className="mr-2" /> Start Session</>
                                                )}
                                            </Button>
                                        )}

                                        {/* ── DOCTOR: Pending (not confirmed) ── */}
                                        {isDoctor && !isConfirmed && (
                                            <Button
                                                className="flex-1 font-bold bg-slate-100 text-slate-400 cursor-not-allowed border-none hover:bg-slate-100 shadow-none"
                                                disabled
                                            >
                                                <AlertCircle size={15} className="mr-2" /> Awaiting Confirmation
                                            </Button>
                                        )}

                                        {/* ── PARENT: Join Call (CONFIRMED only) ── */}
                                        {!isDoctor && isConfirmed && (
                                            <Link to={`/teleconsult/${session.id}`} className="flex-1">
                                                <Button
                                                    id={`btn-join-call-${session.id}`}
                                                    className="w-full font-bold bg-[#14c39a] hover:bg-[#10a884] text-white shadow-sm shadow-[#14c39a]/20"
                                                >
                                                    <Video size={15} className="mr-2" /> Join Call
                                                </Button>
                                            </Link>
                                        )}

                                        {/* ── PARENT: Not ready yet ── */}
                                        {!isDoctor && !isConfirmed && (
                                            <Button
                                                className="flex-1 font-bold bg-slate-100 text-slate-400 cursor-not-allowed border-none hover:bg-slate-100 shadow-none"
                                                disabled
                                            >
                                                <AlertCircle size={15} className="mr-2" /> Waiting for Doctor
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-1 md:col-span-2 text-center p-14 bg-white rounded-xl border border-slate-100">
                        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-black text-slate-700">No Virtual Calls Scheduled</h3>
                        <p className="text-sm text-slate-500 font-medium mt-1">Your teleconsultation queue is empty.</p>
                    </div>
                )}
            </div>

            {/* ── Parent CTA ───────────────────────────────────────────────── */}
            {!isDoctor && (
                <div className="mt-8 text-center pt-6">
                    <Link to="/appointments">
                        <Button className="bg-[#8244e0] hover:bg-[#6c34c4] text-white font-bold shadow-md shadow-[#8244e0]/20 px-8 py-6 rounded-xl">
                            <Calendar size={18} className="mr-2" /> Schedule New Virtual Appointment
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};
