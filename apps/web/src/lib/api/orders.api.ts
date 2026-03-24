import api from '../api';

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface CreateOrderDto {
    customerId?: string;
    items: OrderItem[];
    paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD';
    totalAmount: number;
    notes?: string;
}

export interface Order {
    id: string;
    code: string;
    customerId?: string;
    warehouseId: string;
    status: 'DRAFT' | 'CONFIRMED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
    totalAmount: number;
    paidAmount: number;
    createdAt: string;
    updatedAt: string;
}

export const ordersApi = {
    create: async (dto: CreateOrderDto) => {
        const { data } = await api.post<Order>('/orders', dto);
        return data;
    },

    getAll: async (params?: { page?: number; limit?: number }) => {
        const { data } = await api.get<{ data: Order[]; meta: any }>('/orders', { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<Order>(`/orders/${id}`);
        return data;
    },
};
