import api from '../lib/api';

export interface SalesOrder {
    id: string;
    code: string;
    warehouseId: string;
    status: string;
    totalAmount: number;
    paidAmount: number;
    notes?: string;
    customerId?: string;
    salesPersonId: string;
    createdAt: string;
    customer?: { id: string; fullName: string; phone: string };
    salesPerson: { id: string; fullName: string };
    items: SalesOrderItem[];
}

export interface SalesOrderItem {
    id: string;
    salesOrderId: string;
    serialItemId: string;
    unitPrice: number;
    discount: number;
    finalPrice: number;
    serialItem: {
        id: string;
        serialNumber?: string;
        internalCode: string;
        productTemplate: {
            sku: string;
            name: string;
        }
    }
}

export const salesApi = {
    async getAllOrders(query: any = {}): Promise<{ data: SalesOrder[], pagination: any }> {
        const params = new URLSearchParams();
        if (query.page) params.append('page', query.page.toString());
        if (query.limit) params.append('limit', query.limit.toString());
        if (query.search) params.append('search', query.search);
        if (query.status) params.append('status', query.status);

        const response = await api.get(`/sales?${params.toString()}`);
        return response.data;
    },

    async getOrder(id: string): Promise<SalesOrder> {
        const response = await api.get(`/sales/${id}`);
        return response.data;
    },

    async getStats(): Promise<any> {
        const response = await api.get('/sales/stats');
        return response.data;
    },

    formatCurrency(amount?: number): string {
        if (!amount) return '0 ₫';
        return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
    },

    formatDate(date?: string): string {
        if (!date) return '--';
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
};
