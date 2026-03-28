export interface Property {
  id: string;
  title: string;
  district: string;
  address: string;
  sqm: number;
  rooms: string;
  type: 'Kiralık' | 'Satılık';
  rentStatus: 'Dolu' | 'Boş';
  lon: number;
  lat: number;
  features: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyId: string;
  since: string;
}

export interface Activity {
  id: string;
  time: string;
  type: string;
  propertyTitle: string;
  note: string;
}

export interface MarketNote {
  id: string;
  district: string;
  rentRange: string;
  trend: string;
  note: string;
}

export const properties: Property[] = [
  {
    id: 'p1',
    title: 'Moda Sahil 3+1',
    district: 'Kadıköy',
    address: 'Moda Cad. No: 12, Kadıköy / İstanbul',
    sqm: 118,
    rooms: '3+1',
    type: 'Kiralık',
    rentStatus: 'Dolu',
    lon: 29.027,
    lat: 40.9903,
    features: 'Deniz manzarası, asansör',
  },
  {
    id: 'p2',
    title: 'Levent Plaza Ofis',
    district: 'Beşiktaş',
    address: 'Büyükdere Cad. İş Merkezi, Beşiktaş',
    sqm: 210,
    rooms: 'Açık ofis',
    type: 'Kiralık',
    rentStatus: 'Boş',
    lon: 29.0083,
    lat: 41.0422,
    features: 'Otopark, güvenlik',
  },
  {
    id: 'p3',
    title: 'Üsküdar Sahil 2+1',
    district: 'Üsküdar',
    address: 'Mimar Sinan Mah., Üsküdar',
    sqm: 95,
    rooms: '2+1',
    type: 'Kiralık',
    rentStatus: 'Dolu',
    lon: 29.015,
    lat: 41.021,
    features: 'Metroya yakın',
  },
  {
    id: 'p4',
    title: 'Şişli Merkez 4+1',
    district: 'Şişli',
    address: 'Halaskargazi Cad., Şişli',
    sqm: 145,
    rooms: '4+1',
    type: 'Satılık',
    rentStatus: 'Boş',
    lon: 28.987,
    lat: 41.06,
    features: 'Yeni tadilat',
  },
  {
    id: 'p5',
    title: 'Bakırköy Rezidans 1+1',
    district: 'Bakırköy',
    address: 'Atatürk Cad., Bakırköy',
    sqm: 62,
    rooms: '1+1',
    type: 'Kiralık',
    rentStatus: 'Boş',
    lon: 28.871,
    lat: 40.983,
    features: 'Site içi havuz',
  },
];

export const tenants: Tenant[] = [
  {
    id: 't1',
    name: 'Ayşe Yılmaz',
    phone: '+90 532 000 11 22',
    email: 'ayse.y@ornek.com',
    propertyId: 'p1',
    since: '2023-04-01',
  },
  {
    id: 't2',
    name: 'Mehmet Kaya',
    phone: '+90 533 111 22 33',
    email: 'mehmet.k@ornek.com',
    propertyId: 'p3',
    since: '2024-01-15',
  },
  {
    id: 't3',
    name: 'Zeynep Demir',
    phone: '+90 534 222 33 44',
    email: 'zeynep.d@ornek.com',
    propertyId: 'p2',
    since: '2022-11-01',
  },
];

export const activities: Activity[] = [
  {
    id: 'a1',
    time: '2026-03-28 09:40',
    type: 'Ziyaret',
    propertyTitle: 'Levent Plaza Ofis',
    note: 'Potansiyel kiracı ile yerinde keşif.',
  },
  {
    id: 'a2',
    time: '2026-03-27 16:10',
    type: 'Görüşme',
    propertyTitle: 'Moda Sahil 3+1',
    note: 'Sözleşme yenileme görüşmesi.',
  },
  {
    id: 'a3',
    time: '2026-03-26 11:00',
    type: 'Bakım',
    propertyTitle: 'Şişli Merkez 4+1',
    note: 'Kombi bakımı tamamlandı.',
  },
];

export const marketNotes: MarketNote[] = [
  {
    id: 'm1',
    district: 'Kadıköy',
    rentRange: '450–750 TL/m²',
    trend: 'Stabil',
    note: 'Sahil hattında talep yüksek.',
  },
  {
    id: 'm2',
    district: 'Beşiktaş',
    rentRange: '520–900 TL/m²',
    trend: 'Hafif artış',
    note: 'Ofis segmenti hareketli.',
  },
  {
    id: 'm3',
    district: 'Üsküdar',
    rentRange: '380–650 TL/m²',
    trend: 'Stabil',
    note: 'Metro erişimi önemli faktör.',
  },
];

export function propertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function tenantPropertyLabel(propertyId: string): string {
  return propertyById(propertyId)?.title ?? propertyId;
}

/** Örnek mahalle poligonu (demo — resmi sınır verisi değildir) */
export const sampleNeighborhoodGeoJSON = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'Örnek Mahalle Sınırı (demo)' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [29.018, 40.996],
            [29.038, 40.994],
            [29.036, 40.984],
            [29.02, 40.986],
            [29.018, 40.996],
          ],
        ],
      },
    },
  ],
};

export const aiMockResults: { query: string; title: string; district: string; rooms: string; sqm: number }[] = [
  { query: 'kadıköy', title: 'Moda Sahil 3+1', district: 'Kadıköy', rooms: '3+1', sqm: 118 },
  { query: '3+1', title: 'Moda Sahil 3+1', district: 'Kadıköy', rooms: '3+1', sqm: 118 },
  { query: '100', title: 'Levent Plaza Ofis', district: 'Beşiktaş', rooms: 'Açık ofis', sqm: 210 },
  { query: 'beşiktaş', title: 'Levent Plaza Ofis', district: 'Beşiktaş', rooms: 'Açık ofis', sqm: 210 },
  { query: 'üsküdar', title: 'Üsküdar Sahil 2+1', district: 'Üsküdar', rooms: '2+1', sqm: 95 },
];
