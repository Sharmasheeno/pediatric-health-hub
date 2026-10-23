import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SIGNAL_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

// Google's free public STUN servers — enable NAT traversal on local network
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

/**
 * useWebRTC
 *
 * @param {string} roomId     - The appointmentId, used as the Socket.IO room name
 * @param {string} userRole   - 'DOCTOR' | 'PARENT' — doctor always creates the offer
 * @returns {{ localRef, remoteRef, isMuted, isVideoOff, toggleMic, toggleCamera, endCall, connectionState, remoteUserRole }}
 */
export function useWebRTC(roomId, userRole) {
  const localRef      = useRef(null);  // <video> element for self-view
  const remoteRef     = useRef(null);  // <video> element for remote peer

  const socketRef     = useRef(null);
  const pcRef         = useRef(null);  // RTCPeerConnection
  const localStream   = useRef(null);
  const pendingIce    = useRef([]);    // Buffer ICE candidates before remote description is set

  const [isMuted,         setIsMuted]         = useState(false);
  const [isVideoOff,      setIsVideoOff]      = useState(false);
  const [connectionState, setConnectionState] = useState('connecting'); // connecting | connected | disconnected
  const [remoteUserRole,  setRemoteUserRole]  = useState(null);
  const [callError, setCallError] = useState('');

  // ── Helpers ────────────────────────────────────────────────────────────────
  const createPeerConnection = useCallback((socket) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Send our ICE candidates to the signaling server
    pc.onicecandidate = ({ candidate }) => {
      if (candidate && socket.data?.peerId) {
        socket.emit('ice-candidate', { target: socket.data.peerId, candidate });
      }
    };

    // When the remote track arrives, attach it to the <video> element
    pc.ontrack = (event) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = event.streams[0];
      }
      setConnectionState('connected');
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setConnectionState('disconnected');
      }
    };

    return pc;
  }, []);

  const flushPendingIce = useCallback(async () => {
    while (pendingIce.current.length > 0) {
      const candidate = pendingIce.current.shift();
      try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* ignore */ }
    }
  }, []);

  // ── Main effect: set up socket, media, and peer connection ─────────────────
  useEffect(() => {
    if (!roomId || !userRole) return;

    let isCancelled = false;
    setConnectionState('connecting');
    setCallError('');
    setRemoteUserRole(null);

    const init = async () => {
      // 1. Acquire local camera + microphone
      let stream;
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera and microphone access requires a secure HTTPS connection and a supported browser.');
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch (err) {
        console.error('[WebRTC] getUserMedia failed:', err);
        setCallError(err.name === 'NotAllowedError'
          ? 'Allow camera and microphone access in your browser to join the video call.'
          : err.message || 'Camera or microphone could not be started.');
        setConnectionState('disconnected');
        return;
      }

      localStream.current = stream;
      if (localRef.current) {
        localRef.current.srcObject = stream;
      }
      if (isCancelled) { stream.getTracks().forEach(t => t.stop()); return; }

      // 2. Connect to the signaling server
      const token = useAuthStore.getState().token;
      const socket = io(SIGNAL_URL, { auth: { token }, transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect_error', (err) => {
        console.error('[WebRTC] Signaling connection failed:', err.message);
        setCallError(err.message || 'Could not connect to the secure call service.');
        setConnectionState('disconnected');
      });
      socket.on('room-error', ({ message }) => {
        setCallError(message || 'You could not join this call.');
        setConnectionState('disconnected');
      });

      socket.on('connect', () => {
        console.log('[WebRTC] Signaling socket connected:', socket.id);
        socket.emit('join-room', { roomId, userRole });
      });

      // 3. Create the RTCPeerConnection
      const pc = createPeerConnection(socket);
      pcRef.current = pc;

      // Add local tracks to the peer connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // ── Signaling events ─────────────────────────────────────────────────────

      // Someone already in the room → WE initiate the offer
      socket.on('room-peers', async ({ peers }) => {
        if (peers.length > 0) {
          const peerId = peers[0];
          socket.data = { peerId };

          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { target: peerId, offer });
          console.log('[WebRTC] Sent offer to', peerId);
        }
      });

      // A new peer joined → they will send us an offer, so just record their ID
      socket.on('peer-joined', ({ socketId, userRole: role }) => {
        socket.data = { peerId: socketId };
        setRemoteUserRole(role);
        console.log('[WebRTC] Peer joined:', socketId, role);
      });

      // Received an offer → send back an answer
      socket.on('offer', async ({ from, offer }) => {
        socket.data = { peerId: from };
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushPendingIce();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { target: from, answer });
        console.log('[WebRTC] Sent answer to', from);
      });

      // Received an answer to our offer
      socket.on('answer', async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushPendingIce();
        console.log('[WebRTC] Remote description set from answer');
      });

      // Received an ICE candidate from the peer
      socket.on('ice-candidate', async ({ from, candidate }) => {
        socket.data = socket.data || { peerId: from };
        if (pc.remoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); }
          catch { /* ignore benign errors */ }
        } else {
          pendingIce.current.push(candidate); // buffer until remote desc is ready
        }
      });

      // Peer left the call
      socket.on('peer-left', () => {
        console.log('[WebRTC] Peer left the room');
        setConnectionState('disconnected');
        if (remoteRef.current) remoteRef.current.srcObject = null;
      });
    };

    init();

    // Cleanup when component unmounts or roomId changes
    return () => {
      isCancelled = true;
      localStream.current?.getTracks().forEach(t => t.stop());
      pcRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [roomId, userRole, createPeerConnection, flushPendingIce]);

  // ── Controls ────────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const audioTrack = localStream.current?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMuted(prev => !prev);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const videoTrack = localStream.current?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOff(prev => !prev);
    }
  }, []);

  const endCall = useCallback(() => {
    if (roomId) socketRef.current?.emit('leave-room', { roomId });
    localStream.current?.getTracks().forEach(t => t.stop());
    pcRef.current?.close();
    socketRef.current?.disconnect();
    setConnectionState('disconnected');
  }, [roomId]);

  return {
    localRef,
    remoteRef,
    isMuted,
    isVideoOff,
    callError,
    toggleMic,
    toggleCamera,
    endCall,
    connectionState,
    remoteUserRole,
  };
}
