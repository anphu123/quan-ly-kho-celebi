import api from '../lib/api';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'QC_INSPECTOR'
  | 'INVENTORY_MANAGER'
  | 'TECHNICIAN'
  | 'CASHIER'
  | 'ACCOUNTANT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  fullName?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN:       'Quản trị viên',
  INVENTORY_MANAGER: 'Thủ kho',
  QC_INSPECTOR:      'Kiểm định viên (QC)',
  TECHNICIAN:        'Kỹ thuật viên',
  CASHIER:           'Nhân viên bán hàng',
  ACCOUNTANT:        'Kế toán',
};

export const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  SUPER_ADMIN:       { bg: '#fef3c7', color: '#d97706' },
  INVENTORY_MANAGER: { bg: '#dbeafe', color: '#1d4ed8' },
  QC_INSPECTOR:      { bg: '#ede9fe', color: '#7c3aed' },
  TECHNICIAN:        { bg: '#dcfce7', color: '#15803d' },
  CASHIER:           { bg: '#fce7f3', color: '#be185d' },
  ACCOUNTANT:        { bg: '#ffedd5', color: '#c2410c' },
};

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  create: async (dto: CreateUserDto): Promise<User> => {
    const { data } = await api.post('/users', dto);
    return data;
  },

  update: async (id: string, dto: UpdateUserDto): Promise<User> => {
    const { data } = await api.put(`/users/${id}`, dto);
    return data;
  },

  resetPassword: async (id: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.put(`/users/${id}/reset-password`, { newPassword });
    return data;
  },

  remove: async (id: string): Promise<User> => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};
