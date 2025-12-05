import sharp from "sharp";

export async function validateImage(buffer) {
  try {
    const image = sharp(buffer);
    const meta = await image.metadata();

    if (!["jpg", "jpeg", "png", "webp"].includes(meta.format)) {
      return { valid: false, reason: "Invalid format" };
    }

    if (meta.width < 200 || meta.height < 200) {
      return { valid: false, reason: "Image too small" };
    }

    // ---------- Heuristic authenticity check ----------
    // Goal: distinguish "natural" camera photos from extremely flat / synthetic images.
    const stats = await image.stats();

    const rgbChannels = (stats.channels || []).slice(0, 3);
    const variances = rgbChannels.map((ch) => ch.variance || 0);
    const ranges = rgbChannels.map((ch) => (ch.max ?? 0) - (ch.min ?? 0));

    const avgVariance =
      variances.reduce((sum, v) => sum + v, 0) / (variances.length || 1);
    const avgRange =
      ranges.reduce((sum, r) => sum + r, 0) / (ranges.length || 1);

    // Normalize into a rough 0–1 "authenticity" score.
    // Tuned so normal camera photos (with reasonable texture + contrast) score high,
    // and flat / almost solid-color or low-detail images score low.
    const varianceScore = Math.min(1, avgVariance / 5000); // 0..1
    const rangeScore = Math.min(1, avgRange / 80);         // 0..1

    let authenticityScore = (varianceScore * 0.6 + rangeScore * 0.4);
    if (!Number.isFinite(authenticityScore)) authenticityScore = 0;

    // Threshold can be adjusted based on real data; start conservatively.
    const AUTH_THRESHOLD = 0.2;

    if (authenticityScore < AUTH_THRESHOLD) {
      return {
        valid: false,
        reason: "Image appears too flat or artificial. Please upload a clear photo of a real plant.",
        authenticityScore,
      };
    }

    return { valid: true, authenticityScore };
  } catch (e) {
    return { valid: false, reason: "Invalid image file" };
  }
}
