import { Award } from 'lucide-react';
import { BrandCard } from './BrandCard';
import type { Brand } from '../../../api/masterdata.api';

interface BrandGridProps {
  brands: Brand[];
  loading: boolean;
  onEdit?: (brand: Brand) => void;
  onDelete?: (id: string) => void;
}

export function BrandGrid({ brands, loading, onEdit, onDelete }: BrandGridProps) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        Đang tải...
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <Award size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>Chưa có thương hiệu nào</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '1.5rem',
    }}>
      {brands.map((brand) => (
        <BrandCard
          key={brand.id}
          brand={brand}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
