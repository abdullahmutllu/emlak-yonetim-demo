import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eraser,
  FileBarChart2,
  Flame,
  Info,
  Layers,
  Map as MapIcon,
  MapPin,
  RulerDimensionLine,
  Scan,
  Shapes,
  Sparkles,
  X,
} from 'lucide-react';
import AiSearchPanel from '../components/AiSearchPanel';
import MapView, {
  type AnalysisPayload,
  type BasemapId,
  type MapFocusRequest,
  type MeasureMode,
} from '../components/MapView';
import { useToast } from '../context/ToastContext';
import { buildMockReport } from '../lib/mapAnalysis';
import type { Property } from '../data/mock';
import { properties } from '../data/mock';

const PORTFOLIO_PAGE_SIZE = 3;
const PORTFOLIO_TOTAL_PAGES = Math.max(
  1,
  Math.ceil(properties.length / PORTFOLIO_PAGE_SIZE),
);

const STORAGE_HELP = 'emlak-demo-map-help-dismissed';

const basemapOptions: { id: BasemapId; label: string; hint: string }[] = [
  {
    id: 'dark',
    label: 'Koyu',
    hint: 'CARTO koyu tema — sunumda modern görünüm; gece okuması rahat.',
  },
  {
    id: 'osm',
    label: 'Standart',
    hint: 'Klasik OpenStreetMap renkleri — yol ve isim okuması net.',
  },
  {
    id: 'satellite',
    label: 'Uydu',
    hint: 'Uydu görüntüsü — arazi ve yapı yoğunluğunu görmek için (Esri).',
  },
];

const LAYER_HINT = {
  provinces:
    'Türkiye il sınırları (açık kaynak GeoJSON, ~275 KB). İlk açılışta indirilir; bir kez tüm ülkeye zumlanır. Yoğun çizim — düşük zoomda daha okunaklıdır.',
  heatmap:
    'Örnek portföy noktaları + demo yoğunluk noktalarından ısı haritası — ilgi / talep yoğunluğu hissi verir (gösterim amaçlı, gerçek analitik değildir).',
} as const;

const TOOL_HINT = {
  distance:
    'İki nokta arası mesafe ölçer. Tıklayarak çizgiyi oluşturun; çift tıklayınca biter. Sonuç metre veya km olarak gösterilir.',
  area:
    'Geçici bir alan poligonu çizersiniz (sarı). Çift tıklama ile kapatın. Alan m² / ha / km² olarak hesaplanır; portföy sayımı yapmaz.',
  analysis:
    'Mor alan: seçtiğiniz bölgedeki örnek gayrimenkul noktalarını sayar ve demo “bölge raporu” üretir. Çift tıklama ile poligonu kapatın.',
  stop: 'Seçili çizim aracını kapatır; haritada normal tıklama (varlık seçimi) çalışır.',
  clear:
    'Sarı ölçüm çizgileri/alıkları ve mor analiz poligonunu haritadan siler. Rapor penceresi açıksa kapatmanız ayrıdır.',
} as const;

export default function MapPage() {
  const { show } = useToast();
  const [basemap, setBasemap] = useState<BasemapId>('dark');
  const [mode, setMode] = useState<MeasureMode>('idle');
  const [clearVersion, setClearVersion] = useState(0);
  const [lastLine, setLastLine] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [panelTab, setPanelTab] = useState<'portfolio' | 'measure'>('portfolio');
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState<AnalysisPayload | null>(null);
  const [helpVisible, setHelpVisible] = useState(true);
  const [showProvinces, setShowProvinces] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [mapFocus, setMapFocus] = useState<MapFocusRequest | null>(null);
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_HELP) === '1') setHelpVisible(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!aiModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAiModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aiModalOpen]);

  useEffect(() => {
    if (!detailModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailModalOpen]);

  const dismissHelp = () => {
    setHelpVisible(false);
    try {
      localStorage.setItem(STORAGE_HELP, '1');
    } catch {
      /* ignore */
    }
  };

  const onMeasureResult = useCallback((text: string) => {
    setLastLine(text);
    setPanelTab('measure');
  }, []);

  const onFeatureClick = useCallback((title: string | null) => {
    setSelected(title);
    if (title) {
      setPanelTab('portfolio');
      const p = properties.find((x) => x.title === title);
      if (p) {
        setDetailProperty(p);
        setDetailModalOpen(true);
      }
    }
  }, []);

  const safePortfolioPage = Math.min(portfolioPage, PORTFOLIO_TOTAL_PAGES);
  const portfolioSlice = properties.slice(
    (safePortfolioPage - 1) * PORTFOLIO_PAGE_SIZE,
    safePortfolioPage * PORTFOLIO_PAGE_SIZE,
  );

  /** Liste satırı: sadece haritayı o konuma getirir; detay için haritada işaretçiye tıklanır. */
  const focusPortfolioOnMap = useCallback((p: Property) => {
    setSelected(p.title);
    setPanelTab('portfolio');
    setMapFocus({
      lon: p.lon,
      lat: p.lat,
      zoom: 14,
      token: Date.now(),
    });
  }, []);

  const onProvincesLoadError = useCallback(
    (msg: string) => {
      show(`İl sınırları yüklenemedi: ${msg}. Ağ veya CORS kontrol edin.`);
    },
    [show],
  );

  const onAnalysisComplete = useCallback((payload: AnalysisPayload) => {
    setReport(payload);
    setReportOpen(true);
    setPanelTab('measure');
    setLastLine(`${payload.areaDisplay} · ${payload.matched.length} varlık (poligon içi)`);
    setMode('idle');
  }, []);

  const clearDrawings = () => {
    setMode('idle');
    setLastLine(null);
    setClearVersion((v) => v + 1);
  };

  const modeBanner =
    mode === 'idle'
      ? null
      : mode === 'distance'
        ? {
            title: 'Mesafe ölçümü aktif',
            text: 'Haritada tıklayarak çizgiyi oluşturun; çift tıklayınca ölçüm tamamlanır.',
          }
        : mode === 'area'
          ? {
              title: 'Alan ölçümü aktif',
              text: 'Köşe köşe tıklayarak alanı çizin; çift tıklayınca kapanır — sadece m² hesabı (demo).',
            }
          : {
              title: 'Bölge analizi aktif',
              text: 'Mor poligon ile alanı kapatın; içindeki örnek portföyler sayılır ve rapor penceresi açılır.',
            };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#07070b]">
      <div className="shrink-0 border-b border-white/[0.06] px-4 py-3 md:px-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white md:text-xl">
              Harita operasyonu
            </h1>
            <p className="text-xs text-slate-500 md:text-sm">
              Katmanlar (il / ısı), ölçüm, poligon analizi ve demo rapor — veriler örnektir.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] text-slate-400">
              <Layers className="h-3.5 w-3.5 text-cyan-400/80" aria-hidden />
              OpenLayers · katman + araçlar
            </span>
          </div>
        </div>

        {modeBanner ? (
          <div
            className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3 py-2 text-[11px] text-amber-100/95 md:text-xs"
            role="status"
          >
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden />
            <div>
              <strong className="font-semibold text-amber-50">{modeBanner.title}</strong>
              <span className="text-amber-100/80"> — {modeBanner.text}</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1">
        <MapView
          basemap={basemap}
          mode={mode}
          clearVersion={clearVersion}
          showProvinces={showProvinces}
          showHeatmap={showHeatmap}
          onMeasureResult={onMeasureResult}
          onFeatureClick={onFeatureClick}
          onAnalysisComplete={onAnalysisComplete}
          onProvincesLoadError={onProvincesLoadError}
          focusRequest={mapFocus}
          className="absolute inset-0 h-full w-full min-h-0 rounded-none border-0 bg-[#0a0a10]"
        />

        {/* Sol: yardım + panel */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex max-h-[calc(100%-5.5rem)] w-[min(100%-1.5rem,360px)] flex-col gap-2 md:left-5 md:top-5">
          {helpVisible ? (
            <div className="pointer-events-auto rounded-2xl border border-cyan-500/25 bg-[#0c0c14]/95 p-3 shadow-xl backdrop-blur-md">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-200">
                  <Info className="h-4 w-4 shrink-0" aria-hidden />
                  Nasıl kullanılır?
                </div>
                <button
                  type="button"
                  onClick={dismissHelp}
                  className="rounded-lg p-1 text-slate-500 hover:bg-white/[0.06] hover:text-white"
                  title="Bu kutuyu gizle"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <ul className="mt-2 list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-slate-400">
                <li>
                  <strong className="text-slate-300">Altlık:</strong> koyu / standart / uydu.
                </li>
                <li>
                  <strong className="text-slate-300">İl sınırları:</strong> Türkiye il poligonları
                  (ağdan yüklenir).
                </li>
                <li>
                  <strong className="text-slate-300">Isı haritası:</strong> nokta yoğunluğu —
                  dikkat çekici demo görselleştirme.
                </li>
                <li>
                  <strong className="text-slate-300">Mesafe / Alan:</strong> hızlı ölçüm (sarı
                  çizim).
                </li>
                <li>
                  <strong className="text-slate-300">Bölge analizi:</strong> mor poligon çizin;
                  içindeki örnek varlıklar sayılır ve rapor açılır.
                </li>
                <li>
                  <strong className="text-slate-300">Sıfırla:</strong> tüm çizimleri temizler.
                </li>
              </ul>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setHelpVisible(true)}
              className="pointer-events-auto inline-flex w-fit items-center gap-1.5 rounded-xl border border-white/[0.1] bg-[#0c0c14]/90 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white"
            >
              <Info className="h-3.5 w-3.5" aria-hidden />
              Yardımı göster
            </button>
          )}

          <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0c0c14]/85 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex border-b border-white/[0.06]">
              <button
                type="button"
                onClick={() => setPanelTab('portfolio')}
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold transition ${
                  panelTab === 'portfolio'
                    ? 'bg-white/[0.06] text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Portföy
              </button>
              <button
                type="button"
                onClick={() => setPanelTab('measure')}
                className={`flex flex-1 items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold transition ${
                  panelTab === 'measure'
                    ? 'bg-white/[0.06] text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <RulerDimensionLine className="h-3.5 w-3.5" aria-hidden />
                Ölçüm / ipucu
              </button>
            </div>

            <div className="p-3">
              {panelTab === 'portfolio' ? (
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Kayıtlı varlıklar
                    </div>
                    <span className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-slate-500">
                      {properties.length} kayıt · mock
                    </span>
                  </div>

                  <ul className="mt-3 min-h-[200px] space-y-2">
                    {portfolioSlice.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => focusPortfolioOnMap(p)}
                          className={`group w-full rounded-xl border px-3 py-3 text-left transition ${
                            selected === p.title
                              ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-500/15 to-transparent shadow-[0_0_0_1px_rgba(34,211,238,0.15)]'
                              : 'border-white/[0.06] bg-white/[0.02] hover:border-cyan-500/25 hover:bg-white/[0.05]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold leading-snug text-white">
                              {p.title}
                            </span>
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                p.rentStatus === 'Dolu'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-amber-500/15 text-amber-200'
                              }`}
                            >
                              {p.rentStatus}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                            <span className="text-slate-400">{p.district}</span>
                            <span className="text-slate-600">·</span>
                            <span>{p.rooms}</span>
                            <span className="text-slate-600">·</span>
                            <span className="tabular-nums">{p.sqm} m²</span>
                          </div>
                          <div className="mt-2 text-[10px] font-medium text-cyan-500/80 opacity-0 transition group-hover:opacity-100">
                            Haritada o konuma git → · detay için işaretçiye tıklayın
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
                    <button
                      type="button"
                      title="Önceki sayfa"
                      disabled={safePortfolioPage <= 1}
                      onClick={() => setPortfolioPage((n) => Math.max(1, n - 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <div className="flex flex-col items-center text-center">
                      <span className="text-[11px] font-semibold tabular-nums text-slate-300">
                        Sayfa {safePortfolioPage} / {PORTFOLIO_TOTAL_PAGES}
                      </span>
                      <span className="text-[10px] text-slate-600">
                        {PORTFOLIO_PAGE_SIZE} kayıt / sayfa
                      </span>
                    </div>
                    <button
                      type="button"
                      title="Sonraki sayfa"
                      disabled={safePortfolioPage >= PORTFOLIO_TOTAL_PAGES}
                      onClick={() =>
                        setPortfolioPage((n) => Math.min(PORTFOLIO_TOTAL_PAGES, n + 1))
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>

                  <p className="mt-3 text-[10px] leading-relaxed text-slate-600">
                    Satıra tıklayınca harita o konuma yakınlaşır. Detay penceresi yalnızca haritada
                    yeşil işaretçiye tıklanınca açılır.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-[11px] leading-relaxed text-slate-500">
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Son ölçüm / özet
                    </div>
                    <p className="mt-2 text-sm text-slate-200">
                      {lastLine ?? 'Henüz ölçüm yok — bir araç seçin.'}
                    </p>
                  </div>
                  <p>
                    <strong className="text-slate-400">İpucu:</strong> bölge analizi sonrası rapor
                    penceresi otomatik açılır; PDF indirme bu demoda yalnızca bildirim gösterir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Üst sağ: katman + araçlar */}
        <div className="pointer-events-none absolute right-3 top-3 z-20 flex max-w-[calc(100%-1rem)] flex-col items-end gap-2 md:right-5 md:top-5">
          <div className="pointer-events-auto flex flex-wrap justify-end gap-1.5 rounded-2xl border border-white/[0.1] bg-[#0c0c14]/90 p-1 shadow-xl backdrop-blur-md">
            {basemapOptions.map((o) => (
              <button
                key={o.id}
                type="button"
                title={o.hint}
                onClick={() => setBasemap(o.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  basemap === o.id
                    ? 'bg-cyan-500/20 text-cyan-200'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto flex max-w-full flex-wrap justify-end gap-1.5 rounded-2xl border border-emerald-500/20 bg-[#0c0c14]/90 p-1 shadow-xl backdrop-blur-md">
            <button
              type="button"
              title={LAYER_HINT.provinces}
              onClick={() => setShowProvinces((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                showProvinces
                  ? 'bg-emerald-500/25 text-emerald-100 ring-1 ring-emerald-400/35'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <MapIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">İl sınırları</span>
              <span className="sm:hidden">İl</span>
            </button>
            <button
              type="button"
              title={LAYER_HINT.heatmap}
              onClick={() => setShowHeatmap((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition ${
                showHeatmap
                  ? 'bg-orange-500/25 text-orange-100 ring-1 ring-orange-400/35'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              <Flame className="h-3.5 w-3.5 shrink-0 text-orange-400/90" aria-hidden />
              Isı haritası
            </button>
          </div>

          <div className="pointer-events-auto flex max-w-full flex-wrap justify-end gap-1.5 rounded-2xl border border-white/[0.1] bg-[#0c0c14]/90 p-1.5 shadow-xl backdrop-blur-md">
            <ToolBtn
              active={mode === 'distance'}
              onClick={() => setMode(mode === 'distance' ? 'idle' : 'distance')}
              icon={<Scan className="h-4 w-4" />}
              label="Mesafe"
              hint={TOOL_HINT.distance}
            />
            <ToolBtn
              active={mode === 'area'}
              onClick={() => setMode(mode === 'area' ? 'idle' : 'area')}
              icon={<Shapes className="h-4 w-4" />}
              label="Alan"
              hint={TOOL_HINT.area}
            />
            <ToolBtn
              active={mode === 'analysis'}
              onClick={() => setMode(mode === 'analysis' ? 'idle' : 'analysis')}
              icon={<FileBarChart2 className="h-4 w-4" />}
              label="Analiz"
              hint={TOOL_HINT.analysis}
              accent
            />
            <button
              type="button"
              title={TOOL_HINT.stop}
              onClick={() => setMode('idle')}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-400 hover:bg-white/[0.06] hover:text-white"
            >
              Dur
            </button>
            <button
              type="button"
              title={TOOL_HINT.clear}
              onClick={clearDrawings}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 px-2.5 py-2 text-xs font-medium text-amber-100 hover:bg-amber-500/20"
            >
              <Eraser className="h-4 w-4" aria-hidden />
              Sıfırla
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 flex justify-center px-3 pb-3">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0c0c14]/92 px-4 py-2.5 shadow-2xl backdrop-blur-md">
            <StatusPill label="Dolu portföy" value="3" tone="emerald" />
            <StatusPill label="Boş" value="2" tone="amber" />
            <StatusPill label="Örnek nokta" value="5" tone="rose" />
            <span className="hidden h-4 w-px bg-white/10 sm:block" aria-hidden />
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              <Bot className="h-3.5 w-3.5 shrink-0" aria-hidden />
              AI ile sorgula
            </button>
          </div>
        </div>
      </div>

      {aiModalOpen ? (
        <div
          className="fixed inset-0 z-[410] flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setAiModalOpen(false)}
            aria-label="Pencereyi kapat"
          />
          <div className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cyan-500/25 bg-[#0a0a12] shadow-2xl shadow-cyan-950/40">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.06] bg-[#0c0c14]/95 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/30 to-emerald-600/30 text-cyan-200">
                  <Bot className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h2 id="ai-modal-title" className="text-base font-semibold text-white">
                    AI asistan — sorgu
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Demo simülasyon; haritadan çıkmadan arama yapın.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"
                aria-label="Kapat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <AiSearchPanel compact />
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-[#0c0c14]/90 px-4 py-3 sm:px-5">
              <p className="text-[10px] text-slate-600">
                Tam ekran ve geçmiş için sayfa görünümüne geçebilirsiniz.
              </p>
              <Link
                to="/ai-arama"
                onClick={() => setAiModalOpen(false)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Tam sayfada aç →
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {detailModalOpen && detailProperty ? (
        <PropertyDetailModal
          property={detailProperty}
          onClose={() => {
            setDetailModalOpen(false);
          }}
        />
      ) : null}

      {reportOpen && report ? (
        <ReportModal
          payload={report}
          onClose={() => setReportOpen(false)}
          onDownloadDemo={() => {
            show('PDF indirme bu demoda simüle edildi — üretimde rapor üretilir.');
          }}
        />
      ) : null}
    </div>
  );
}

function ToolBtn({
  active,
  onClick,
  icon,
  label,
  hint,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  hint: string;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={hint}
      className={`inline-flex max-w-[140px] items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold transition sm:max-w-none ${
        active
          ? accent
            ? 'bg-violet-500/25 text-violet-100 ring-1 ring-violet-400/35'
            : 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/30'
          : 'text-slate-300 hover:bg-white/[0.06]'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'emerald' | 'amber' | 'rose';
}) {
  const ring =
    tone === 'emerald'
      ? 'text-emerald-300/90'
      : tone === 'amber'
        ? 'text-amber-300/90'
        : 'text-rose-300/90';
  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-lg font-bold tabular-nums ${ring}`}>{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
    </div>
  );
}

function PropertyDetailModal({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[405] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-detail-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Kapat"
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#0c0c14] shadow-2xl shadow-black/50">
        <div className="border-b border-white/[0.06] bg-gradient-to-r from-cyan-500/10 to-transparent px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-200">
                <Building2 className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2
                  id="property-detail-title"
                  className="text-base font-semibold leading-snug text-white"
                >
                  {property.title}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">{property.district}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-slate-300">
              {property.type}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                property.rentStatus === 'Dolu'
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-amber-500/15 text-amber-200'
              }`}
            >
              {property.rentStatus}
            </span>
            <span className="rounded-full bg-slate-500/15 px-2.5 py-0.5 text-[11px] text-slate-300">
              {property.rooms}
            </span>
          </div>
        </div>

        <div className="max-h-[min(55vh,420px)] space-y-4 overflow-y-auto px-5 py-4 text-sm">
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Adres
            </h3>
            <p className="mt-1 leading-relaxed text-slate-300">{property.address}</p>
          </div>
          <dl className="grid gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Brüt alan</dt>
              <dd className="font-medium tabular-nums text-white">{property.sqm} m²</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Özellikler</dt>
              <dd className="max-w-[60%] text-right text-slate-300">{property.features}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-white/[0.04] pt-3">
              <dt className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                Konum
              </dt>
              <dd className="font-mono text-[11px] text-slate-400">
                {property.lat.toFixed(4)}, {property.lon.toFixed(4)}
              </dd>
            </div>
          </dl>
          <p className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 text-[11px] leading-relaxed text-amber-100/90">
            Bu kart demo verisidir. Üretimde sözleşme tarihleri, fotoğraflar, belgeler ve geçmiş
            işlemler burada listelenir.
          </p>
        </div>

        <div className="flex justify-end border-t border-white/[0.06] bg-[#0a0a10] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06]"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

function ReportModal({
  payload,
  onClose,
  onDownloadDemo,
}: {
  payload: AnalysisPayload;
  onClose: () => void;
  onDownloadDemo: () => void;
}) {
  const mock = buildMockReport(payload.areaM2, payload.matched);

  return (
    <div
      className="fixed inset-0 z-[400] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Raporu kapat"
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-violet-500/25 bg-[#0c0c14] p-5 shadow-2xl shadow-violet-950/50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
              <FileBarChart2 className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <h2 id="report-title" className="text-lg font-semibold text-white">
                Bölge analiz raporu
              </h2>
              <p className="text-[11px] text-slate-500">Demo — gerçek veri veya PDF yok</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/[0.06] hover:text-white"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="mt-5 grid gap-3 rounded-xl border border-white/[0.06] bg-black/25 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Çizilen alan</dt>
            <dd className="font-medium text-slate-100">{payload.areaDisplay}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Poligon içi portföy</dt>
            <dd className="font-semibold text-violet-300">{payload.matched.length} adet</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Yoğunluk (adet / km²)</dt>
            <dd className="tabular-nums text-slate-300">{mock.density}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Bölge skoru (demo)</dt>
            <dd className="font-semibold text-emerald-300">{mock.score}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Tahmini kira bandı</dt>
            <dd className="text-right text-slate-300">{mock.rentBand}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Ort. m² (seçilenler)</dt>
            <dd className="tabular-nums text-slate-300">
              {payload.matched.length ? mock.avgSqm : '—'}
            </dd>
          </div>
        </dl>

        {payload.matched.length > 0 ? (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Alan içindeki varlıklar
            </h3>
            <ul className="mt-2 max-h-40 space-y-2 overflow-y-auto text-sm">
              {payload.matched.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2"
                >
                  <span className="font-medium text-slate-100">{p.title}</span>
                  <span className="text-xs text-slate-500">
                    {p.district} · {p.sqm} m²
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.06] p-3 text-[11px] leading-relaxed text-cyan-100/90">
          {mock.insight}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDownloadDemo}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg min-[400px]:flex-none"
          >
            <Download className="h-4 w-4" aria-hidden />
            Raporu indir (demo)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/[0.1] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06]"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
