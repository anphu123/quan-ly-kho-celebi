import api from '../lib/api';

export interface Attribute {
    id: string;
    attributeGroupId: string;
    key: string;
    name: string;
    type: 'TEXT' | 'NUMBER' | 'DECIMAL' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'DATE';
    isRequired: boolean;
    options?: any;
}

export interface AttributeGroup {
    id: string;
    categoryId: string;
    name: string;
    description?: string;
    attributes: Attribute[];
}

export const attributesApi = {
    async getGroupsByCategory(categoryId: string): Promise<AttributeGroup[]> {
        const response = await api.get(`/attributes/categories/${categoryId}/groups`);
        return response.data;
    },

    async createGroup(data: any): Promise<AttributeGroup> {
        const response = await api.post('/attributes/groups', data);
        return response.data;
    },

    async createAttribute(data: any): Promise<Attribute> {
        const response = await api.post('/attributes', data);
        return response.data;
    }
};
