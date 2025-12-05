export function compareParams(oldParams, newParams) {
  function percent(oldVal, newVal) {
    if (!oldVal || oldVal === 0) return null;
    return ((newVal - oldVal) / oldVal) * 100;
  }

  return {
    heightGrowth: percent(oldParams.height, newParams.height),
    widthGrowth: percent(oldParams.width, newParams.width),
    areaGrowth: percent(oldParams.leafArea, newParams.leafArea),
  };
}
