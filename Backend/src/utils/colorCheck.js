// Uses opencv.js to create mask for green range and returns mask + greenPercent
// input: cv (loaded), mat (cv.Mat)
export function getGreenMaskAndPercent(cv, mat) {
  // Convert to HSV
  const hsv = new cv.Mat();
  cv.cvtColor(mat, hsv, cv.COLOR_BGR2HSV);

  // Lower and upper bounds for green in HSV (tweakable)
  const lowerScalar = new cv.Scalar(35, 40, 40, 0);
  const upperScalar = new cv.Scalar(85, 255, 255, 255);

  const lower = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), lowerScalar);
  const upper = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), upperScalar);

  const mask = new cv.Mat();
  cv.inRange(hsv, lower, upper, mask);

  // Morphological clean up: open then close
  const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));
  const opened = new cv.Mat();
  const closed = new cv.Mat();
  cv.morphologyEx(mask, opened, cv.MORPH_OPEN, kernel);
  cv.morphologyEx(opened, closed, cv.MORPH_CLOSE, kernel);

  // Count green pixels
  const greenPixels = cv.countNonZero(closed);
  const totalPixels = closed.rows * closed.cols;
  const percentGreen = totalPixels > 0 ? (greenPixels / totalPixels) * 100 : 0;

  // cleanup intermediate mats
  hsv.delete();
  lower.delete();
  upper.delete();
  mask.delete();
  opened.delete();
  kernel.delete();

  // Return closed as mask (caller must delete when done)
  return { mask: closed, greenPercent: percentGreen };
}
