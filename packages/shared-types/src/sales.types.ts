// ============== SALES TYPES ==============

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  DEBT = 'DEBT',
  MIXED = 'MIXED',
}

export enum SOStatus {
  COMPLETED = 'COMPLETED',
  RETURNED = 'RETURNED',
  PARTIALLY_RETURNED = 'PARTIALLY_RETURNED',
  CANCELLED = 'CANCELLED',
}

export interface SalesOrder {
  id: string;
  code: string;
  customerId?: string;
  status: SOStatus;
  orderDate: Date;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  changeAmount: number;
  debtAmount: number;
  totalCOGS: number;
  note?: string;
  createdById: string;
  warehouseId: string;
  createdAt: Date;
}

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  lineTotal: number;
  returnedQty: number;
}

export interface CreateSalesOrderDto {
  customerId?: string;
  warehouseId: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
  discountAmount?: number;
  discountPercent?: number;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  note?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  membershipTier: 'REGULAR' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalSpent: number;
  points: number;
  creditLimit: number;
  currentDebt: number;
  isActive: boolean;
}
