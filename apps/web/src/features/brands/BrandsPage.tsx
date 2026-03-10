import { Plus, Award } from 'lucide-react';
import { PageHeader } from '../../components/widgets/PageHeader';
import { SearchBar } from '../../components/widgets/SearchBar';
import { BrandStats } from './components/BrandStats';
import { BrandGrid } from './components/BrandGrid';
import { useBrands } from './hooks/useBrands';
import { useState } from 'react';

export default function BrandsPage() {
  const { brands, isLoading, stats } = useBrands();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (brand: any) => {
    alert('Chức năng đang phát triển');
  };

  const handleDelete = (id: string) => {
    alert('Chức năng đang phát triển');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={Award}
        tag="Quản lý thương hiệu"
        title="Thương hiệu"
        subtitle="& Nhãn hiệu"
        description="Quản lý các thương hiệu sản phẩm và logo nhận diện"
        action={{
          label: 'Thêm thương hiệu',
          icon: Plus,
          onClick: () => alert('Chức năng đang phát triển'),
        }}
      />

      <BrandStats stats={stats} />

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm thương hiệu..."
        />
      </div>

      <BrandGrid
        brands={filteredBrands}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
