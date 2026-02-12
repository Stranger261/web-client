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
  MessageCircle,
  X,
  Send,
  Paperclip,
  File,
  Image as ImageIcon,
  Download,
  ChevronDown,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useVideoCall } from '../../contexts/VideoCallContext';
import { useSocket } from '../../contexts/SocketContext';
import { DEVELOPMENT_BASE_URL, GRADIENTS } from '../../configs/CONST';
import { LoadingOverlay } from '../ui/loading-overlay';
import videoApi from '../../services/videoApi';

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

  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Room Status State
  const [roomStatus, setRoomStatus] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const isNavigatingAwayRef = useRef(false);
  const hasJoinedRef = useRef(false);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const userName = `${currentUser?.person?.first_name || ''} ${
    currentUser?.person?.last_name || ''
  }`;
  const isDoctor = currentUser?.role === 'doctor';

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Load chat history when room is joined
  useEffect(() => {
    if (roomId && inCall && isChatOpen) {
      loadChatHistory();
    }
  }, [roomId, inCall, isChatOpen]);

  const loadChatHistory = async () => {
    try {
      const response = await videoApi.getChatMessages(roomId);
      console.log('📥 Chat history response:', response);
      const data = response;

      if (data.success && data.data?.messages) {
        const formattedMessages = data.data.messages.map(msg => {
          // ✅ CRITICAL FIX: Compare with user_id, not socket_id
          // Socket IDs change on reconnect, but user_id stays the same
          const isOwnMessage = msg.senderId === currentUser?.user_id;

          console.log('📨 Message:', {
            messageId: msg.messageId,
            senderId: msg.senderId,
            currentUserId: currentUser?.user_id,
            isOwnMessage,
            senderName: msg.senderName,
          });

          return {
            id: msg.messageId,
            // ✅ Use mySocketId for own messages so alignment works
            senderId: isOwnMessage ? mySocketId : msg.senderId,
            senderName: msg.senderName,
            text: msg.messageType === 'text' ? msg.messageContent : undefined,
            fileUrl: msg.fileUrl,
            fileName: msg.messageContent,
            fileSize: msg.fileSize,
            fileType: msg.fileType,
            timestamp: new Date(msg.sentAt),
            type: msg.messageType,
          };
        });

        setMessages(formattedMessages);
        console.log(
          `💬 Loaded ${formattedMessages.length} chat messages for user ${currentUser?.user_id}`,
        );
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  // Socket listeners for chat
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleChatMessage = data => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          timestamp: new Date(),
          type: 'text',
        },
      ]);

      if (!isChatOpen && data.senderId !== mySocketId) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleFileMessage = data => {
      setMessages(prev => [
        ...prev,
        {
          id: data.messageId || Date.now(),
          senderId: data.senderId,
          senderName: data.senderName,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          timestamp: data.timestamp || new Date(),
          type: 'file',
        },
      ]);

      if (!isChatOpen && data.senderId !== mySocketId) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleUserTyping = data => {
      if (data.senderId !== mySocketId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socket.on('chat:message', handleChatMessage);
    socket.on('chat:file', handleFileMessage);
    socket.on('chat:typing', handleUserTyping);

    return () => {
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:file', handleFileMessage);
      socket.off('chat:typing', handleUserTyping);
    };
  }, [socket, roomId, mySocketId, isChatOpen]);

  // Check room status when roomId exists
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

      if (status.canJoin && !hasJoinedRef.current) {
        hasJoinedRef.current = true;
        await joinRoom({
          roomId,
          myPeerId,
          mySocketId,
          scheduledDuration: 30,
        });
      }
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
      socket.emit('video:force-disconnect', {
        socketId: mySocketId,
        userId: currentUser.user_id,
        userType: currentUser.role,
        roomId: roomId,
        reason: 'page_unload',
      });

      const apiUrl = `${DEVELOPMENT_BASE_URL}/api/v1/online-video/disconnected-user`;
      const payload = JSON.stringify({
        socketId: mySocketId,
        userId: currentUser.user_id,
        userType: currentUser.role,
        roomId: roomId,
        reason: 'page_unload',
      });

      navigator.sendBeacon(
        apiUrl,
        new Blob([payload], { type: 'application/json' }),
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Clean up when navigating away within the app
      if (!isNavigatingAwayRef.current && socket.connected) {
        socket.emit('video:force-disconnect', {
          socketId: mySocketId,
          userId: currentUser.user_id,
          userType: currentUser.role,
          roomId: roomId,
          reason: 'navigation',
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

  // Chat Functions
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setUnreadCount(0);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !socket) return;

    const messageData = {
      roomId,
      senderId: mySocketId,
      senderName: userName,
      text: messageInput.trim(),
    };

    socket.emit('chat:message', messageData);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        senderId: mySocketId,
        senderName: userName,
        text: messageInput.trim(),
        timestamp: new Date(),
        type: 'text',
      },
    ]);

    setMessageInput('');
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('chat:typing', {
      roomId,
      senderId: mySocketId,
      senderName: userName,
    });
  };

  const handleFileSelect = async e => {
    const file = e.target.files?.[0];
    if (!file || !socket) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingFile(true);

    try {
      // Upload file
      const response = await videoApi.uploadChatFile(file, roomId);

      // ✅ Fix: Access response.data.data correctly
      const { fileUrl, fileName, fileSize, fileType } = response.data;

      // Emit socket with file data
      socket.emit('chat:file', {
        roomId,
        senderId: mySocketId,
        senderName: userName,
        fileUrl,
        fileName,
        fileSize,
        fileType,
      });

      // Optimistic UI update
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          senderId: mySocketId,
          senderName: userName,
          file: {
            name: fileName,
            size: fileSize,
            type: fileType,
            url: fileUrl,
          },
          fileUrl,
          fileName,
          fileSize,
          fileType,
          type: fileType.startsWith('image/') ? 'image' : 'file',
          timestamp: new Date(),
        },
      ]);

      toast.success('File sent successfully');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to send file');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleFileDownload = async (fileUrl, fileName) => {
    try {
      // Show loading indicator
      toast.loading('Downloading file...');

      // Fetch the file as blob
      const response = await fetch(fileUrl, {
        credentials: 'include', // Include cookies if authentication is needed
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      // Convert response to blob
      const blob = await response.blob();

      // Create a temporary blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary link element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName; // Set the download filename
      link.style.display = 'none';

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);

      // Success feedback
      toast.dismiss();
      toast.success('File downloaded successfully');

      console.log('✅ File downloaded:', fileName);
    } catch (error) {
      console.error('❌ Download error:', error);
      toast.dismiss();
      toast.error('Failed to download file. Please try again.');
    }
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatMessageTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = fileType => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  // RENDERING LOGIC BASED ON ROOM STATUS

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
                    <p>No scheduled consultations for today</p>
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

  // Add debugging
  console.log('🔍 Render conditions:', {
    roomId,
    roomStatus,
    inCall,
    callStatus,
    checkingStatus,
    isLoading,
    canJoin: roomStatus?.canJoin,
  });

  // 5. Can join or already joined - show video interface with chat
  // Simplified: if we have roomId and passed all previous checks, show video interface
  if (roomId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-full mx-auto p-4 md:p-6">
          <div className="flex gap-4" style={{ height: 'calc(100vh - 2rem)' }}>
            {/* Video Section */}
            <div
              className={`${
                isChatOpen ? 'flex-1' : 'w-full'
              } transition-all duration-300`}
            >
              <div
                ref={containerRef}
                className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative h-full"
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
                <div className="absolute top-4 right-4 w-40 md:w-56 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-10">
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
                          <span
                            className={`font-mono text-sm ${getTimeColor()}`}
                          >
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
                      onClick={toggleChat}
                      className="p-4 rounded-full bg-white/20 text-white hover:scale-110 transition-all backdrop-blur-md relative"
                      title="Toggle chat"
                    >
                      <MessageCircle className="h-6 w-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
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

            {/* Chat Sidebar */}
            {isChatOpen && (
              <div className="w-full md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div
                  className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                  style={{ background: GRADIENTS.primary }}
                >
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-white" />
                    <h3 className="font-semibold text-white">Chat</h3>
                  </div>
                  <button
                    onClick={toggleChat}
                    className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs mt-1">
                        Start a conversation or share files
                      </p>
                    </div>
                  ) : (
                    messages.map(message => {
                      const isOwn = message.senderId === mySocketId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] ${
                              isOwn
                                ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-2xl rounded-tl-sm'
                            } px-4 py-2`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-semibold mb-1 opacity-75">
                                {message.senderName}
                              </p>
                            )}

                            {message.type === 'text' ? (
                              <p className="text-sm break-words">
                                {message.text}
                              </p>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      isOwn
                                        ? 'bg-blue-600'
                                        : 'bg-gray-200 dark:bg-gray-600'
                                    }`}
                                  >
                                    {getFileIcon(message.fileType)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {message.fileName}
                                    </p>
                                    <p className="text-xs opacity-75">
                                      {formatFileSize(message.fileSize)}
                                    </p>
                                  </div>
                                </div>

                                {/* Image Preview */}
                                {message.fileType?.startsWith('image/') && (
                                  <img
                                    src={message.fileUrl}
                                    alt={message.fileName}
                                    className="rounded-lg max-w-full h-auto"
                                  />
                                )}

                                {/* Download Button */}
                                <button
                                  onClick={() =>
                                    handleFileDownload(
                                      message.fileUrl,
                                      message.fileName,
                                    )
                                  }
                                  className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg ${
                                    isOwn
                                      ? 'bg-blue-600 hover:bg-blue-700'
                                      : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
                                  } transition-colors w-full justify-center`}
                                >
                                  <Download className="h-3 w-3" />
                                  Download
                                </button>
                              </div>
                            )}

                            <p
                              className={`text-xs mt-1 ${
                                isOwn ? 'opacity-75' : 'opacity-60'
                              }`}
                            >
                              {formatMessageTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50"
                      title="Attach file"
                    >
                      {uploadingFile ? (
                        <Loader className="h-5 w-5 animate-spin" />
                      ) : (
                        <Paperclip className="h-5 w-5" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={e => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageInput.trim()}
                      className="p-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                      style={{
                        background: messageInput.trim()
                          ? GRADIENTS.primary
                          : '#9CA3AF',
                      }}
                      title="Send message"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 6. Fallback - show debugging info if we reach here
  console.error('🚨 Unexpected render state:', {
    roomId,
    roomStatus,
    inCall,
    callStatus,
    checkingStatus,
    isLoading,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          Unexpected State
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Something went wrong. Please try again.
        </p>
        <button
          onClick={() => {
            navigate(`/${currentUser.role}/video-call`, { replace: true });
          }}
          className="w-full px-6 py-3 rounded-lg text-white font-medium"
          style={{ background: GRADIENTS.primary }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
