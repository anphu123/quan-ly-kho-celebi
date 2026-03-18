import { FolderTree, Package, Layers, Info } from 'lucide-react';
import { StatsCard } from '../../../components/widgets/StatsCard';

interface CategoryStatsProps {
  stats: {
    total: number;
    electronics: number;
    applianceLarge: number;
    applianceSmall: number;
    computer: number;
    accessory: number;
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
        label="Điện máy lớn"
        value={stats.applianceLarge}
        icon={Layers}
        color="orange"
      />
      <StatsCard
        label="Điện máy nhỏ"
        value={stats.applianceSmall}
        icon={Info}
        color="emerald"
      />
      <StatsCard
        label="Máy tính"
        value={stats.computer}
        icon={Package}
        color="blue"
      />
      <StatsCard
        label="Phụ kiện"
        value={stats.accessory}
        icon={Layers}
        color="indigo"
      />
    </div>
  );
}
