import { Link, useLocation } from 'react-router-dom';
import { Bot, ChevronRight, Sparkles } from 'lucide-react';
import { getBreadcrumbs } from '../lib/routeLabels';

export default function AppHeader() {
  const { pathname } = useLocation();
  const { product, section } = getBreadcrumbs(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-white/[0.06] bg-[#0c0c12]/90 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="truncate font-medium text-slate-500">{product}</span>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
        <span className="truncate font-semibold text-slate-100">{section}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 font-mono text-[10px] text-slate-500 md:inline">
          demo.local
        </span>
        <Link
          to="/ai-arama"
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          <Bot className="h-4 w-4" aria-hidden />
          AI asistan
        </Link>
        <span
          className="hidden items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2 py-1 text-[10px] font-medium text-emerald-400/90 sm:inline-flex"
          title="Demo modu"
        >
          <Sparkles className="h-3 w-3" aria-hidden />
          Demo
        </span>
      </div>
    </header>
  );
}
