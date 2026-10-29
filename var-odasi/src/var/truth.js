// "Gerçek cevap" ölçümleri. Senaryo jeneratörü (koreografi üzerinde) ve VAR
// değerlendirmesi (maç kaydı üzerinde) AYNI fonksiyonları kullanır.
// Kaynak arayüzü (src):
//   src.ent(f, id)  -> durum ya da null
//   src.ball(f)     -> [x, y, z]
//   src.ids(team)   -> o takımdaki (aktif) varlık id'leri
//   src.n           -> kare sayısı

import { computeSkeleton, makeSkel, bodyExtent, minPartDistance, ballPartDistance, PARTS, LEG_PARTS, P, J } from '../sim/skeleton.js';
import { BALL_R, POSE, PITCH } from '../sim/constants.js';

const skA = makeSkel(), skB = makeSkel(), skC = makeSkel();

export function choreoSource(c, teams) {
  // teams: id -> takım
  return {
    n: c.n,
    ent: (f, id) => (c.tracks.has(id) ? c.state(id, Math.max(0, Math.min(c.n - 1, f))) : null),
    ball: (f) => c.ballAt(f),
    ids: (team) => [...c.tracks.keys()].filter((id) => teams(id) === team),
  };
}

export function recordingSource(rec, start, n, teamOf) {
  return {
    n,
    ent: (f, id) => {
      const s = rec.ent(start + Math.max(0, Math.min(n - 1, f)), id);
      return s.pose === POSE.HIDDEN ? null : s;
    },
    ball: (f) => rec.ball(start + Math.max(0, Math.min(n - 1, f))),
    ids: (team) => {
      const out = [];
      for (let i = 0; i < 22; i++) if (teamOf(i) === team) {
        const s = rec.ent(start, i);
        if (s.pose !== POSE.HIDDEN) out.push(i);
      }
      return out;
    },
  };
}

export const teamOfId = (id) => (id < 11 ? 0 : id < 22 ? 1 : 2);

/** Bir karede ofsayt ölçümü. dir: hücum yönü (+1 / -1). */
export function offsideAt(src, f, attackerId, defTeam, dir) {
  const a = src.ent(f, attackerId);
  computeSkeleton(a, skA);
  const att = bodyExtent(skA, dir, 0, true);
  const attAll = bodyExtent(skA, dir, 0, false);
  const defs = [];
  for (const id of src.ids(defTeam)) {
    const s = src.ent(f, id);
    if (!s) continue;
    computeSkeleton(s, skB);
    const e = bodyExtent(skB, dir, 0, true);
    defs.push({ id, ext: e.ext, part: e.part });
  }
  defs.sort((x, y) => y.ext - x.ext);
  const second = defs[1] || defs[0];
  const ball = src.ball(f);
  const ballExt = ball[0] * dir;
  const margin = att.ext - second.ext;
  const inOppHalf = att.ext > 0;
  return {
    attExt: att.ext, attPart: att.part, attAllExt: attAll.ext, attAllPart: attAll.part,
    defs, second, margin, ballExt,
    offside: margin > 0 && att.ext > ballExt && inOppHalf,
  };
}

/** İki oyuncunun seçili parçaları arasında kare aralığında temas taraması. */
export function contactScan(src, f0, f1, idA, partsA, idB, partsB) {
  let minD = Infinity, minF = f0, first = -1, point = null, pa = -1, pb = -1, firstPoint = null, maxPen = 0;
  for (let f = f0; f <= f1; f++) {
    const a = src.ent(f, idA), b = src.ent(f, idB);
    if (!a || !b) continue;
    computeSkeleton(a, skA); computeSkeleton(b, skB);
    const r = minPartDistance(skA, partsA, skB, partsB);
    if (r.d < minD) { minD = r.d; minF = f; point = r.point.slice(); pa = r.pa; pb = r.pb; }
    if (r.d < 0) maxPen = Math.max(maxPen, -r.d);
    if (r.d < 0 && first < 0) { first = f; firstPoint = r.point.slice(); }
  }
  return { minD, minF, first, point, firstPoint, pa, pb, contact: first >= 0, maxPen };
}

/** Top ile oyuncu arasındaki en derin temas (elle oynama). */
export function ballHit(src, f, id) {
  const s = src.ent(f, id);
  computeSkeleton(s, skC);
  const b = src.ball(f);
  let best = { d: Infinity, part: -1, point: null, t: 0, len: 0 };
  for (let i = 0; i < PARTS.length; i++) {
    const r = ballPartDistance(skC, i, b[0], b[1], b[2], BALL_R);
    if (r.d < best.d) best = { d: r.d, part: i, point: r.point, t: r.t, len: r.len || 0 };
  }
  // Kural: kolun üst sınırı koltuk altının alt hizasıdır. Üst kolun ilk ~9 cm'si "omuz" sayılır.
  let region = PARTS[best.part].cat;
  if ((best.part === P.UARML || best.part === P.UARMR) && best.t * best.len < 0.09) region = 'omuz';
  if (best.part === P.TORSO) {
    // gövde kutusunun üst köşesi = omuz
    const up = skC.up;
    const pel = [skC.j[0], skC.j[1], skC.j[2]];
    const h = (best.point[0] - pel[0]) * up[0] + (best.point[1] - pel[1]) * up[1] + (best.point[2] - pel[2]) * up[2];
    const r = (best.point[0] - pel[0]) * skC.right[0] + (best.point[2] - pel[2]) * skC.right[2];
    region = h > 0.42 && Math.abs(r) > 0.1 ? 'omuz' : 'govde';
  }
  return { ...best, region };
}

/** İlk temas karesini bul (top ile oyuncu). */
export function firstBallContact(src, f0, f1, id) {
  for (let f = f0; f <= f1; f++) {
    const h = ballHit(src, f, id);
    if (h.d <= 0.002) return { f, ...h };
  }
  return null;
}

/** Topun bir kare aralığında kale çizgisini ne kadar geçtiği (m). Pozitif = tamamen dışarıda. */
export function ballOutMargin(src, f0, f1, dir) {
  let best = -Infinity, bf = f0;
  for (let f = f0; f <= f1; f++) {
    const b = src.ball(f);
    const m = b[0] * dir - (PITCH.HL + BALL_R);
    if (m > best) { best = m; bf = f; }
  }
  return { margin: best, frame: bf };
}

/** Oyuncunun belirli bir karede bir eklem noktası (dünya). */
export function jointAt(src, f, id, j) {
  computeSkeleton(src.ent(f, id), skA);
  return [skA.j[j * 3], skA.j[j * 3 + 1], skA.j[j * 3 + 2]];
}

export { LEG_PARTS, P, J };
