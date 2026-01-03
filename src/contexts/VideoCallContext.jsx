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

const VideoCallContext = createContext();

const VideoCallProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();

  const [myPeerId, setMyPeerId] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState('idle');

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const callTimerRef = useRef(null);
  const currentSessionRef = useRef(null);
  const remoteUserRef = useRef(null);

  // webRTC config
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    if (!socket || !isConnected || !currentUser) return;

    console.log('🎥 Registering for video calls...');

    socket.emit('video:register', {
      userId: currentUser.user_id,
      name: `${currentUser?.person?.first_name} ${currentUser?.person?.last_name}`,
      role: currentUser?.role,
      peerId: currentUser.user_uuid,
    });

    // listen for registration confirmation
    socket.on('video:registered', data => {
      console.log(data);
      setMyPeerId(data.peerId);
    });

    // listen for incoming calls
    socket.on('video:call-incoming', handleIncomingCall);

    // user call got accepted
    socket.on('video:call-accepted', handleAcceptedCall);

    // user call got rejected
    socket.on('video:call-rejected', handleCallRejected);

    // ice candidate
    socket.on('video:ice-candidate', handleRemoteICECandidate);

    // if other user ended the call
    socket.on('video:call-ended', handleRemoteCallEnded);

    // if something went wrong
    socket.on('video:call-error', handleCallError);

    // if users change or audio or video
    socket.on('video:media-peer-change', handlePeerMediaChange);

    return () => {
      socket.off('video:registered');
      socket.off('video:incoming-call');
      socket.off('video:call-accepted');
      socket.off('video:call-rejected');
      socket.off('video:ice-candidate');
      socket.off('video:call-ended');
      socket.off('video:call-error');
      socket.off('video:peer-media-change');

      cleanupCall();
    };
  }, [currentUser, socket, isConnected]);

  // media stream functions
  const startLocalStream = useCallback(async () => {
    try {
      console.log('🎥 Starting local stream...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      localStreamRef.current = stream;

      return stream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      toast.error(
        'Could not access camera/microphone. Please check permissions.'
      );
      throw error;
    }
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped track:', track.kind);
      });
      localStreamRef.current = null;
    }
  }, []);

  // peer connection setup
  const createPeerConnection = () => {
    console.log('🔗 Creating peer connection...');
    const pc = new RTCPeerConnection(rtcConfig);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
        console.log('➕ Added local track:', track.kind);
      });
    }

    // handle remote stream
    pc.ontrack = event => {
      console.log('📥 Received remote track:', event.track.kind);
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        console.log('✅ Remote stream set');
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = event => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate');
        socket.emit('video:ice-candidate', {
          to: remoteUserRef.current,
          candidate: event.candidate,
        });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('🔄 Connection state:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
        toast.success('Call connected!');
      } else if (pc.connectionState === 'failed') {
        toast.error('Connection failed');
        // endCall();
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', pc.iceConnectionState);
    };

    return pc;
  };

  // call the other user
  const handleCallUser = useCallback(async remotePeerId => {
    try {
      if (inCall) {
        toast.error('You are already in call.');
        return;
      }

      console.log(`📞 Calling user: ${remotePeerId}`);
      setCallStatus('calling');
      remoteUserRef.current = remotePeerId;

      // start local stream
      await startLocalStream();

      // create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log('📤 Created offer');
      console.log(myPeerId);
      // Send offer through signaling server
      socket.emit('video:call-user', {
        to: remotePeerId,
        offer,
        from: myPeerId,
        callerInfo: {
          name: `${currentUser.person?.first_name} ${currentUser.person?.last_name}`,
          role: currentUser.role,
        },
      });

      setInCall(true);
      toast('Calling...', { icon: '📞' });
    } catch (error) {
      console.error('❌ Error initiating call:', error);
      toast.error('Failed to start call');
      cleanupCall();
    }
  }, []);

  // getting called from another user
  const handleIncomingCall = useCallback(async data => {
    console.log('📞 Incoming call from:', data.from);
    console.log('Caller info:', data.callerInfo);

    setIncomingCall({
      from: data.from,
      offer: data.offer,
      sessionId: data.sessionId,
      callerInfo: data.callerInfo,
    });

    setCallStatus('ringing');

    toast('Incoming call from ' + data.callerInfo.name, {
      icon: '📞',
      duration: 3000,
    });
  }, []);

  // if another user answer the call
  const handleAnswerCall = useCallback(async () => {
    try {
      if (!incomingCall) return;

      console.log('✅ Answering call...');
      setCallStatus('connecting');

      remoteUserRef.current = incomingCall.from;
      currentSessionRef.current = incomingCall.sessionId;

      // Start local stream
      await startLocalStream();

      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;

      // Set remote description (the offer)
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('📤 Created answer');

      socket.emit('video:call-answered', {
        to: incomingCall.from,
        answer,
        sessionId: incomingCall.sessionId,
      });

      setInCall(true);
      setIncomingCall(null);
      startCallTimer('Call connected');

      toast.success('Call connected!');
    } catch (error) {
      console.error('❌ Error answering call:', error);
      toast.error('Failed to answer call');
      cleanupCall();
    }
  });

  // accept call from another user
  const handleAcceptedCall = useCallback(
    async data => {
      try {
        console.log('🎉 Call accepted!');

        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          console.log('📥 Set remote description (answer)');

          currentSessionRef.current = data.sessionId;
          startCallTimer();
          setCallStatus('connected');
        }
      } catch (error) {
        console.error('❌ Error handling call acceptance:', error);
        toast.error('Error connecting call');
      }
    },
    [socket]
  );

  // reject the call from another user
  const handleRejectCall = useCallback(() => {
    if (!incomingCall) return;

    console.log('❌ Rejecting call');

    socket.emit('video:call-rejected', {
      to: incomingCall.from,
      sessionId: incomingCall.sessionId,
      reason: 'Call declined.',
    });

    setIncomingCall(null);
    setCallStatus('idle');
    toast('Call rejected');
  }, [socket, incomingCall]);

  // manage the call by other user's rejection
  const handleCallRejected = useCallback(data => {
    console.log('❌ Call was rejected:', data.reason);
    toast.error(data.reason || 'Call was declined');
    cleanupCall();
  }, []);

  const handleRemoteICECandidate = useCallback(async data => {
    try {
      if (peerConnectionRef.current && data.candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
        console.log('🧊 Added remote ICE candidate');
      }
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }, []);

  // for ending the call
  const handleEndCall = useCallback(() => {
    console.log('📴 Ending call...');

    if (remoteUserRef.current) {
      socket.emit('video:end-call', {
        to: remoteUserRef.current,
        sessionId: currentSessionRef.current,
      });
    }

    cleanupCall();
    toast('Call ended');
  }, [socket]);

  // manage if other user ended the call
  const handleRemoteCallEnded = useCallback(() => {
    console.log('📴 Remote user ended call');
    toast('Call ended by other user');
    cleanupCall();
  }, []);

  // if the call error from both user
  const handleCallError = error => {
    console.error('❌ Call error:', error);
    toast.error(error.error || 'Call error occurred');
    cleanupCall();
  };

  // clean up or back from the start state.
  const cleanupCall = useCallback(() => {
    console.log('🧹 Cleaning up call...');

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    stopLocalStream();

    remoteStreamRef.current = null;
    remoteUserRef.current = null;
    currentSessionRef.current = null;

    setInCall(false);
    setCallStatus('idle');
    setCallDuration(0);
    setIncomingCall(null);
    setIsMuted(false);
    setIsVideoOff(false);

    if (callTimerRef.current) {
      callTimerRef.current = null;
    }
  }, [stopLocalStream]);

  const startCallTimer = () => {
    callTimerRef.current = setInterval(
      () => setCallDuration(prev => prev + 1),
      1000
    );
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const newMutedState = !audioTrack.enabled;

        setIsMuted(newMutedState);

        // notify the other user that the current user is changing the mute detail
        if (remoteStreamRef.current) {
          socket.emit('video:media-change', {
            to: remoteStreamRef.current,
            type: 'audio',
            enabled: audioTrack.enabled,
          });
        }

        toast(newMutedState ? 'Microphone muted' : 'Microphone unmuted', {
          icon: newMutedState ? '🔇' : '🔊',
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const newVideoOffState = !videoTrack.enabled;

        setIsVideoOff(newVideoOffState);

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

  const handlePeerMediaChange = data => {
    console.log('🎛️ Peer media change:', data);
    // You can use this to show UI indicators that peer muted/disabled video
  };

  const value = {
    // states
    myPeerId,
    inCall,
    isMuted,
    isVideoOff,
    callDuration,
    incomingCall,
    callStatus,

    // ref
    localStreamRef,
    remoteStreamRef,

    // functions
    handleCallUser,
    handleAnswerCall,
    handleRejectCall,
    handleEndCall,
    toggleMute,
    toggleVideo,
    startLocalStream,
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
    console.log('useVideoCall must be use within VideoCall Provider');
  }

  return context;
};

export default VideoCallProvider;
