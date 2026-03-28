import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Bot,
  Building2,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  MapPinned,
  Shield,
  Users,
} from 'lucide-react';
import AppHeader from './AppHeader';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: 'Genel',
    items: [
      { to: '/', label: 'Özet', icon: LayoutDashboard, end: true },
      { to: '/harita', label: 'Harita', icon: MapPinned },
    ],
  },
  {
    title: 'Portföy',
    items: [
      { to: '/gayrimenkuller', label: 'Gayrimenkuller', icon: Building2 },
      { to: '/kiracilar', label: 'Kiracılar', icon: Users },
    ],
  },
  {
    title: 'Analiz',
    items: [
      { to: '/pazar-arastirma', label: 'Pazar araştırması', icon: LineChart },
      { to: '/faaliyetler', label: 'Faaliyetler', icon: ClipboardList },
      { to: '/ai-arama', label: 'AI arama', icon: Bot },
    ],
  },
  {
    title: 'Sistem',
    items: [{ to: '/guvenlik', label: 'Güvenlik & roller', icon: Shield }],
  },
];

function navClass({ isActive }: { isActive: boolean }) {
  return [
    'group flex items-center gap-3 rounded-r-lg border-l-2 py-2.5 pl-3 pr-3 text-sm font-medium transition-all',
    isActive
      ? 'border-cyan-400 bg-gradient-to-r from-cyan-500/15 to-transparent text-white shadow-[inset_0_0_24px_rgba(34,211,238,0.06)]'
      : 'border-transparent text-slate-400 hover:border-slate-600 hover:bg-white/[0.04] hover:text-slate-200',
  ].join(' ');
}

export default function Layout() {
  const { pathname } = useLocation();
  const isMapPage = pathname === '/harita';

  return (
    <div className="flex min-h-screen bg-[#07070b] text-slate-100">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a10]">
        <div className="border-b border-white/[0.06] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 shadow-lg shadow-cyan-500/20">
              <Building2 className="h-5 w-5 text-white" aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Yönetim
              </div>
              <div className="truncate text-base font-bold tracking-tight text-white">
                Emlak<span className="text-cyan-400">OS</span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            Portföy · harita · analiz — müşteri demosu
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g.title} className="mb-6 last:mb-0">
              <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {g.title}
              </div>
              <ul className="space-y-0.5">
                {g.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={navClass}
                    >
                      <item.icon
                        className="h-[18px] w-[18px] shrink-0 opacity-80 group-hover:opacity-100"
                        aria-hidden
                      />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.06] p-4">
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] px-3 py-2 text-[11px] text-amber-200/90">
            <strong className="font-semibold text-amber-100">Demo</strong> — canlı veri
            yok; sunum amaçlı arayüz.
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main
          className={
            isMapPage
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden'
              : 'app-shell flex-1 overflow-auto p-4 md:p-6'
          }
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
