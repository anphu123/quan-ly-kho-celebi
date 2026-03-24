import { Award, Package, Image } from 'lucide-react';
import { StatsCard } from '../../../components/widgets/StatsCard';

interface BrandStatsProps {
  stats: {
    total: number;
    withLogo: number;
    totalProducts: number;
  };
}

export function BrandStats({ stats }: BrandStatsProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    }}>
      <StatsCard
        label="Tổng thương hiệu"
        value={stats.total}
        icon={Award}
        color="indigo"
      />
      <StatsCard
        label="Có logo"
        value={stats.withLogo}
        icon={Image}
        color="purple"
      />
      <StatsCard
        label="Sản phẩm"
        value={stats.totalProducts}
        icon={Package}
        color="blue"
      />
    </div>
  );
}
