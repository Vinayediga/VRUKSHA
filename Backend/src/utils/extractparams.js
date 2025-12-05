import sharp from "sharp";

export async function extractParams(buffer) {
  const image = sharp(buffer).resize(300, 300, { fit: "cover" });

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  let total = info.width * info.height;
  let greenCount = 0;
  let brightness = 0;

  for (let i = 0; i < data.length; i += 3) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (g > r && g > b && g > 80) greenCount++; // Basic green detection  
    brightness += (r + g + b) / 3;
  }

  const greenPercent = ((greenCount / total) * 100).toFixed(2);
  const avgBrightness = (brightness / total).toFixed(2);

  return {
    greenPercent: Number(greenPercent),
    brightness: Number(avgBrightness),
    width: info.width,
    height: info.height,
  };
}
