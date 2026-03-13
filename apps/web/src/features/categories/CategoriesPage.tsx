import { Plus, FolderTree } from 'lucide-react';
import { PageHeader } from '../../components/widgets/PageHeader';
import { SearchBar } from '../../components/widgets/SearchBar';
import { CategoryStats } from './components/CategoryStats';
import { CategoryTable } from './components/CategoryTable';
import { CategoryModal } from './components/CategoryModal';
import { useCategories } from './hooks/useCategories';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Category, CreateCategoryDto } from '../../api/masterdata.api';

export default function CategoriesPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    categories,
    isLoading,
    stats,
    createMutation,
    updateMutation,
    deleteMutation
  } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q !== null) setSearchTerm(q);
  }, [location.search]);

  const getErrorMessage = (error: any) => {
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || 'Có lỗi xảy ra';
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (data: CreateCategoryDto) => {
    try {
      await createMutation.mutateAsync(data);
      setIsModalOpen(false);
      alert('Tạo danh mục thành công!');
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const handleUpdate = async (data: CreateCategoryDto) => {
    if (!editingCategory) return;
    try {
      await updateMutation.mutateAsync({ id: editingCategory.id, data });
      setIsModalOpen(false);
      setEditingCategory(null);
      alert('Cập nhật danh mục thành công!');
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleView = (category: Category) => {
    navigate(`/categories/${category.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nhận xóa danh mục này?')) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Xóa danh mục thành công!');
      } catch (error) {
        alert(getErrorMessage(error));
      }
    }
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
          onClick: () => {
            setEditingCategory(null);
            setIsModalOpen(true);
          },
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
        onView={handleView}
      />

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        initialData={editingCategory}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
