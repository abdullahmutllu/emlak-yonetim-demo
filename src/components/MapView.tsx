import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Heatmap from 'ol/layer/Heatmap';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';
import GeoJSON from 'ol/format/GeoJSON';
import Draw from 'ol/interaction/Draw';
import { easeOut } from 'ol/easing';
import { getLength, getArea } from 'ol/sphere';
import type { Property } from '../data/mock';
import { properties, sampleNeighborhoodGeoJSON } from '../data/mock';
import { TURKEY_PROVINCES_GEOJSON_URL } from '../lib/turkeyGeo';

export type MeasureMode = 'idle' | 'distance' | 'area' | 'analysis';

export type BasemapId = 'dark' | 'osm' | 'satellite';

export type AnalysisPayload = {
  areaM2: number;
  areaDisplay: string;
  matched: Property[];
};

/** Haritada varlığa odaklanmak için (token her istekte benzersiz olmalı) */
export type MapFocusRequest = {
  lon: number;
  lat: number;
  /** Varsayılan ~14 (sokak seviyesi hissi) */
  zoom?: number;
  token: number;
};

function createBaseSource(kind: BasemapId): OSM | XYZ {
  switch (kind) {
    case 'dark':
      return new XYZ({
        url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap © CARTO',
        crossOrigin: 'anonymous',
      });
    case 'satellite':
      return new XYZ({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: 'Tiles © Esri',
        maxZoom: 19,
        crossOrigin: 'anonymous',
      });
    default:
      return new OSM();
  }
}

function neighborhoodStyle(): Style {
  return new Style({
    fill: new Fill({ color: 'rgba(34, 211, 238, 0.08)' }),
    stroke: new Stroke({ color: 'rgba(34, 211, 238, 0.85)', width: 2 }),
  });
}

function propertyStyle(feature: Feature): Style {
  const name = feature.get('name') as string | undefined;
  return new Style({
    image: new CircleStyle({
      radius: 9,
      fill: new Fill({ color: 'rgba(52, 211, 153, 0.95)' }),
      stroke: new Stroke({ color: 'rgba(255,255,255,0.95)', width: 2 }),
    }),
    text: name
      ? new Text({
          text: name,
          offsetY: -18,
          fill: new Fill({ color: '#f8fafc' }),
          stroke: new Stroke({ color: '#020617', width: 4 }),
          font: '600 11px system-ui, sans-serif',
        })
      : undefined,
  });
}

function measureStyle(): Style {
  return new Style({
    stroke: new Stroke({ color: '#fbbf24', width: 3 }),
    fill: new Fill({ color: 'rgba(251, 191, 36, 0.14)' }),
  });
}

function analysisZoneStyle(): Style {
  return new Style({
    stroke: new Stroke({ color: 'rgba(167, 139, 250, 0.95)', width: 3 }),
    fill: new Fill({ color: 'rgba(139, 92, 246, 0.18)' }),
  });
}

/** İl sınırları — neon çizgi + hafif parlama */
function provinceBoundaryStyle(): Style[] {
  return [
    new Style({
      stroke: new Stroke({ color: 'rgba(45, 212, 191, 0.35)', width: 5 }),
      zIndex: 0,
    }),
    new Style({
      stroke: new Stroke({ color: 'rgba(34, 253, 200, 0.95)', width: 1.35 }),
      zIndex: 1,
    }),
  ];
}

function formatArea(m2: number): string {
  if (m2 >= 1_000_000) return `Alan: ${(m2 / 1_000_000).toFixed(2)} km²`;
  if (m2 >= 10_000) return `Alan: ${(m2 / 10_000).toFixed(2)} ha`;
  return `Alan: ${Math.round(m2)} m²`;
}

function buildHeatmapSource(): VectorSource {
  const src = new VectorSource();
  for (const p of properties) {
    const f = new Feature({
      geometry: new Point(fromLonLat([p.lon, p.lat])),
    });
    f.set('weight', Math.min(1, p.sqm / 220));
    src.addFeature(f);
  }
  for (let i = 0; i < 28; i++) {
    const lon = 28.55 + Math.random() * 1.05;
    const lat = 40.82 + Math.random() * 0.55;
    const f = new Feature({
      geometry: new Point(fromLonLat([lon, lat])),
    });
    f.set('weight', 0.2 + Math.random() * 0.8);
    src.addFeature(f);
  }
  return src;
}

type MapViewProps = {
  basemap: BasemapId;
  mode: MeasureMode;
  clearVersion: number;
  showProvinces: boolean;
  showHeatmap: boolean;
  onMeasureResult: (text: string) => void;
  onFeatureClick: (title: string | null) => void;
  onAnalysisComplete?: (payload: AnalysisPayload) => void;
  onProvincesLoaded?: () => void;
  onProvincesLoadError?: (message: string) => void;
  /** Liste/modal ile seçilen konuma yumuşak zoom */
  focusRequest?: MapFocusRequest | null;
  className?: string;
};

export default function MapView({
  basemap,
  mode,
  clearVersion,
  showProvinces,
  showHeatmap,
  onMeasureResult,
  onFeatureClick,
  onAnalysisComplete,
  onProvincesLoaded,
  onProvincesLoadError,
  focusRequest = null,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const measureSourceRef = useRef<VectorSource | null>(null);
  const analysisSourceRef = useRef<VectorSource | null>(null);
  const provinceSourceRef = useRef<VectorSource | null>(null);
  const provinceLayerRef = useRef<VectorLayer | null>(null);
  const heatmapLayerRef = useRef<Heatmap | null>(null);
  const propertyLayerRef = useRef<VectorLayer | null>(null);
  const measureDrawRef = useRef<Draw | null>(null);
  const analysisDrawRef = useRef<Draw | null>(null);
  const onFeatureClickRef = useRef(onFeatureClick);
  const onMeasureResultRef = useRef(onMeasureResult);
  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  const onProvincesLoadedRef = useRef(onProvincesLoaded);
  const onProvincesLoadErrorRef = useRef(onProvincesLoadError);
  const provincesDataLoadedRef = useRef(false);
  const provincesFitDoneRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  onFeatureClickRef.current = onFeatureClick;
  onMeasureResultRef.current = onMeasureResult;
  onAnalysisCompleteRef.current = onAnalysisComplete;
  onProvincesLoadedRef.current = onProvincesLoaded;
  onProvincesLoadErrorRef.current = onProvincesLoadError;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measureSource = new VectorSource();
    const analysisSource = new VectorSource();
    const propertySource = new VectorSource();
    const neighborhoodSource = new VectorSource();
    const provinceSource = new VectorSource();
    measureSourceRef.current = measureSource;
    analysisSourceRef.current = analysisSource;
    provinceSourceRef.current = provinceSource;

    for (const p of properties) {
      const f = new Feature({
        geometry: new Point(fromLonLat([p.lon, p.lat])),
      });
      f.set('name', p.title);
      propertySource.addFeature(f);
    }

    const gj = new GeoJSON();
    const boundary = gj.readFeatures(sampleNeighborhoodGeoJSON, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });
    neighborhoodSource.addFeatures(boundary);

    const heatmapSource = buildHeatmapSource();

    const baseLayer = new TileLayer({
      source: createBaseSource(basemap),
    });

    const provinceLayer = new VectorLayer({
      source: provinceSource,
      style: () => provinceBoundaryStyle(),
      visible: false,
      opacity: 1,
    });
    provinceLayerRef.current = provinceLayer;

    const heatmapLayer = new Heatmap({
      source: heatmapSource,
      blur: 18,
      radius: 14,
      weight: 'weight',
      opacity: 0.82,
      visible: false,
      gradient: [
        'rgba(8, 47, 73, 0.35)',
        'rgba(14, 165, 233, 0.55)',
        'rgba(34, 211, 238, 0.75)',
        'rgba(52, 211, 153, 0.85)',
        'rgba(251, 191, 36, 0.92)',
        'rgba(249, 115, 22, 0.95)',
        'rgba(239, 68, 68, 0.98)',
      ],
    });
    heatmapLayerRef.current = heatmapLayer;

    const propertyLayer = new VectorLayer({
      source: propertySource,
      style: (f) => propertyStyle(f as Feature),
    });
    propertyLayerRef.current = propertyLayer;

    const map = new Map({
      target: el,
      layers: [
        baseLayer,
        provinceLayer,
        heatmapLayer,
        new VectorLayer({
          source: neighborhoodSource,
          style: neighborhoodStyle,
        }),
        propertyLayer,
        new VectorLayer({
          source: analysisSource,
          style: analysisZoneStyle,
        }),
        new VectorLayer({
          source: measureSource,
          style: measureStyle,
        }),
      ],
      view: new View({
        center: fromLonLat([29.03, 41.01]),
        zoom: 11,
        maxZoom: 19,
      }),
    });

    mapRef.current = map;

    const ro = new ResizeObserver(() => {
      map.updateSize();
    });
    ro.observe(el);

    map.on('singleclick', (evt) => {
      const propLayer = propertyLayerRef.current;
      if (!propLayer) return;
      let found: string | null = null;
      map.forEachFeatureAtPixel(
        evt.pixel,
        (feature, layer) => {
          if (layer !== propLayer) return undefined;
          const n = feature.get('name');
          if (typeof n === 'string') found = n;
          return true;
        },
        { hitTolerance: 8 },
      );
      onFeatureClickRef.current(found);
    });

    setMapReady(true);

    return () => {
      setMapReady(false);
      ro.disconnect();
      map.setTarget(undefined);
      mapRef.current = null;
      measureSourceRef.current = null;
      analysisSourceRef.current = null;
      provinceSourceRef.current = null;
      provinceLayerRef.current = null;
      heatmapLayerRef.current = null;
      propertyLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const baseLayer = mapRef.current.getLayers().item(0) as TileLayer<OSM | XYZ>;
    baseLayer.setSource(createBaseSource(basemap));
  }, [mapReady, basemap]);

  useEffect(() => {
    heatmapLayerRef.current?.setVisible(showHeatmap);
  }, [mapReady, showHeatmap]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !focusRequest) return;
    const view = mapRef.current.getView();
    view.animate({
      center: fromLonLat([focusRequest.lon, focusRequest.lat]),
      zoom: focusRequest.zoom ?? 14,
      duration: 720,
      easing: easeOut,
    });
  }, [mapReady, focusRequest]);

  useEffect(() => {
    const layer = provinceLayerRef.current;
    const src = provinceSourceRef.current;
    const map = mapRef.current;
    if (!mapReady || !layer || !src || !map) return;

    layer.setVisible(showProvinces);

    if (!showProvinces || provincesDataLoadedRef.current) return;

    let cancelled = false;
    fetch(TURKEY_PROVINCES_GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`Sunucu ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        const format = new GeoJSON();
        const features = format.readFeatures(data, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857',
        });
        src.addFeatures(features);
        provincesDataLoadedRef.current = true;
        onProvincesLoadedRef.current?.();
        if (!provincesFitDoneRef.current) {
          const extent = src.getExtent();
          if (
            extent &&
            extent.length === 4 &&
            extent.every((x) => Number.isFinite(x))
          ) {
            map.getView().fit(extent, {
              padding: [32, 48, 32, 48],
              maxZoom: 7,
              duration: 450,
            });
            provincesFitDoneRef.current = true;
          }
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          onProvincesLoadErrorRef.current?.(e.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [mapReady, showProvinces]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const measureSource = measureSourceRef.current;
    if (!map || !measureSource) return;

    if (measureDrawRef.current) {
      map.removeInteraction(measureDrawRef.current);
      measureDrawRef.current = null;
    }

    if (mode === 'idle' || mode === 'analysis') return;

    const geomType = mode === 'distance' ? 'LineString' : 'Polygon';
    const draw = new Draw({
      source: measureSource,
      type: geomType,
    });

    draw.on('drawend', (event) => {
      const geom = event.feature.getGeometry();
      const projection = map.getView().getProjection();
      if (!geom) return;
      if (geom instanceof LineString) {
        const m = getLength(geom, { projection });
        const label =
          m >= 1000
            ? `Mesafe: ${(m / 1000).toFixed(2)} km`
            : `Mesafe: ${Math.round(m)} m`;
        onMeasureResultRef.current(label);
      } else if (geom instanceof Polygon) {
        const a = getArea(geom, { projection });
        onMeasureResultRef.current(formatArea(a));
      }
    });

    map.addInteraction(draw);
    measureDrawRef.current = draw;

    return () => {
      map.removeInteraction(draw);
      measureDrawRef.current = null;
    };
  }, [mapReady, mode]);

  useEffect(() => {
    if (!mapReady || mode !== 'analysis') return;
    const map = mapRef.current;
    const analysisSource = analysisSourceRef.current;
    if (!map || !analysisSource) return;

    if (analysisDrawRef.current) {
      map.removeInteraction(analysisDrawRef.current);
      analysisDrawRef.current = null;
    }

    const draw = new Draw({
      source: analysisSource,
      type: 'Polygon',
    });

    draw.on('drawstart', () => {
      analysisSource.clear();
    });

    draw.on('drawend', (event) => {
      const geom = event.feature.getGeometry();
      const projection = map.getView().getProjection();
      if (!(geom instanceof Polygon)) return;
      const areaM2 = getArea(geom, { projection });
      const areaDisplay = formatArea(areaM2);
      const matched: Property[] = [];
      for (const p of properties) {
        const c = fromLonLat([p.lon, p.lat]);
        if (geom.intersectsCoordinate(c)) {
          matched.push(p);
        }
      }
      onAnalysisCompleteRef.current?.({
        areaM2,
        areaDisplay,
        matched,
      });
    });

    map.addInteraction(draw);
    analysisDrawRef.current = draw;

    return () => {
      map.removeInteraction(draw);
      analysisDrawRef.current = null;
    };
  }, [mapReady, mode]);

  useEffect(() => {
    if (clearVersion === 0) return;
    measureSourceRef.current?.clear();
    analysisSourceRef.current?.clear();
  }, [clearVersion]);

  return (
    <div
      ref={containerRef}
      className={
        className ??
        'h-full min-h-[320px] w-full rounded-2xl border border-white/[0.08] bg-[#0a0a10]'
      }
      role="application"
      aria-label="İstanbul harita alanı"
    />
  );
}
