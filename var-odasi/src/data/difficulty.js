// Zorluk seviyeleri. level: 0 kolay, 1 orta, 2 zor.
// refError: saha hakeminin hata yapma olasılığı; gray: gri alan sıklığı;
// avar: AVAR yardımcısının doğru ipucu verme olasılığı; time: VAR kontrol süresi (sn).
export const DIFFICULTIES = {
  kolay: { key: 'kolay', name: 'Kolay', level: 0, refError: 0.5, gray: 0.12, avar: 0.9, time: 120 },
  orta: { key: 'orta', name: 'Orta', level: 1, refError: 0.42, gray: 0.22, avar: 0.75, time: 90 },
  zor: { key: 'zor', name: 'Zor', level: 2, refError: 0.38, gray: 0.32, avar: 0.6, time: 60 },
};

export function withDerby(d) {
  return { ...d, gray: Math.min(0.45, d.gray + 0.12), time: Math.max(45, d.time - 20), derby: true };
}
