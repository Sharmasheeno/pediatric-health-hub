import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/axios';
import { useWebRTC } from '../../hooks/useWebRTC';
import useAuthStore from '../../store/authStore';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  Shield, WifiOff, Loader2, UserCircle2
} from 'lucide-react';

export const TeleconsultSession = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isDoctor = user?.role === 'DOCTOR';

  const {
    localRef,
    remoteRef,
    isMuted,
    isVideoOff,
    toggleMic,
    toggleCamera,
    endCall,
    connectionState,
  } = useWebRTC(appointmentId, user?.role);

  // When the doctor ends a call, also mark it as ended on the backend
  const handleEndCall = async () => {
    endCall();
    if (isDoctor) {
      try {
        await api.patch(`/teleconsultations/${appointmentId}/end`, {
          notes: 'Session concluded by provider.'
        });
      } catch (e) {
        console.error('Failed to log session end:', e);
      }
    }
    navigate('/teleconsult');
  };

  // If disconnected after being connected, go back
  useEffect(() => {
    if (connectionState === 'disconnected') {
      const timer = setTimeout(() => navigate('/teleconsult'), 4000);
      return () => clearTimeout(timer);
    }
  }, [connectionState, navigate]);

  return (
    <div className="w-full h-[calc(100vh-88px)] bg-[#0d1117] flex flex-col overflow-hidden rounded-xl relative">

      {/* ── Top Status Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#161b22] border-b border-white/5 z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Shield size={16} className="text-[#14c39a]" />
          <span className="text-[#14c39a] text-sm font-bold tracking-wide">
            Encrypted P2P Session
          </span>
          <span className="text-slate-500 text-xs font-mono">· Room: {appointmentId?.slice(0, 12)}…</span>
        </div>

        {/* Connection state pill */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
          connectionState === 'connected'
            ? 'bg-[#14c39a]/15 text-[#14c39a]'
            : connectionState === 'disconnected'
            ? 'bg-red-500/15 text-red-400'
            : 'bg-yellow-500/15 text-yellow-400'
        }`}>
          {connectionState === 'connected' && <span className="w-2 h-2 rounded-full bg-[#14c39a] animate-pulse" />}
          {connectionState === 'connecting' && <Loader2 size={12} className="animate-spin" />}
          {connectionState === 'disconnected' && <WifiOff size={12} />}
          {connectionState === 'connected'    ? 'Live'       :
           connectionState === 'connecting'   ? 'Connecting' :
           'Call Ended — Returning...'}
        </div>
      </div>

      {/* ── Video Grid ──────────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-[#0d1117]">

        {/* Remote Video (full screen background) */}
        <video
          ref={remoteRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Remote video placeholder when not yet connected */}
        {connectionState !== 'connected' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#0d1117]">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <UserCircle2 size={56} className="text-white/20" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white/60 font-semibold text-lg">
                {connectionState === 'connecting'
                  ? `Waiting for ${isDoctor ? 'patient' : 'doctor'} to join...`
                  : 'Call has ended'}
              </p>
              {connectionState === 'connecting' && (
                <div className="flex items-center justify-center gap-2 text-[#14c39a] text-sm">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Establishing encrypted tunnel...</span>
                </div>
              )}
              {connectionState === 'disconnected' && (
                <p className="text-red-400/80 text-sm">
                  Redirecting you back in a moment...
                </p>
              )}
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture corner) */}
        <div className="absolute bottom-4 right-4 w-44 h-32 sm:w-56 sm:h-40 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/50 bg-[#161b22] group">
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#161b22]">
              <VideoOff size={28} className="text-white/30" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-widest text-white/50 bg-black/40 px-2 py-0.5 rounded-full">
            You
          </div>
        </div>
      </div>

      {/* ── Control Bar ─────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#161b22] border-t border-white/5 px-6 py-4">
        <div className="flex items-center justify-center gap-4">

          {/* Mic toggle */}
          <button
            id="btn-toggle-mic"
            onClick={toggleMic}
            title={isMuted ? 'Unmute' : 'Mute'}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 ${
              isMuted
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 focus:ring-red-500/20'
                : 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/10'
            }`}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Camera toggle */}
          <button
            id="btn-toggle-camera"
            onClick={toggleCamera}
            title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 ${
              isVideoOff
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 focus:ring-red-500/20'
                : 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/10'
            }`}
          >
            {isVideoOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>

          {/* End call — always visible, prominent */}
          <button
            id="btn-end-call"
            onClick={handleEndCall}
            title="End call"
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/30"
          >
            <PhoneOff size={26} />
          </button>
        </div>

        {/* Role label */}
        <p className="text-center text-white/25 text-xs font-medium mt-3 tracking-wide">
          {isDoctor
            ? '"Terminate Session For All" — ends the room for both parties'
            : 'Click the red button to leave the call'}
        </p>
      </div>
    </div>
  );
};
