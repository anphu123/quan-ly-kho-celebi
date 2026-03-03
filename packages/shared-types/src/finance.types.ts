// ============== FINANCE TYPES ==============

export enum CashEntryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum DebtStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface CashEntry {
  id: string;
  code: string;
  type: CashEntryType;
  category: string;
  amount: number;
  paymentMethod: string;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  entryDate: Date;
  createdById: string;
  createdAt: Date;
}

export interface AccountReceivable {
  id: string;
  customerId: string;
  salesOrderId?: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: Date;
  status: DebtStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountPayable {
  id: string;
  supplierId: string;
  purchaseOrderId?: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: Date;
  status: DebtStatus;
  createdAt: Date;
  updatedAt: Date;
}
