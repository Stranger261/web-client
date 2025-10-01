import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAWSFaceRecognition } from '../../hooks/useAWSFaceRecog';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const LiveFaceVerification = ({ usedAt }) => {
  const { completeVerification } = useAuth();

  const [countdown, setCountdown] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Simplified refs - remove duplicates
  const countdownRef = useRef(null);
  const isCountdownRunningRef = useRef(false);
  const hasProcessedResultRef = useRef(false);

  // Simplified verification result handler
  const handleVerificationResult = useCallback(
    async (result, imageBlob) => {
      // Prevent duplicate processing
      if (hasProcessedResultRef.current) {
        return;
      }
      hasProcessedResultRef.current = true;

      // Clear countdown immediately and update states
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }

      setCountdown(null);
      setIsCountingDown(false);
      setHasCaptured(true);
      setIsVerifying(true);
      isCountdownRunningRef.current = false;

      if (result.matched) {
        try {
          const res = await completeVerification(imageBlob);

          const raw = res?.data?.data;
          setIsVerifying(false);

          toast.success(
            raw?.message || res.message || 'Verification successful'
          );

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          setIsVerifying(false);
          toast.error(
            error.message || error?.data?.message || 'Verification failed'
          );
          resetState();
        }
      } else {
        toast.error('❌ No match found.');
        setIsVerifying(false);
        toast.error(`❌ Verification failed: ${result.message}`);
        resetState();
      }
    },
    [completeVerification]
  );

  // Helper function to reset state
  const resetState = useCallback(() => {
    setHasCaptured(false);
    setIsVerifying(false);
    setCountdown(null);
    setIsCountingDown(false);
    hasProcessedResultRef.current = false;
    isCountdownRunningRef.current = false;
  }, []);

  // Memoize error handler
  const handleError = useCallback(() => {
    stop();
    resetState();
  }, []);

  const {
    videoRef,
    canvasRef,
    isConnected,
    cameraStatus,
    analysis,
    isCapturing,
    start,
    stop,
    manualCapture,
    hasError,
  } = useAWSFaceRecognition({
    onVerificationResult: handleVerificationResult,
    onError: handleError,
  });

  const isFaceInCircle = useCallback(() => {
    if (!videoRef.current || !analysis.face_detected || !analysis.face_box) {
      return false;
    }
    const video = videoRef.current;
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    const circleRadius = Math.min(videoWidth, videoHeight) * 0.35;
    const circleCenterX = videoWidth / 2;
    const circleCenterY = videoHeight / 2;

    const [faceX, faceY, faceWidth, faceHeight] = analysis.face_box;
    const faceCenterX = faceX + faceWidth / 2;
    const faceCenterY = faceY + faceHeight / 2;

    const distance = Math.sqrt(
      Math.pow(faceCenterX - circleCenterX, 2) +
        Math.pow(faceCenterY - circleCenterY, 2)
    );

    const faceSizeRatio = Math.max(faceWidth, faceHeight) / (circleRadius * 2);
    const isCorrectSize = faceSizeRatio > 0.4 && faceSizeRatio < 1.4;

    return distance <= circleRadius * 0.7 && isCorrectSize;
  }, [analysis.face_detected, analysis.face_box]);

  const isValidFacePosition = analysis.face_detected && isFaceInCircle();

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      resetState();
    };
  }, [resetState]);

  // Simplified countdown effect
  useEffect(() => {
    // Skip countdown if we have results or are in process
    if (hasCaptured || isVerifying || isCapturing) {
      return;
    }

    const isPerfect = analysis.feedback === 'Perfect! Hold still';
    const ready = analysis.ready_for_capture;
    const validPosition = isValidFacePosition;

    const shouldStartCountdown =
      isPerfect && ready && validPosition && !isCountdownRunningRef.current;

    if (shouldStartCountdown) {
      isCountdownRunningRef.current = true;
      setIsCountingDown(true);
      let countdownValue = 3;
      setCountdown(countdownValue);

      countdownRef.current = setInterval(() => {
        countdownValue -= 1;

        if (countdownValue <= 0) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setCountdown(null);
          setIsCountingDown(false);
          isCountdownRunningRef.current = false;
          manualCapture();
        } else {
          setCountdown(countdownValue);
        }
      }, 1000);
    }

    // Stop countdown if conditions are no longer met
    const shouldStopCountdown =
      (!isPerfect || !ready || !validPosition) && isCountdownRunningRef.current;

    if (shouldStopCountdown) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setCountdown(null);
      setIsCountingDown(false);
      isCountdownRunningRef.current = false;
    }
  }, [
    analysis.feedback,
    analysis.ready_for_capture,
    isValidFacePosition,
    isCapturing,
    hasCaptured,
    isVerifying,
    manualCapture,
  ]);

  const getInstructions = () => {
    if (hasError) return 'Camera error - please try again';
    if (cameraStatus === 'requesting') return 'Requesting camera access...';
    if (!isConnected) return 'Connecting to server...';
    if (isCapturing || isVerifying) return 'Verifying...';
    if (!analysis.face_detected) return 'Position your face in the circle';
    if (analysis.face_detected && !isValidFacePosition)
      return 'Move closer and center your face in the circle';
    if (isCountingDown) return `Perfect! Hold still, capturing in ${countdown}`;
    if (isValidFacePosition && analysis.feedback === 'Perfect! Hold still')
      return 'Perfect! Hold still for automatic capture';
    if (isValidFacePosition) return analysis.feedback || 'Hold steady';
    return analysis.feedback || 'Adjust your position and lighting';
  };

  const getInstructionColor = () => {
    if (hasError) return 'text-red-500';
    if (
      isCountingDown ||
      (isValidFacePosition && analysis.feedback === 'Perfect! Hold still')
    ) {
      return 'text-green-600';
    }
    if (isValidFacePosition) return 'text-yellow-600';
    return 'text-red-500';
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-white"
      >
        {/* Header */}
        <div className="bg-blue-500 text-white px-4 py-4 flex items-center">
          <button className="mr-3">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="text-lg font-medium">AWS Face Verification</h1>
        </div>

        {/* Main Content */}
        <div className="px-6 py-6 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-medium text-gray-900">
              Take a selfie to verify your identity
            </h2>

            <p className="text-sm text-gray-600 leading-relaxed">
              Position your face in the circle. Remove any hat, face mask or
              sunglasses. Ensure good lighting for best results.
            </p>
          </div>

          <div className="flex justify-center">
            <div className="relative w-80 h-80">
              <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />

                <AnimatePresence>
                  {isCountingDown && countdown !== null && (
                    <motion.div
                      key={`countdown-${countdown}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center z-10"
                    >
                      <div className="bg-blue-500 text-white rounded-full w-24 h-24 flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white">
                        {countdown}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-72 h-72 rounded-full border-4 transition-all duration-300 ${
                    isValidFacePosition
                      ? 'border-green-500 bg-green-500/10'
                      : analysis.face_detected
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-red-400 bg-red-400/5'
                  }`}
                >
                  {!analysis.face_detected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400">
                        <svg
                          className="w-24 h-24"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {analysis.face_detected && !isValidFacePosition && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-yellow-500 text-center">
                        <svg
                          className="w-16 h-16 mx-auto mb-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {isValidFacePosition && !isCountingDown && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-green-500">
                        <svg
                          className="w-16 h-16"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {isCapturing && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="bg-green-500 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg border-4 border-white">
                    <svg
                      className="w-8 h-8 animate-spin"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.364-6.364l-2.828 2.828M9.464 9.464L6.636 6.636m12.728 12.728l-2.828-2.828M9.464 14.536l-2.828 2.828" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className={`text-sm font-medium ${getInstructionColor()}`}>
              {getInstructions()}
            </p>
          </div>

          <div className="px-4">
            {cameraStatus === 'idle' ? (
              <button
                onClick={start}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium text-lg hover:bg-blue-600 transition-colors"
              >
                Start Camera
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  disabled={
                    !isValidFacePosition ||
                    isCapturing ||
                    isCountingDown ||
                    isVerifying
                  }
                  onClick={manualCapture}
                  className={`w-full py-4 rounded-xl font-medium text-lg transition-colors ${
                    isValidFacePosition &&
                    !isCapturing &&
                    !isCountingDown &&
                    !isVerifying
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCapturing || isVerifying
                    ? 'Verifying...'
                    : isCountingDown
                    ? `Auto-capture in ${countdown}s`
                    : 'Capture Now'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  cameraStatus === 'ready' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></div>
              <span>Camera {cameraStatus}</span>
            </div>

            <div className="flex items-center space-x-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>

              <span>Server {isConnected ? 'connected' : 'disconnected'}</span>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
              <h4 className="font-semibold mb-2">Debug Info:</h4>

              <div className="grid grid-cols-2 gap-2">
                <div>Face Detected: {analysis.face_detected ? '✅' : '❌'}</div>
                <div>Face In Circle: {isValidFacePosition ? '✅' : '❌'}</div>
                <div>
                  Ready for Capture:
                  {analysis.ready_for_capture ? '✅' : '❌'}
                </div>
                <div>Confidence: {(analysis.confidence * 100).toFixed(1)}%</div>
                <div>Brightness: {analysis.brightness}</div>
                <div>Blur: {analysis.blur}</div>
                <div>Position: {analysis.face_position}</div>
                <div>Glasses: {analysis.glasses ? '👓' : '❌'}</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default LiveFaceVerification;
