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
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<CustomersResponse> => {
    const { page = 1, limit = 12, search = '' } = params || {};
    const response = await api.get('/customers', { params: { page, limit, search } });
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (dto: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post('/customers', dto);
    return response.data;
  },

  update: async (id: string, dto: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },

  findByPhone: async (phone: string): Promise<Customer | null> => {
    const response = await api.get('/customers', { params: { search: phone, limit: 1 } });
    return response.data.data[0] || null;
  },
};
