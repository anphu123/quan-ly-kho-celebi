import { Plus, Award } from 'lucide-react';
import { PageHeader } from '../../components/widgets/PageHeader';
import { SearchBar } from '../../components/widgets/SearchBar';
import { BrandStats } from './components/BrandStats';
import { BrandGrid } from './components/BrandGrid';
import { BrandModal } from './components/BrandModal';
import { useBrands } from './hooks/useBrands';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Brand, CreateBrandDto } from '../../api/masterdata.api';

export default function BrandsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { brands, isLoading, stats, createMutation, updateMutation, deleteMutation } = useBrands();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q');
    if (q !== null) setSearchTerm(q);
  }, [location.search]);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getErrorMessage = (error: any) => {
    const message = error?.response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    return message || 'Có lỗi xảy ra';
  };

  const handleCreate = async (data: CreateBrandDto) => {
    try {
      await createMutation.mutateAsync(data);
      setIsModalOpen(false);
      alert('Tạo thương hiệu thành công!');
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const handleUpdate = async (data: CreateBrandDto) => {
    if (!editingBrand) return;
    try {
      await updateMutation.mutateAsync({ id: editingBrand.id, data });
      setIsModalOpen(false);
      setEditingBrand(null);
      alert('Cập nhật thương hiệu thành công!');
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleView = (brand: Brand) => {
    navigate(`/brands/${brand.id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xác nhận xóa thương hiệu này?')) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Xóa thương hiệu thành công!');
      } catch (error) {
        alert(getErrorMessage(error));
      }
    }
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
          onClick: () => {
            setEditingBrand(null);
            setIsModalOpen(true);
          },
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
        onView={handleView}
      />

      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBrand(null);
        }}
        onSubmit={editingBrand ? handleUpdate : handleCreate}
        initialData={editingBrand}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
