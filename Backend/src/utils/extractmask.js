import cv from "opencv4nodejs";

export function getPlantMask(mat) {
  const hsv = mat.cvtColor(cv.COLOR_BGR2HSV);

  const lowerGreen = new cv.Vec3(35, 40, 40);
  const upperGreen = new cv.Vec3(85, 255, 255);

  let mask = hsv.inRange(lowerGreen, upperGreen);

  mask = mask.erode(new cv.Mat(), new cv.Point(-1, -1), 2);
  mask = mask.dilate(new cv.Mat(), new cv.Point(-1, -1), 2);

  return mask;
}
