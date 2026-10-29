// 4-4-2 dizilimi (göreli koordinat: X hücum yönü). Dizin = kadrodaki sıra.
export const BASE = [
  [-50, 0], // GK
  [-34, 20], [-37, 7], [-37, -7], [-34, -20], // DR DC DC DL  (Z+ = sağ bek tarafı)
  [-14, 22], [-16, 7], [-16, -7], [-14, -22], // MR MC MC ML
  [3, 6], [3, -6], // FW FW
];
export const KICKOFF = [
  [-50, 0], [-30, 22], [-33, 8], [-33, -8], [-30, -22], [-14, 24], [-15, 8], [-15, -8], [-14, -24], [-1, 1.5], [-6, -8],
];

/** Topun konumuna göre bir oyuncunun dizilim hedefi (göreli). */
export function formationTarget(idx, ballX, ballZ, inPossession, wander = [0, 0]) {
  const b = BASE[idx];
  if (idx === 0) {
    const gx = -50.5 + Math.max(0, (ballX + 20) * 0.04);
    return [Math.min(gx, -47), ballZ * 0.12];
  }
  let x = b[0] * 0.62 + ballX * 0.48 + (inPossession ? 7 : -3);
  const line = idx <= 4 ? 0 : idx <= 8 ? 1 : 2;
  // savunma hattı topun gerisinde kalır
  if (line === 0) x = Math.min(x, ballX - 6);
  if (line === 2 && !inPossession) x = Math.max(x, -12);
  x = Math.max(-46, Math.min(46, x));
  let z = b[1] * 0.82 + ballZ * 0.28;
  z = Math.max(-31, Math.min(31, z));
  return [x + wander[0], z + wander[1]];
}
