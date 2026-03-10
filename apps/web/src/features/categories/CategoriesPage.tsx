import { Plus, FolderTree } from 'lucide-react';
import { PageHeader } from '../../components/widgets/PageHeader';
import { SearchBar } from '../../components/widgets/SearchBar';
import { CategoryStats } from './components/CategoryStats';
import { CategoryTable } from './components/CategoryTable';
import { useCategories } from './hooks/useCategories';
import { useState } from 'react';

export default function CategoriesPage() {
  const { categories, isLoading, stats } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category: any) => {
    alert('Chức năng đang phát triển');
  };

  const handleDelete = (id: string) => {
    alert('Chức năng đang phát triển');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        icon={FolderTree}
        tag="Quản lý danh mục"
        title="Danh mục"
        subtitle="Sản phẩm"
        description="Quản lý phân loại sản phẩm theo danh mục và phương thức theo dõi tồn kho"
        action={{
          label: 'Thêm danh mục',
          icon: Plus,
          onClick: () => alert('Chức năng đang phát triển'),
        }}
      />

      <CategoryStats stats={stats} />

      <div style={{ marginBottom: '1.5rem' }}>
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm danh mục..."
        />
      </div>

      <CategoryTable
        categories={filteredCategories}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
