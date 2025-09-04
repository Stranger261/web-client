import { useEffect, useState } from 'react';
import cv from '@techstark/opencv-js';

let opencvLoadingPromise = null;

export function useOpenCv() {
  const [cvLoaded, setCvLoaded] = useState(false);

  useEffect(() => {
    if (!opencvLoadingPromise) {
      opencvLoadingPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.x/opencv.js';
        script.async = true;
        script.onload = () => {
          cv['onRuntimeInitialized'] = () => {
            resolve();
          };
        };
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    opencvLoadingPromise.then(() => setCvLoaded(true));
  }, []);

  return cvLoaded;
}
