import api from '../lib/api';

export interface PosProduct {
    id: string; // SerialItemId
    productTemplateId: string;
    serialNumber?: string;
    internalCode: string;
    suggestedPrice: number;
    grade?: string;
    productTemplate: {
        name: string;
        sku: string;
        category: { name: string };
        brand?: { name: string };
    };
}

export interface CheckoutPayload {
    warehouseId: string;
    customerId?: string;
    paymentMethod?: string;
    paidAmount?: number;
    notes?: string;
    items: {
        serialItemId: string;
        unitPrice: number;
        discount?: number;
    }[];
}

export const posApi = {
    async searchItems(warehouseId: string, keyword: string): Promise<PosProduct[]> {
        const response = await api.get('/pos/search', {
            params: { warehouseId, keyword }
        });
        return response.data;
    },

    async checkout(payload: CheckoutPayload): Promise<any> {
        const response = await api.post('/pos/checkout', payload);
        return response.data;
    }
};
