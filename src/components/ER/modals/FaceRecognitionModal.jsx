import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Info,
  UserCheck,
  UserX,
  X,
  Scan,
  Lightbulb,
  Crosshair,
  Maximize2,
  Camera,
  ClipboardList,
  Pill,
  Stethoscope,
  Bed,
  Activity,
  Calendar,
  FlaskConical,
  ShieldAlert,
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import { erService } from '../../../services/erApi';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/dateFormatter';

/**
 * ERFaceRecognitionModal
 *
 * FOR UNCONSCIOUS / UNRESPONSIVE PATIENTS — no blink detection.
 *
 * Flow:
 *   1. Camera opens — auto-detects face, centering, and lighting
 *   2. Nurse manually presses Capture when satisfied
 *   3. Image sent to ER face recognition API
 *   4a. Match → shows patient identity card + medical records panel → onMatchFound
 *   4b. No match → onNoMatch({ faceData })
 *
 * Video/canvas are always in the DOM (off-screen) so refs are never null.
 * Medical records panel auto-loads on match from the updated resolvePatientByFaceMatch.
 */
export default function ERFaceRecognitionModal({
  isOpen,
  onClose,
  onMatchFound,
  onNoMatch,
}) {
  const [phase, setPhase] = useState('idle');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [matchedPatient, setMatchedPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [capturedB64, setCapturedB64] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [feedback, setFeedback] = useState({
    faceDetected: false,
    centered: false,
    rightSize: false,
    lighting: false,
    message: '',
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const streamRef = useRef(null);
  const detectionTimerRef = useRef(null);
  const mountedRef = useRef(true);
  const cameraActiveRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    doReset();
    if (!modelsLoaded) {
      setPhase('loading');
      loadModels();
    } else {
      setPhase('camera');
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const doReset = () => {
    setMatchedPatient(null);
    setMedicalRecords(null);
    setCapturedUrl(null);
    setCapturedB64(null);
    setConfidence(null);
    setErrorMsg('');
    setFeedback({
      faceDetected: false,
      centered: false,
      rightSize: false,
      lighting: false,
      message: "Position the patient's face in the circle",
    });
  };

  // ── Model loading ────────────────────────────────────────────────────────
  const loadModels = async () => {
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models/');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models/');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models/');
      if (!mountedRef.current) return;
      setModelsLoaded(true);
      setPhase('camera');
      startCamera();
    } catch {
      if (!mountedRef.current) return;
      setErrorMsg('Failed to load AI models. Please refresh and try again.');
      setPhase('error');
    }
  };

  // ── Camera ───────────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          'Camera API unavailable. This page requires HTTPS or localhost.',
        );

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await new Promise((resolve, reject) => {
        videoRef.current.onloadedmetadata = () =>
          videoRef.current.play().then(resolve).catch(reject);
      });

      if (!mountedRef.current) return;

      cameraActiveRef.current = true;
      const v = videoRef.current;
      canvasRef.current.width = overlayRef.current.width = v.videoWidth;
      canvasRef.current.height = overlayRef.current.height = v.videoHeight;
      startDetection();
    } catch (err) {
      if (!mountedRef.current) return;
      let msg = 'Camera access failed. ';
      if (err.name === 'NotAllowedError')
        msg += 'Permission denied — allow camera in browser settings.';
      else if (err.name === 'NotFoundError')
        msg += 'No camera found on this device.';
      else if (err.name === 'NotReadableError')
        msg += 'Camera is in use by another application.';
      else msg += err.message;
      setErrorMsg(msg);
      setPhase('error');
    }
  };

  const stopCamera = useCallback(() => {
    cameraActiveRef.current = false;
    clearInterval(detectionTimerRef.current);
    detectionTimerRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    try {
      if (videoRef.current) videoRef.current.srcObject = null;
    } catch {}
  }, []);

  // ── Detection loop ───────────────────────────────────────────────────────
  const startDetection = () => {
    detectionTimerRef.current = setInterval(async () => {
      if (!cameraActiveRef.current || !videoRef.current?.videoWidth) return;
      try {
        const det = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
          )
          .withFaceLandmarks();

        if (!canvasRef.current || !overlayRef.current || !mountedRef.current)
          return;

        const ov = overlayRef.current;
        const ovx = ov.getContext('2d');
        const cv = canvasRef.current;
        const cvx = cv.getContext('2d');
        ovx.clearRect(0, 0, ov.width, ov.height);
        cvx.clearRect(0, 0, cv.width, cv.height);

        const cx = ov.width / 2,
          cy = ov.height / 2;
        const r = Math.min(ov.width, ov.height) * 0.48;

        ovx.fillStyle = 'rgba(0,0,0,0.65)';
        ovx.fillRect(0, 0, ov.width, ov.height);
        ovx.globalCompositeOperation = 'destination-out';
        ovx.beginPath();
        ovx.arc(cx, cy, r, 0, 2 * Math.PI);
        ovx.fill();
        ovx.globalCompositeOperation = 'source-over';

        const sz = Math.floor(r * 2);
        const tmp = Object.assign(document.createElement('canvas'), {
          width: sz,
          height: sz,
        });
        tmp
          .getContext('2d')
          .drawImage(videoRef.current, cx - r, cy - r, sz, sz, 0, 0, sz, sz);
        const id = tmp.getContext('2d').getImageData(0, 0, sz, sz);
        let bsum = 0;
        for (let i = 0; i < id.data.length; i += 4)
          bsum += (id.data[i] + id.data[i + 1] + id.data[i + 2]) / 3;
        const avgB = bsum / (id.data.length / 4);
        const goodLight = avgB > 60 && avgB < 200;

        let centered = false,
          rightSize = false;

        if (det) {
          const box = det.detection.box;
          const fcx = box.x + box.width / 2,
            fcy = box.y + box.height / 2;
          const dist = Math.hypot(fcx - cx, fcy - cy);
          const fs = (box.width + box.height) / 2;
          const ts = r * 1.4;
          centered = dist < r * 0.3;
          rightSize = Math.abs(fs - ts) < ts * 0.3;

          cvx.fillStyle = '#22c55e';
          det.landmarks.positions.forEach(p => {
            cvx.beginPath();
            cvx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
            cvx.fill();
          });

          const ready = centered && rightSize && goodLight;
          ovx.beginPath();
          ovx.arc(cx, cy, r, 0, 2 * Math.PI);
          ovx.strokeStyle = ready
            ? '#10b981'
            : !goodLight
              ? '#f59e0b'
              : '#3b82f6';
          ovx.lineWidth = 8;
          ovx.stroke();

          let message = '';
          if (!goodLight) {
            message =
              avgB <= 60
                ? 'Too dark — add more light'
                : 'Too bright — reduce light';
          } else if (!centered) {
            if (fcx < cx - r * 0.25) message = 'Move right';
            else if (fcx > cx + r * 0.25) message = 'Move left';
            else if (fcy < cy - r * 0.25) message = 'Move down';
            else message = 'Move up';
          } else if (!rightSize) {
            message = fs < ts ? 'Move closer' : 'Move farther back';
          } else {
            message = 'Face positioned — press Capture when ready';
          }

          if (mountedRef.current)
            setFeedback({
              faceDetected: true,
              centered,
              rightSize,
              lighting: goodLight,
              message,
            });
        } else {
          ovx.beginPath();
          ovx.arc(cx, cy, r, 0, 2 * Math.PI);
          ovx.strokeStyle = '#ef4444';
          ovx.lineWidth = 6;
          ovx.stroke();
          if (mountedRef.current)
            setFeedback({
              faceDetected: false,
              centered: false,
              rightSize: false,
              lighting: false,
              message: 'No face detected — position patient face in circle',
            });
        }
      } catch {
        /* silent frame drop */
      }
    }, 100);
  };

  // ── Capture & recognize ──────────────────────────────────────────────────
  const captureAndRecognize = async () => {
    setPhase('recognizing');
    try {
      const cvs = document.createElement('canvas');
      cvs.width = videoRef.current?.videoWidth ?? 640;
      cvs.height = videoRef.current?.videoHeight ?? 480;
      const ctx = cvs.getContext('2d');
      if (!videoRef.current) throw new Error('Camera not available');
      ctx.drawImage(videoRef.current, 0, 0, cvs.width, cvs.height);
      ctx.translate(cvs.width, 0);
      ctx.scale(-1, 1);

      stopCamera();

      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        cvs.toBlob(blob => reader.readAsDataURL(blob), 'image/jpeg', 0.9);
      });

      setCapturedUrl(cvs.toDataURL('image/jpeg', 0.9));
      setCapturedB64(base64);

      const res = await erService.recognizePatientByFace(base64);
      console.log(res);
      const data = res?.data ?? res;
      if (!mountedRef.current) return;
      console.log(data);

      if (data?.matched && data?.patient) {
        setMatchedPatient(data.patient); // now a clean formatted object
        setMedicalRecords(data.medicalRecords ?? null);
        setConfidence(data.confidence ?? null);
        setPhase('matched');
      } else {
        setPhase('no_match');
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const msg =
        err.response?.data?.message ||
        'Face recognition failed. Please try again.';
      setErrorMsg(msg);
      setPhase('error');
      toast.error(msg);
    }
  };

  const handleRetry = () => {
    stopCamera();
    doReset();
    setPhase('camera');
    startCamera();
  };

  const handleConfirmMatch = () => {
    onMatchFound({
      patient: matchedPatient,
      faceData: { image_base64: capturedB64, confidence },
      medicalRecords,
    });
    onClose();
  };

  const handleProceedUnknown = () => {
    onNoMatch({ faceData: { image_base64: capturedB64 } });
    onClose();
  };

  const canCapture =
    feedback.faceDetected &&
    feedback.centered &&
    feedback.rightSize &&
    feedback.lighting;
  const isWide = phase === 'matched' && matchedPatient;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{
        background: isOpen ? 'rgba(0,0,0,0.7)' : 'transparent',
        backdropFilter: isOpen ? 'blur(4px)' : 'none',
      }}
    >
      {/* Always-mounted off-screen video/canvas */}
      <div
        style={{
          position: 'fixed',
          left: -9999,
          top: -9999,
          width: 1,
          height: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        <video ref={videoRef} autoPlay muted playsInline />
        <canvas ref={canvasRef} />
        <canvas ref={overlayRef} />
      </div>

      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-all duration-500 ${isWide ? 'w-full max-w-6xl' : 'w-full max-w-3xl'}`}
        style={{ maxHeight: '95vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-violet-600 to-violet-700 shrink-0">
          <div className="flex items-center gap-3">
            <Scan size={20} className="text-white" />
            <div>
              <h1 className="text-base font-bold text-white">
                ER Face Recognition
              </h1>
              <p className="text-violet-200 text-xs">
                Unresponsive / unconscious patient identification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {/* ── LOADING ── */}
          {(phase === 'idle' || phase === 'loading') && (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                <div className="absolute inset-0 rounded-full border-4 border-t-violet-600 animate-spin" />
                <Shield
                  size={22}
                  className="absolute inset-0 m-auto text-violet-500"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Loading AI Models
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Preparing facial recognition engine…
                </p>
              </div>
            </div>
          )}

          {/* ── CAMERA ── */}
          {phase === 'camera' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <LiveFeed
                  videoRef={videoRef}
                  canvasRef={canvasRef}
                  overlayRef={overlayRef}
                  message={feedback.message}
                />
                <button
                  onClick={captureAndRecognize}
                  disabled={!canCapture}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                    canCapture
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Camera size={17} />
                  {canCapture
                    ? 'Capture & Identify Patient'
                    : 'Waiting for face to be positioned…'}
                </button>
                <div className="flex items-start gap-2 px-1">
                  <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    No blink required — patient may be unconscious. Position the
                    face in the circle, then press Capture when ready.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                    Positioning Check
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        label: 'Face Detected',
                        value: feedback.faceDetected,
                        Icon: Scan,
                      },
                      {
                        label: 'Good Lighting',
                        value: feedback.lighting,
                        Icon: Lightbulb,
                      },
                      {
                        label: 'Centered',
                        value: feedback.centered,
                        Icon: Crosshair,
                      },
                      {
                        label: 'Distance OK',
                        value: feedback.rightSize,
                        Icon: Maximize2,
                      },
                    ].map(({ label, value, Icon }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${value ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'}`}
                      >
                        <Icon
                          size={15}
                          className={
                            value
                              ? 'text-emerald-500'
                              : 'text-slate-300 dark:text-slate-500'
                          }
                        />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex-1">
                          {label}
                        </span>
                        {value ? (
                          <CheckCircle
                            size={14}
                            className="text-emerald-500 shrink-0"
                          />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-500 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <div
                    className={`mt-3 p-3 rounded-xl text-center font-bold text-sm transition-all ${canCapture ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}
                  >
                    {canCapture
                      ? 'Ready — press Capture'
                      : 'Adjust positioning'}
                  </div>
                </div>

                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <Info
                      size={14}
                      className="text-violet-500 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-[10px] font-black text-violet-800 dark:text-violet-300 uppercase tracking-wide mb-2">
                        For Unconscious Patients
                      </p>
                      <ol className="space-y-1.5 text-xs text-violet-700 dark:text-violet-400">
                        {[
                          "Hold camera or phone above patient's face",
                          'Ensure adequate light — avoid shadows',
                          'All 4 checks turn green',
                          'Press Capture — nurse confirms result',
                        ].map((s, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="font-black shrink-0">
                              {i + 1}.
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RECOGNIZING ── */}
          {phase === 'recognizing' && (
            <div className="p-10 flex flex-col items-center gap-6">
              {capturedUrl && (
                <div className="relative w-32 h-32">
                  <img
                    src={capturedUrl}
                    alt="Scan"
                    className="w-32 h-32 rounded-full object-cover border-4 border-violet-300 dark:border-violet-700 shadow-lg"
                  />
                  <div
                    className="absolute rounded-full border-4 border-t-violet-600 border-transparent animate-spin"
                    style={{ inset: -4 }}
                  />
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                  Searching Patient Database
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Matching captured face against registered patients…
                </p>
              </div>
              <div className="space-y-3 w-full max-w-sm">
                {[
                  { label: 'Feature Extraction', done: true },
                  { label: 'Patient Database Match', done: false },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {s.label}
                      </span>
                      <span className="text-xs font-bold text-violet-600">
                        {s.done ? '100%' : 'Processing…'}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-violet-600 rounded-full ${s.done ? 'w-full' : 'w-3/4 animate-pulse'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MATCHED — two-column: identity left, medical records right ── */}
          {phase === 'matched' && matchedPatient && (
            <div
              className="flex flex-col lg:flex-row min-h-0"
              style={{ minHeight: 520 }}
            >
              {/* Left: identity + actions */}
              <div className="lg:w-[400px] shrink-0 p-5 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-700 flex flex-col gap-4 overflow-y-auto">
                {/* Captured photo + match badge */}
                {capturedUrl && (
                  <div className="flex items-center gap-4">
                    <img
                      src={capturedUrl}
                      alt="Captured"
                      className="w-20 h-20 rounded-xl object-cover border-4 border-emerald-300 dark:border-emerald-700 shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle size={15} className="text-emerald-500" />
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          Patient Identified
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Confidence:{' '}
                        <strong className="text-slate-600 dark:text-slate-300">
                          {confidence != null
                            ? `${typeof confidence === 'number' && confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence)}%`
                            : 'High'}
                        </strong>
                      </p>
                    </div>
                  </div>
                )}

                {/* Dark identity card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0">
                        <UserCheck size={18} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black text-base leading-tight">
                          {/* backend now sends fullName, firstName, lastName */}
                          {matchedPatient.fullName ??
                            `${matchedPatient.firstName ?? ''} ${matchedPatient.lastName ?? ''}`.trim()}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-emerald-300 text-xs font-mono font-semibold">
                            {matchedPatient.mrn}
                          </span>
                          {matchedPatient.age && (
                            <span className="text-slate-400 text-xs">
                              {matchedPatient.age} y/o
                            </span>
                          )}
                          {matchedPatient.gender && (
                            <span className="text-slate-400 text-xs capitalize">
                              · {matchedPatient.gender}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        {
                          label: 'Date of Birth',
                          value: matchedPatient.dateOfBirth
                            ? new Date(
                                matchedPatient.dateOfBirth,
                              ).toLocaleDateString()
                            : '—',
                        },
                        {
                          label: 'Blood Type',
                          value: matchedPatient.bloodType || '—',
                          red: !!matchedPatient.bloodType,
                        },
                        {
                          label: 'Contact',
                          value: matchedPatient.contactNumber || '—',
                        },
                        {
                          label: 'Nationality',
                          value: matchedPatient.nationality || '—',
                        },
                      ].map(({ label, value, red }) => (
                        <div key={label} className="bg-white/5 rounded-lg p-2">
                          <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide">
                            {label}
                          </p>
                          <p
                            className={`text-xs font-bold mt-0.5 truncate ${red ? 'text-red-300' : 'text-white/80'}`}
                          >
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {matchedPatient.emergencyContacts?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wide mb-1.5">
                          Emergency Contact
                        </p>
                        {matchedPatient.emergencyContacts
                          .slice(0, 1)
                          .map((c, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs text-white/80 font-medium">
                                {c.contact_name || c.name}
                              </span>
                              {c.relationship && (
                                <span className="text-[10px] text-slate-400">
                                  {c.relationship}
                                </span>
                              )}
                              <span className="text-[10px] text-emerald-300 font-mono ml-auto">
                                {c.contact_number || c.phone}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}

                    {medicalRecords?.summary?.hasActiveAdmission && (
                      <div className="mt-3 flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-lg px-3 py-2">
                        <ShieldAlert
                          size={13}
                          className="text-amber-400 shrink-0"
                        />
                        <p className="text-[11px] text-amber-300 font-semibold">
                          Currently has an active admission
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification warning */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-2">
                  <AlertCircle
                    size={14}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Verify physically</strong> before confirming.
                    Cross-check with any ID, wristband, or accompanying person.
                  </p>
                </div>

                {/* Action buttons — pinned to bottom */}
                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => setPhase('no_match')}
                    className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Not a Match
                  </button>
                  <button
                    onClick={handleConfirmMatch}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <UserCheck size={15} /> Confirm & Register
                  </button>
                </div>
              </div>

              {/* Right: medical records panel */}
              <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-800/30">
                <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0">
                  <ClipboardList size={15} className="text-violet-500" />
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                    Medical Records
                  </h3>
                  <span className="text-[10px] text-slate-400 ml-1">
                    Auto-loaded on face match
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <MedicalRecordsPanel medicalRecords={medicalRecords} />
                </div>
              </div>
            </div>
          )}

          {/* ── NO MATCH ── */}
          {phase === 'no_match' && (
            <div className="p-6 flex flex-col md:flex-row gap-6">
              {capturedUrl && (
                <div className="shrink-0 mx-auto md:mx-0 text-center">
                  <img
                    src={capturedUrl}
                    alt="Captured"
                    className="w-44 h-44 rounded-xl object-cover border-4 border-amber-300 dark:border-amber-700 shadow-md opacity-75"
                  />
                  <p className="text-xs text-slate-400 mt-2 font-medium">
                    Scanned image
                  </p>
                </div>
              )}
              <div className="flex-1">
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <UserX
                        size={22}
                        className="text-amber-600 dark:text-amber-400"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-amber-800 dark:text-amber-300">
                        No Match Found
                      </h2>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Patient not registered in the system
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    The face scan photo will be stored with the temporary record
                    for future re-identification.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-4 flex gap-2">
                  <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    <p className="font-bold mb-1">What happens next:</p>
                    <ul className="space-y-0.5">
                      {[
                        'A TEMP MRN will be assigned',
                        'Face photo stored for future re-identification',
                        'Staff can retry scan from the patient board at any time',
                      ].map(s => (
                        <li key={s} className="flex items-start gap-1.5">
                          <span className="font-black text-blue-400 shrink-0">
                            —
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRetry}
                    className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> Retry Scan
                  </button>
                  <button
                    onClick={handleProceedUnknown}
                    className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <UserX size={15} /> Register as Unknown Patient
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ERROR ── */}
          {phase === 'error' && (
            <div className="p-12 flex flex-col items-center gap-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle size={28} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-lg">
                  Recognition Failed
                </p>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  onClick={handleProceedUnknown}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold flex items-center gap-2"
                >
                  <UserX size={14} /> Skip — Register Unknown
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LiveFeed: mirrors off-screen video into a visible display canvas ─────────
function LiveFeed({ videoRef, canvasRef, overlayRef, message }) {
  const displayRef = useRef(null);
  useEffect(() => {
    let raf;
    const draw = () => {
      const disp = displayRef.current;
      const video = videoRef.current;
      const marks = canvasRef.current;
      const overlay = overlayRef.current;
      if (disp && video && video.readyState >= 2) {
        const ctx = disp.getContext('2d');
        disp.width = video.videoWidth || 640;
        disp.height = video.videoHeight || 480;
        ctx.save();
        ctx.translate(disp.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, disp.width, disp.height);
        ctx.restore();
        if (marks?.width) ctx.drawImage(marks, 0, 0, disp.width, disp.height);
        if (overlay?.width)
          ctx.drawImage(overlay, 0, 0, disp.width, disp.height);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [videoRef, canvasRef, overlayRef]);

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-950 shadow-xl border-2 border-slate-300 dark:border-slate-600">
      <canvas
        ref={displayRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] z-10">
        <div className="bg-black/80 text-white px-4 py-2.5 rounded-xl text-sm font-semibold text-center shadow-lg">
          {message || 'Initializing camera…'}
        </div>
      </div>
    </div>
  );
}

// ─── MedicalRecordsPanel ──────────────────────────────────────────────────────
function MedicalRecordsPanel({ medicalRecords }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!medicalRecords) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <FlaskConical
          size={32}
          className="text-slate-200 dark:text-slate-600 mb-3"
        />
        <p className="text-sm font-semibold text-slate-400">
          No medical records found
        </p>
        <p className="text-xs text-slate-300 dark:text-slate-500 mt-1">
          Patient may be a first-time visitor
        </p>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'diagnoses', label: 'Diagnoses' },
    { key: 'medications', label: 'Medications' },
    { key: 'admissions', label: 'Admissions' },
    { key: 'lab', label: 'Lab Results' }, // New tab
    { key: 'imaging', label: 'Imaging' }, // New tab
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Summary row */}
      {medicalRecords.summary && (
        <div className="grid grid-cols-3 gap-2">
          {[
            {
              label: 'Records',
              value: medicalRecords.summary.totalMedicalRecords,
              Icon: ClipboardList,
              color: 'text-blue-500',
              bg: 'bg-blue-50 dark:bg-blue-900/20',
            },
            {
              label: 'Appointments',
              value: medicalRecords.summary.totalAppointments,
              Icon: Calendar,
              color: 'text-violet-500',
              bg: 'bg-violet-50 dark:bg-violet-900/20',
            },
            {
              label: 'Admissions',
              value: medicalRecords.summary.totalAdmissions,
              Icon: Bed,
              color: 'text-amber-500',
              bg: 'bg-amber-50 dark:bg-amber-900/20',
            },
          ].map(({ label, value, Icon, color, bg }) => (
            <div
              key={label}
              className={`${bg} rounded-xl p-3 flex flex-col items-center gap-1 border border-white dark:border-slate-700`}
            >
              <Icon size={15} className={color} />
              <span className={`text-xl font-black ${color} tabular-nums`}>
                {value ?? 0}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
                {label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab.key ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab bodies */}
      <div className="space-y-3">
        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            {medicalRecords.latestVitals && (
              <VitalsStrip vitals={medicalRecords.latestVitals} />
            )}

            {medicalRecords.recentDiagnoses?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3">
                <SectionTitle
                  Icon={Stethoscope}
                  label="Recent Diagnoses"
                  count={medicalRecords.recentDiagnoses.length}
                />
                <div className="space-y-2">
                  {medicalRecords.recentDiagnoses.slice(0, 3).map((d, i) => (
                    <div
                      key={i}
                      className="flex gap-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="w-1 rounded-full bg-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                          {d.diagnosis}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-400">
                            {fmtDate(d.date)}
                          </span>
                          {d.doctor && (
                            <span className="text-[10px] text-slate-400">
                              · {d.doctor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {medicalRecords.currentMedications?.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3">
                <SectionTitle
                  Icon={Pill}
                  label="Current Medications"
                  count={medicalRecords.currentMedications.length}
                />
                <div className="space-y-1.5">
                  {medicalRecords.currentMedications.slice(0, 4).map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {m.medicationName}
                      </span>
                      {m.dosage && (
                        <span className="text-slate-400">{m.dosage}</span>
                      )}
                      {m.frequency && <MedBadge>{m.frequency}</MedBadge>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!medicalRecords.latestVitals &&
              !medicalRecords.recentDiagnoses?.length &&
              !medicalRecords.currentMedications?.length && (
                <EmptyState label="No clinical data on file" />
              )}
          </>
        )}

        {/* Diagnoses */}
        {activeTab === 'diagnoses' &&
          (medicalRecords.recentDiagnoses?.length > 0 ? (
            medicalRecords.recentDiagnoses.map((d, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug flex-1">
                    {d.diagnosis}
                  </p>
                  {d.recordType && (
                    <MedBadge>{d.recordType.replace('_', ' ')}</MedBadge>
                  )}
                </div>
                {d.treatment && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      Tx:{' '}
                    </span>
                    {d.treatment}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700 flex-wrap">
                  <Calendar size={10} className="text-slate-300" />
                  <span className="text-[10px] text-slate-400">
                    {fmtDate(d.date)}
                  </span>
                  {d.doctor && (
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {d.doctor}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <EmptyState label="No diagnosis records found" />
          ))}

        {/* Medications */}
        {activeTab === 'medications' &&
          (medicalRecords.currentMedications?.length > 0 ? (
            medicalRecords.currentMedications.map((m, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Pill size={14} className="text-green-500" />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex-1">
                    {m.medicationName}
                  </span>
                  {m.status && (
                    <MedBadge color={m.status === 'active' ? 'green' : 'slate'}>
                      {m.status}
                    </MedBadge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  {m.dosage && (
                    <span className="text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Dose:{' '}
                      </span>
                      {m.dosage}
                    </span>
                  )}
                  {m.frequency && (
                    <span className="text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Freq:{' '}
                      </span>
                      {m.frequency}
                    </span>
                  )}
                  {m.route && (
                    <span className="text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        Route:{' '}
                      </span>
                      {m.route}
                    </span>
                  )}
                  {m.prescriptionDate && (
                    <span className="text-slate-400">
                      {fmtDate(m.prescriptionDate)}
                    </span>
                  )}
                </div>
                {m.instructions && (
                  <p className="text-[11px] text-slate-400 mt-1.5 italic">
                    {m.instructions}
                  </p>
                )}
              </div>
            ))
          ) : (
            <EmptyState label="No medication records found" />
          ))}

        {/* Admissions */}
        {activeTab === 'admissions' &&
          (medicalRecords.recentAdmissions?.length > 0 ? (
            medicalRecords.recentAdmissions.map((adm, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Bed size={14} className="text-violet-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {adm.admissionNumber}
                    </span>
                  </div>
                  <MedBadge
                    color={
                      adm.status === 'admitted'
                        ? 'amber'
                        : adm.status === 'discharged'
                          ? 'green'
                          : 'slate'
                    }
                  >
                    {adm.status}
                  </MedBadge>
                </div>
                {adm.diagnosis && (
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    {adm.diagnosis}
                  </p>
                )}
                {adm.dischargeSummary && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mb-1.5">
                    {adm.dischargeSummary}
                  </p>
                )}
                <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-700 flex-wrap">
                  <span>Admitted {fmtDate(adm.admissionDate)}</span>
                  {adm.dischargeDate && (
                    <span>Discharged {fmtDate(adm.dischargeDate)}</span>
                  )}
                  {adm.lengthOfStay != null && (
                    <span className="font-semibold text-slate-500 dark:text-slate-400">
                      {adm.lengthOfStay}d stay
                    </span>
                  )}
                  {adm.doctor && <span className="ml-auto">{adm.doctor}</span>}
                </div>
              </div>
            ))
          ) : (
            <EmptyState label="No admission records found" />
          ))}

        {activeTab === 'lab' &&
          (medicalRecords.labResults?.length > 0 ? (
            <div className="space-y-3">
              {medicalRecords.labResults.map((lab, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {lab.testName}
                    </span>
                    <MedBadge
                      color={lab.status === 'Completed' ? 'green' : 'slate'}
                    >
                      {lab.status}
                    </MedBadge>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {formatDate(lab.orderDate)}
                  </p>
                  {lab.results.map((r, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-slate-700 first:border-0"
                    >
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {r.parameter}
                      </span>
                      <span
                        className={`text-xs font-mono ${r.isAbnormal ? 'text-red-500 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {r.value} {r.unit}
                        {r.isAbnormal && (
                          <AlertTriangle
                            size={10}
                            className="inline ml-1 text-red-500"
                          />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No lab results found" icon={FlaskConical} />
          ))}

        {/* Imaging Studies */}
        {activeTab === 'imaging' &&
          (medicalRecords.imagingStudies?.length > 0 ? (
            <div className="space-y-3">
              {medicalRecords.imagingStudies.map((study, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {study.modality} - {study.bodyPart}
                      </span>
                      <p className="text-xs text-slate-400">
                        {study.description}
                      </p>
                    </div>
                    <MedBadge
                      color={study.status === 'Reported' ? 'green' : 'slate'}
                    >
                      {study.status}
                    </MedBadge>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">
                    {formatDate(study.studyDate)}
                  </p>
                  {study.report && (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        Impression:
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {study.report.impression}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="No imaging studies found" icon={Scan} />
          ))}
      </div>
    </div>
  );
}

// ─── VitalsStrip ──────────────────────────────────────────────────────────────
function VitalsStrip({ vitals }) {
  const items = [
    { label: 'BP', value: vitals.bloodPressure, unit: 'mmHg' },
    { label: 'HR', value: vitals.heartRate, unit: 'bpm' },
    { label: 'Temp', value: vitals.temperature, unit: '°C' },
    { label: 'SpO₂', value: vitals.oxygenSaturation, unit: '%' },
    { label: 'RR', value: vitals.respiratoryRate, unit: '/min' },
    { label: 'Weight', value: vitals.weight, unit: 'kg' },
  ].filter(i => i.value != null && i.value !== '');
  if (!items.length) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-3">
      <SectionTitle Icon={Activity} label="Last Known Vitals" />
      <div className="grid grid-cols-3 gap-2">
        {items.map(({ label, value, unit }) => (
          <div
            key={label}
            className="bg-white/70 dark:bg-slate-800/60 rounded-lg p-2"
          >
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide block">
              {label}
            </span>
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 tabular-nums leading-tight">
              {value}
              <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                {unit}
              </span>
            </span>
          </div>
        ))}
      </div>
      {vitals.recordedAt && (
        <p className="text-[10px] text-slate-400 mt-2 text-right">
          Recorded {fmtDate(vitals.recordedAt)}
        </p>
      )}
    </div>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────
function SectionTitle({ Icon, label, count }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <Icon size={13} className="text-slate-400 shrink-0" />
      <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      {count != null && (
        <span className="ml-auto text-[10px] font-bold text-slate-400 tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}

function MedBadge({ children, color = 'slate' }) {
  const map = {
    red: 'bg-red-100 text-red-700 border-red-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    violet: 'bg-violet-100 text-violet-700 border-violet-200',
    slate:
      'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide shrink-0 ${map[color] ?? map.slate}`}
    >
      {children}
    </span>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <ClipboardList
        size={28}
        className="text-slate-200 dark:text-slate-600 mb-2"
      />
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
