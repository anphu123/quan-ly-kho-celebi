// ============== ROLES & PERMISSIONS ==============

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  CASHIER: 'CASHIER',
  ACCOUNTANT: 'ACCOUNTANT',
} as const;

export const PERMISSIONS = {
  // System
  MANAGE_SYSTEM: 'manage:system',
  MANAGE_USERS: 'manage:users',
  
  // Products
  VIEW_PRODUCTS: 'view:products',
  CREATE_PRODUCTS: 'create:products',
  UPDATE_PRODUCTS: 'update:products',
  DELETE_PRODUCTS: 'delete:products',
  VIEW_COST_PRICE: 'view:cost_price',
  UPDATE_COST_PRICE: 'update:cost_price',
  
  // Purchasing
  VIEW_PURCHASE_ORDERS: 'view:purchase_orders',
  CREATE_PURCHASE_ORDERS: 'create:purchase_orders',
  UPDATE_PURCHASE_ORDERS: 'update:purchase_orders',
  DELETE_PURCHASE_ORDERS: 'delete:purchase_orders',
  
  // Sales
  VIEW_SALES: 'view:sales',
  CREATE_SALES: 'create:sales',
  VIEW_PROFIT: 'view:profit',
  
  // Inventory
  VIEW_INVENTORY: 'view:inventory',
  MANAGE_INVENTORY: 'manage:inventory',
  STOCKTAKE: 'stocktake',
  TRANSFER_STOCK: 'transfer:stock',
  
  // Finance
  VIEW_FINANCE: 'view:finance',
  MANAGE_CASH_BOOK: 'manage:cash_book',
  MANAGE_AR: 'manage:accounts_receivable',
  MANAGE_AP: 'manage:accounts_payable',
  
  // Reports
  VIEW_REPORTS: 'view:reports',
  VIEW_FINANCIAL_REPORTS: 'view:financial_reports',
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  
  [USER_ROLES.INVENTORY_MANAGER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.UPDATE_PRODUCTS,
    PERMISSIONS.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.CREATE_PURCHASE_ORDERS,
    PERMISSIONS.UPDATE_PURCHASE_ORDERS,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.STOCKTAKE,
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.VIEW_REPORTS,
  ],
  
  [USER_ROLES.CASHIER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_SALES,
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.VIEW_INVENTORY,
  ],
  
  [USER_ROLES.ACCOUNTANT]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.VIEW_COST_PRICE,
    PERMISSIONS.VIEW_PURCHASE_ORDERS,
    PERMISSIONS.VIEW_SALES,
    PERMISSIONS.VIEW_PROFIT,
    PERMISSIONS.VIEW_FINANCE,
    PERMISSIONS.MANAGE_CASH_BOOK,
    PERMISSIONS.MANAGE_AR,
    PERMISSIONS.MANAGE_AP,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
  ],
};
