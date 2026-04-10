import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Plus, Search, Edit2, Key, ToggleLeft, ToggleRight,
  Shield, Loader2, X, Save, Eye, EyeOff, UserCheck, UserX
} from 'lucide-react';
import {
  usersApi, ROLE_LABELS, ROLE_COLORS,
  type User, type CreateUserDto, type UpdateUserDto, type UserRole
} from '../../api/users.api';
import { useAuthStore } from '../../stores/auth.store';

const ALL_ROLES: UserRole[] = [
  'SUPER_ADMIN', 'INVENTORY_MANAGER', 'QC_INSPECTOR',
  'TECHNICIAN', 'CASHIER', 'ACCOUNTANT',
];

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', height: 40, borderRadius: 9,
  border: '1.5px solid #e2e8f0', fontSize: 13, paddingLeft: 12, paddingRight: 12,
  color: '#0f172a', outline: 'none', background: '#fff',
};

/* ── Create / Edit User Modal ── */
function UserModal({
  user, onClose,
}: {
  user?: User;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(user);
  const [form, setForm] = useState<CreateUserDto & { confirmPassword?: string }>({
    email: user?.email || '',
    fullName: user?.fullName || '',
    password: '',
    role: user?.role || 'CASHIER',
    confirmPassword: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const createMut = useMutation({
    mutationFn: (dto: CreateUserDto) => usersApi.create(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Lỗi tạo tài khoản'),
  });

  const updateMut = useMutation({
    mutationFn: (dto: UpdateUserDto) => usersApi.update(user!.id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Lỗi cập nhật'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isEdit) {
      if (form.password !== form.confirmPassword) { setError('Mật khẩu không khớp'); return; }
      if (form.password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự'); return; }
      createMut.mutate({ email: form.email, fullName: form.fullName, password: form.password, role: form.role });
    } else {
      updateMut.mutate({ fullName: form.fullName, role: form.role });
    }
  };

  const loading = createMut.isPending || updateMut.isPending;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#fff', borderRadius: 18, width: 480, maxWidth: '95vw', boxShadow: '0 25px 60px rgba(0,0,0,.18)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <Shield size={20} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>{isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới'}</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Full name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Họ tên *</label>
            <input style={inputStyle} value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nguyễn Văn A" required />
          </div>

          {/* Email — readonly when editing */}
          {!isEdit && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email *</label>
              <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="nhanvien@cua-hang.com" required />
            </div>
          )}

          {/* Role */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Vai trò *</label>
            <select style={{ ...inputStyle, appearance: 'none' }} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))} required>
              {ALL_ROLES.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
          </div>

          {/* Password (create only) */}
          {!isEdit && (
            <>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mật khẩu *</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPwd ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 40 }} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Tối thiểu 6 ký tự" required />
                  <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Xác nhận mật khẩu *</label>
                <input type={showPwd ? 'text' : 'password'} style={inputStyle} value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Nhập lại mật khẩu" required />
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#475569' }}>
              Hủy
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Reset Password Modal ── */
function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const mut = useMutation({
    mutationFn: (p: string) => usersApi.resetPassword(user.id, p),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); onClose(); },
    onError: (e: any) => setError(e.response?.data?.message || 'Lỗi đặt lại mật khẩu'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pwd !== confirm) { setError('Mật khẩu không khớp'); return; }
    if (pwd.length < 6) { setError('Tối thiểu 6 ký tự'); return; }
    mut.mutate(pwd);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#fff', borderRadius: 18, width: 400, maxWidth: '95vw', boxShadow: '0 25px 60px rgba(0,0,0,.18)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
            <Key size={20} />
            <span style={{ fontWeight: 800, fontSize: 16 }}>Đặt lại mật khẩu</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>Đặt mật khẩu mới cho <strong>{user.fullName}</strong></p>
          {error && <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, fontWeight: 600 }}>{error}</div>}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mật khẩu mới *</label>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 40 }} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Tối thiểu 6 ký tự" required />
              <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#475569', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Xác nhận *</label>
            <input type={showPwd ? 'text' : 'password'} style={inputStyle} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Nhập lại mật khẩu" required />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid #e2e8f0', background: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#475569' }}>Hủy</button>
            <button type="submit" disabled={mut.isPending} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: mut.isPending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: mut.isPending ? 0.7 : 1 }}>
              {mut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Key size={15} />}
              Đặt lại mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function UsersPage() {
  const { user: me } = useAuthStore();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetPwdUser, setResetPwdUser] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'SUPER_ADMIN').length,
    byRole: ALL_ROLES.map(r => ({ role: r, count: users.filter(u => u.role === r).length })),
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-tag">
            <Shield size={11} />
            Quản lý hệ thống
            <span className="page-tag-dot" />
          </div>
          <h1 className="page-title">Tài khoản & <span>Phân quyền</span></h1>
          <p className="page-desc">Tạo tài khoản, gán vai trò và quản lý quyền truy cập cho nhân viên.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-submit">
          <Plus size={16} />
          Tạo tài khoản
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Tổng tài khoản', value: stats.total, color: '#4f46e5' },
          { label: 'Đang hoạt động', value: stats.active, color: '#10b981' },
          { label: 'Không hoạt động', value: stats.total - stats.active, color: '#ef4444' },
          { label: 'Quản trị viên', value: stats.admins, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="table-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Role distribution */}
      <div className="table-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lọc theo vai trò:</span>
          <button
            onClick={() => setRoleFilter('')}
            style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1.5px solid', background: !roleFilter ? '#4f46e5' : '#fff', color: !roleFilter ? '#fff' : '#64748b', borderColor: !roleFilter ? '#4f46e5' : '#e2e8f0' }}
          >
            Tất cả ({users.length})
          </button>
          {stats.byRole.filter(r => r.count > 0).map(({ role, count }) => {
            const c = ROLE_COLORS[role];
            const active = roleFilter === role;
            return (
              <button key={role} onClick={() => setRoleFilter(role === roleFilter ? '' : role)}
                style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1.5px solid', background: active ? c.color : c.bg, color: active ? '#fff' : c.color, borderColor: c.color }}>
                {ROLE_LABELS[role]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Table */}
      <div className="table-card">
        <div style={{ padding: '1rem 1rem 0' }}>
          <div className="table-search-wrap" style={{ maxWidth: 400 }}>
            <span className="table-search-icon"><Search size={16} /></span>
            <input type="text" placeholder="Tìm theo tên, email..." className="table-search" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="table-loading">
            <Loader2 size={28} className="animate-spin" style={{ color: '#4f46e5' }} />
            <p style={{ color: '#94a3b8' }}>Đang tải danh sách...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center' }}>
            <div className="table-empty-icon" style={{ margin: '0 auto 1rem' }}><Users size={24} /></div>
            <p style={{ fontWeight: 800, fontSize: '1.125rem', color: '#0f172a', marginBottom: '0.5rem' }}>Không tìm thấy tài khoản</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Nhân viên</th>
                  <th>Vai trò</th>
                  <th>Lần đăng nhập cuối</th>
                  <th>Ngày tạo</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-center" style={{ width: 160 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const rc = ROLE_COLORS[u.role];
                  const isMe = u.id === me?.id;
                  return (
                    <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.5 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${rc.bg},${rc.color}22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: rc.color, flexShrink: 0 }}>
                            {u.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>
                              {u.fullName}
                              {isMe && <span style={{ marginLeft: 6, fontSize: 10, background: '#4f46e5', color: '#fff', padding: '2px 7px', borderRadius: 99, fontWeight: 700 }}>Bạn</span>}
                            </p>
                            <p style={{ fontSize: 12, color: '#94a3b8' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: rc.bg, color: rc.color }}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569' }}>
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : <span style={{ color: '#cbd5e1' }}>Chưa đăng nhập</span>}
                      </td>
                      <td style={{ fontSize: 13, color: '#94a3b8' }}>
                        {new Date(u.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="text-center">
                        {u.isActive
                          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: '#dcfce7', color: '#15803d' }}><UserCheck size={12} /> Hoạt động</span>
                          : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, background: '#fee2e2', color: '#dc2626' }}><UserX size={12} /> Vô hiệu</span>
                        }
                      </td>
                      <td className="text-center">
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          {/* Edit */}
                          <button title="Chỉnh sửa" onClick={() => setEditUser(u)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}>
                            <Edit2 size={14} />
                          </button>
                          {/* Reset password */}
                          <button title="Đặt lại mật khẩu" onClick={() => setResetPwdUser(u)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                            <Key size={14} />
                          </button>
                          {/* Toggle active */}
                          {!isMe && (
                            <button title={u.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                              onClick={() => toggleActiveMut.mutate({ id: u.id, isActive: !u.isActive })}
                              style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.isActive ? '#ef4444' : '#10b981' }}>
                              {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <UserModal onClose={() => setShowCreate(false)} />}
      {editUser && <UserModal user={editUser} onClose={() => setEditUser(null)} />}
      {resetPwdUser && <ResetPasswordModal user={resetPwdUser} onClose={() => setResetPwdUser(null)} />}
    </div>
  );
}
