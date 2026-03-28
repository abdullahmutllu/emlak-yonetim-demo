# Emlak Yönetim Sistemi — Demo Arayüz

Şirket içi gayrimenkullerin yönetimi, takibi ve harita üzerinden analiz için tasarlanmış **ürün vizyonunu gösteren** statik bir ön yüz demosudur. **Canlı veri, API veya kimlik doğrulama yoktur**; tüm liste ve göstergeler yerel mock veri ile doldurulmuştur.

## Modüller (gösterim)

- **Panel**: Özet KPI ve son aktiviteler (mock)
- **Gayrimenkuller / Kiracılar**: Tablolar, arama, düzenle/sil bildirimleri (kalıcı kayıt yok)
- **Harita**: OpenLayers + OSM; gayrimenkul işaretçileri, örnek mahalle poligonu, mesafe ve alan ölçümü
- **Faaliyetler, Pazar araştırması, AI arama (simülasyon), Güvenlik**: RFP ile hizalı placeholder veya kısıtlı demo davranışı

Ürün onayı sonrası backend, roller, raporlama ve gerçek AI/NL arama ayrı fazda geliştirilebilir.

## Yerel çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda Vite’nin verdiği adresi açın (genelde `http://localhost:5173`).

## Üretim derlemesi

```bash
npm run build
npm run preview
```

Çıktı klasörü: `dist`.

## Vercel’de yayınlama

1. Projeyi bir Git deposuna (ör. GitHub) gönderin.
2. [Vercel](https://vercel.com) üzerinde **Add New Project** ile depoyu içe aktarın.
3. **Framework Preset**: Vite; **Build Command**: `npm run build`; **Output Directory**: `dist`.
4. Kökteki `vercel.json`, istemci tarafı yönlendirmeleri için SPA yönlendirmesi sağlar.
5. Dağıtım tamamlanınca üretilen URL’yi müşteriyle paylaşabilirsiniz.

## Lisans / harita

Varsayılan harita katmanı [OpenStreetMap](https://www.openstreetmap.org/copyright) katkıcılarıdır; kullanım koşullarına uyun. Mahalle sınırı geometrisi **yalnızca demo amaçlıdır**, resmi idari sınır verisi değildir.
