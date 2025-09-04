import { useEffect, useState } from 'react';
import { useCamera } from '../../hooks/useCamera';

const CameraScanner = ({ onCapture, disabled }) => {
  const {
    videoRef,
    hiddenCanvasRef,
    feedback,
    analyze,
    captureToDataURL,
    startCamera,
    stopCamera,
    switchCamera,
    active,
  } = useCamera();

  const [captured, setCaptured] = useState(false);

  // continuous analysis only if camera is active
  useEffect(() => {
    if (active) {
      const loop = () => {
        analyze();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }
  }, [active, analyze]);

  const handleCapture = () => {
    const dataUrl = captureToDataURL();
    if (dataUrl) {
      onCapture(dataUrl);
      setCaptured(true);
      stopCamera(); // stop camera after capture
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg border border-gray-300"
          style={{ transform: 'scaleX(1)' }} // ensure no mirroring
        />
        {/* guide box overlay */}
        {active && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-4 border-blue-500 rounded-lg w-2/3 h-40 bg-transparent opacity-75" />
          </div>
        )}
      </div>

      <canvas ref={hiddenCanvasRef} className="hidden" />
      <p className="text-sm text-gray-600">{feedback}</p>

      <div className="flex justify-between mt-2">
        {!active ? (
          <button
            type="button"
            onClick={startCamera}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={switchCamera}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Switch Camera
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Capture
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraScanner;
