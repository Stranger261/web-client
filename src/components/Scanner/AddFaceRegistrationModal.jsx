import { useState, useRef } from 'react';
import {
  X,
  Camera,
  CheckCircle,
  AlertCircle,
  Upload,
  RefreshCw,
} from 'lucide-react';

import { Button } from '../ui/button';

const AddFaceRegistrationModal = ({
  isOpen,
  onClose,
  onSuccess,
  patientInfo,
}) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [faceImageBase64, setFaceImageBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [useCamera, setUseCamera] = useState(true);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
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
    if (useCamera) {
      startCamera();
    }
  };

  const handleSubmit = async () => {
    if (!faceImageBase64) {
      setError('Please capture or upload a photo first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response
      const mockResponse = {
        success: true,
        data: {
          person: {
            person_id: patientInfo.person_id,
            first_name: patientInfo.first_name,
            last_name: patientInfo.last_name,
            face_quality_score: 87.5,
          },
          face: {
            quality_score: 87.5,
            added_to_faceset: true,
          },
        },
      };

      console.log('Submitting face for person:', patientInfo.person_id);
      console.log('Base64 length:', faceImageBase64.length);

      if (onSuccess) {
        onSuccess(mockResponse.data);
      }

      handleClose();
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to register face. Please try again.');
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
    onClose();
  };

  // Start camera when modal opens
  useState(() => {
    if (isOpen && useCamera && !capturedImage) {
      startCamera();
    }
    return () => stopCamera();
  }, [isOpen, useCamera, capturedImage]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
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
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Method Selection */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={useCamera ? 'primary' : 'outline'}
              onClick={() => {
                setUseCamera(true);
                setCapturedImage(null);
                setFaceImageBase64(null);
                if (!capturedImage) startCamera();
              }}
              icon={Camera}
              className="flex-1"
            >
              Use Camera
            </Button>
            <Button
              variant={!useCamera ? 'primary' : 'outline'}
              onClick={() => {
                setUseCamera(false);
                stopCamera();
                setCapturedImage(null);
                setFaceImageBase64(null);
              }}
              icon={Upload}
              className="flex-1"
            >
              Upload Photo
            </Button>
          </div>

          {/* Camera/Upload Area */}
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            {!capturedImage ? (
              <>
                {useCamera ? (
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Face Guide Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-80 border-4 border-white/50 rounded-full"></div>
                    </div>

                    {/* Instructions */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-center text-sm">
                        Position your face within the circle
                      </p>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium mb-1">
                      Click to upload photo
                    </p>
                    <p className="text-gray-500 text-sm">PNG, JPG up to 5MB</p>
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

          {/* Instructions */}
          {!capturedImage && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photo Guidelines
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Face the camera directly</li>
                <li>• Ensure good lighting</li>
                <li>• Remove glasses if possible</li>
                <li>• Keep a neutral expression</li>
                <li>• Only one person in the photo</li>
              </ul>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {!capturedImage ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={useCamera ? capturePhoto : null}
                  disabled={!useCamera || !stream}
                  icon={Camera}
                  className="flex-1"
                >
                  Capture Photo
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={retakePhoto}
                  icon={RefreshCw}
                  className="flex-1"
                >
                  Retake
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  icon={CheckCircle}
                  className="flex-1"
                >
                  {isSubmitting ? 'Registering...' : 'Register Face'}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFaceRegistrationModal;
