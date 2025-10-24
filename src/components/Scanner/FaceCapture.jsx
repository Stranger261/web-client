import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader,
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import FacePlusPlusService from '../../services/facePlusPlus';

// Helper functions
const fileToBase64 = file => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
  });
};

const fileToBase64FromUrl = async url => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await fileToBase64(blob);
};

function App() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [croppedFace, setCroppedFace] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [idFaceToken, setIdFaceToken] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isVerifying, setIsVerifying] = useState(false); // NEW: Verification loading state
  const [feedback, setFeedback] = useState({
    centered: false,
    rightSize: false,
    blinked: false,
    lighting: false,
    faceDetected: false,
    message: 'Waiting to start...',
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

  // Blink detection state
  const blinkCountRef = useRef(0);
  const cameraActiveRef = useRef(false);
  const requirementsMetRef = useRef(false);
  const lastBlinkTimeRef = useRef(0);
  const lastEARRef = useRef(0.4);
  const isBlinkingRef = useRef(false);
  const countdownStartedRef = useRef(false);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModels = async () => {
    try {
      setStatus({ message: 'Loading AI models...', type: 'info' });

      const MODEL_URL = '/models/';

      console.log('🔄 Loading SSD MobileNetV1 models from:', MODEL_URL);

      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      console.log('✅ Loaded ssdMobilenetv1');

      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log('✅ Loaded faceLandmark68Net');

      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log('✅ Loaded faceRecognitionNet');

      setModelsLoaded(true);
      setStatus({
        message: 'AI Models loaded! Ready to start.',
        type: 'success',
      });
      console.log('✅ All models loaded successfully');
    } catch (error) {
      setStatus({
        message: 'Error loading models. Check console.',
        type: 'error',
      });
      console.error('❌ Model loading error:', error);
    }
  };

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus({ message: 'Processing ID photo with Face++...', type: 'info' });
    const img = await loadImage(file);
    setUploadedImage(img.src);

    try {
      console.log('🔍 Detecting face in uploaded image with Face++...');

      const base64 = await fileToBase64(file);
      const faceData = await FacePlusPlusService.detectFace(base64);

      if (faceData) {
        console.log('✅ Face detected with Face++:', faceData.face_token);

        setIdFaceToken(faceData.face_token);

        // Also do face-api.js detection for display
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections) {
          setFaceDescriptor(detections.descriptor);
          const box = detections.detection.box;
          const croppedCanvas = document.createElement('canvas');
          const ctx = croppedCanvas.getContext('2d');

          const padding = 30;
          croppedCanvas.width = box.width + padding * 2;
          croppedCanvas.height = box.height + padding * 2;

          ctx.drawImage(
            img,
            box.x - padding,
            box.y - padding,
            box.width + padding * 2,
            box.height + padding * 2,
            0,
            0,
            croppedCanvas.width,
            croppedCanvas.height
          );

          setCroppedFace(croppedCanvas.toDataURL());
        }

        setStatus({
          message: `Face registered with Face++! Quality: ${(
            faceData.face_quality?.value * 100
          ).toFixed(1)}%`,
          type: 'success',
        });

        // Auto-start camera after successful ID upload
        setTimeout(() => {
          startCamera();
        }, 500);
      } else {
        console.log('❌ No face detected by Face++');
        setStatus({
          message: 'No face detected. Upload a clearer photo.',
          type: 'error',
        });
      }
    } catch (error) {
      setStatus({
        message: 'Error processing image with Face++.',
        type: 'error',
      });
      console.error('❌ Face++ Error:', error);
    }
  };

  const loadImage = file => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = URL.createObjectURL(file);
    });
  };

  const startCamera = async () => {
    if (!idFaceToken) {
      setStatus({ message: 'Please upload an ID photo first!', type: 'error' });
      return;
    }

    try {
      console.log('🎥 Starting camera...');
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

      // Reset all detection states
      blinkCountRef.current = 0;
      requirementsMetRef.current = false;
      lastBlinkTimeRef.current = 0;
      lastEARRef.current = 0.4;
      isBlinkingRef.current = false;
      countdownStartedRef.current = false;

      setStatus({ message: 'Camera active!', type: 'info' });
      console.log('✅ Camera started');

      setTimeout(() => {
        if (canvasRef.current && videoRef.current && overlayCanvasRef.current) {
          const video = videoRef.current;
          console.log(
            '📐 Setting canvas dimensions:',
            video.videoWidth,
            'x',
            video.videoHeight
          );

          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
          overlayCanvasRef.current.width = video.videoWidth;
          overlayCanvasRef.current.height = video.videoHeight;

          console.log('✅ Canvas dimensions set');
          console.log('🔍 Starting face detection...');
          startDetection();
        } else {
          console.error('❌ Canvas or video ref not available');
        }
      }, 1000);
    } catch (error) {
      setStatus({ message: 'Camera access denied.', type: 'error' });
      console.error('❌ Camera error:', error);
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
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

    console.log(
      '⏱️ Starting countdown... Requirements met:',
      requirementsMetRef.current
    );
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

          // Only capture if requirements are still met
          if (requirementsMetRef.current) {
            console.log('✅ Countdown complete - capturing image');
            captureAndVerify();
          } else {
            console.log('❌ Requirements lost during countdown - cancelling');
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
    console.log('🔄 Resetting countdown');
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCountingDown(false);
    setCountdown(3);
    requirementsMetRef.current = false;
    countdownStartedRef.current = false;
  };

  // SIMPLE and RELIABLE blink detection
  const detectBlink = avgEAR => {
    const BLINK_THRESHOLD = 0.27;
    const DEBOUNCE_TIME = 600;

    const now = Date.now();
    const isEyesClosed = avgEAR < BLINK_THRESHOLD;

    // If eyes were open and now closed, start tracking blink
    if (!isBlinkingRef.current && isEyesClosed) {
      isBlinkingRef.current = true;
      console.log('👀 Eyes closing detected, EAR:', avgEAR.toFixed(3));
    }
    // If eyes were closed and now open, register blink
    else if (isBlinkingRef.current && !isEyesClosed) {
      isBlinkingRef.current = false;

      const timeSinceLastBlink = now - lastBlinkTimeRef.current;

      if (timeSinceLastBlink > DEBOUNCE_TIME) {
        blinkCountRef.current = Math.min(2, blinkCountRef.current + 1);
        lastBlinkTimeRef.current = now;

        console.log(`👁️ BLINK REGISTERED! Count: ${blinkCountRef.current}/2`);
        console.log(
          `   EAR: ${avgEAR.toFixed(
            3
          )}, Time since last: ${timeSinceLastBlink}ms`
        );

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

      // Calculate vertical distances
      const vertical1 = Math.sqrt(
        Math.pow(p2.x - p6.x, 2) + Math.pow(p2.y - p6.y, 2)
      );
      const vertical2 = Math.sqrt(
        Math.pow(p3.x - p5.x, 2) + Math.pow(p3.y - p5.y, 2)
      );

      // Calculate horizontal distance
      const horizontal = Math.sqrt(
        Math.pow(p1.x - p4.x, 2) + Math.pow(p1.y - p4.y, 2)
      );

      if (horizontal === 0) return 0.3;

      const ear = (vertical1 + vertical2) / (2.0 * horizontal);

      return Math.max(0.1, Math.min(0.5, ear));
    } catch (error) {
      console.error('EAR calculation error:', error);
      return 0.3;
    }
  };

  const startDetection = () => {
    console.log('🚀 startDetection() called');
    let detectionCount = 0;

    detectionIntervalRef.current = setInterval(async () => {
      detectionCount++;

      if (!cameraActiveRef.current || !videoRef.current) {
        return;
      }

      // Check if video is ready
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
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })
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

        // Dimmed overlay
        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);

        // Cut circle
        overlayCtx.globalCompositeOperation = 'destination-out';
        overlayCtx.beginPath();
        overlayCtx.arc(centerX, centerY, circleRadius, 0, 2 * Math.PI);
        overlayCtx.fill();
        overlayCtx.globalCompositeOperation = 'source-over';

        // Check brightness
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
          size
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
              Math.pow(faceCenterY - centerY, 2)
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

          // Blink detection
          const leftEye = detections.landmarks.getLeftEye();
          const rightEye = detections.landmarks.getRightEye();
          const leftEAR = calculateEAR(leftEye);
          const rightEAR = calculateEAR(rightEye);
          const avgEAR = (leftEAR + rightEAR) / 2;

          // Detect blink
          detectBlink(avgEAR);

          // VISUAL FEEDBACK: Make eyes red when blinking
          const eyeColor = isBlinkingRef.current ? '#ff4444' : '#00ff00';
          ctx.fillStyle = eyeColor;
          ctx.strokeStyle = eyeColor;
          ctx.lineWidth = 3;

          // Draw both eyes with current state color
          [leftEye, rightEye].forEach(eye => {
            // Draw eye points
            eye.forEach(point => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
              ctx.fill();
            });

            // Draw eye contour
            ctx.beginPath();
            ctx.moveTo(eye[0].x, eye[0].y);
            for (let i = 1; i < eye.length; i++) {
              ctx.lineTo(eye[i].x, eye[i].y);
            }
            ctx.closePath();
            ctx.stroke();
          });

          // Draw circle with appropriate color
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

          // Requirement checking and messaging
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
            // Reset blink count when not centered
            blinkCountRef.current = 0;
          } else if (!isRightSize) {
            message = faceSize < targetSize ? '🔍 Move closer' : '🔍 Move back';
            // Reset blink count when wrong size
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

          // Reset blinks when position changes
          if (!canBlink && blinkCountRef.current > 0) {
            blinkCountRef.current = 0;
            isBlinkingRef.current = false;
          }

          // Update feedback state
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

          // Countdown logic
          const allRequirementsMet =
            isCentered && isRightSize && hasBlinked && isGoodLighting;

          if (allRequirementsMet) {
            if (!requirementsMetRef.current) {
              console.log('✅ All requirements met!');
              requirementsMetRef.current = true;
            }

            // Only start countdown if requirements are met AND countdown hasn't been started yet
            if (!isCountingDown && !countdownStartedRef.current) {
              console.log('🚀 Starting countdown now!');
              startCountdown();
            }
          } else {
            if (requirementsMetRef.current) {
              console.log('❌ Requirements no longer met');
              requirementsMetRef.current = false;
            }
            if (isCountingDown) {
              console.log('🔄 Requirements lost - stopping countdown');
              resetCountdown();
            }
          }
        } else {
          // No face detected
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
        console.error('❌ Detection error:', error);
      }
    }, 100);
  };

  // UPDATED: Better error handling and loading states
  const captureAndVerify = async () => {
    try {
      console.log('📸 Capturing with Face++...');
      setIsVerifying(true); // Show loading state
      setStatus({
        message: 'Sending to Face++ for verification...',
        type: 'info',
      });

      // Capture live face
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const liveImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

      // Convert ID photo to base64
      const idImageBase64 = await fileToBase64FromUrl(uploadedImage);

      // Verify with Face++
      const result = await FacePlusPlusService.verifyFaces(
        idImageBase64,
        liveImageBase64
      );

      console.log('🎯 Face++ Verification Result:', result);

      setVerificationResult({
        isMatch: result.isMatch,
        confidence: result.confidence,
        distance: 1 - result.confidence / 100,
        threshold: 0.15,
        liveFaceImage: canvas.toDataURL(),
        facePlusPlusData: result.facePlusPlusData,
      });

      setIsVerifying(false);
      stopCamera();
    } catch (error) {
      console.error('❌ Face++ verification error:', error);

      // Better error messages for different types of errors
      let errorMessage = 'Verification failed. Please try again.';

      if (
        error.message.includes('403') ||
        error.message.includes('Forbidden')
      ) {
        errorMessage =
          'Face++ API quota exceeded. Please try again later or contact support.';
      } else if (
        error.message.includes('Network') ||
        error.message.includes('Failed to fetch')
      ) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      } else if (error.message.includes('detect')) {
        errorMessage =
          'Face detection failed. Please ensure your face is clearly visible.';
      }

      setStatus({
        message: errorMessage,
        type: 'error',
      });
      setIsVerifying(false);
      resetCountdown();
    }
  };

  const resetDemo = () => {
    setUploadedImage(null);
    setCroppedFace(null);
    setFaceDescriptor(null);
    setIdFaceToken(null);
    setVerificationResult(null);
    setStatus({ message: '', type: '' });
    setIsVerifying(false);
    stopCamera();
  };

  const StatusAlert = ({ message, type }) => {
    if (!message) return null;
    const colors = {
      info: 'bg-blue-100 text-blue-800 border-blue-300',
      success: 'bg-green-100 text-green-800 border-green-300',
      error: 'bg-red-100 text-red-800 border-red-300',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    const icons = {
      info: <AlertCircle className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      error: <XCircle className="w-5 h-5" />,
      warning: <AlertCircle className="w-5 h-5" />,
    };
    return (
      <div
        className={`flex items-center gap-2 p-4 rounded-lg border ${colors[type]}`}
      >
        {icons[type]}
        <span className="font-medium">{message}</span>
      </div>
    );
  };

  if (!modelsLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Loading AI Models...
          </p>
          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // NEW: Show verification loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">
            Verifying with Face++...
          </p>
          <p className="text-gray-500 mt-2">This may take a few seconds</p>
          <div className="mt-4 bg-blue-50 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              Sending images to Face++ for comparison
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            🎯 Verification Result
          </h1>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-indigo-600 mb-4">
                  ID Photo
                </h3>
                <img
                  src={croppedFace || uploadedImage}
                  alt="ID"
                  className="rounded-lg shadow-lg mx-auto"
                />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-indigo-600 mb-4">
                  Live Camera
                </h3>
                <img
                  src={verificationResult.liveFaceImage}
                  alt="Live"
                  className="rounded-lg shadow-lg mx-auto"
                />
              </div>
            </div>
            <div
              className={`p-8 rounded-xl text-center ${
                verificationResult.isMatch
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <div className="text-4xl font-bold mb-4">
                {verificationResult.isMatch
                  ? '✅ IDENTITY VERIFIED'
                  : '❌ IDENTITY NOT VERIFIED'}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-left bg-white bg-opacity-50 rounded-lg p-4">
                <div>
                  <div className="text-sm opacity-75">Match Confidence</div>
                  <div className="text-3xl font-bold">
                    {verificationResult.confidence.toFixed(1)}%
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        verificationResult.confidence > 85
                          ? 'bg-green-500'
                          : verificationResult.confidence > 60
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${verificationResult.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Match Status</div>
                  <div className="text-2xl font-bold mt-1">
                    {verificationResult.confidence > 80
                      ? '🟢 Strong Match'
                      : verificationResult.confidence > 70
                      ? '🟡 Weak Match'
                      : verificationResult.confidence > 60
                      ? '🟠 Poor Match'
                      : '🔴 No Match'}
                  </div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Face++ Confidence</div>
                  <div className="text-xl font-semibold">
                    {verificationResult.confidence.toFixed(1)}%
                  </div>
                  <div className="text-xs opacity-75">(Higher is better)</div>
                </div>
                <div>
                  <div className="text-sm opacity-75">Pass Threshold</div>
                  <div className="text-xl font-semibold">
                    &gt; {verificationResult.threshold * 100}%
                  </div>
                  <div className="text-xs opacity-75">
                    {verificationResult.isMatch ? '✓ Passed' : '✗ Failed'}
                  </div>
                </div>
              </div>

              <div className="text-sm mt-4 p-4 bg-white bg-opacity-70 rounded-lg text-left space-y-2">
                <div className="font-bold text-base mb-2">
                  📊 Face++ Verification Breakdown:
                </div>
                <div className="flex justify-between">
                  <span>Required Confidence:</span>
                  <span className="font-semibold">≥ 85%</span>
                </div>
                <div className="flex justify-between">
                  <span>Your Confidence:</span>
                  <span className="font-semibold">
                    {verificationResult.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Face++ Thresholds:</span>
                  <span className="font-semibold">
                    1e-3:{' '}
                    {verificationResult.facePlusPlusData?.thresholds?.['1e-3']}{' '}
                    | 1e-4:{' '}
                    {verificationResult.facePlusPlusData?.thresholds?.['1e-4']}{' '}
                    | 1e-5:{' '}
                    {verificationResult.facePlusPlusData?.thresholds?.['1e-5']}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Result:</span>
                  <span
                    className={`font-bold ${
                      verificationResult.isMatch
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {verificationResult.isMatch
                      ? 'VERIFIED ✓'
                      : 'NOT VERIFIED ✗'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <button
                onClick={resetDemo}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>

              {!verificationResult.isMatch && (
                <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-left">
                  <div className="font-bold text-yellow-800 mb-2">
                    💡 Tips to Improve Accuracy:
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Ensure good, even lighting on your face</li>
                    <li>Face the camera directly (no angles)</li>
                    <li>Remove glasses or accessories if possible</li>
                    <li>Use a neutral expression similar to your ID</li>
                    <li>Stay still during the countdown</li>
                    <li>Make sure your ID photo is clear and well-lit</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          🎓 Face Verification System
        </h1>
        <p className="text-white text-center mb-8 text-lg">
          Hybrid: face-api.js (Live Guide) + Face++ (Accurate Verify)
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6 border-b-4 border-indigo-600 pb-2">
              📋 Step 1: Upload ID Photo
            </h2>
            <StatusAlert message={status.message} type={status.type} />
            <div className="mt-6 text-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition inline-flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Choose ID Photo
                </div>
              </label>
              <p className="text-sm text-gray-600 mt-2">
                Face++ will detect and register your face
              </p>
            </div>
            {uploadedImage && (
              <div className="mt-6">
                <h3 className="font-semibold text-indigo-600 mb-2">
                  Uploaded ID:
                </h3>
                <img
                  src={uploadedImage}
                  alt="ID"
                  className="rounded-lg shadow-lg w-full"
                />
              </div>
            )}
            {croppedFace && (
              <div className="mt-6">
                <h3 className="font-semibold text-indigo-600 mb-2">
                  Detected Face:
                </h3>
                <img
                  src={croppedFace}
                  alt="Face"
                  className="rounded-lg shadow-lg w-full max-w-sm mx-auto"
                />
              </div>
            )}
            {idFaceToken && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-700 text-sm font-semibold">
                  ✅ Face registered with Face++
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-indigo-600 mb-6 border-b-4 border-indigo-600 pb-2">
              📹 Step 2: Live Verification
            </h2>

            <div
              className={`relative mb-4 ${cameraActive ? 'block' : 'hidden'}`}
            >
              <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-full bg-black shadow-2xl">
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
                  <div
                    className="absolute inset-0 flex items-center justify-center z-10"
                    style={{ zIndex: 10 }}
                  >
                    <div className="text-white text-9xl font-bold drop-shadow-2xl animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}

                <div
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 text-white px-6 py-3 rounded-lg font-bold text-base text-center shadow-lg max-w-xs"
                  style={{ zIndex: 20 }}
                >
                  {feedback.message}
                </div>
              </div>
            </div>

            {cameraActive && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium mb-1">
                    👁️ Blink Detection:
                  </p>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>
                      • <strong>Close and open eyes naturally</strong>
                    </li>
                    <li>• Eyes turn RED when closing detected</li>
                    <li>
                      • Count: <strong>{feedback.blinkCount}/2</strong> blinks
                      registered
                    </li>
                    <li>
                      • Current EAR:{' '}
                      <strong>
                        {feedback.currentEAR?.toFixed(3) || '0.000'}
                      </strong>
                    </li>
                  </ul>
                </div>
                <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Live Status (face-api.js)
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className={`p-2 rounded-lg text-center ${
                      feedback.faceDetected ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <div className="text-xs text-gray-600">Face</div>
                    <div
                      className={`font-bold ${
                        feedback.faceDetected
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}
                    >
                      {feedback.faceDetected ? '✓' : '✗'}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-lg text-center ${
                      feedback.lighting ? 'bg-green-100' : 'bg-orange-100'
                    }`}
                  >
                    <div className="text-xs text-gray-600">Light</div>
                    <div
                      className={`font-bold ${
                        feedback.lighting ? 'text-green-700' : 'text-orange-700'
                      }`}
                    >
                      {feedback.lighting ? '✓' : '✗'}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-lg text-center ${
                      feedback.centered ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    <div className="text-xs text-gray-600">Centered</div>
                    <div
                      className={`font-bold ${
                        feedback.centered ? 'text-green-700' : 'text-blue-700'
                      }`}
                    >
                      {feedback.centered ? '✓' : '✗'}
                    </div>
                  </div>
                  <div
                    className={`p-2 rounded-lg text-center ${
                      feedback.rightSize ? 'bg-green-100' : 'bg-blue-100'
                    }`}
                  >
                    <div className="text-xs text-gray-600">Distance</div>
                    <div
                      className={`font-bold ${
                        feedback.rightSize ? 'text-green-700' : 'text-blue-700'
                      }`}
                    >
                      {feedback.rightSize ? '✓' : '✗'}
                    </div>
                  </div>
                </div>
                <div
                  className={`p-2 rounded-lg text-center ${
                    feedback.blinked ? 'bg-green-100' : 'bg-yellow-100'
                  }`}
                >
                  <div className="text-xs text-gray-600">Blink Count</div>
                  <div
                    className={`font-bold ${
                      feedback.blinked ? 'text-green-700' : 'text-yellow-700'
                    }`}
                  >
                    {feedback.blinkCount}/2 {feedback.blinked ? '✓' : ''}
                  </div>
                </div>

                {feedback.centered &&
                  feedback.rightSize &&
                  feedback.lighting &&
                  feedback.blinked && (
                    <div className="mt-3 pt-3 border-t-2 border-green-200 bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>All requirements met! Countdown starting...</span>
                      </div>
                    </div>
                  )}

                {isCountingDown && (
                  <div className="mt-3 pt-3 border-t-2 border-blue-200 bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Countdown: {countdown}... Hold still!</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  disabled={!idFaceToken}
                  className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                    idFaceToken
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Stop Camera
                </button>
              )}
            </div>

            <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Requirements:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-6">
                <li>✓ Face detected</li>
                <li>✓ Good lighting</li>
                <li>✓ Face centered</li>
                <li>✓ Correct distance</li>
                <li>✓ Blink 2 times</li>
                <li>✓ 3-second countdown</li>
              </ul>
              <p className="text-xs text-blue-600 mt-2 italic">
                face-api.js guides you → Face++ verifies accuracy
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-white rounded-xl p-4 inline-block shadow-lg">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> Face-API{' '}
              {modelsLoaded ? '✅ Active' : '❌ Inactive'} | Face++{' '}
              {idFaceToken ? '✅ Ready' : '❌ Waiting'} | Camera{' '}
              {cameraActive ? '🎥 On' : '📷 Off'} | Countdown{' '}
              {isCountingDown ? `⏱️ ${countdown}` : '⏸️ Inactive'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
