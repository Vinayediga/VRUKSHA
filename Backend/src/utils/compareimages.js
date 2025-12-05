import sharp from "sharp";

const TARGET_WIDTH = 400;
const GREEN_HUE_MIN = 50; // approx degrees
const GREEN_HUE_MAX = 170;
const MIN_SATURATION = 0.15;
const MIN_VALUE = 0.15;

function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const s = max === 0 ? 0 : delta / max;
  const v = max;
  return { h, s, v };
}

async function extractMetrics(buffer) {
  const { data, info } = await sharp(buffer)
    .resize(TARGET_WIDTH, null, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = info.width * info.height;
  const mask = new Uint8Array(totalPixels);

  let greenCount = 0;
  let minX = info.width;
  let maxX = -1;
  let minY = info.height;
  let maxY = -1;

  for (let i = 0; i < totalPixels; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    const { h, s, v } = rgbToHsv(r, g, b);
    const hsvGreen =
      h >= GREEN_HUE_MIN &&
      h <= GREEN_HUE_MAX &&
      s >= MIN_SATURATION &&
      v >= MIN_VALUE;
    const simpleGreen = g > 70 && g > r * 0.9 && g > b * 0.9;

    if (hsvGreen || simpleGreen) {
      mask[i] = 1;
      greenCount++;

      const y = Math.floor(i / info.width);
      const x = i % info.width;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (greenCount === 0 || maxX === -1) {
    return null;
  }

  const bboxWidth = maxX - minX + 1;
  const bboxHeight = maxY - minY + 1;
  const bboxArea = bboxWidth * bboxHeight;

  return {
    widthRatio: bboxWidth / info.width,
    heightRatio: bboxHeight / info.height,
    areaRatio: bboxArea / (info.width * info.height),
    greenRatio: greenCount / totalPixels,
  };
}

function percentChange(prev, cur) {
  if (!prev || prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}

/**
 * Compare two plant images based on their green mask height/width/area changes.
 * Returns percentage changes and maxGrowthChange (max abs of height/width).
 */
export async function compareImages(buffer1, buffer2) {
  try {
    const [prevMetrics, curMetrics] = await Promise.all([
      extractMetrics(buffer1),
      extractMetrics(buffer2),
    ]);

    if (!prevMetrics || !curMetrics) {
      return {
        error: "Could not detect plant shape in one of the images.",
      };
    }

    const heightChange = percentChange(
      prevMetrics.heightRatio,
      curMetrics.heightRatio
    );
    const widthChange = percentChange(
      prevMetrics.widthRatio,
      curMetrics.widthRatio
    );
    const areaChange = percentChange(
      prevMetrics.areaRatio,
      curMetrics.areaRatio
    );
    const greenChange = percentChange(
      prevMetrics.greenRatio,
      curMetrics.greenRatio
    );

    const maxGrowthChange = Math.max(
      Math.abs(heightChange ?? 0),
      Math.abs(widthChange ?? 0)
    );

    return {
      heightChange: Number(heightChange?.toFixed(2)),
      widthChange: Number(widthChange?.toFixed(2)),
      areaChange: Number(areaChange?.toFixed(2)),
      greenChange: Number(greenChange?.toFixed(2)),
      maxGrowthChange: Number(maxGrowthChange.toFixed(2)),
    };
  } catch (error) {
    console.error("Error comparing images:", error);
    return {
      error: `Image comparison failed: ${error.message}`,
    };
  }
}
