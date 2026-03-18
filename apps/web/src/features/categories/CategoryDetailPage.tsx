import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FolderTree, Package } from 'lucide-react';
import { categoriesApi } from '../../api/masterdata.api';

export default function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category-detail', id],
    queryFn: () => categoriesApi.getById(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div style={{ padding: 32 }}>Đang tải...</div>;
  if (error || !category) return <div style={{ padding: 32 }}>Không tìm thấy danh mục</div>;

  const brands = category.brandCategories?.map(bc => bc.brand).filter(Boolean) || [];

  return (
    <div style={{ padding: 32 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, fontWeight: 600 }}>
        <ArrowLeft size={15} /> Quay lại
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FolderTree size={22} color="#6366f1" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{category.name}</h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>{category.code}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Loại sản phẩm</div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{categoriesApi.getProductTypeLabel(category.productType)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Phương thức</div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{categoriesApi.getTrackingMethodLabel(category.trackingMethod)}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Sản phẩm</div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{category._count?.productTemplates || 0}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Thương hiệu thuộc danh mục</h3>
          {brands.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Chưa gán thương hiệu</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {brands.map((b: any) => (
                <button key={b.id} onClick={() => navigate(`/brands/${b.id}`)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Mẫu sản phẩm gần đây</h3>
          {category.productTemplates?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {category.productTemplates.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                    <Package size={16} color="#94a3b8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.brand?.name || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Chưa có sản phẩm</div>
          )}
        </div>
      </div>
    </div>
  );
}
