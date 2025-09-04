import React, { useEffect, useRef } from 'react';

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const faceOverlayRef = useRef(null);
  const faceBoxRef = useRef(null);
  const countdownRef = useRef(null);
  const statusIndicatorRef = useRef(null);
  const statusTextRef = useRef(null);
  const captureBtnRef = useRef(null);
  const resultModalRef = useRef(null);
  const resultIconRef = useRef(null);
  const resultTitleRef = useRef(null);
  const resultMessageRef = useRef(null);

  useEffect(() => {
    class LiveFaceVerifier {
      constructor() {
        this.video = videoRef.current;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ws = null;
        this.isConnected = false;
        this.stream = null;
        this.frameInterval = null;

        // UI refs
        this.faceOverlay = faceOverlayRef.current;
        this.faceBox = faceBoxRef.current;
        this.countdown = countdownRef.current;
        this.statusIndicator = statusIndicatorRef.current;
        this.statusText = statusTextRef.current;
        this.captureBtn = captureBtnRef.current;
        this.resultModal = resultModalRef.current;
        this.resultIcon = resultIconRef.current;
        this.resultTitle = resultTitleRef.current;
        this.resultMessage = resultMessageRef.current;

        this.init();
      }

      async init() {
        try {
          await this.initCamera();
          this.initWebSocket();
          this.setupEventListeners();
        } catch (error) {
          console.error('Initialization failed:', error);
          this.updateStatus('error', 'Camera initialization failed');
        }
      }

      async initCamera() {
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
          });

          this.video.srcObject = this.stream;

          return new Promise(resolve => {
            this.video.onloadedmetadata = () => {
              this.canvas.width = this.video.videoWidth;
              this.canvas.height = this.video.videoHeight;
              resolve();
            };
          });
        } catch (error) {
          throw new Error('Camera access denied or not available');
        }
      }

      initWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live_verify/ws/live_verify`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnected = true;
          this.updateStatus(
            'good',
            'Camera ready - Position your face in the circle'
          );
          this.startFrameCapture();
        };

        this.ws.onmessage = event => {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        };

        this.ws.onclose = () => {
          this.isConnected = false;
          this.updateStatus('error', 'Connection lost - Reconnecting...');
          setTimeout(() => this.initWebSocket(), 3000);
        };

        this.ws.onerror = error => {
          console.error('WebSocket error:', error);
          this.updateStatus('error', 'Connection error');
        };
      }

      setupEventListeners() {
        this.captureBtn.addEventListener('click', () => {
          if (this.isConnected) {
            this.manualCapture();
          }
        });
      }

      startFrameCapture() {
        if (this.frameInterval) {
          clearInterval(this.frameInterval);
        }

        this.frameInterval = setInterval(() => {
          this.captureAndSendFrame();
        }, 200);
      }

      captureAndSendFrame() {
        if (!this.isConnected || this.video.videoWidth === 0) return;

        this.ctx.drawImage(this.video, 0, 0);
        const frameData = this.canvas.toDataURL('image/jpeg', 0.7);

        this.ws.send(
          JSON.stringify({
            type: 'frame',
            data: frameData,
          })
        );
      }

      manualCapture() {
        if (!this.isConnected || this.video.videoWidth === 0) return;

        this.ctx.drawImage(this.video, 0, 0);
        const frameData = this.canvas.toDataURL('image/jpeg', 0.8);

        this.captureBtn.disabled = true;
        this.updateStatus('warning', 'Processing...');

        this.ws.send(
          JSON.stringify({
            type: 'manual_capture',
            data: frameData,
          })
        );
      }

      handleWebSocketMessage(data) {
        switch (data.type) {
          case 'verification_result':
            this.showResult(data.result);
            this.captureBtn.disabled = false;
            break;

          case 'error':
            this.updateStatus('error', data.message);
            this.captureBtn.disabled = false;
            break;
          default:
            break;
        }
      }

      updateStatus(type, message) {
        this.statusIndicator.className = `flex items-center justify-center mb-4 p-3 rounded-lg ${type}`;
        this.statusText.textContent = message;
      }

      showResult(result) {
        if (result.matched) {
          this.resultIcon.textContent = '✓';
          this.resultIcon.className =
            'w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-bold text-green-400 bg-green-100';
          this.resultTitle.textContent = 'Verification Successful!';
          this.resultMessage.textContent = `Welcome, ${result.name || 'back'}!`;
        } else {
          this.resultIcon.textContent = '✗';
          this.resultIcon.className =
            'w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-bold text-red-400 bg-red-100';
          this.resultTitle.textContent = 'Verification Failed';
          this.resultMessage.textContent =
            result.message || 'Face not recognized. Please try again.';
        }
        this.resultModal.classList.remove('hidden');
      }

      destroy() {
        if (this.frameInterval) clearInterval(this.frameInterval);
        if (this.ws) this.ws.close();
        if (this.stream) this.stream.getTracks().forEach(track => track.stop());
      }
    }

    const verifier = new LiveFaceVerifier();
    return () => verifier.destroy();
  }, []);

  return (
    <div>
      {/* Main container */}
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-5 text-center">
          <h1 className="text-xl font-semibold mb-2">Face Verification</h1>
          <p className="opacity-90 text-sm">Position your face in the circle</p>
        </div>

        {/* Camera */}
        <div className="relative w-full h-96 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          ></video>
          <div
            ref={faceOverlayRef}
            className="absolute w-48 h-48 border-4 border-dashed border-white rounded-full animate-pulse pointer-events-none"
          ></div>
          <div
            ref={faceBoxRef}
            className="absolute border-2 border-red-500 rounded-md hidden"
          ></div>
          <div
            ref={countdownRef}
            className="absolute bg-black bg-opacity-80 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl font-semibold z-10 hidden"
          >
            3
          </div>
        </div>

        {/* Feedback */}
        <div className="p-5 text-center">
          <div
            ref={statusIndicatorRef}
            className="flex items-center justify-center mb-4 p-3 rounded-lg"
          >
            <div className="w-5 h-5 bg-green-400 rounded-full mr-2"></div>
            <span ref={statusTextRef} className="text-sm">
              Initializing camera...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div
              id="positionStatus"
              className="flex items-center p-2 rounded-lg bg-gray-100 text-sm"
            >
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full mr-2"></div>
              <span>Position</span>
            </div>
            <div
              id="brightnessStatus"
              className="flex items-center p-2 rounded-lg bg-gray-100 text-sm"
            >
              <div className="w-2.5 h-2.5 bg-orange-400 rounded-full mr-2"></div>
              <span>Lighting</span>
            </div>
            <div
              id="blurStatus"
              className="flex items-center p-2 rounded-lg bg-gray-100 text-sm"
            >
              <div className="w-2.5 h-2.5 bg-red-400 rounded-full mr-2"></div>
              <span>Clarity</span>
            </div>
            <div
              id="glassesStatus"
              className="flex items-center p-2 rounded-lg bg-gray-100 text-sm"
            >
              <div className="w-2.5 h-2.5 bg-red-400 rounded-full mr-2"></div>
              <span>Glasses</span>
            </div>
          </div>

          <button
            ref={captureBtnRef}
            disabled
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-full text-lg font-bold cursor-pointer disabled:opacity-50"
          >
            Manual Capture
          </button>
        </div>
      </div>

      {/* Modal */}
      <div
        ref={resultModalRef}
        className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 flex items-center justify-center z-50 hidden"
      >
        <div className="bg-white p-8 rounded-lg text-center max-w-xs mx-5">
          <div
            ref={resultIconRef}
            className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-4xl font-bold text-green-400 bg-green-100"
          >
            ✓
          </div>
          <h2 ref={resultTitleRef} className="text-xl font-semibold">
            Verification Successful!
          </h2>
          <p ref={resultMessageRef} className="text-sm mt-2">
            Welcome back!
          </p>
          <button
            className="bg-gray-200 text-gray-700 py-2 px-6 rounded-full mt-5 cursor-pointer"
            onClick={() => resultModalRef.current.classList.add('hidden')}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;
