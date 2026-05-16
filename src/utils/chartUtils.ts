export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const scaleLinear = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number]
) => {
  const [domainMin, domainMax] = domain;
  const [rangeMin, rangeMax] = range;

  if (domainMin === domainMax) {
    return (rangeMin + rangeMax) / 2;
  }

  return rangeMin + ((value - domainMin) / (domainMax - domainMin)) * (rangeMax - rangeMin);
};

export const createDomain = (values: number[], fallback: [number, number]): [number, number] => {
  if (values.length === 0) {
    return fallback;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const padding = min === 0 ? 1 : Math.abs(min) * 0.1;
    return [Math.max(0, min - padding), max + padding];
  }

  const padding = (max - min) * 0.1;
  return [Math.max(0, min - padding), max + padding];
};

export const createTicks = (domain: readonly [number, number], count: number) => {
  if (count <= 1) {
    return [domain[0]];
  }

  if (domain[0] === domain[1]) {
    return [domain[0]];
  }

  return Array.from({ length: count }, (_, index) => domain[0] + ((domain[1] - domain[0]) * index) / (count - 1));
};

export const formatFeatureTick = (value: number) => {
  if (Number.isInteger(value)) {
    return value.toString();
  }

  if (Math.abs(value) >= 10) {
    return value.toFixed(0);
  }

  return value.toFixed(1);
};

export const getColorByValue = (valueScore: number) => {
  if (valueScore > 1.2) return '#22c55e';
  if (valueScore > 0.6) return '#facc15';
  return '#ef4444';
};
