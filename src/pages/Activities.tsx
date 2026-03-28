import PageHeader from '../components/PageHeader';
import { activities } from '../data/mock';

export default function Activities() {
  return (
    <div>
      <PageHeader
        title="Faaliyet takibi"
        subtitle="Görüşme, ziyaret ve bakım kayıtları — kronolojik özet (demo)."
      />

      <ol className="relative ml-2 border-l border-white/[0.08] pl-8">
        {activities.map((a) => (
          <li key={a.id} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[25px] top-1 flex h-3 w-3 items-center justify-center">
              <span className="absolute h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <time className="font-mono text-[11px] text-slate-500">{a.time}</time>
            <div className="mt-1 inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
              {a.type}
            </div>
            <div className="mt-2 text-sm font-semibold text-white">{a.propertyTitle}</div>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{a.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
