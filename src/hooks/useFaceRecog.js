import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for face recognition functionality
 * @param {Object} config - Configuration options
 * @param {string} config.wsUrl - WebSocket URL (optional, auto-detected if not provided)
 * @param {function} config.onVerificationResult - Callback for verification results
 * @param {function} config.onError - Callback for errors
 * @param {number} config.frameInterval - Frame capture interval in ms (default: 200)
 * @returns {Object} Face recognition state and methods
 */
export const useFaceRecognition = (config = {}) => {
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
    feedback: 'Click start to begin',
    ready_for_capture: false,
    face_box: null,
  });
  const [countdown, setCountdown] = useState({ active: false, count: 0 });
  const [isCapturing, setIsCapturing] = useState(false);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    if (providedWsUrl) return providedWsUrl;

    // Use the correct server port (8010) instead of the frontend port (5173)
    const serverHost = 'localhost:8001'; // Your FastAPI server
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    // Based on your main.py: app.include_router(live_verify.router, prefix="/api/live_verify")
    const wsUrl = `${protocol}//${serverHost}/api/live_verify/ws/live_verify`;

    return wsUrl;
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
          videoRef.current.onloadedmetadata = () => {
            // Create canvas for frame capture
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

  // Capture and send frame - Fixed to check WebSocket readyState directly
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
  }, []); // Remove isConnected dependency since we check WebSocket state directly

  // Start frame capture
  const startFrameCapture = useCallback(() => {
    console.log('🎬 Starting frame capture...');
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }

    frameIntervalRef.current = setInterval(() => {
      captureAndSendFrame();
    }, frameInterval);
  }, [frameInterval, captureAndSendFrame]);

  // Initialize WebSocket
  const initializeWebSocket = useCallback(() => {
    // Prevent multiple connections
    if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      console.log('⏳ WebSocket already connecting, skipping...');
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      console.log('🔌 Closing existing WebSocket connection');
      wsRef.current.close();
    }

    const wsUrl = getWebSocketUrl();
    console.log('🔗 Connecting to WebSocket:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('✅ WebSocket connection opened');
      setIsConnected(true);
      setAnalysis(prev => ({
        ...prev,
        feedback: 'Connected - Position your face in the circle',
      }));

      // Start frame capture after a small delay to ensure everything is ready
      setTimeout(() => {
        console.log('🎬 Starting frame capture after connection established');
        startFrameCapture();
      }, 100);
    };

    wsRef.current.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        // Log the specific message content
        switch (data.type) {
          case 'welcome':
            break;
          case 'analysis':
            break;
          case 'verification_result':
            console.log('✅ Verification result:', data.result);
            break;
          case 'ping':
            break;
          case 'error':
            console.log('❌ Error message:', data.message);
            break;
          default:
            console.log('❓ Unknown message type:', data);
        }

        handleWebSocketMessage(data);
      } catch (error) {
        console.error('❌ Failed to parse WebSocket message:', error);
        console.error('Raw data was:', event.data);
      }
    };

    wsRef.current.onclose = event => {
      console.log('❌ WebSocket closed:', event.code, event.reason);
      setIsConnected(false);
      setAnalysis(prev => ({
        ...prev,
        feedback: 'Connection lost - Reconnecting...',
      }));

      // Stop frame capture when connection is lost
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }

      // Auto-reconnect after delay (only if not manually closed)
      if (event.code !== 1000 && cameraStatus === 'ready') {
        setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          initializeWebSocket();
        }, 3000);
      }
    };

    wsRef.current.onerror = error => {
      console.error('💥 WebSocket error:', error);
      setIsConnected(false);
      setAnalysis(prev => ({
        ...prev,
        feedback: 'Connection error - Please check your network',
      }));
      if (onError) onError(error);
    };
  }, [getWebSocketUrl, onError]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(
    data => {
      switch (data.type) {
        case 'welcome':
          console.log('Received welcome message');
          // Don't update analysis for welcome messages
          break;

        case 'analysis':
          setAnalysis(data.analysis);
          setCountdown({
            active: data.countdown_active,
            count: data.countdown,
          });
          break;

        case 'verification_result':
          console.log('🎯 Verification result received:', data.result);
          setIsCapturing(false);
          if (onVerificationResult) {
            onVerificationResult(data.result);
          }
          break;

        case 'error':
          console.log('❌ Error from server:', data.message);
          setIsCapturing(false);
          setAnalysis(prev => ({
            ...prev,
            feedback: data.message,
          }));
          if (onError) onError(new Error(data.message));
          break;

        case 'ping':
          console.log('🏓 Server ping received');
          // Just log it, don't need to do anything
          break;

        default:
          console.log('❓ Unhandled message type:', data.type);
          console.log('Full message:', data);
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
      feedback: 'Processing verification...',
    }));

    wsRef.current.send(
      JSON.stringify({
        type: 'manual_capture',
        data: frameData,
      })
    );
  }, [isCapturing]);

  // Start the face recognition process
  const start = useCallback(async () => {
    try {
      await initializeCamera();
    } catch (error) {
      // Error already handled in initializeCamera
    }
  }, [initializeCamera]);

  // Stop the face recognition process
  const stop = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setCameraStatus('idle');
    setIsConnected(false);
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
    setIsCapturing(false);
  }, []);

  // Initialize WebSocket when camera is ready
  useEffect(() => {
    if (cameraStatus === 'ready' && !wsRef.current) {
      console.log('📡 Camera ready, initializing WebSocket...');
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
    // Refs for video and canvas elements
    videoRef,
    canvasRef,

    // State
    isConnected,
    cameraStatus,
    analysis,
    countdown,
    isCapturing,

    // Methods
    start,
    stop,
    manualCapture,

    // Computed properties
    isReady: cameraStatus === 'ready' && isConnected,
    canCapture: analysis.face_detected && isConnected && !isCapturing,
    hasError: cameraStatus === 'error',

    // debugging
  };
};
