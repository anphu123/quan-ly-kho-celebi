// ============== CURRENCY UTILITIES ==============

/**
 * Format số thành VND currency
 * @param amount - Số tiền
 * @returns Chuỗi định dạng VND (ví dụ: "1.000.000₫")
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format số thành VND không ký hiệu
 * @param amount - Số tiền
 * @returns Chuỗi định dạng (ví dụ: "1.000.000")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount);
}

/**
 * Parse chuỗi VND thành số
 */
export function parseVND(value: string): number {
  return parseFloat(value.replace(/[^\d.-]/g, '') || '0');
}
