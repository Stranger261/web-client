import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { toast } from 'react-hot-toast';
import videoApi from '../services/videoApi';
import { useNavigate } from 'react-router';

const VideoCallContext = createContext();

const VideoCallProvider = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();

  // State
  const [myPeerId, setMyPeerId] = useState(null);
  const [mySocketId, setMySocketId] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [canRejoin, setCanRejoin] = useState(false);
  const [roomParticipants, setRoomParticipants] = useState([]);
  const [localStreamReady, setLocalStreamReady] = useState(false);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const [scheduledDuration, setScheduledDuration] = useState(30);

  // Refs
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);
  const currentRoomRef = useRef(null);
  const remoteUserRef = useRef(null);
  const toastShownRef = useRef({
    callStarted: false,
    videoConnected: false,
  });

  const name = `${currentUser?.person?.first_name} ${currentUser?.person?.last_name}`;

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  // Socket event handlers
  useEffect(() => {
    if (!socket || !isConnected || !currentUser) return;

    socket.emit('video:register', {
      userId: currentUser.user_id,
      name,
      role: currentUser.role,
      peerId: currentUser.user_uuid,
    });

    socket.on('video:registered', data => {
      setMyPeerId(data.peerId);
      setMySocketId(data.socketId);
    });

    socket.on('video:room-users-updated', async data => {
      setRoomParticipants(data.participants);

      if (data.participantsCount >= 2) {
        if (!inCall) {
          setInCall(true);
          startCallTimer();

          // ✅ Show toast only once
          if (!toastShownRef.current.callStarted) {
            toast.success('Call started');
            toastShownRef.current.callStarted = true;
          }
        }

        // Skip if peer connection already exists and is connected
        if (peerConnectionRef.current) {
          const state = peerConnectionRef.current.connectionState;
          if (state === 'connected' || state === 'connecting') {
            return;
          } else {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
          }
        }

        const myIndex = data.participants.findIndex(
          p => p.socketId === socket.id,
        );
        const otherUser = data.participants.find(p => p.socketId !== socket.id);

        // Only User #1 creates offer
        if (myIndex === 0 && otherUser && localStreamRef.current) {
          const pc = createPeerConnection(otherUser.socketId, data.roomId);
          peerConnectionRef.current = pc;
          currentRoomRef.current = data.roomId;
          remoteUserRef.current = otherUser.socketId;
          setCallStatus('connecting');

          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket.emit('video:offer', {
              roomId: data.roomId,
              to: otherUser.socketId,
              offer,
            });
          } catch (error) {
            console.error('❌ Offer error:', error);
          }
        } else if (myIndex === 1) {
          setCallStatus('connecting');
        }
      } else {
        setCallStatus('waiting');
        if (inCall) {
          toast('Waiting for other participant...');
        }
      }
    });

    socket.on('video:offer', async data => {
      // Clean up existing connection if any
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (localStreamRef.current) {
        const pc = createPeerConnection(data.from, data.roomId);
        peerConnectionRef.current = pc;
        currentRoomRef.current = data.roomId;
        remoteUserRef.current = data.from;

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

          // Process queued ICE candidates
          if (pc.pendingCandidates?.length > 0) {
            for (const candidate of pc.pendingCandidates) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pc.pendingCandidates = [];
          }

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('video:answer', {
            roomId: data.roomId,
            to: data.from,
            answer,
          });
        } catch (error) {
          console.error('❌ Answer error:', error);
        }
      }
    });

    socket.on('video:answer', async data => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer),
          );

          // Process queued ICE candidates
          const pc = peerConnectionRef.current;
          if (pc.pendingCandidates?.length > 0) {
            for (const candidate of pc.pendingCandidates) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            pc.pendingCandidates = [];
          }
        } catch (error) {
          console.error('❌ Answer error:', error);
        }
      }
    });

    socket.on('video:user-left', data => {
      if (data.isDisconnect) {
        toast(`${data.name} disconnected`, { icon: '🔌' });
      } else {
        toast(`${data.name} left the call`);
      }

      setCallStatus('waiting');
      setRemoteStreamReady(false);
      remoteStreamRef.current = null;

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      remoteUserRef.current = null;
    });

    socket.on('video:ice-candidate', handleRemoteICECandidate);

    return () => {
      socket.off('video:registered');
      socket.off('video:room-users-updated');
      socket.off('video:user-left');
      socket.off('video:offer');
      socket.off('video:answer');
      socket.off('video:ice-candidate');
    };
  }, [currentUser, socket, isConnected, inCall]);

  // Media stream functions
  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;
      setLocalStreamReady(true);
      return stream;
    } catch (error) {
      console.error('❌ Media error:', error);
      toast.error('Could not access camera/microphone');
      throw error;
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setLocalStreamReady(false);
    }
  }, []);

  const handleRemoteICECandidate = useCallback(async data => {
    try {
      if (peerConnectionRef.current && data.candidate) {
        if (peerConnectionRef.current.remoteDescription) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(data.candidate),
          );
        } else {
          // Queue candidates if remote description not set yet
          if (!peerConnectionRef.current.pendingCandidates) {
            peerConnectionRef.current.pendingCandidates = [];
          }
          peerConnectionRef.current.pendingCandidates.push(data.candidate);
        }
      }
    } catch (error) {
      console.error('❌ ICE error:', error);
    }
  }, []);

  const createPeerConnection = useCallback(
    (otherSocketId, roomId) => {
      const pc = new RTCPeerConnection(rtcConfig);

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle remote tracks
      pc.ontrack = event => {
        if (event.streams?.[0]) {
          remoteStreamRef.current = event.streams[0];
          setRemoteStreamReady(true);
          setCallStatus('connected');

          // ✅ Show toast only once
          if (!toastShownRef.current.videoConnected) {
            toast.success('Video connected');
            toastShownRef.current.videoConnected = true;
          }
        }
      };

      // ICE candidates
      pc.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('video:ice-candidate', {
            roomId,
            to: otherSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Connection state
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') {
          toast.error('Connection failed');
        } else if (pc.connectionState === 'disconnected') {
          console.log('⚠️ Peer disconnected');
        }
      };

      return pc;
    },
    [socket],
  );

  const cleanupCall = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    stopLocalStream();

    remoteStreamRef.current = null;
    remoteUserRef.current = null;
    currentRoomRef.current = null;

    setInCall(false);
    setCallStatus('idle');
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setRemoteStreamReady(false);
    setLocalStreamReady(false);

    // Reset toast flags
    toastShownRef.current = {
      callStarted: false,
      videoConnected: false,
    };
  }, [stopLocalStream]);

  const startCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = setInterval(
      () => setCallDuration(prev => prev + 1),
      1000,
    );
  };

  const handleEndCall = useCallback(() => {
    if (remoteUserRef.current) {
      socket.emit('video:end-call', {
        to: remoteUserRef.current,
        sessionId: currentRoomRef.current,
      });
    }
    cleanupCall();
  }, [socket, cleanupCall]);

  // API functions
  const getTodaysOnlineConsultation = async filters => {
    try {
      return await videoApi.getTodaysOnlineConsultation(filters);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to get consultations',
      );
      throw error;
    }
  };

  const joinRoom = async data => {
    try {
      setIsLoading(true);
      setCallStatus('connecting');

      // ✅ Check room status first
      const roomStatus = await checkRoomStatus(data.roomId);
      const status = roomStatus.data;

      if (!status.exists) {
        toast.error('Consultation room not found');
        navigate(`/${currentUser.role}/video-call`, { replace: true });
        setIsLoading(false);
        return;
      }

      if (status.isCompleted) {
        toast.error('This consultation has ended');
        navigate(`/${currentUser.role}/video-call`, { replace: true });
        setIsLoading(false);
        return;
      }

      if (status.canRejoin) {
        setIsLoading(false);
        await rejoinRoom({
          roomId: data.roomId,
          socketId: data.mySocketId,
          peerId: data.myPeerId,
        });
        return;
      }

      if (!status.canJoin) {
        toast.error('Cannot join this consultation');
        navigate(`/${currentUser.role}/video-call`, { replace: true });
        setIsLoading(false);
        return;
      }

      // ✅ Room is valid, proceed with join
      const joinedRoom = await videoApi.joinRoom({
        peerId: data.myPeerId,
        socketId: data.mySocketId,
        roomId: data.roomId,
      });

      if (joinedRoom.success) {
        await startLocalStream();
        socket.emit('video:join-room', { roomId: data.roomId });
        setScheduledDuration(data.scheduledDuration || 30);
        setCallStatus('waiting');
        toast.success('Joined consultation');
      }

      return joinedRoom;
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Failed to join';
      toast.error(errorMsg);

      if (error?.response?.status === 403 || error?.response?.status === 404) {
        navigate(`/${currentUser.role}/video-call`, { replace: true });
      }

      setCallStatus('idle');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = async ({ roomId, duration }) => {
    try {
      socket.emit('video:leave-room', { roomId });
      const leftRoom = await videoApi.leaveRoom({ roomId, duration });

      const message = leftRoom.data?.consultationEnded
        ? 'Consultation ended'
        : 'Left consultation';
      toast.success(message);

      handleEndCall();
      navigate(`/${currentUser.role}/video-call`, { replace: true });

      return leftRoom;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to leave');
      console.error(error);
    }
  };

  const rejoinRoom = async ({ roomId, socketId, peerId }) => {
    try {
      setIsLoading(true);
      setCanRejoin(false);

      // Clean up any existing peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Reset remote stream
      if (remoteStreamRef.current) {
        remoteStreamRef.current = null;
        setRemoteStreamReady(false);
      }

      // Reset refs
      remoteUserRef.current = null;
      currentRoomRef.current = null;

      // Reset toast flags to allow new toasts
      toastShownRef.current = {
        callStarted: false,
        videoConnected: false,
      };

      const rejoinedRoom = await videoApi.rejoinRoom({
        roomId,
        socketId,
        peerId,
      });

      if (rejoinedRoom.success) {
        // Start fresh local stream if not exists
        if (!localStreamRef.current) {
          await startLocalStream();
        }

        // Emit join event to trigger room update
        socket.emit('video:join-room', { roomId });

        setCallStatus('waiting');
        navigate(`/${currentUser?.role}/video-call/${roomId}`, {
          replace: true,
        });
        toast.success('Reconnected to consultation');
      }

      return rejoinedRoom;
    } catch (error) {
      console.error('Rejoin error:', error);
      toast.error('Failed to reconnect');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkRoomStatus = async roomId => {
    try {
      return await videoApi.checkRoomStatus(roomId);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to check status');
      throw error;
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);

        if (remoteUserRef.current) {
          socket.emit('video:media-change', {
            to: remoteUserRef.current,
            type: 'audio',
            enabled: audioTrack.enabled,
          });
        }

        const message = audioTrack.enabled ? 'Microphone on' : 'Microphone off';
        toast(message, {
          icon: audioTrack.enabled ? '🔊' : '🔇',
          duration: 1500,
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);

        if (remoteUserRef.current) {
          socket.emit('video:media-change', {
            to: remoteUserRef.current,
            type: 'video',
            enabled: videoTrack.enabled,
          });
        }
      }
    }
  };

  const value = {
    myPeerId,
    mySocketId,
    inCall,
    isMuted,
    isVideoOff,
    callDuration,
    callStatus,
    canRejoin,
    scheduledDuration,
    isLoading,
    roomParticipants,
    localStreamRef,
    remoteStreamRef,
    localStreamReady,
    remoteStreamReady,
    handleEndCall,
    toggleMute,
    toggleVideo,
    startLocalStream,
    getTodaysOnlineConsultation,
    joinRoom,
    leaveRoom,
    rejoinRoom,
    checkRoomStatus,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error('useVideoCall must be used within VideoCallProvider');
  }
  return context;
};

export default VideoCallProvider;
