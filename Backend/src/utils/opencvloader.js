// Loads OpenCV.js and exports a promise that resolves to cv when ready
import cv from "opencv.js";

let _cvPromise = null;

export function loadOpenCV() {
  if (_cvPromise) return _cvPromise;

  _cvPromise = new Promise((resolve) => {
    // opencv.js uses onRuntimeInitialized
    if (cv && cv.onRuntimeInitialized) {
      cv.onRuntimeInitialized = () => resolve(cv);
    } else {
      // fallback: resolve immediately if already ready
      resolve(cv);
    }
  });

  return _cvPromise;
}
