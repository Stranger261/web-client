import { useRef, useState, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [feedback, setFeedback] = useState('Camera inactive.');
  const [facingMode, setFacingMode] = useState('environment');
  const [active, setActive] = useState(false);

  useEffect(() => {
    let rafId;

    async function start() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
        setStream(mediaStream);
        setFeedback('Camera started. Align the ID within the box.');
      } catch (e) {
        console.error(e);
        setFeedback('Failed to access camera. Please check permissions.');
      }
    }

    function stop() {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      cancelAnimationFrame(rafId);
      setFeedback('Camera inactive.');
    }

    if (active) start();
    else stop();

    return () => stop();
  }, [active, facingMode]);

  // Analyze frame (feedback)
  const analyze = () => {
    if (
      !window.cv ||
      !hiddenCanvasRef.current ||
      !videoRef.current ||
      videoRef.current.readyState !== 4
    )
      return;

    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let mat = window.cv.matFromImageData(imgData);
    let gray = new window.cv.Mat();
    window.cv.cvtColor(mat, gray, window.cv.COLOR_RGBA2GRAY);

    // sharpness
    let lap = new window.cv.Mat();
    window.cv.Laplacian(gray, lap, window.cv.CV_64F);
    let mean = new window.cv.Mat();
    let std = new window.cv.Mat();
    window.cv.meanStdDev(lap, mean, std);
    const sharpness = Math.pow(std.data64F[0], 2);

    // brightness
    const avgBrightness = window.cv.mean(gray)[0];

    // edges (placement check heuristic)
    let edges = new window.cv.Mat();
    window.cv.Canny(gray, edges, 50, 150);
    let nonZero = window.cv.countNonZero(edges);

    // decide feedback
    if (sharpness < 100) setFeedback('Too blurry. Hold still!');
    else if (avgBrightness < 80 || avgBrightness > 180)
      setFeedback('Too dark or too bright. Adjust lighting.');
    else if (nonZero < 500) setFeedback('Place ID inside the guide box.');
    else setFeedback('Perfect! Ready to capture.');

    // cleanup
    mat.delete();
    gray.delete();
    lap.delete();
    mean.delete();
    std.delete();
    edges.delete();
  };

  // Capture + auto-enhance
  const captureToDataURL = () => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let mat = window.cv.matFromImageData(imgData);

    // grayscale
    let gray = new window.cv.Mat();
    window.cv.cvtColor(mat, gray, window.cv.COLOR_RGBA2GRAY);

    // histogram equalization
    let equalized = new window.cv.Mat();
    window.cv.equalizeHist(gray, equalized);

    // sharpen
    let kernel = window.cv.matFromArray(
      3,
      3,
      window.cv.CV_32F,
      [0, -1, 0, -1, 5, -1, 0, -1, 0]
    );
    let sharp = new window.cv.Mat();
    window.cv.filter2D(equalized, sharp, window.cv.CV_8U, kernel);

    // back to canvas
    window.cv.imshow(canvas, sharp);

    // cleanup
    mat.delete();
    gray.delete();
    equalized.delete();
    kernel.delete();
    sharp.delete();

    return canvas.toDataURL('image/png');
  };

  const startCamera = () => setActive(true);
  const stopCamera = () => setActive(false);
  const switchCamera = () =>
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));

  return {
    videoRef,
    hiddenCanvasRef,
    feedback,
    analyze,
    captureToDataURL,
    startCamera,
    stopCamera,
    switchCamera,
    active,
  };
};
