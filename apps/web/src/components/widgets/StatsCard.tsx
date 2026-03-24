import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'indigo' | 'purple' | 'blue' | 'emerald' | 'orange' | 'red';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  indigo: 'bg-indigo-50 text-indigo-600',
  purple: 'bg-purple-50 text-purple-600',
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
};

export function StatsCard({ label, value, icon: Icon, color = 'indigo', trend }: StatsCardProps) {
  return (
    <div style={{
      background: '#fff',
      padding: '1.5rem',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            {label}
          </p>
          <p style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a' }}>
            {value}
          </p>
          {trend && (
            <p style={{
              fontSize: '0.75rem',
              color: trend.isPositive ? '#10b981' : '#ef4444',
              marginTop: '0.25rem'
            }}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={colorClasses[color]} style={{
          width: '3rem',
          height: '3rem',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
