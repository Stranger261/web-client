import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFaceRecognition } from '../../hooks/useFaceRecog';
import { verifyUser } from '../../services/authApi';
import toast from 'react-hot-toast';

const SimpleFaceRecognition = ({ onResult, className = '', usedAt }) => {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const {
    videoRef,
    canvasRef,
    isConnected,
    cameraStatus,
    analysis,
    countdown,
    isCapturing,
    start,
    stop,
    manualCapture,
    isReady,
    canCapture,
    hasError,
  } = useFaceRecognition({
    onVerificationResult: verificationResult => {
      setResult(verificationResult);
      setShowResult(true);
      if (onResult) {
        onResult(verificationResult);
      }
    },
    onError: error => {
      console.error('Face recognition error:', error);
    },
  });
  useEffect(() => {
    if (result !== null && usedAt === 'register') {
      onResult(result.person_id);
    }
  }, [result]);

  const closeResult = () => {
    setShowResult(false);
    setResult(null);
  };

  // Call this function when debugging

  // Helper functions for styling
  const getStatusClass = () => {
    if (analysis.ready_for_capture)
      return 'bg-green-100 text-green-700 border border-green-200';
    if (analysis.face_detected)
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    return 'bg-red-100 text-red-700 border border-red-200';
  };

  const getQualityClass = (status, type) => {
    let isGood = false;
    switch (type) {
      case 'position':
        isGood = status === 'center';
        break;
      case 'brightness':
        isGood = status === 'good';
        break;
      case 'blur':
        isGood = status === 'good';
        break;
      case 'glasses':
        isGood = !status;
        break;
    }

    if (isGood) return 'bg-green-100 text-green-700';
    if (type === 'glasses' && status) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getDotColor = (status, type) => {
    let isGood = false;
    switch (type) {
      case 'position':
        isGood = status === 'center';
        break;
      case 'brightness':
        isGood = status === 'good';
        break;
      case 'blur':
        isGood = status === 'good';
        break;
      case 'glasses':
        isGood = !status;
        break;
    }

    if (isGood) return 'bg-green-400';
    if (type === 'glasses' && status) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  const getFaceOverlayClass = () => {
    let baseClass =
      'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border-4 rounded-full pointer-events-none transition-all duration-300';

    if (analysis.ready_for_capture) {
      return `${baseClass} border-blue-400 border-solid shadow-lg shadow-blue-400/50`;
    } else if (analysis.face_detected) {
      return `${baseClass} border-green-400 border-solid`;
    } else {
      return `${baseClass} border-dashed border-white animate-pulse`;
    }
  };

  if (cameraStatus === 'idle') {
    return (
      <div
        className={`bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden relative ${className}`}
      >
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-5 text-center">
          <h1 className="text-xl font-semibold mb-2">Face Verification</h1>
          <p className="opacity-90 text-sm">Ready to start verification</p>
        </div>

        <div className="relative w-full h-96 bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-24 h-24 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="mb-6">Camera not started</p>
            <button
              onClick={start}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold transition-all hover:shadow-lg"
            >
              Start Camera
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden relative ${className}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-5 text-center">
          <h1 className="text-xl font-semibold mb-2">Face Verification</h1>
          <p className="opacity-90 text-sm">Position your face in the circle</p>

          {/* Connection Status */}
          <div className="mt-2 flex items-center justify-center">
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-300' : 'bg-red-300'
              }`}
            ></div>
            <span className="text-xs opacity-75">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Camera Container */}
        <div className="relative w-full h-96 bg-black flex items-center justify-center overflow-hidden">
          {/* Video Element */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />

          {/* Face Overlay Circle */}
          <div className={getFaceOverlayClass()} />

          {/* Face Detection Box */}
          {analysis.face_box && videoRef.current && (
            <div
              className="absolute border-2 border-orange-500 rounded-md pointer-events-none transition-all duration-200"
              style={{
                left: `${
                  // Mirror the X-coordinate manually:
                  ((videoRef.current.videoWidth -
                    analysis.face_box[0] -
                    analysis.face_box[2]) /
                    videoRef.current.videoWidth) *
                  100
                }%`,
                top: `${
                  (analysis.face_box[1] / videoRef.current.videoHeight) * 100
                }%`,
                width: `${
                  (analysis.face_box[2] / videoRef.current.videoWidth) * 100
                }%`,
                height: `${
                  (analysis.face_box[3] / videoRef.current.videoHeight) * 100
                }%`,
              }}
            />
          )}

          {/* Countdown */}
          {countdown.active && countdown.count > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-semibold z-10 animate-bounce">
              {countdown.count}
            </div>
          )}

          {/* Loading Spinner for Processing */}
          {isCapturing && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white w-20 h-20 rounded-full flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center text-white text-center p-4">
              <div>
                <div className="w-16 h-16 mx-auto mb-4 text-red-400">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="mb-4">Camera Error</p>
                <button
                  onClick={start}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="p-5 text-center">
          {/* Status Indicator */}
          <div
            className={`flex items-center justify-center mb-4 p-3 rounded-lg transition-all ${getStatusClass()}`}
          >
            <div className="w-5 h-5 bg-current rounded-full mr-2 opacity-60"></div>
            <span className="text-sm font-medium">{analysis.feedback}</span>
          </div>

          {/* Quality Indicators */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              className={`flex items-center p-2 rounded-lg text-sm transition-all ${getQualityClass(
                analysis.face_position,
                'position'
              )}`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mr-2 ${getDotColor(
                  analysis.face_position,
                  'position'
                )}`}
              ></div>
              <span>Position</span>
            </div>
            <div
              className={`flex items-center p-2 rounded-lg text-sm transition-all ${getQualityClass(
                analysis.brightness,
                'brightness'
              )}`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mr-2 ${getDotColor(
                  analysis.brightness,
                  'brightness'
                )}`}
              ></div>
              <span>Lighting</span>
            </div>
            <div
              className={`flex items-center p-2 rounded-lg text-sm transition-all ${getQualityClass(
                analysis.blur,
                'blur'
              )}`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mr-2 ${getDotColor(
                  analysis.blur,
                  'blur'
                )}`}
              ></div>
              <span>Clarity</span>
            </div>
            <div
              className={`flex items-center p-2 rounded-lg text-sm transition-all ${getQualityClass(
                analysis.glasses,
                'glasses'
              )}`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full mr-2 ${getDotColor(
                  analysis.glasses,
                  'glasses'
                )}`}
              ></div>
              <span>Glasses</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              className={`flex-1 py-3 px-6 rounded-full text-lg font-bold transition-all ${
                canCapture
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white cursor-pointer hover:transform hover:-translate-y-1 hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={manualCapture}
              disabled={!canCapture}
            >
              {isCapturing ? 'Processing...' : 'Capture'}
            </button>

            <button
              className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-all"
              onClick={stop}
            >
              Stop
            </button>
          </div>

          {/* Confidence Score */}
          {analysis.confidence > 0 && (
            <div className="mt-3 text-xs text-gray-500">
              Quality: {Math.round(analysis.confidence * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Result Modal */}
      {showResult && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-sm mx-5 animate-slideUp">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-bold transition-all ${
                result?.matched
                  ? 'text-green-400 bg-green-100 animate-bounce'
                  : 'text-red-400 bg-red-100 animate-pulse'
              }`}
            >
              {result?.matched ? '✓' : '✗'}
            </div>

            <h2 className="text-xl font-semibold mb-2">
              {result?.matched
                ? 'Verification Successful!'
                : 'Verification Failed'}
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              {result?.message ||
                (result?.matched
                  ? 'Welcome back!'
                  : 'Face not recognized. Please try again.')}
            </p>

            {result?.matched && result?.name && (
              <p className="text-sm font-medium text-green-600 mb-4">
                Welcome, {result.name}!
              </p>
            )}

            {result?.person_id && (
              <p className="text-xs text-gray-500 mb-4">
                ID: {result.person_id}
              </p>
            )}

            {result?.confidence && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">
                  Confidence: {Math.round(result.confidence)}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(result.confidence)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-6 rounded-full cursor-pointer transition-all"
                onClick={() => navigate('/login')}
              >
                Continue
              </button>

              {!result?.matched && (
                <button
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-full cursor-pointer transition-all"
                  onClick={() => {
                    closeResult();
                  }}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};

export default SimpleFaceRecognition;
