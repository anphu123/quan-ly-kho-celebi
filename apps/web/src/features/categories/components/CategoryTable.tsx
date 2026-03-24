import { Edit2, Trash2, Package } from 'lucide-react';
import { categoriesApi } from '../../../api/masterdata.api';
import type { Category } from '../../../api/masterdata.api';

interface CategoryTableProps {
  categories: Category[];
  loading: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (id: string) => void;
}

export function CategoryTable({ categories, loading, onEdit, onDelete }: CategoryTableProps) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        Đang tải...
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
        <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>Chưa có danh mục nào</p>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Mã
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Tên danh mục
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Loại sản phẩm
            </th>
            <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Phương thức
            </th>
            <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Sản phẩm
            </th>
            <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: '#f1f5f9',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#475569',
                }}>
                  {category.code}
                </span>
              </td>
              <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>
                {category.name}
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {categoriesApi.getProductTypeLabel(category.productType)}
                </span>
              </td>
              <td style={{ padding: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {categoriesApi.getTrackingMethodLabel(category.trackingMethod)}
                </span>
              </td>
              <td style={{ padding: '1rem', textAlign: 'center' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  background: '#dbeafe',
                  color: '#1e40af',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}>
                  {category._count?.productTemplates || 0}
                </span>
              </td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => onEdit?.(category)}
                    style={{
                      padding: '0.5rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      color: '#64748b',
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Xác nhận xóa danh mục này?')) {
                        onDelete?.(category.id);
                      }
                    }}
                    style={{
                      padding: '0.5rem',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      color: '#dc2626',
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
    </div>
  );
}
