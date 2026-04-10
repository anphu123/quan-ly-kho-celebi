import api from '../lib/api';

export interface CustomFieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
}

export interface TradeInProgram {
  id: string;
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  customFields?: CustomFieldDef[];
  defaultFieldConfig?: Record<string, { visible: boolean; required: boolean }>;
  createdById?: string;
  createdBy?: { id: string; fullName: string };
  createdAt: string;
  updatedAt: string;
  stats: {
    totalRequests: number;
    completedRequests: number;
    totalEstimatedValue: number;
    totalActualValue: number;
  };
}

export interface CreateTradeInProgramDto {
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  startDate?: string;
  endDate?: string;
  customFields?: CustomFieldDef[];
  defaultFieldConfig?: Record<string, { visible: boolean; required: boolean }>;
}

export interface UpdateTradeInProgramDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  customFields?: CustomFieldDef[];
  defaultFieldConfig?: Record<string, { visible: boolean; required: boolean }>;
}

export const tradeInProgramsApi = {
  getAll: async (): Promise<TradeInProgram[]> => {
    const { data } = await api.get('/trade-in-programs');
    return data;
  },

  getById: async (id: string): Promise<TradeInProgram> => {
    const { data } = await api.get(`/trade-in-programs/${id}`);
    return data;
  },

  create: async (dto: CreateTradeInProgramDto): Promise<TradeInProgram> => {
    const { data } = await api.post('/trade-in-programs', dto);
    return data;
  },

  update: async (id: string, dto: UpdateTradeInProgramDto): Promise<TradeInProgram> => {
    const { data } = await api.put(`/trade-in-programs/${id}`, dto);
    return data;
  },

  remove: async (id: string): Promise<TradeInProgram> => {
    const { data } = await api.delete(`/trade-in-programs/${id}`);
    return data;
  },

  formatCurrency: (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
};
