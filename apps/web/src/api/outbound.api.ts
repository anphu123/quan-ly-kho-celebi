import api from '../lib/api';

export interface OutboundItem {
    serialItemId: string;
    notes?: string;
    serialNumber?: string;
    name?: string;
}

export interface CreateOutboundPayload {
    warehouseId: string;
    type: 'RETURN_TO_VENDOR' | 'DISPOSAL' | 'INTERNAL_TRANSFER';
    destinationId?: string;
    items: OutboundItem[];
    notes?: string;
}

export const outboundApi = {
    async createOutbound(payload: CreateOutboundPayload): Promise<any> {
        const response = await api.post('/outbound', payload);
        return response.data;
    },

    async getRecentTransactions(): Promise<any[]> {
        const response = await api.get('/outbound/recent');
        return response.data;
    },

    getTypeLabel(type: string): string {
        const labels: Record<string, string> = {
            RETURN_TO_VENDOR: 'Trả NCC',
            DISPOSAL: 'Xuất Hủy',
            INTERNAL_TRANSFER: 'Chuyển Kho'
        };
        return labels[type] || type;
    }
};
