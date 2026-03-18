import { Edit2, Trash2, Package } from 'lucide-react';
import type { Brand } from '../../../api/masterdata.api';

interface BrandCardProps {
  brand: Brand;
  onEdit?: (brand: Brand) => void;
  onDelete?: (id: string) => void;
  onView?: (brand: Brand) => void;
}

export function BrandCard({ brand, onEdit, onDelete, onView }: BrandCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      padding: '1.5rem',
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    onClick={() => onView?.(brand)}
    >
      {/* Logo */}
      <div style={{
        width: '100%',
        height: '120px',
        background: brand.logo ? `url(${brand.logo}) center/contain no-repeat` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '0.75rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '2rem',
        fontWeight: 800,
      }}>
        {!brand.logo && brand.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.25rem',
        }}>
          {brand.name}
        </h3>
        <p style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          fontFamily: 'monospace',
        }}>
          {brand.code}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '0.5rem',
        marginBottom: '1rem',
      }}>
        <Package size={16} style={{ color: '#6366f1' }} />
        <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
          {brand._count?.productTemplates || 0} sản phẩm
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(brand);
          }}
          style={{
            flex: 1,
            padding: '0.5rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <Edit2 size={14} />
          Sửa
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Xác nhận xóa thương hiệu này?')) {
              onDelete?.(brand.id);
            }
          }}
          style={{
            flex: 1,
            padding: '0.5rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <Trash2 size={14} />
          Xóa
        </button>
      </div>
    </div>
  );
}
