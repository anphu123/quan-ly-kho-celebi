// ============== INVENTORY TYPES ==============

export enum StockMovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  RETURN_IN = 'RETURN_IN',
  RETURN_OUT = 'RETURN_OUT',
}

export interface StockLevel {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: StockMovementType;
  quantity: number;
  unitCost: number;
  runningBalance: number;
  runningCost: number;
  referenceType: string;
  referenceId: string;
  note?: string;
  createdById: string;
  createdAt: Date;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  isDefault: boolean;
  isActive: boolean;
}

export enum StocktakeStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Stocktake {
  id: string;
  code: string;
  warehouseId: string;
  status: StocktakeStatus;
  startedAt: Date;
  completedAt?: Date;
  note?: string;
  createdById: string;
}

export interface StocktakeItem {
  id: string;
  stocktakeId: string;
  productId: string;
  bookQty: number;
  actualQty: number;
  diffQty: number;
  reason?: string;
}
