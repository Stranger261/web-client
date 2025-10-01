// hooks/useAWSFaceRecog.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useAWSFaceRecognition = (config = {}) => {
  const {
    wsUrl: providedWsUrl,
    onVerificationResult,
    onError,
    frameInterval = 200,
  } = config;

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const streamRef = useRef(null);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [analysis, setAnalysis] = useState({
    face_detected: false,
    face_position: 'center',
    brightness: 'good',
    blur: 'good',
    glasses: false,
    face_size: 'good',
    confidence: 0.0,
    feedback: 'No face detected',
    ready_for_capture: false,
    face_box: null,
  });
  const [countdown, setCountdown] = useState({ active: false, count: 0 });
  const [isCapturing, setIsCapturing] = useState(false);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    if (providedWsUrl) return providedWsUrl;

    const serverHost = 'localhost:8001';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    return `${protocol}//${serverHost}/api/live_verify/ws/live_verify`;
  }, [providedWsUrl]);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setCameraStatus('requesting');
      setAnalysis(prev => ({
        ...prev,
        feedback: 'Requesting camera access...',
      }));

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

        return new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();

              if (canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }

              setCameraStatus('ready');
              setAnalysis(prev => ({
                ...prev,
                feedback: 'Camera ready - Connecting to server...',
              }));
              resolve();
            } catch (playError) {
              console.error('Video play failed:', playError);
              reject(playError);
            }
          };

          videoRef.current.onerror = reject;
        });
      }
    } catch (error) {
      console.error('Camera initialization failed:', error);
      setCameraStatus('error');
      setAnalysis(prev => ({
        ...prev,
        feedback: 'Camera access denied or not available',
      }));
      if (onError) onError(error);
      throw error;
    }
  }, [onError]);

  // Capture and send frame
  const captureAndSendFrame = useCallback(() => {
    if (
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN ||
      !videoRef.current ||
      videoRef.current.videoWidth === 0 ||
      !canvasRef.current
    ) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    const frameData = canvas.toDataURL('image/jpeg', 0.7);

    wsRef.current.send(
      JSON.stringify({
        type: 'frame',
        data: frameData,
      })
    );
  }, []);

  // Start frame capture
  const startFrameCapture = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    frameIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, frameInterval);
  }, [frameInterval, captureAndSendFrame]);

  // Initialize WebSocket
  const initializeWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = getWebSocketUrl();
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setIsConnected(true);

      setAnalysis(prev => ({
        ...prev,
        feedback: 'Connected - Position your face in the circle',
      }));

      // Start frame capture
      setTimeout(() => {
        startFrameCapture();
      }, 1000);
    };

    wsRef.current.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onclose = event => {
      setIsConnected(false);
      setAnalysis(prev => ({
        ...prev,
        feedback: 'Connection lost - Reconnecting...',
      }));

      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }

      if (event.code !== 1000 && cameraStatus === 'ready') {
        setTimeout(() => {
          initializeWebSocket();
        }, 3000);
      }
    };

    wsRef.current.onerror = error => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setAnalysis(prev => ({
        ...prev,
        feedback: 'Connection error - Please check your network',
      }));
      if (onError) onError(error);
    };
  }, [getWebSocketUrl, onError, startFrameCapture, cameraStatus]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(
    data => {
      switch (data.type) {
        case 'welcome':
          break;

        case 'authenticated':
          break;

        case 'analysis':
          setAnalysis(data.analysis);
          setCountdown({
            active: data.countdown_active,
            count: data.countdown,
          });

          break;

        case 'verification_result':
          setIsCapturing(false);

          // 🔑 Grab the current frame as Blob so you can upload to /api/face/verify
          if (canvasRef.current) {
            canvasRef.current.toBlob(
              blob => {
                if (onVerificationResult) {
                  onVerificationResult(data.result, blob);
                }
              },
              'image/jpeg',
              0.9
            );
          } else {
            onVerificationResult(data.result, null);
          }
          break;

        case 'error':
          setIsCapturing(false);
          setAnalysis(prev => ({
            ...prev,
            feedback: data.message,
          }));
          if (onError) onError(new Error(data.message));
          break;

        case 'auth_error':
          setAnalysis(prev => ({
            ...prev,
            feedback: 'Authentication failed',
          }));
          break;

        default:
      }
    },
    [onVerificationResult, onError]
  );

  // Manual capture
  const manualCapture = useCallback(() => {
    if (
      !wsRef.current ||
      wsRef.current.readyState !== WebSocket.OPEN ||
      !videoRef.current ||
      videoRef.current.videoWidth === 0 ||
      isCapturing
    ) {
      return;
    }

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    const frameData = canvas.toDataURL('image/jpeg', 0.8);

    setAnalysis(prev => ({
      ...prev,
      feedback: 'Processing AWS verification...',
    }));

    wsRef.current.send(
      JSON.stringify({
        type: 'manual_capture',
        data: frameData,
      })
    );
  }, [isCapturing]);

  // CAN BE REMOVE
  // Add this function inside your hook
  const analyzeImageForFace = useCallback(imageData => {
    const data = imageData.data;
    let brightPixels = 0;
    let totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = (r + g + b) / 3;

      if (brightness > 80 && brightness < 200) {
        brightPixels++;
      }
    }

    const brightRatio = brightPixels / totalPixels;
    return brightRatio > 0.15 && brightRatio < 0.6;
  }, []);

  // Add this function to analyze current frame
  const analyzeCurrentFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasLikelyFace = analyzeImageForFace(imageData);

    if (hasLikelyFace) {
      setAnalysis(prev => ({
        ...prev,
        face_detected: true,
        feedback: 'Perfect! Hold still',
        ready_for_capture: true,
        face_box: [160, 120, 320, 240], // Approximate center face box
      }));
    } else {
      setAnalysis(prev => ({
        ...prev,
        face_detected: false,
        feedback: 'Position your face in the circle',
        ready_for_capture: false,
        face_box: null,
      }));
    }
  }, [isCapturing, analyzeImageForFace]);

  // Add this useEffect to start real-time analysis when camera is ready
  useEffect(() => {
    let analysisInterval;

    if (cameraStatus === 'ready' && !isCapturing) {
      analysisInterval = setInterval(analyzeCurrentFrame, 300); // Every 300ms
    }

    return () => {
      if (analysisInterval) {
        clearInterval(analysisInterval);
      }
    };
  }, [cameraStatus, isCapturing, analyzeCurrentFrame]);

  // Start process
  const start = useCallback(async () => {
    try {
      await initializeCamera();
    } catch (error) {
      console.error('Failed to start camera:', error);
    }
  }, [initializeCamera]);

  // Stop process
  // Stop process
  const stop = useCallback(() => {
    // stop frame capture loop
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }

    // close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // stop camera tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // reset states
    setCameraStatus('idle');
    setIsConnected(false);
    setIsCapturing(false);
    setAnalysis({
      face_detected: false,
      face_position: 'center',
      brightness: 'good',
      blur: 'good',
      glasses: false,
      face_size: 'good',
      confidence: 0.0,
      feedback: 'Click start to begin',
      ready_for_capture: false,
      face_box: null,
    });
    setCountdown({ active: false, count: 0 });
  }, []);

  // Initialize WebSocket when camera is ready
  useEffect(() => {
    if (cameraStatus === 'ready' && !wsRef.current) {
      initializeWebSocket();
    }
  }, [cameraStatus, initializeWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
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
    isReady: cameraStatus === 'ready' && isConnected,
    canCapture: analysis.face_detected && isConnected && !isCapturing,
    hasError: cameraStatus === 'error',
  };
};
