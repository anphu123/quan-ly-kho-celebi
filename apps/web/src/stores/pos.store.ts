import { create } from 'zustand';
import type { PosProduct } from '../api/pos.api';

export interface CartItem extends PosProduct {
    unitPrice: number; // Negotiated price
    discount: number;
}

interface PosState {
    cart: CartItem[];
    customerId?: string;
    paymentMethod: string;
    notes: string;

    addItem: (product: PosProduct) => void;
    removeItem: (serialItemId: string) => void;
    updatePrice: (serialItemId: string, price: number) => void;
    updateDiscount: (serialItemId: string, discount: number) => void;
    clearCart: () => void;

    setCustomerId: (id?: string) => void;
    setPaymentMethod: (method: string) => void;
    setNotes: (notes: string) => void;

    getTotal: () => number;
}

export const usePosStore = create<PosState>((set, get) => ({
    cart: [],
    paymentMethod: 'CASH',
    notes: '',

    addItem: (product) => {
        const { cart } = get();
        // Don't add if already in cart (since it's serial-based, qty is always 1)
        if (cart.find(i => i.id === product.id)) return;

        set({
            cart: [...cart, {
                ...product,
                unitPrice: product.suggestedPrice || 0,
                discount: 0
            }]
        });
    },

    removeItem: (id) => {
        set({ cart: get().cart.filter(item => item.id !== id) });
    },

    updatePrice: (id, price) => {
        set({
            cart: get().cart.map(item =>
                item.id === id ? { ...item, unitPrice: price } : item
            )
        });
    },

    updateDiscount: (id, discount) => {
        set({
            cart: get().cart.map(item =>
                item.id === id ? { ...item, discount } : item
            )
        });
    },

    clearCart: () => {
        set({ cart: [], customerId: undefined, notes: '' });
    },

    setCustomerId: (id) => set({ customerId: id }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),
    setNotes: (notes) => set({ notes }),

    getTotal: () => {
        return get().cart.reduce((total, item) => total + (item.unitPrice - item.discount), 0);
    }
}));
