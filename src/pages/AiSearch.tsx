import PageHeader from '../components/PageHeader';
import AiSearchPanel from '../components/AiSearchPanel';

export default function AiSearch() {
  return (
    <div>
      <PageHeader
        title="AI destekli arama"
        subtitle="Doğal dil sorgusu simülasyonu — gerçek LLM bağlantısı yoktur."
      />
      <AiSearchPanel />
    </div>
  );
}
