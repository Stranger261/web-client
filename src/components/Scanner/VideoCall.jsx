import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Copy,
  Video,
  Phone,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  PhoneOff,
  PhoneIncoming,
  PhoneCall,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useVideoCall } from '../../contexts/VideoCallContext';

import { COLORS, GRADIENTS } from '../../configs/CONST';
const VideoCall = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const { currentUser } = useAuth();
  const {
    // states
    myPeerId,
    inCall,
    isMuted,
    isVideoOff,
    callDuration,
    incomingCall,
    callStatus,

    // refs
    localStreamRef,
    remoteStreamRef,

    // functions
    handleCallUser,
    handleAnswerCall,
    handleRejectCall,
    handleEndCall,
    toggleMute,
    toggleVideo,
  } = useVideoCall();

  const [callerId, setCallerId] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const userName = `${currentUser?.person?.first_name || ''} ${
    currentUser?.person?.last_name || ''
  }`;

  const formatDuration = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    if (localStreamRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      console.log('📹 Local video attached');
    }
  }, [localStreamRef.current]);

  useEffect(() => {
    if (remoteStreamRef.current && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
      console.log('📹 Remote video attached');
    }
  }, [remoteStreamRef.current]);

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    toast.success('ID copied to clipboard');
  };

  const handleStartCall = () => {
    if (!callerId.trim()) {
      toast.error('Please enter a peer ID');
      return;
    }
    console.log(callerId.trim());
    handleCallUser(callerId.trim());
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Video Consultation
          </h1>
          <p style={{ color: COLORS.text.secondary }}>
            Connect with patients or healthcare providers through secure video
            calls
          </p>
        </div>

        {/* incoming call modal */}
        {incomingCall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div
              className="rounded-2xl p-8  max-w-md w-full text-center shadow-2xl"
              style={{
                background: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
              }}
            >
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold"
                style={{ background: GRADIENTS.primary }}
              >
                {incomingCall.callerInfo?.name?.charAt(0) || '?'}
              </div>
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Incoming Call
              </h2>
              <p
                className="text-lg mb-1"
                style={{ color: COLORS.text.secondary }}
              >
                {incomingCall.callerInfo?.name || 'Unknown'}
              </p>
              <p
                className="text-sm mb-6 capitalize"
                style={{ color: COLORS.text.secondary }}
              >
                {incomingCall.callerInfo?.role || 'User'}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleRejectCall}
                  className="flex-1 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600 transition-all"
                >
                  <PhoneOff size={20} />
                  Decline
                </button>
                <button
                  onClick={handleAnswerCall}
                  className="flex-1 py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600 transition-all"
                >
                  <PhoneCall size={20} />
                  Answer
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Section - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            {/* Local Video */}
            <div
              className="rounded-xl overflow-hidden shadow-lg relative"
              style={{
                background: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
              }}
            >
              <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {(isVideoOff || !localStreamRef.current) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                      style={{ background: GRADIENTS.primary }}
                    >
                      {userName.charAt(0)}
                    </div>
                  </div>
                )}

                {/* Video Controls Overlay */}
                {inCall && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                    <button
                      onClick={toggleMute}
                      className={`p-4 rounded-full transition-all ${
                        isMuted ? 'bg-red-500' : 'bg-gray-800 bg-opacity-70'
                      } text-white hover:scale-110`}
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>

                    <button
                      onClick={toggleVideo}
                      className={`p-4 rounded-full transition-all ${
                        isVideoOff ? 'bg-red-500' : 'bg-gray-800 bg-opacity-70'
                      } text-white hover:scale-110`}
                      title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                    >
                      {isVideoOff ? (
                        <VideoOff size={20} />
                      ) : (
                        <Video size={20} />
                      )}
                    </button>

                    <button
                      onClick={handleEndCall}
                      className="p-4 rounded-full bg-red-500 text-white hover:scale-110 transition-all"
                      title="End call"
                    >
                      <PhoneOff size={20} />
                    </button>
                  </div>
                )}

                {/* Time/Status Indicator */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                  {inCall ? formatDuration(callDuration) : 'Ready'}
                </div>

                {/* Connection Status */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        callStatus === 'connected'
                          ? 'bg-green-500'
                          : callStatus === 'calling' || callStatus === 'ringing'
                          ? 'bg-yellow-500 animate-pulse'
                          : 'bg-gray-500'
                      }`}
                    />
                    {callStatus === 'connected'
                      ? 'Connected'
                      : callStatus === 'calling'
                      ? 'Calling...'
                      : callStatus === 'ringing'
                      ? 'Ringing...'
                      : callStatus === 'connecting'
                      ? 'Connecting...'
                      : 'Ready'}
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  You
                </div>
              </div>
            </div>

            {/* Remote Video (shown when in call) */}
            {inCall && (
              <div
                className="rounded-xl overflow-hidden shadow-lg relative"
                style={{
                  background: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                }}
              >
                <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {!remoteStreamRef.current && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-white text-center">
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                        <p>Waiting for video...</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                    Remote User
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Your ID Card */}
            <div
              className="rounded-xl p-6 shadow-lg"
              style={{
                background: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
              }}
            >
              <h3
                className="text-sm font-medium mb-2"
                style={{ color: COLORS.text.secondary }}
              >
                Your Connection ID
              </h3>
              <div
                className="p-3 rounded-lg mb-3 font-mono text-sm break-all"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.background.dark
                    : COLORS.background.light,
                  color: COLORS.primary,
                }}
              >
                {myPeerId || 'Connecting...'}
              </div>
              <button
                onClick={() => myPeerId && copyToClipboard(myPeerId)}
                disabled={!myPeerId}
                className="w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: GRADIENTS.primary,
                  color: 'white',
                }}
              >
                <Copy size={18} />
                Copy ID
              </button>
            </div>

            {/* Call Control Card */}
            {!inCall && (
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{
                  background: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                }}
              >
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: COLORS.text.secondary }}
                >
                  Start a Call
                </h3>
                <input
                  type="text"
                  value={callerId}
                  onChange={e => setCallerId(e.target.value)}
                  placeholder="Enter peer ID to call"
                  disabled={inCall || callStatus !== 'idle'}
                  className="w-full p-3 rounded-lg mb-3 font-mono text-sm disabled:opacity-50"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.background.dark
                      : COLORS.background.light,
                    border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                />
                <button
                  onClick={handleStartCall}
                  disabled={!callerId || inCall || callStatus !== 'idle'}
                  className="w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      callerId && callStatus === 'idle'
                        ? COLORS.primary
                        : COLORS.text.secondary,
                    color: 'white',
                  }}
                >
                  <Phone size={18} />
                  {callStatus === 'calling' ? 'Calling...' : 'Start Call'}
                </button>
              </div>
            )}

            {/* Call Status Card (shown during call) */}
            {inCall && (
              <div
                className="rounded-xl p-6 shadow-lg"
                style={{
                  background: isDarkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                }}
              >
                <h3
                  className="text-sm font-medium mb-3"
                  style={{ color: COLORS.text.secondary }}
                >
                  Call in Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.text.secondary }}>
                      Duration:
                    </span>
                    <span
                      className="font-mono font-bold"
                      style={{ color: COLORS.primary }}
                    >
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.text.secondary }}>
                      Status:
                    </span>
                    <span
                      className="font-medium capitalize"
                      style={{ color: COLORS.primary }}
                    >
                      {callStatus}
                    </span>
                  </div>
                  <button
                    onClick={handleEndCall}
                    className="w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all hover:opacity-90 bg-red-500 text-white mt-4"
                  >
                    <PhoneOff size={18} />
                    End Call
                  </button>
                </div>
              </div>
            )}

            {/* Instructions Card */}
            <div
              className="rounded-xl p-6 shadow-lg"
              style={{
                background: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
              }}
            >
              <h3
                className="text-sm font-medium mb-3"
                style={{ color: COLORS.text.secondary }}
              >
                How to Connect
              </h3>
              <ol
                className="space-y-2 text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                <li className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    1.
                  </span>
                  Share your Connection ID with the other person
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    2.
                  </span>
                  Get their Connection ID
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    3.
                  </span>
                  Enter their ID and click Start Call
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold" style={{ color: COLORS.primary }}>
                    4.
                  </span>
                  Allow camera and microphone permissions when prompted
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
