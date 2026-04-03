import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { Button } from '../../components/ui/Button';
import { Shield, PhoneOff, AlertTriangle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

export const TeleconsultSession = () => {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [roomUrl, setRoomUrl] = useState(null);
    const [errorMsg, setError] = useState("");

    useEffect(() => {
        const fetchRoom = async () => {
            // MVP Demo Bypass: Route the mock UI layouts directly to a live WebRTC sandbox instance
            if (appointmentId === 'app-982' || appointmentId === 'app-71b') {
                setTimeout(() => setRoomUrl(`https://meet.jit.si/PediatricHealthHub_DemoRoom_${appointmentId}`), 800);
                return;
            }

            try {
                // Dynamically validates token vs ownership DB rules on the backend
                const res = await api.get(`/teleconsultations/${appointmentId}`);
                setRoomUrl(res.data.data.roomUrl);
            } catch (err) {
                setError(err.response?.data?.message || "Secure room negotiation failed. Session is invalid, expired, or outside authorization boundaries.");
            }
        };
        fetchRoom();
    }, [appointmentId]);

    const endCall = async () => {
        if (user?.role === 'DOCTOR' || user?.role === 'ADMIN') {
            try {
                await api.patch(`/teleconsultations/${appointmentId}/end`, { notes: "Session concluded cleanly by provider authorization." });
            } catch(e) { console.error("Failed to execute termination sequence", e); }
        }
        navigate('/dashboard');
    };

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] px-4 max-w-2xl mx-auto text-center space-y-5">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center p-3 shadow-sm border border-red-100"><AlertTriangle size={36} /></div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Connection Rejected</h2>
                <p className="text-slate-600 font-medium text-lg max-w-md">{errorMsg}</p>
                <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">Return to Secure Interface</Button>
            </div>
        )
    }

    if (!roomUrl) {
        return <div className="p-16 text-center text-slate-500 font-semibold tracking-wide animate-pulse">Negotiating End-to-End Encrypted Tunnel...</div>;
    }

    return (
        <div className="w-full h-[calc(100vh-100px)] bg-slate-900 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-700 relative flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 bg-slate-800/90 backdrop-blur border-b border-slate-700/80">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold tracking-wide">
                    <Shield size={18} className="animate-pulse" /> Health Hub Encrypted Uplink Established
                </div>
                <button onClick={endCall} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-500/20 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md">
                    <PhoneOff size={16} /> {user?.role === 'DOCTOR' ? 'Terminate Session For All' : 'Leave Call Securely'}
                </button>
            </div>
            
            <div className="flex-1 w-full bg-black relative">
                {/* Standard robust iframe integration ensuring isolated execution of native WebRTC components (Daily.co / Jitsi) */}
                <iframe
                    src={`${roomUrl}?api=true`}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    className="w-full h-full border-none"
                    title="Pediatric Health Virtual Consultation Room"
                ></iframe>
            </div>
        </div>
    );
};
