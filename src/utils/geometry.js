export function testerFitsAngle(angleA, angleB, tolerance = 3) {
  const diff = Math.abs(((angleB - angleA) % 180 + 180) % 180);
  return Math.abs(diff - 90) <= tolerance;
}

export function isParallel(angleA, angleB, tolerance = 3) {
  const diff = Math.abs(((angleB - angleA) % 180 + 180) % 180);
  return diff <= tolerance || Math.abs(diff - 180) <= tolerance;
}
