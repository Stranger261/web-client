// components/modals/AddFaceRegistrationModal.jsx

import { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
  Loader,
  Info,
  Shield,
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import { usePatient } from '../../../contexts/PatientContext';
import { useAuth } from '../../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AddFaceRegistrationModal = ({
  isOpen,
  onClose,
  onSuccess,
  patientInfo,
}) => {
  const { addFaceToPatient } = usePatient();
  const { currentUser } = useAuth();

  // State management
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceImageBase64, setFaceImageBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [useCamera, setUseCamera] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
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

  // Refs
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

  // Load face-api models on mount
  useEffect(() => {
    const initialize = async () => {
      await loadModels();
    };
    initialize();

    return () => {
      stopCamera();
    };
  }, []);

  // Start camera when modal opens and models are loaded
  useEffect(() => {
    if (isOpen && modelsLoaded && useCamera && !capturedImage) {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, modelsLoaded, useCamera, capturedImage]);

  const loadModels = async () => {
    try {
      setStatus({ message: 'Loading AI models...', type: 'info' });

      const MODEL_URL = '/models/';

      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      setStatus({
        message: 'AI Models loaded successfully',
        type: 'success',
      });
    } catch (err) {
      console.error('Model loading error:', err);
      setStatus({
        message: 'Error loading AI models. Please refresh the page.',
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
      if (videoRef.current) {
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

        // Reset blink detection
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
        setError(null);

        // Initialize canvases
        setTimeout(() => {
          if (
            canvasRef.current &&
            videoRef.current &&
            overlayCanvasRef.current
          ) {
            const video = videoRef.current;

            canvasRef.current.width = video.videoWidth;
            canvasRef.current.height = video.videoHeight;
            overlayCanvasRef.current.width = video.videoWidth;
            overlayCanvasRef.current.height = video.videoHeight;

            startDetection();
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Camera access failed. ';

      if (err.message.includes('not available')) {
        errorMessage += 'Camera API requires HTTPS or localhost.';
      } else if (err.name === 'NotAllowedError') {
        errorMessage +=
          'Camera permission denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use by another application.';
      } else {
        errorMessage += err.message;
      }

      setError(errorMessage);
      setStatus({ message: errorMessage, type: 'error' });
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

        // Draw overlay with cutout circle
        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        overlayCtx.globalCompositeOperation = 'destination-out';
        overlayCtx.beginPath();
        overlayCtx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
        overlayCtx.fill();
        overlayCtx.globalCompositeOperation = 'source-over';

        // Calculate brightness
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

          // Draw landmarks
          const positions = detections.landmarks.positions;
          ctx.fillStyle = '#00ff00';
          positions.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Eye detection and blink tracking
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

          // Draw circle border with status color
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

          // Generate feedback message
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
            capturePhoto();
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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image back to normal orientation
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result.split(',')[1];
          setFaceImageBase64(base64);
          setCapturedImage(reader.result);
        };
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.95,
    );

    stopCamera();
    toast.success('Photo captured successfully!');
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setFaceImageBase64(base64);
      setCapturedImage(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setFaceImageBase64(null);
    setError(null);
    blinkCountRef.current = 0;
    if (useCamera && modelsLoaded) {
      startCamera();
    }
  };

  const handleSubmit = async () => {
    if (!faceImageBase64) {
      setError('Please capture or upload a photo first');
      return;
    }

    if (!patientInfo?.person_id) {
      setError('Patient information is missing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const staffId = currentUser?.staff_id || currentUser?.user_id;

      const result = await addFaceToPatient(
        patientInfo.person_id,
        faceImageBase64,
        staffId,
      );

      console.log('Face registered successfully:', result);
      toast.success('Face registered successfully!');

      if (onSuccess) {
        onSuccess(result);
      }

      handleClose();
    } catch (err) {
      console.error('Face registration error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to register face. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setFaceImageBase64(null);
    setError(null);
    setUseCamera(true);
    blinkCountRef.current = 0;
    onClose();
  };

  if (!isOpen) return null;

  // Loading screen
  if (!modelsLoaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-10 text-center max-w-md w-full">
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Add Face Registration
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {patientInfo
                  ? `${patientInfo.first_name} ${patientInfo.last_name} (MRN: ${patientInfo.mrn})`
                  : 'Patient'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-88px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main Camera/Upload Area */}
            <div className="lg:col-span-2">
              {/* Method Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setUseCamera(true);
                    setCapturedImage(null);
                    setFaceImageBase64(null);
                    if (!capturedImage && modelsLoaded) startCamera();
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    useCamera
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  Use Camera
                </button>
                <button
                  onClick={() => {
                    setUseCamera(false);
                    stopCamera();
                    setCapturedImage(null);
                    setFaceImageBase64(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    !useCamera
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </button>
              </div>

              {/* Status Alert */}
              {status.message && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border mb-4 ${
                    status.type === 'info'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : status.type === 'success'
                        ? 'bg-green-50 text-green-800 border-green-200'
                        : status.type === 'error'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                  }`}
                >
                  {status.type === 'info' && (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  {status.type === 'success' && (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  {status.type === 'error' && (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium text-sm">{status.message}</span>
                </div>
              )}

              {/* Camera/Upload Area */}
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {!capturedImage ? (
                  <>
                    {useCamera ? (
                      <div className="relative aspect-square bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
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

                        {/* Countdown Overlay */}
                        {isCountingDown && countdown > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
                            <div className="text-white text-7xl font-bold drop-shadow-lg">
                              {countdown}
                            </div>
                          </div>
                        )}

                        {/* Feedback Message */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 max-w-xs w-full px-4">
                          <div className="bg-black/75 text-white px-4 py-2.5 rounded-lg font-medium text-center shadow-lg text-sm">
                            {feedback.message}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-gray-200 transition-colors">
                        <Upload className="w-16 h-16 text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium mb-1">
                          Click to upload photo
                        </p>
                        <p className="text-gray-500 text-sm">
                          PNG, JPG up to 5MB
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <img
                      src={capturedImage}
                      alt="Captured face"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                    <div className="absolute top-4 right-4">
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Photo Ready
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mt-4">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t mt-4">
                {!capturedImage ? (
                  <>
                    <button
                      onClick={handleClose}
                      className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    {useCamera && (
                      <button
                        onClick={() => {
                          if (cameraActive && !isCountingDown) {
                            // Manual capture
                            capturePhoto();
                          }
                        }}
                        disabled={!cameraActive || isCountingDown}
                        className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Camera className="w-4 h-4" />
                        {isCountingDown
                          ? `Capturing (${countdown}s)`
                          : 'Manual Capture'}
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Retake
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Register Face
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar - Info and Status */}
            <div className="space-y-4">
              {cameraActive && !capturedImage && (
                <>
                  {/* Blink Detection Status */}
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

                  {/* Status Indicators */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                      <Loader className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-semibold text-gray-800">
                        Status Indicators
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          label: 'Face Detected',
                          value: feedback.faceDetected,
                        },
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
                              metric.value
                                ? 'text-emerald-700'
                                : 'text-gray-400'
                            }`}
                          >
                            {metric.value ? '✓' : '○'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Blink Progress */}
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
                          feedback.blinked
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {feedback.blinked
                          ? 'Blinks Completed'
                          : 'Blinks Required'}
                      </p>
                    </div>
                  </div>

                  {/* Ready Status */}
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

                  {/* Countdown Status */}
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
                </>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      Photo Guidelines
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Face the camera directly</li>
                      <li>• Ensure good, even lighting</li>
                      <li>• Remove glasses if possible</li>
                      <li>• Keep a neutral expression</li>
                      <li>• Complete 2 blinks when prompted</li>
                      <li>• Hold still during countdown</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFaceRegistrationModal;
