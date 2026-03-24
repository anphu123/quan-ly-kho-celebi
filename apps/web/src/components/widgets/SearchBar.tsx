import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Tìm kiếm...' }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
        }}
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem 0.75rem 2.75rem',
          border: '1px solid #e2e8f0',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#6366f1';
          e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e2e8f0';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
