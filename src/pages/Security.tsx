import { Shield } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const roles = [
  { name: 'Yönetici', desc: 'Tüm modüller ve kullanıcı ayarları (örnek).' },
  { name: 'Operasyon', desc: 'Gayrimenkul, kiracı ve faaliyet kayıtları.' },
  { name: 'Görüntüleyici', desc: 'Salt okunur panel ve raporlar.' },
];

export default function Security() {
  return (
    <div>
      <PageHeader
        title="Kullanıcı ve güvenlik"
        subtitle="Bu demoda oturum açma ve rol tabanlı yetkilendirme yoktur; aşağıdaki kartlar hedef rol modelini özetler."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((r) => (
          <div
            key={r.name}
            className="rounded-2xl border border-white/[0.06] bg-[#0c0c14]/80 p-5 shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400/80" aria-hidden />
              <h2 className="font-semibold text-white">{r.name}</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">{r.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 text-sm leading-relaxed text-amber-100/95">
        <strong className="font-semibold text-amber-50">Üretimde:</strong> güvenli oturum (ör.
        SSO veya MFA), denetim günlüğü, şifreleme ve KVKK uyumlu veri işleme politikaları ayrı
        tasarlanır.
      </div>
    </div>
  );
}
