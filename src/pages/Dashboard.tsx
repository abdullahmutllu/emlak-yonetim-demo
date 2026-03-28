import {
  Activity,
  Building2,
  PieChart,
  TrendingUp,
  Users,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { activities, properties, tenants } from '../data/mock';

export default function Dashboard() {
  const total = properties.length;
  const occupied = properties.filter((p) => p.rentStatus === 'Dolu').length;
  const vacant = total - occupied;
  const rate = total ? Math.round((occupied / total) * 100) : 0;
  const ringDash = total ? (occupied / total) * 100 : 0;

  const cards = [
    {
      label: 'Toplam gayrimenkul',
      value: String(total),
      hint: 'Kayıtlı varlık',
      icon: Building2,
      accent: 'from-cyan-500/20 to-transparent',
      iconClass: 'text-cyan-400',
    },
    {
      label: 'Doluluk oranı',
      value: `%${rate}`,
      hint: `${occupied} dolu · ${vacant} boş`,
      icon: TrendingUp,
      accent: 'from-emerald-500/20 to-transparent',
      iconClass: 'text-emerald-400',
    },
    {
      label: 'Aktif kiracı',
      value: String(tenants.length),
      hint: 'Sözleşmeli',
      icon: Users,
      accent: 'from-violet-500/15 to-transparent',
      iconClass: 'text-violet-300',
    },
    {
      label: 'Son dönem aktivite',
      value: String(activities.length),
      hint: 'Demo kayıtları',
      icon: Activity,
      accent: 'from-amber-500/15 to-transparent',
      iconClass: 'text-amber-300',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Özet panel"
        subtitle="Portföy ve operasyon metrikleri — gösterim amaçlı örnek veriler; canlı sistemde gerçek zamanlı güncellenir."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14]/80 p-5 shadow-xl shadow-black/20"
          >
            <div
              className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${c.accent} blur-2xl`}
            />
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-slate-500">{c.label}</div>
                <div className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-white">
                  {c.value}
                </div>
                <div className="mt-1 text-[11px] text-slate-600">{c.hint}</div>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] ${c.iconClass}`}
              >
                <c.icon className="h-5 w-5" aria-hidden />
              </div>
            </div>
            <Sparkline className="mt-4 opacity-60 group-hover:opacity-90" seed={c.label} />
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-[#0c0c14]/70 p-5 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-200">Portföy trafiği (örnek)</h2>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-slate-500">
              Son 6 ay
            </span>
          </div>
          <div className="mt-4 h-48 w-full">
            <svg
              viewBox="0 0 400 120"
              className="h-full w-full text-cyan-500/80"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,90 C40,85 60,40 100,55 S180,20 220,35 300,10 400,25 L400,120 L0,120 Z"
                fill="url(#g)"
              />
              <path
                d="M0,90 C40,85 60,40 100,55 S180,20 220,35 300,10 400,25"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <p className="mt-2 text-[11px] text-slate-600">
            Üretimde gerçek ziyaret ve sözleşme olaylarından beslenen çizelge kullanılır.
          </p>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-[#0c0c14]/70 p-5 shadow-xl">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-cyan-400/80" aria-hidden />
            <h2 className="text-sm font-semibold text-slate-200">Durum dağılımı</h2>
          </div>
          <div className="mt-6 flex items-center justify-center">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="rgba(51,65,85,0.5)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="rgb(52,211,153)"
                  strokeWidth="3"
                  strokeDasharray={`${ringDash} ${100 - ringDash}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-white">{rate}%</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Dolu
                </span>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-xs text-slate-500">
            <li className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Dolu
              </span>
              <span className="tabular-nums text-slate-300">{occupied}</span>
            </li>
            <li className="flex justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Boş
              </span>
              <span className="tabular-nums text-slate-300">{vacant}</span>
            </li>
          </ul>
        </section>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14]/60 shadow-xl">
        <div className="border-b border-white/[0.06] px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-200">Canlı aktivite akışı</h2>
          <p className="text-[11px] text-slate-600">Son kayıtlar — demo metinleri</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Zaman</th>
                <th className="px-5 py-3">Tür</th>
                <th className="px-5 py-3">Gayrimenkul</th>
                <th className="px-5 py-3">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-slate-300">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs text-slate-500">
                    {a.time}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                      {a.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-white">{a.propertyTitle}</td>
                  <td className="max-w-md px-5 py-3 text-slate-500">{a.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Sparkline({ className, seed }: { className?: string; seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 40;
  const pts = Array.from({ length: 12 }, (_, i) => {
    const v = ((h + i * 7) % 35) + 5;
    return `${(i / 11) * 100},${100 - v}`;
  }).join(' ');
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`h-8 w-full ${className ?? ''}`}
      aria-hidden
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-cyan-500/50"
        points={pts}
      />
    </svg>
  );
}
