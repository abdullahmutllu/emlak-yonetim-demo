import { useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { tenants as allTenants, tenantPropertyLabel } from '../data/mock';
import { useToast } from '../context/ToastContext';

const inputClass =
  'w-full rounded-xl border border-white/[0.08] bg-[#0c0c14] px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30';

export default function Tenants() {
  const { show } = useToast();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTenants;
    return allTenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        tenantPropertyLabel(t.propertyId).toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div>
      <PageHeader
        title="Kiracı yönetimi"
        subtitle="Kiracı bilgileri ve bağlı olduğu gayrimenkul — örnek ilişkiler."
        action={
          <button
            type="button"
            onClick={() => show('Yeni kiracı kaydı bu demoda yalnızca bildirim gösterir.')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 transition hover:brightness-110"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Yeni kiracı
          </button>
        }
      />

      <div className="max-w-md">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="İsim, e-posta veya gayrimenkul ara…"
          className={inputClass}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14]/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Ad</th>
                <th className="px-5 py-3">Telefon</th>
                <th className="px-5 py-3">E-posta</th>
                <th className="px-5 py-3">Gayrimenkul</th>
                <th className="px-5 py-3">Başlangıç</th>
                <th className="px-5 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-medium text-white">{t.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{t.phone}</td>
                  <td className="px-5 py-3.5">{t.email}</td>
                  <td className="px-5 py-3.5 text-slate-200">
                    {tenantPropertyLabel(t.propertyId)}
                  </td>
                  <td className="px-5 py-3.5 tabular-nums text-slate-400">{t.since}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      className="mr-3 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                      onClick={() =>
                        show(`Düzenle: ${t.name} (demo — kalıcı kayıt yok)`)
                      }
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-rose-400/90 hover:text-rose-300"
                      onClick={() =>
                        show(`Sil: ${t.name} (demo — kalıcı kayıt yok)`)
                      }
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
