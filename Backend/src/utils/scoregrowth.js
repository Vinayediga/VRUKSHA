// Simple scoring: only heightGrowth considered by default (you can combine)
export function getGrowthScore(heightGrowth) {
  if (heightGrowth === null || isNaN(heightGrowth)) return 0;
  if (heightGrowth >= 5 && heightGrowth <= 10) return 10;
  return 0;
}
