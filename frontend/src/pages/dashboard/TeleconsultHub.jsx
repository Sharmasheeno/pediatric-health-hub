import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Video, Calendar, Clock, AlertCircle, Zap, CheckCircle2, Loader2, StopCircle, PhoneCall, Phone, Volume2 } from 'lucide-react';
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
    const [activeCall, setActiveCall] = useState(null);
    const ringtoneRef = useRef(null);

    const { data: upcomingSessions, isLoading } = useQuery({
        queryKey: ['teleconsultAppointments'],
        queryFn: async () => {
            const res = await api.get('/appointments/my-schedule');
            return res.data.data.appointments?.filter(app => {
                if (isDoctor) return app.status === 'CONFIRMED';
                return app.status === 'PENDING' || app.status === 'CONFIRMED';
            }) || [];
        },
        refetchInterval: 3000 // Speed up polling for snappy call receiving
    });

    // Ringing detection for doctors
    useEffect(() => {
        if (!isDoctor || !upcomingSessions) return;

        // Find an active teleconsultation session that was started by the parent
        // (i.e. teleconsultation relation exists and endedAt is null)
        const incomingCall = upcomingSessions.find(session => 
            session.teleconsultation && !session.teleconsultation.endedAt
        );

        if (incomingCall && !activeCall) {
            setActiveCall(incomingCall);
            // Play a synthetic ringtone sequence using Web Audio API to bypass missing MP3 files
            if (!ringtoneRef.current) {
                try {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    const ctx = new AudioContext();
                    const playRing = () => {
                        if(ctx.state === 'closed') return;
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(440, ctx.currentTime);
                        osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);
                        gain.gain.setValueAtTime(0, ctx.currentTime);
                        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 2);
                    };
                    ringtoneRef.current = setInterval(playRing, 2500);
                    playRing();
                } catch(e) { console.error("Audio API blocked", e); }
            }
        } else if (!incomingCall && activeCall) {
            setActiveCall(null);
            if (ringtoneRef.current) {
                clearInterval(ringtoneRef.current);
                ringtoneRef.current = null;
            }
        }

        return () => {
            if (ringtoneRef.current) {
                clearInterval(ringtoneRef.current);
                ringtoneRef.current = null;
            }
        };
    }, [upcomingSessions, isDoctor, activeCall]);

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
            <div className="bg-[--surface] rounded-[--radius-md] shadow-[--shadow-sm] border border-[--border] p-6 sm:p-10 text-center flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden mb-8 transition-colors">
                <div className="absolute top-0 right-0 w-72 h-72 bg-teal/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-600/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="w-16 h-16 bg-teal/10 text-teal rounded-[--radius-md] flex items-center justify-center mb-6 shadow-sm z-10">
                    <Video size={30} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-extrabold text-[--text-primary] tracking-tight mb-3 z-10">
                    Teleconsultation Hub
                </h1>
                <p className="text-[--text-secondary] font-medium max-w-[620px] leading-relaxed z-10">
                    {isDoctor
                        ? "Start a secure, encrypted video session with your patient. Click \"Start Session\" on any confirmed appointment to open the live room — your patient will join from their portal."
                        : "Connect directly with your pediatric doctors from the comfort of your home. When the doctor opens the session, click \"Join Call\" to enter the encrypted video room."}
                </p>

                {isDoctor && (
                    <div className="flex items-center gap-2 mt-5 px-4 py-2 bg-teal/10 rounded-full z-10">
                        <Zap size={14} className="text-teal" />
                        <span className="text-teal text-xs font-bold uppercase tracking-widest">
                            WebRTC · Peer-to-Peer · End-to-End Encrypted
                        </span>
                    </div>
                )}
            </div>

            {/* ── Incoming Call Overlay (DOCTOR ONLY) ───────────────────────── */}
            {isDoctor && activeCall && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-sm overflow-hidden relative text-center p-8">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-teal animate-pulse" />
                        
                        <div className="w-24 h-24 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                            <div className="absolute inset-0 border-4 border-teal rounded-full animate-ping opacity-20" />
                            <PhoneCall size={40} className="text-teal animate-bounce" />
                        </div>
                        
                        <h2 className="text-2xl font-black tracking-tight text-white mb-2">Incoming Call</h2>
                        <p className="text-[--text-secondary] font-medium mb-8">
                            Patient: <span className="text-white font-bold">{activeCall.child?.firstName} {activeCall.child?.lastName}</span>
                        </p>
                        
                        <div className="flex gap-4">
                            <Button 
                                onClick={() => startSession.mutate(activeCall.id)}
                                className="flex-1 bg-teal hover:bg-teal/90 text-white font-bold h-12 shadow-lg shadow-teal/20"
                            >
                                <Phone size={18} className="mr-2" /> Accept Call
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Direct Messaging Component ────────────────────────────── */}
            <DirectMessageClient />

            {/* ── Upcoming Sessions List ────────────────────────────────────── */}
            <h2 className="text-[--text-muted] font-bold text-sm tracking-wide mt-8 mb-[-12px]">
                Your Upcoming Virtual Appointments
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {isLoading ? (
                    <div className="col-span-2 text-center p-12 text-[--text-muted] font-bold uppercase tracking-widest animate-pulse">
                        Syncing Telemetry...
                    </div>
                ) : upcomingSessions?.length > 0 ? (
                    upcomingSessions.map((session) => {
                        const isConfirmed   = session.status === 'CONFIRMED';
                        const isActivating  = activatingId === session.id;
                        const isExpired     = new Date(session.scheduledAt) < new Date();

                        return (
                            <Card
                                key={session.id}
                                className={`relative overflow-hidden group ${isExpired ? 'opacity-70' : ''}`}
                            >
                                {/* Status stripe */}
                                <div className={`absolute top-0 left-0 w-1 h-full transition-colors ${isExpired ? 'bg-danger' : isConfirmed ? 'bg-success' : 'bg-warning'}`} />

                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <h3 className="font-bold text-lg text-[--text-primary] tracking-tight">
                                                {isDoctor
                                                    ? `Patient: ${session.child?.firstName} ${session.child?.lastName}`
                                                    : `Consultation: Dr. ${session.doctor?.lastName}`}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-1.5 text-xs font-bold text-[--text-muted]">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={13} className="text-primary-500" />
                                                    {new Date(session.scheduledAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-primary-500" />
                                                    {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                                            isExpired 
                                                ? 'bg-danger/10 text-danger'
                                                : isConfirmed
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-warning/10 text-warning'
                                        }`}>
                                            {isExpired 
                                                ? <><StopCircle size={11} /> Expired</>
                                                : isConfirmed
                                                    ? <><CheckCircle2 size={11} /> Ready</>
                                                    : <><AlertCircle size={11} /> Pending</>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        {isExpired ? (
                                            <Button
                                                variant="secondary"
                                                className="flex-1 font-bold cursor-not-allowed opacity-80 bg-[--surface-soft] text-[--text-muted] border border-[--border]"
                                                disabled
                                            >
                                                <StopCircle size={15} className="mr-2" /> Session Expired
                                            </Button>
                                        ) : (
                                            <>
                                        {/* ── DOCTOR: Start Session button ── */}
                                        {isDoctor && isConfirmed && (
                                            <Button
                                                id={`btn-start-session-${session.id}`}
                                                className="flex-1 font-bold bg-teal hover:bg-teal/90 text-white shadow-sm"
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
                                                variant="secondary"
                                                className="flex-1 font-bold cursor-not-allowed opacity-60"
                                                disabled
                                            >
                                                <AlertCircle size={15} className="mr-2" /> Awaiting Confirmation
                                            </Button>
                                        )}

                                        {/* ── PARENT: Call Doctor (any active appointment) ── */}
                                        {!isDoctor && (
                                            <Button
                                                id={`btn-call-doctor-${session.id}`}
                                                className="flex-1 font-bold bg-teal hover:bg-teal/90 text-white shadow-sm"
                                                onClick={() => startSession.mutate(session.id)}
                                                disabled={isActivating}
                                            >
                                                {isActivating ? (
                                                    <><Loader2 size={15} className="mr-2 animate-spin" /> Calling...</>
                                                ) : (
                                                    <><PhoneCall size={15} className="mr-2" /> Call Doctor</>
                                                )}
                                            </Button>
                                        )}
                                        </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-1 md:col-span-2 text-center p-14 bg-[--surface] rounded-[--radius-md] border border-[--border]">
                        <div className="w-16 h-16 bg-[--surface-soft] text-[--text-muted] rounded-full flex items-center justify-center mx-auto mb-4 border border-[--border]">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[--text-primary]">No Virtual Calls Scheduled</h3>
                        <p className="text-sm text-[--text-secondary] font-medium mt-1">Your teleconsultation queue is empty.</p>
                    </div>
                )}
            </div>

            {/* ── Parent CTA ───────────────────────────────────────────────── */}
            {!isDoctor && (
                <div className="mt-8 text-center pt-6">
                    <Link to="/appointments">
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-md px-8 py-6 rounded-[--radius-md]">
                            <Calendar size={18} className="mr-2" /> Schedule New Virtual Appointment
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
};
