import fs from "fs";
import sharp from "sharp";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

// ---------- Helper Functions ----------

// Convert image to PNG buffer of same size
async function toPngBuffer(imagePath, width = 600) {
  const img = sharp(imagePath).resize(width, null);
  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Convert raw buffer to PNG object for pixelmatch
  const png = new PNG({ width: info.width, height: info.height });
  png.data = data;
  return png;
}

// Compute average brightness of an image (for confidence)
async function getBrightness(imagePath) {
  const stats = await sharp(imagePath).stats();
  return stats.channels[1].mean; // use green channel as approx brightness
}

// ---------- Growth Parameters ----------

// Extract simple green mask
async function getGreenMask(imagePath, width = 600) {
  const img = sharp(imagePath).resize(width, null).raw().ensureAlpha();
  const { data, info } = await img.toBuffer({ resolveWithObject: true });
  const mask = Buffer.alloc(info.width * info.height);

  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // detect green pixels (simple HSV-ish condition)
    if (g > 60 && g > r * 1.2 && g > b * 1.2) mask[i] = 255;
    else mask[i] = 0;
  }
  return { mask, width: info.width, height: info.height };
}

// Compute plant bounding box and ratios
function computeParams(mask, width, height) {
  let minY = height, maxY = 0, minX = width, maxX = 0, greenCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const val = mask[y * width + x];
      if (val > 0) {
        greenCount++;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
    }
  }

  if (greenCount === 0) return null;

  const bboxHeight = maxY - minY;
  const bboxWidth = maxX - minX;
  const boxArea = bboxWidth * bboxHeight;

  const RHR = bboxHeight / height; // height ratio
  const GAR = greenCount / boxArea; // green area ratio
  const TE = (maxY - minY) / height; // top extension (same as RHR, kept separate for flexibility)

  return { RHR, GAR, TE, greenCount, bboxHeight, bboxWidth };
}

// ---------- Compare Two Images ----------

async function compareGrowth(prevImg, curImg) {
  const prevMaskData = await getGreenMask(prevImg);
  const curMaskData = await getGreenMask(curImg);

  const prevParams = computeParams(prevMaskData.mask, prevMaskData.width, prevMaskData.height);
  const curParams = computeParams(curMaskData.mask, curMaskData.width, curMaskData.height);

  if (!prevParams || !curParams) {
    return { error: "Could not detect plant in one or both images." };
  }

  // Compute percent change for each parameter
  function pctChange(prev, cur) {
    return ((cur - prev) / Math.max(0.0001, prev)) * 100;
  }

  const dRHR = pctChange(prevParams.RHR, curParams.RHR);
  const dGAR = pctChange(prevParams.GAR, curParams.GAR);
  const dTE = pctChange(prevParams.TE, curParams.TE);

  // Confidence based on brightness difference
  const bPrev = await getBrightness(prevImg);
  const bCur = await getBrightness(curImg);
  const brightnessDiff = Math.abs(bPrev - bCur);
  let confidence = 1;
  if (brightnessDiff > 40) confidence = 0.6;
  if (brightnessDiff > 80) confidence = 0.4;

  // Weighted growth (balanced)
  const wH = 0.45, wA = 0.45, wT = 0.1;
  let growth = wH * dRHR + wA * dGAR + wT * dTE;
  growth = growth * confidence;

  // Clip extreme results
  if (growth > 50) growth = 50;
  if (growth < -10) growth = 0;

  return {
    delta_RHR_pct: Number(dRHR.toFixed(2)),
    delta_GAR_pct: Number(dGAR.toFixed(2)),
    delta_TE_pct: Number(dTE.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    growth_pct: Number(growth.toFixed(2)),
  };
}

