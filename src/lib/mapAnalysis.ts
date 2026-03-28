import type { Property } from '../data/mock';

/** Demo: poligon içi portföye göre sahte metrikler */
export function buildMockReport(areaM2: number, matched: Property[]) {
  const n = matched.length;
  const avgSqm = n
    ? Math.round(matched.reduce((s, p) => s + p.sqm, 0) / n)
    : 0;
  const score =
    n >= 4 ? 'A' : n >= 2 ? 'B+' : n >= 1 ? 'B' : '—';
  const rentLow = 380 + n * 45 + Math.min(120, Math.round(areaM2 / 5000));
  const rentHigh = rentLow + 180 + n * 30;

  return {
    score,
    avgSqm,
    rentBand: n ? `${rentLow}–${rentHigh} TL/m² (tahmini)` : '—',
    insight: n
      ? 'Seçilen bölgede kayıtlı varlıklar tespit edildi. Gerçek üründe bu alan için pazar kıyası ve gelir projeksiyonu üretilir (demo metni).'
      : 'Poligon içinde örnek portföy noktası yok. Haritada yeşil işaretçilerin üzerine daha geniş bir alan çizmeyi deneyin.',
    density: n && areaM2 > 0 ? (n / (areaM2 / 1_000_000)).toFixed(1) : '—',
  };
}
