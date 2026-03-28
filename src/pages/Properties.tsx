import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { properties as allProperties, type Property } from '../data/mock';
import { useToast } from '../context/ToastContext';

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#0c0c14] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30';

export default function Properties() {
  const { show } = useToast();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allProperties;
    return allProperties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q),
    );
  }, [query]);

  const notify = (action: string, p: Property) => {
    show(`${action}: ${p.title} (demo — kalıcı kayıt yok)`);
  };

  return (
    <div>
      <PageHeader
        title="Gayrimenkul yönetimi"
        subtitle="Adres, metrekare, oda sayısı ve durum — tüm kayıtlar örnek veridir."
        action={
          <button
            type="button"
            onClick={() => show('Yeni kayıt formu bu demoda yalnızca bildirim gösterir.')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Yeni gayrimenkul
          </button>
        }
      />

      <div className="max-w-md">
        <label htmlFor="search-prop" className="sr-only">
          Ara
        </label>
        <input
          id="search-prop"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Başlık, ilçe veya adres ara…"
          className={inputClass}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14]/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Başlık</th>
                <th className="px-5 py-3">İlçe</th>
                <th className="px-5 py-3">m²</th>
                <th className="px-5 py-3">Oda</th>
                <th className="px-5 py-3">Tür</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filtered.map((p) => (
                <tr key={p.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-medium text-white">{p.title}</td>
                  <td className="px-5 py-3.5">{p.district}</td>
                  <td className="px-5 py-3.5 tabular-nums">{p.sqm}</td>
                  <td className="px-5 py-3.5">{p.rooms}</td>
                  <td className="px-5 py-3.5">{p.type}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={
                        p.rentStatus === 'Dolu'
                          ? 'inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300'
                          : 'inline-flex rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-200'
                      }
                    >
                      {p.rentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      className="mr-3 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                      onClick={() => notify('Düzenle', p)}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-rose-400/90 hover:text-rose-300"
                      onClick={() => notify('Sil', p)}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
