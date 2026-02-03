import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  Clock,
  AlertCircle,
  Loader,
  LogIn,
  Calendar,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { useSocket } from '../../contexts/SocketContext';
import { DEVELOPMENT_BASE_URL, GRADIENTS } from '../../configs/CONST';
import { LoadingOverlay } from '../ui/loading-overlay';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();
  const { currentUser } = useAuth();
  const {
    myPeerId,
    mySocketId,
    inCall,
    isMuted,
    isVideoOff,
    callDuration,
    callStatus,
    isLoading,
    scheduledDuration,
    localStreamRef,
    remoteStreamRef,
    localStreamReady,
    remoteStreamReady,
    toggleMute,
    toggleVideo,
    joinRoom,
    rejoinRoom,
    leaveRoom,
    getTodaysOnlineConsultation,
    checkRoomStatus,
  } = useVideoCall();

  // UI Control States
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [roomInput, setRoomInput] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // ✅ Room Status State - Controls what UI to show
  const [roomStatus, setRoomStatus] = useState(null); // null = not checked yet
  const [checkingStatus, setCheckingStatus] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const isNavigatingAwayRef = useRef(false);
  const hasJoinedRef = useRef(false);

  const userName = `${currentUser?.person?.first_name || ''} ${
    currentUser?.person?.last_name || ''
  }`;
  const isDoctor = currentUser?.role === 'doctor';

  // ✅ Check room status when roomId exists
  useEffect(() => {
    if (roomId && myPeerId && mySocketId && !roomStatus && !checkingStatus) {
      checkStatus();
    }
  }, [roomId, myPeerId, mySocketId]);

  const checkStatus = async () => {
    try {
      setCheckingStatus(true);

      const response = await checkRoomStatus(roomId);
      const status = response.data;

      setRoomStatus(status);

      // ✅ Handle different scenarios based on status
      if (!status.exists) {
        toast.error('Consultation room not found');
        navigate(`/${currentUser.role}/video-call`, { replace: true });
        return;
      }

      if (status.isCompleted) {
        toast.error('This consultation has already ended');
        navigate(`/${currentUser.role}/video-call`, { replace: true });
        return;
      }

      // ✅ Auto-join if allowed and not already joined
      if (status.canJoin && !hasJoinedRef.current) {
        hasJoinedRef.current = true;
        await joinRoom({
          roomId,
          myPeerId,
          mySocketId,
          scheduledDuration: 30,
        });
      }

      // ✅ If canRejoin, just show the rejoin UI (handled in render)
    } catch (error) {
      console.error('Failed to check room status:', error);
      toast.error('Failed to check room status');
      navigate(`/${currentUser.role}/video-call`, { replace: true });
    } finally {
      setCheckingStatus(false);
    }
  };

  // Reset status when room changes
  useEffect(() => {
    return () => {
      setRoomStatus(null);
      setCheckingStatus(false);
      hasJoinedRef.current = false;
    };
  }, [roomId]);

  // Handle navigation away and page refresh
  useEffect(() => {
    if (!socket || !roomId || !mySocketId || !currentUser) return;
    if (!inCall && callStatus !== 'waiting' && callStatus !== 'connecting')
      return;

    const handleBeforeUnload = e => {
      console.log('🔄 Page unloading');

      socket.emit('video:force-disconnect', {
        socketId: mySocketId,
        userId: currentUser.user_id,
        userType: currentUser.role,
        roomId: roomId,
      });

      const apiUrl = `${DEVELOPMENT_BASE_URL}/api/v1/online-video/disconnected-user`;
      const payload = JSON.stringify({
        socketId: mySocketId,
        userId: currentUser.user_id,
        userType: currentUser.role,
      });

      navigator.sendBeacon(
        apiUrl,
        new Blob([payload], { type: 'application/json' }),
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      if (!isNavigatingAwayRef.current && socket.connected) {
        console.log('🚪 Navigating away from video call');
        socket.emit('video:force-disconnect', {
          socketId: mySocketId,
          userId: currentUser.user_id,
          userType: currentUser.role,
          roomId: roomId,
        });
      }
    };
  }, [socket, roomId, mySocketId, currentUser, inCall, callStatus]);

  useEffect(() => {
    const unlisten = () => {
      isNavigatingAwayRef.current = true;
    };
    return unlisten;
  }, [location]);

  // Load available rooms
  useEffect(() => {
    if (isDoctor && !roomId) {
      loadAvailableRooms();
    }
  }, [isDoctor, roomId]);

  const loadAvailableRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await getTodaysOnlineConsultation();
      setAvailableRooms(response.data || []);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Attach local video
  useEffect(() => {
    if (localStreamReady && localStreamRef.current && localVideoRef.current) {
      console.log('🎥 Attaching local stream');
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(err => {
        console.error('❌ Local video play error:', err);
      });
    }
  }, [localStreamReady]);

  // Attach remote video
  useEffect(() => {
    if (
      remoteStreamReady &&
      remoteStreamRef.current &&
      remoteVideoRef.current
    ) {
      console.log('🎥 Attaching remote stream');
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      remoteVideoRef.current.play().catch(err => {
        console.error('❌ Remote video play error:', err);
      });
    }
  }, [remoteStreamReady]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (inCall) setShowControls(false);
    }, 3000);
  };

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const remaining = scheduledDuration * 60 - callDuration;
    if (callDuration > scheduledDuration * 60) return 'text-red-500';
    if (remaining < 60) return 'text-red-400';
    if (remaining < 300) return 'text-yellow-400';
    return 'text-green-400';
  };

  const handleJoinRoom = room => {
    navigate(`/${currentUser?.role}/video-call/${room.room_id}`, {
      replace: true,
    });
  };

  // ✅ RENDERING LOGIC BASED ON ROOM STATUS

  // 1. Checking room status
  if (roomId && (checkingStatus || !roomStatus)) {
    return (
      <LoadingOverlay
        isLoading={true}
        message="Checking room status..."
        type="fullscreen"
      />
    );
  }

  // 2. Connecting/Loading
  if (isLoading) {
    return (
      <LoadingOverlay
        isLoading={true}
        message="Connecting to consultation..."
        type="fullscreen"
      />
    );
  }

  // 3. Can rejoin - show rejoin prompt
  if (roomId && roomStatus?.canRejoin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            You Left the Call
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You can rejoin if the other participant is still connected.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigate(`/${currentUser.role}/video-call`, { replace: true });
              }}
              className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Go Back
            </button>
            <button
              onClick={async () => {
                hasJoinedRef.current = true;
                await rejoinRoom({ roomId, myPeerId, mySocketId });
                setRoomStatus({
                  ...roomStatus,
                  canRejoin: false,
                  canJoin: true,
                });
              }}
              className="flex-1 px-6 py-3 rounded-lg text-white font-medium"
              style={{ background: GRADIENTS.primary }}
            >
              Rejoin Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. No roomId - show join/select page
  if (!roomId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
              {isDoctor ? 'Your Consultations' : 'Join Consultation'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {isDoctor
                ? 'Select a scheduled consultation to start'
                : 'Enter the room code provided by your doctor'}
            </p>

            {isDoctor ? (
              <div>
                {loadingRooms ? (
                  <div className="text-center py-12">
                    <Loader className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                  </div>
                ) : availableRooms.length > 0 ? (
                  <div className="space-y-3">
                    {availableRooms.map(room => (
                      <button
                        key={room.room_id}
                        onClick={() => handleJoinRoom(room)}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ background: GRADIENTS.primary }}
                            >
                              {room.patient_name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {room.patient_name}
                                </h3>
                                {room.is_active && (
                                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {room.appointment_time?.substring(0, 5)}
                                </span>
                                <span>{room.duration} min</span>
                                {room.reason && (
                                  <span className="text-xs">
                                    • {room.reason}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <LogIn className="h-5 w-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No scheduled consultationss for today</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomInput}
                    onChange={e => setRoomInput(e.target.value)}
                    onKeyPress={e => {
                      if (e.key === 'Enter' && roomInput.trim()) {
                        navigate(
                          `/${currentUser?.role}/video-call/${roomInput}`,
                          { replace: true },
                        );
                      }
                    }}
                    placeholder="Enter room code (e.g., room-123_456)"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => {
                    if (roomInput.trim()) {
                      navigate(
                        `/${currentUser?.role}/video-call/${roomInput}`,
                        { replace: true },
                      );
                    }
                  }}
                  disabled={!roomInput.trim()}
                  className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: roomInput.trim()
                      ? GRADIENTS.primary
                      : '#9CA3AF',
                  }}
                >
                  Join Consultation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. ✅ Can join or already joined - show video interface
  if (
    roomId &&
    (roomStatus?.canJoin ||
      inCall ||
      callStatus === 'waiting' ||
      callStatus === 'connecting')
  ) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto p-6">
          <div
            ref={containerRef}
            className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative"
            style={{ height: 'calc(100vh - 3rem)' }}
            onMouseMove={handleMouseMove}
          >
            {/* Remote Video */}
            <div className="absolute inset-0">
              {remoteStreamReady ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin mx-auto mb-6 text-blue-500" />
                    <div
                      className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-5xl font-bold"
                      style={{ background: GRADIENTS.primary }}
                    >
                      {userName.charAt(0)}
                    </div>
                    <p className="text-white text-xl mb-3">
                      Waiting for other participant...
                    </p>
                    <p className="text-gray-400 text-sm">
                      {callStatus === 'connecting'
                        ? 'Establishing connection...'
                        : 'Preparing video call...'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Local Video PIP */}
            <div className="absolute top-4 right-4 w-48 md:w-64 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
              <div className="aspect-video bg-gray-900 relative">
                {localStreamReady ? (
                  <>
                    <video
                      ref={localVideoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                    {isVideoOff && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                          style={{ background: GRADIENTS.primary }}
                        >
                          {userName.charAt(0)}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <Loader className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Top Bar */}
            <div
              className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 z-20 transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        callStatus === 'connected'
                          ? 'bg-green-500 animate-pulse'
                          : callStatus === 'connecting'
                            ? 'bg-yellow-500 animate-pulse'
                            : 'bg-gray-500'
                      }`}
                    />
                    <span className="text-white text-sm capitalize">
                      {callStatus}
                    </span>
                  </div>
                  {inCall && (
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full backdrop-blur-sm">
                      <Clock className="h-4 w-4 text-white" />
                      <span className={`font-mono text-sm ${getTimeColor()}`}>
                        {formatDuration(callDuration)}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={toggleFullScreen}
                  className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm transition-colors"
                >
                  {isFullScreen ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Controls */}
            <div
              className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 z-20 transition-opacity ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`p-4 rounded-full ${
                    isMuted ? 'bg-red-500' : 'bg-white/20'
                  } text-white hover:scale-110 transition-all backdrop-blur-md`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full ${
                    isVideoOff ? 'bg-red-500' : 'bg-white/20'
                  } text-white hover:scale-110 transition-all backdrop-blur-md`}
                  title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? (
                    <VideoOff className="h-6 w-6" />
                  ) : (
                    <Video className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={() => {
                    isNavigatingAwayRef.current = true;
                    leaveRoom({ roomId, duration: callDuration });
                  }}
                  className="p-5 rounded-full bg-red-500 text-white hover:scale-110 hover:bg-red-600 transition-all shadow-lg"
                  title="Leave call"
                >
                  <PhoneOff className="h-7 w-7" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. Fallback - shouldn't reach here
  return null;
};

export default VideoCall;
