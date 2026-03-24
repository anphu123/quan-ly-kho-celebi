import { FolderTree, Package, Layers } from 'lucide-react';
import { StatsCard } from '../../../components/widgets/StatsCard';

interface CategoryStatsProps {
  stats: {
    total: number;
    electronics: number;
    accessories: number;
    services: number;
  };
}

export function CategoryStats({ stats }: CategoryStatsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    }}>
      <StatsCard
        label="Tổng danh mục"
        value={stats.total}
        icon={FolderTree}
        color="indigo"
      />
      <StatsCard
        label="Điện tử"
        value={stats.electronics}
        icon={Package}
        color="purple"
      />
      <StatsCard
        label="Phụ kiện"
        value={stats.accessories}
        icon={Layers}
        color="blue"
      />
    </div>
  );
}
