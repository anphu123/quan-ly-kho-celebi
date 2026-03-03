import api from '../api';

export interface Customer {
  id: string;
  code: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
  membershipTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  loyaltyPoints: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomersResponse {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomerDto {
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

export const customersApi = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get<CustomersResponse>('/customers', { params });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Customer>(`/customers/${id}`);
    return data;
  },

  create: async (dto: CreateCustomerDto) => {
    const { data } = await api.post<Customer>('/customers', dto);
    return data;
  },

  update: async (id: string, dto: UpdateCustomerDto) => {
    const { data } = await api.patch<Customer>(`/customers/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/customers/${id}`);
  },

  findByPhone: async (phone: string) => {
    const { data } = await api.get<Customer>(`/customers/phone/${phone}`);
    return data;
  },
};
