/** Üst bar breadcrumb etiketleri */
export function getBreadcrumbs(pathname: string): { product: string; section: string } {
  if (pathname === '/' || pathname === '') {
    return { product: 'Emlak Yönetim', section: 'Özet' };
  }
  const map: Record<string, string> = {
    gayrimenkuller: 'Gayrimenkuller',
    kiracilar: 'Kiracılar',
    harita: 'Harita operasyonu',
    faaliyetler: 'Faaliyetler',
    'pazar-arastirma': 'Pazar araştırması',
    'ai-arama': 'AI asistan',
    guvenlik: 'Güvenlik & roller',
  };
  const key = pathname.replace(/^\//, '');
  return {
    product: 'Emlak Yönetim',
    section: map[key] ?? key,
  };
}
