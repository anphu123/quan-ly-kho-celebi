import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Award, Package } from 'lucide-react';
import { brandsApi } from '../../api/masterdata.api';
import { resolveImageUrl } from '../../lib/image';

export default function BrandDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: brand, isLoading, error } = useQuery({
    queryKey: ['brand-detail', id],
    queryFn: () => brandsApi.getById(id as string),
    enabled: !!id,
  });

  if (isLoading) return <div style={{ padding: 32 }}>Đang tải...</div>;
  if (error || !brand) return <div style={{ padding: 32 }}>Không tìm thấy thương hiệu</div>;

  const categories = brand.brandCategories?.map(bc => bc.category).filter(Boolean) || [];

  return (
    <div style={{ padding: 32 }}>
      <button onClick={() => navigate(-1)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, fontWeight: 600 }}>
        <ArrowLeft size={15} /> Quay lại
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Award size={22} color="#f59e0b" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{brand.name}</h1>
          <div style={{ fontSize: 13, color: '#64748b' }}>{brand.code}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Sản phẩm</div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{brand._count?.productTemplates || 0}</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Logo</div>
          {brand.logo ? (
            <img src={resolveImageUrl(brand.logo)} alt={brand.name} style={{ height: 40, objectFit: 'contain' }} />
          ) : (
            <div style={{ color: '#94a3b8', fontSize: 12 }}>Không có logo</div>
          )}
        </div>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Danh mục</div>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{categories.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Danh mục áp dụng</h3>
          {categories.length === 0 ? (
            <div style={{ color: '#94a3b8', fontSize: 13 }}>Chưa gán danh mục</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map((c: any) => (
                <button key={c.id} onClick={() => navigate(`/categories/${c.id}`)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>Mẫu sản phẩm gần đây</h3>
          {brand.productTemplates?.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {brand.productTemplates.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                    <Package size={16} color="#94a3b8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{p.category?.name || '—'}</div>
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
