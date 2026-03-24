import { useQuery } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, FolderTree, Package } from 'lucide-react';
import { categoriesApi } from '../../api/masterdata.api';

export default function CategoriesPage() {
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [editingCategory, setEditingCategory] = useState<any>(null);
  // const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  // const createMutation = useMutation({
  //   mutationFn: categoriesApi.create,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['categories'] });
  //     setIsModalOpen(false);
  //     alert('Tạo danh mục thành công!');
  //   },
  // });

  // const updateMutation = useMutation({
  //   mutationFn: ({ id, data }: any) => categoriesApi.update(id, data),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['categories'] });
  //     setIsModalOpen(false);
  //     setEditingCategory(null);
  //     alert('Cập nhật danh mục thành công!');
  //   },
  // });

  // const deleteMutation = useMutation({
  //   mutationFn: categoriesApi.delete,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['categories'] });
  //     alert('Xóa danh mục thành công!');
  //   },
  // });

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#0f172a' }}>
            Quản lý Danh mục
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14 }}>
            Quản lý danh mục sản phẩm và cấu trúc phân cấp
          </p>
        </div>
        <button
          onClick={() => alert('Chức năng đang phát triển')}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          <Plus size={20} />
          Tạo danh mục mới
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderTree size={24} color="#3b82f6" />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{categories.length}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Tổng danh mục</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', padding: 24, borderRadius: 16, border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} color="#16a34a" />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a' }}>0</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Sản phẩm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
            Danh sách danh mục
          </h3>
        </div>

        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>
            Đang tải...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FolderTree size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
              Chưa có danh mục nào
            </div>
            <div style={{ fontSize: 14, color: '#94a3b8' }}>
              Tạo danh mục đầu tiên để bắt đầu quản lý sản phẩm
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Tên danh mục</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Mã</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Loại</th>
                <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Theo dõi</th>
                <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#64748b' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category: any) => (
                <tr key={category.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{category.name}</div>
                  </td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{category.code}</td>
                  <td style={{ padding: '16px 24px', color: '#64748b' }}>{category.productType}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 600,
                      background: category.trackingMethod === 'SERIAL_BASED' ? '#dbeafe' : '#fef3c7',
                      color: category.trackingMethod === 'SERIAL_BASED' ? '#1e40af' : '#92400e',
                    }}>
                      {category.trackingMethod === 'SERIAL_BASED' ? 'Theo số serial' : 'Số lượng'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => alert('Chức năng đang phát triển')}
                        style={{
                          padding: 8,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          cursor: 'pointer',
                          color: '#64748b',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Xác nhận xóa danh mục này?')) {
                            alert('Chức năng đang phát triển');
                          }
                        }}
                        style={{
                          padding: 8,
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: 8,
                          cursor: 'pointer',
                          color: '#ef4444',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
