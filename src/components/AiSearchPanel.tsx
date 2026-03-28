import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bot, Search } from 'lucide-react';
import { aiMockResults, properties } from '../data/mock';

const STORAGE_KEY = 'emlak-demo-ai-history';

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveHistory(items: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 12)));
}

const inputClass =
  'min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0c0c14] px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30';

type AiSearchPanelProps = {
  /** Modal içinde daha kompakt grid */
  compact?: boolean;
};

export default function AiSearchPanel({ compact }: AiSearchPanelProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<typeof properties>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const runSearch = useCallback(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const matched = new Map<string, (typeof properties)[0]>();
      for (const row of aiMockResults) {
        if (q.includes(row.query) || row.query.includes(q)) {
          const p = properties.find((x) => x.title === row.title);
          if (p) matched.set(p.id, p);
        }
      }
      if (matched.size === 0) {
        for (const p of properties) {
          if (
            p.district.toLowerCase().includes(q) ||
            p.title.toLowerCase().includes(q) ||
            p.rooms.toLowerCase().includes(q)
          ) {
            matched.set(p.id, p);
          }
        }
      }
      setResults([...matched.values()]);
      setLoading(false);
      const qTrim = query.trim();
      setHistory((prev) => {
        const next = [qTrim, ...prev.filter((x) => x !== qTrim)].slice(0, 12);
        saveHistory(next);
        return next;
      });
    }, 600);
  }, [query]);

  const hint = useMemo(
    () =>
      'Örnek: “Kadıköy’de 3+1, 100 m² üzeri kiralık” — demo anahtar kelime ve filtre ile eşleştirir.',
    [],
  );

  const gridClass = compact
    ? 'mt-5 grid grid-cols-1 gap-4'
    : 'mt-8 grid gap-6 lg:grid-cols-3';

  const resultsSpan = compact ? '' : 'lg:col-span-2';

  return (
    <div>
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent p-4 md:p-5">
        <p className="flex items-start gap-2 text-sm text-slate-400">
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400/80" aria-hidden />
          {hint}
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder="Doğal dil ile arayın…"
            className={inputClass}
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 transition hover:brightness-110 disabled:opacity-50"
          >
            <Search className="h-4 w-4" aria-hidden />
            {loading ? 'Aranıyor…' : 'Ara'}
          </button>
        </div>
      </div>

      <div className={gridClass}>
        <section
          className={`rounded-2xl border border-white/[0.06] bg-[#0c0c14]/60 p-4 shadow-xl sm:p-5 ${resultsSpan}`}
        >
          <h2 className="text-sm font-semibold text-slate-200">Sonuçlar</h2>
          {loading ? (
            <p className="mt-4 text-sm text-slate-500">Sorgu işleniyor (demo gecikmesi)…</p>
          ) : results.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Sorgu girin veya Kadıköy, 3+1, 100 gibi kelimeler deneyin.
            </p>
          ) : (
            <ul className="mt-3 max-h-[min(40vh,280px)] space-y-2 overflow-y-auto sm:mt-4 sm:space-y-3">
              {results.map((p) => (
                <li
                  key={p.id}
                  className="rounded-xl border border-white/[0.06] bg-black/20 px-3 py-2.5 text-sm sm:px-4 sm:py-3"
                >
                  <div className="font-semibold text-white">{p.title}</div>
                  <div className="mt-1 text-slate-500">
                    {p.district} · {p.rooms} · {p.sqm} m² · {p.type}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-[#0c0c14]/60 p-4 shadow-xl sm:p-5">
          <h2 className="text-sm font-semibold text-slate-200">Geçmiş aramalar</h2>
          <p className="mt-1 text-xs text-slate-600">Tarayıcıda saklanır (demo).</p>
          <ul className="mt-3 max-h-[min(32vh,220px)] space-y-2 overflow-y-auto text-sm">
            {history.length === 0 ? (
              <li className="text-slate-600">Henüz yok.</li>
            ) : (
              history.map((h) => (
                <li key={h}>
                  <button
                    type="button"
                    className="text-left text-sm font-medium text-cyan-400/90 hover:text-cyan-300"
                    onClick={() => {
                      setQuery(h);
                    }}
                  >
                    {h}
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
