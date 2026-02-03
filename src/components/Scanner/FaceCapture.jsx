import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader,
  Shield,
  Zap,
  Camera,
  Info,
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

function FaceCapture({ onSuccess }) {
  const { verifyFace } = useAuth();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [feedback, setFeedback] = useState({
    centered: false,
    rightSize: false,
    blinked: false,
    lighting: false,
    faceDetected: false,
    message: 'Initializing camera...',
    blinkCount: 0,
    brightness: 0,
    currentEAR: 0,
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const blinkCountRef = useRef(0);
  const cameraActiveRef = useRef(false);
  const requirementsMetRef = useRef(false);
  const lastBlinkTimeRef = useRef(0);
  const lastEARRef = useRef(0.4);
  const isBlinkingRef = useRef(false);
  const countdownStartedRef = useRef(false);

  useEffect(() => {
    const initialize = async () => {
      await loadModels();
    };
    initialize();

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (modelsLoaded && !cameraActive && !verificationResult) {
      startCamera();
    }
  }, [modelsLoaded]);

  const loadModels = async () => {
    try {
      setStatus({ message: 'Loading AI models...', type: 'info' });

      const MODEL_URL = '/models/';

      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      setStatus({
        message: 'AI Models loaded! Starting camera...',
        type: 'success',
      });
    } catch (error) {
      setStatus({
        message: 'Error loading models. Please refresh the page.',
        type: 'error',
      });
    }
  };

  const startCamera = async () => {
    try {
      setStatus({ message: 'Accessing camera...', type: 'info' });

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Camera API not available. This requires HTTPS or localhost connection.',
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise(resolve => {
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(resolve);
        };
      });

      setCameraActive(true);
      cameraActiveRef.current = true;
      setCountdown(3);
      setIsCountingDown(false);

      blinkCountRef.current = 0;
      requirementsMetRef.current = false;
      lastBlinkTimeRef.current = 0;
      lastEARRef.current = 0.4;
      isBlinkingRef.current = false;
      countdownStartedRef.current = false;

      setStatus({
        message: 'Camera active! Follow the instructions.',
        type: 'info',
      });

      setTimeout(() => {
        if (canvasRef.current && videoRef.current && overlayCanvasRef.current) {
          const video = videoRef.current;

          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          overlayCanvasRef.current.width = video.videoWidth;
          overlayCanvasRef.current.height = video.videoHeight;

          startDetection();
        }
      }, 1000);
    } catch (error) {
      let errorMessage = 'Camera access failed. ';

      if (error.message.includes('not available')) {
        errorMessage += 'Camera API requires HTTPS or localhost.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage +=
          'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += error.message;
      }

      setStatus({
        message: errorMessage,
        type: 'error',
      });
    }
  };

  const stopCamera = () => {
    cameraActiveRef.current = false;
    requirementsMetRef.current = false;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setIsCountingDown(false);
    setCountdown(3);
    countdownStartedRef.current = false;
  };

  const startCountdown = () => {
    if (isCountingDown) return;

    setIsCountingDown(true);
    setCountdown(3);
    countdownStartedRef.current = true;

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;

          if (requirementsMetRef.current) {
            captureAndVerify();
          } else {
            setIsCountingDown(false);
            setCountdown(3);
            countdownStartedRef.current = false;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCountingDown(false);
    setCountdown(3);
    requirementsMetRef.current = false;
    countdownStartedRef.current = false;
  };

  const detectBlink = avgEAR => {
    const BLINK_THRESHOLD = 0.27;
    const DEBOUNCE_TIME = 600;

    const now = Date.now();
    const isEyesClosed = avgEAR < BLINK_THRESHOLD;

    if (!isBlinkingRef.current && isEyesClosed) {
      isBlinkingRef.current = true;
    } else if (isBlinkingRef.current && !isEyesClosed) {
      isBlinkingRef.current = false;

      const timeSinceLastBlink = now - lastBlinkTimeRef.current;

      if (timeSinceLastBlink > DEBOUNCE_TIME) {
        blinkCountRef.current = Math.min(2, blinkCountRef.current + 1);
        lastBlinkTimeRef.current = now;
        return true;
      }
    }

    lastEARRef.current = avgEAR;
    return false;
  };

  const calculateEAR = eye => {
    if (!eye || eye.length < 6) return 0.3;

    try {
      const [p1, p2, p3, p4, p5, p6] = eye;

      const vertical1 = Math.sqrt(
        Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2),
      );
      const vertical2 = Math.sqrt(
        Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2),
      );

      const horizontal = Math.sqrt(
        Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2),
      );

      if (horizontal === 0) return 0.3;

      const ear = (vertical1 + vertical2) / (2.0 * horizontal);

      return Math.max(0.1, Math.min(0.5, ear));
    } catch (error) {
      return 0.3;
    }
  };

  const startDetection = () => {
    detectionIntervalRef.current = setInterval(async () => {
      if (!cameraActiveRef.current || !videoRef.current) {
        return;
      }

      if (
        videoRef.current.videoWidth === 0 ||
        videoRef.current.videoHeight === 0
      ) {
        return;
      }

      try {
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
          )
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!canvasRef.current || !overlayCanvasRef.current) {
          return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const overlayCanvas = overlayCanvasRef.current;
        const overlayCtx = overlayCanvas.getContext('2d');
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        const centerX = overlayCanvas.width / 2;
        const centerY = overlayCanvas.height / 2;
        const circleRadius =
          Math.min(overlayCanvas.width, overlayCanvas.height) * 0.48;

        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        overlayCtx.globalCompositeOperation = 'destination-out';
        overlayCtx.beginPath();
        overlayCtx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
        overlayCtx.fill();
        overlayCtx.globalCompositeOperation = 'source-over';

        const tempCanvas = document.createElement('canvas');
        const size = Math.floor(circleRadius * 2);
        tempCanvas.width = size;
        tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');

        tempCtx.drawImage(
          videoRef.current,
          centerX - circleRadius,
          centerY - circleRadius,
          size,
          size,
          0,
          0,
          size,
          size,
        );

        const imageData = tempCtx.getImageData(0, 0, size, size);
        let totalBrightness = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          totalBrightness +=
            (imageData.data[i] +
              imageData.data[i + 1] +
              imageData.data[i + 2]) /
            3;
        }
        const avgBrightness = totalBrightness / (imageData.data.length / 4);
        const isGoodLighting = avgBrightness > 60 && avgBrightness < 200;

        let isCentered = false;
        let isRightSize = false;
        const hasBlinked = blinkCountRef.current >= 2;

        if (detections) {
          const box = detections.detection.box;
          const faceCenterX = box.x + box.width / 2;
          const faceCenterY = box.y + box.height / 2;

          const distanceFromCenter = Math.sqrt(
            Math.pow(faceCenterX - centerX, 2) +
              Math.pow(faceCenterY - centerY, 2),
          );

          const faceSize = (box.width + box.height) / 2;
          const targetSize = circleRadius * 1.4;
          const sizeDiff = Math.abs(faceSize - targetSize);

          isCentered = distanceFromCenter < circleRadius * 0.3;
          isRightSize = sizeDiff < targetSize * 0.3;

          const positions = detections.landmarks.positions;
          ctx.fillStyle = '#00ff00';
          positions.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });

          const leftEye = detections.landmarks.getLeftEye();
          const rightEye = detections.landmarks.getRightEye();
          const leftEAR = calculateEAR(leftEye);
          const rightEAR = calculateEAR(rightEye);
          const avgEAR = (leftEAR + rightEAR) / 2;

          detectBlink(avgEAR);

          const eyeColor = isBlinkingRef.current ? '#ff4444' : '#00ff00';
          ctx.fillStyle = eyeColor;
          ctx.strokeStyle = eyeColor;
          ctx.lineWidth = 3;

          [leftEye, rightEye].forEach(eye => {
            eye.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
              ctx.fill();
            });

            ctx.beginPath();
            ctx.moveTo(eye[0].x, eye[0].y);
            for (let i = 1; i < eye.length; i++) {
              ctx.lineTo(eye[i].x, eye[i].y);
            }
            ctx.closePath();
            ctx.stroke();
          });

          overlayCtx.beginPath();
          overlayCtx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);

          if (isCentered && isRightSize && hasBlinked && isGoodLighting) {
            overlayCtx.strokeStyle = '#10b981';
            overlayCtx.lineWidth = 8;
          } else if (!isGoodLighting) {
            overlayCtx.strokeStyle = '#f59e0b';
            overlayCtx.lineWidth = 6;
          } else if (!isCentered || !isRightSize) {
            overlayCtx.strokeStyle = '#3b82f6';
            overlayCtx.lineWidth = 6;
          } else if (!hasBlinked) {
            overlayCtx.strokeStyle = '#8b5cf6';
            overlayCtx.lineWidth = 6;
          } else {
            overlayCtx.strokeStyle = '#ef4444';
            overlayCtx.lineWidth = 6;
          }
          overlayCtx.stroke();

          let message = '';
          let canBlink = false;

          if (!isGoodLighting) {
            message =
              avgBrightness <= 60
                ? '💡 Too dark - add more light'
                : '☀️ Too bright - reduce light';
          } else if (!isCentered) {
            if (faceCenterX < centerX - circleRadius * 0.25) {
              message = '← Move right';
            } else if (faceCenterX > centerX + circleRadius * 0.25) {
              message = '→ Move left';
            } else if (faceCenterY < centerY - circleRadius * 0.25) {
              message = '↓ Move down';
            } else {
              message = '↑ Move up';
            }
            blinkCountRef.current = 0;
          } else if (!isRightSize) {
            message = faceSize < targetSize ? '🔍 Move closer' : '🔍 Move back';
            blinkCountRef.current = 0;
          } else {
            canBlink = true;
            if (!hasBlinked) {
              const remainingBlinks = 2 - blinkCountRef.current;
              message = `👁️ Blink ${remainingBlinks} more time${
                remainingBlinks > 1 ? 's' : ''
              } naturally`;
            } else {
              message = '✓ Perfect! Hold still...';
            }
          }

          if (!canBlink && blinkCountRef.current > 0) {
            blinkCountRef.current = 0;
            isBlinkingRef.current = false;
          }

          setFeedback({
            centered: isCentered,
            rightSize: isRightSize,
            blinked: hasBlinked,
            lighting: isGoodLighting,
            faceDetected: true,
            message,
            blinkCount: blinkCountRef.current,
            brightness: Math.round(avgBrightness),
            currentEAR: avgEAR,
          });

          const allRequirementsMet =
            isCentered && isRightSize && hasBlinked && isGoodLighting;

          if (allRequirementsMet) {
            if (!requirementsMetRef.current) {
              requirementsMetRef.current = true;
            }

            if (!isCountingDown && !countdownStartedRef.current) {
              startCountdown();
            }
          } else {
            if (requirementsMetRef.current) {
              requirementsMetRef.current = false;
            }
            if (isCountingDown) {
              resetCountdown();
            }
          }
        } else {
          overlayCtx.beginPath();
          overlayCtx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
          overlayCtx.strokeStyle = '#ef4444';
          overlayCtx.lineWidth = 6;
          overlayCtx.stroke();

          blinkCountRef.current = 0;
          isBlinkingRef.current = false;

          setFeedback({
            centered: false,
            rightSize: false,
            blinked: false,
            lighting: false,
            faceDetected: false,
            message: '❌ No face detected',
            blinkCount: 0,
            brightness: Math.round(avgBrightness),
            currentEAR: 0,
          });

          requirementsMetRef.current = false;
          resetCountdown();
        }
      } catch (error) {
        // Detection error - continue silently
      }
    }, 100);
  };
  const captureAndVerify = async () => {
    try {
      setIsVerifying(true);
      setStatus({
        message: 'Sending to backend for verification...',
        type: 'info',
      });

      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const dataURL = canvas.toDataURL('image/jpeg', 0.9);
      const livePhotoBase64 = dataURL.replace(/^data:image\/jpeg;base64,/, '');

      const response = await verifyFace({ livePhotoBase64 });

      // ✅ Set verification result
      setVerificationResult({
        isMatch: response.verified || response.isMatch,
        confidence: response.confidence,
        distance: 1 - (response.confidence || 0) / 100,
        threshold: 0.15,
        liveFaceImage: canvas.toDataURL(),
        verificationData: response.data || response.match_details || {},
      });

      setStatus({
        message: 'Verification successful! Redirecting to login...',
        type: 'success',
      });

      // ✅ Stop camera
      stopCamera();
      setIsVerifying(false);

      // ✅ Call onSuccess immediately if verified
      if (response.verified || response.isMatch) {
        // Call onSuccess which will handle logout
        onSuccess?.(response);
      }
    } catch (error) {
      console.error('Face verification error:', error);

      let errorMessage = 'Verification failed. Please try again.';

      if (error.response) {
        const serverMessage = error.response?.data?.message;
        errorMessage = serverMessage || errorMessage;

        if (error.response.status === 403) {
          errorMessage =
            'API quota exceeded. Please try again later or contact support.';
        } else if (error.response.status === 400) {
          errorMessage =
            serverMessage || 'Face does not match. Please try again.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found or verification not available.';
        } else if (error.response.status === 503) {
          errorMessage =
            'Service temporarily unavailable. Please try again later.';
        }
      } else if (error.request) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (error.message) {
        if (error.message.includes('detect')) {
          errorMessage =
            'Face detection failed. Please ensure your face is clearly visible.';
        } else if (
          error.message.includes('Network') ||
          error.message.includes('Failed to fetch')
        ) {
          errorMessage =
            'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setVerificationResult({
        isMatch: false,
        confidence: 0,
        error: true,
        errorMessage: errorMessage,
        liveFaceImage: null,
      });

      setStatus({
        message: errorMessage,
        type: 'error',
      });

      stopCamera();
      setIsVerifying(false);
      toast.error(errorMessage);
    }
  };

  const resetDemo = () => {
    setVerificationResult(null);
    setStatus({ message: '', type: '' });
    setIsVerifying(false);
    blinkCountRef.current = 0;

    if (modelsLoaded) {
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  const StatusAlert = ({ message, type }) => {
    if (!message) return null;
    const colors = {
      info: 'bg-blue-50 text-blue-800 border-blue-200',
      success: 'bg-green-50 text-green-800 border-green-200',
      error: 'bg-red-50 text-red-800 border-red-200',
      warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    };
    const icons = {
      info: <AlertCircle className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      error: <XCircle className="w-5 h-5" />,
      warning: <AlertCircle className="w-5 h-5" />,
    };
    return (
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${colors[type]} mb-4`}
      >
        {icons[type]}
        <span className="font-medium text-sm">{message}</span>
      </div>
    );
  };

  if (!modelsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-10 text-center max-w-md w-full border border-gray-200">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Initializing System
          </h2>
          <p className="text-gray-600 text-sm">
            Loading facial recognition models...
          </p>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-10 text-center max-w-lg w-full border border-gray-200">
          <div className="w-20 h-20 mx-auto mb-6 text-blue-600">
            <Shield className="w-full h-full" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            Verifying Identity
          </h2>
          <p className="text-gray-600 mb-8">
            Please wait while we verify your facial biometrics...
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Feature Extraction
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  100%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-full transition-all"></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Database Matching
                </span>
                <span className="text-xs font-semibold text-blue-600">
                  Processing...
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-3/4 animate-pulse transition-all"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationResult) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8" />
                <div>
                  <h1 className="text-2xl font-semibold">
                    Verification Results
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Identity Authentication Complete
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {verificationResult.liveFaceImage && (
                <div className="mb-6 text-center">
                  <img
                    src={verificationResult.liveFaceImage}
                    alt="Captured Face"
                    className="rounded-lg shadow-md mx-auto max-w-sm w-full border border-gray-200"
                  />
                </div>
              )}

              <div
                className={`rounded-lg p-6 border-2 ${
                  verificationResult.isMatch
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                      verificationResult.isMatch
                        ? 'bg-emerald-100'
                        : 'bg-red-100'
                    }`}
                  >
                    {verificationResult.isMatch ? (
                      <CheckCircle className="w-10 h-10 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-red-600" />
                    )}
                  </div>
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      verificationResult.isMatch
                        ? 'text-emerald-800'
                        : 'text-red-800'
                    }`}
                  >
                    {verificationResult.isMatch
                      ? 'Identity Verified'
                      : 'Verification Failed'}
                  </h2>
                  <p className="text-gray-700 mb-6">
                    {verificationResult.isMatch
                      ? 'Facial biometrics successfully matched with registered profile'
                      : 'Unable to verify identity with registered profile'}
                  </p>

                  {!verificationResult.error ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Match Confidence
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-3">
                          {verificationResult.confidence.toFixed(1)}%
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              verificationResult.confidence > 85
                                ? 'bg-emerald-500'
                                : verificationResult.confidence > 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{
                              width: `${verificationResult.confidence}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-sm">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Match Quality
                        </div>
                        <div className="text-xl font-bold text-gray-800 mt-2 flex items-center justify-center gap-2">
                          {verificationResult.confidence > 80 ? (
                            <>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                              <span className="text-emerald-700">
                                Strong Match
                              </span>
                            </>
                          ) : verificationResult.confidence > 70 ? (
                            <>
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                              <span className="text-yellow-700">
                                Weak Match
                              </span>
                            </>
                          ) : verificationResult.confidence > 60 ? (
                            <>
                              <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                              <span className="text-orange-700">
                                Poor Match
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                              <span className="text-red-700">No Match</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                      <p className="text-sm text-red-700">
                        {verificationResult.errorMessage}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                <button
                  onClick={resetDemo}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  <RefreshCw className="w-5 h-5" />
                  Verify Again
                </button>

                {!verificationResult.isMatch && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 max-w-2xl w-full">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-amber-900 mb-3">
                          Recommendations for Better Results
                        </h3>
                        <ul className="text-sm text-amber-800 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>
                              Ensure bright, even lighting on your face
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>Position camera at eye level</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>
                              Remove glasses, masks, and accessories if possible
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>Maintain a neutral facial expression</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>
                              Complete the blink detection process carefully
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-7 h-7 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-800">
              Face Verification System
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Biometric identity authentication for healthcare professionals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gray-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Live Camera Capture
                  </h2>
                </div>
              </div>

              <div className="p-5">
                <StatusAlert message={status.message} type={status.type} />

                <div
                  className={`relative mb-5 ${
                    cameraActive ? 'block' : 'hidden'
                  }`}
                >
                  <div className="relative max-w-lg mx-auto">
                    <div className="relative aspect-square rounded-full overflow-hidden bg-black shadow-lg border-4 border-gray-300">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{ transform: 'scaleX(-1)', zIndex: 1 }}
                      />
                      <canvas
                        ref={overlayCanvasRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{ transform: 'scaleX(-1)', zIndex: 2 }}
                      />

                      {isCountingDown && countdown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                          <div className="text-white text-7xl font-bold drop-shadow-lg">
                            {countdown}
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 max-w-xs w-full px-4">
                        <div className="bg-black/75 text-white px-4 py-2.5 rounded-lg font-medium text-center shadow-lg text-sm">
                          {feedback.message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {!cameraActive && modelsLoaded && !verificationResult && (
                  <div className="text-center p-10 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="relative w-14 h-14 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin"></div>
                    </div>
                    <p className="text-gray-700 font-medium text-sm">
                      Initializing Camera
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Please grant camera permissions
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {cameraActive && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-base">👁️</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Blink Detection
                    </h3>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>Blink naturally and slowly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        Progress:{' '}
                        <strong className="text-gray-900">
                          {feedback.blinkCount}/2
                        </strong>{' '}
                        blinks
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>
                        EAR Value:{' '}
                        <strong className="text-gray-900">
                          {feedback.currentEAR?.toFixed(3)}
                        </strong>
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <Loader className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-800">
                      Status Indicators
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Face Detected', value: feedback.faceDetected },
                      { label: 'Lighting', value: feedback.lighting },
                      { label: 'Centered', value: feedback.centered },
                      { label: 'Distance', value: feedback.rightSize },
                    ].map((metric, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-center border ${
                          metric.value
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="text-xs text-gray-600 mb-1">
                          {metric.label}
                        </div>
                        <div
                          className={`text-sm font-bold ${
                            metric.value ? 'text-emerald-700' : 'text-gray-400'
                          }`}
                        >
                          {metric.value ? '✓' : '○'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`rounded-lg p-4 border ${
                    feedback.blinked
                      ? 'bg-emerald-50 border-emerald-300'
                      : 'bg-amber-50 border-amber-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {feedback.blinkCount}/2
                    </div>
                    <p
                      className={`text-xs font-medium ${
                        feedback.blinked ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {feedback.blinked
                        ? 'Blinks Completed'
                        : 'Blinks Required'}
                    </p>
                  </div>
                </div>

                {feedback.centered &&
                  feedback.rightSize &&
                  feedback.lighting &&
                  feedback.blinked && (
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-700 justify-center">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          Ready to Capture
                        </span>
                      </div>
                    </div>
                  )}

                {isCountingDown && (
                  <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-700 justify-center">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="font-medium text-sm">
                        Capturing in {countdown}s
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Instructions
                  </h3>
                  <ol className="space-y-1.5 text-xs text-blue-800">
                    <li>1. Camera activates automatically</li>
                    <li>2. Position face within the circle</li>
                    <li>3. Ensure proper lighting</li>
                    <li>4. Complete 2 blinks</li>
                    <li>5. Hold still during countdown</li>
                    <li>6. System verifies automatically</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="inline-flex items-center gap-5 bg-white border border-gray-200 px-6 py-2.5 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  modelsLoaded ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              ></div>
              <span className="text-xs font-medium text-gray-700">
                AI System
              </span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  cameraActive ? 'bg-emerald-500' : 'bg-gray-400'
                }`}
              ></div>
              <span className="text-xs font-medium text-gray-700">Camera</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isCountingDown ? 'bg-blue-500' : 'bg-gray-400'
                }`}
              ></div>
              <span className="text-xs font-medium text-gray-700">
                {isCountingDown ? `Countdown: ${countdown}s` : 'Standby'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FaceCapture;
