import { MapPin } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { marketNotes } from '../data/mock';

export default function Market() {
  return (
    <div>
      <PageHeader
        title="Pazar araştırması ve analiz"
        subtitle="Bölgesel kira bantları ve trend notları — üretimde bu veriler harita katmanları ve raporlarla birleştirilebilir."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {marketNotes.map((m) => (
          <article
            key={m.id}
            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0c14]/80 p-5 shadow-xl transition hover:border-cyan-500/20"
          >
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl transition group-hover:bg-cyan-500/15" />
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-semibold text-white">{m.district}</h2>
              <MapPin className="h-4 w-4 shrink-0 text-cyan-500/60" aria-hidden />
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Kira bandı (örnek)
                </dt>
                <dd className="mt-1 font-semibold text-cyan-300/90">{m.rentRange}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Trend
                </dt>
                <dd className="mt-1 text-slate-300">{m.trend}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-white/[0.06] pt-4 text-sm leading-relaxed text-slate-500">
              {m.note}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
