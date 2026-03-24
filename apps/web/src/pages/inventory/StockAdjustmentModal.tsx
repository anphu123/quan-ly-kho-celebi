import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Package, Warehouse, RotateCcw, X, Zap, Target, ShieldAlert, FileText } from 'lucide-react';
import { inventoryApi } from '../../lib/api/inventory.api';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  stockItem?: any;
}

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  stockItem
}: StockAdjustmentModalProps) {
  const [newQuantity, setNewQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  const adjustStockMutation = useMutation({
    mutationFn: inventoryApi.adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setNewQuantity('');
    setReason('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItem || !newQuantity || !reason) return;

    adjustStockMutation.mutate({
      serialItemId: stockItem.id,
      status: 'AVAILABLE' as any,
      notes: `${reason} - ${notes}`,
    } as any);
  };

  const handleClose = () => {
    if (!adjustStockMutation.isPending) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen || !stockItem) return null;

  const quantityDiff = Number(newQuantity) - stockItem.quantity;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fade-in">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full overflow-hidden animate-slide-up border border-slate-200 relative">

        {/* Animated Background Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

        {/* Header */}
        <div className="relative sticky top-0 bg-white/70 backdrop-blur-3xl border-b border-slate-100 px-10 py-10 flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white shadow-2xl">
              <RotateCcw className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-[1000] text-slate-900 tracking-tight leading-none">Hiệu chuẩn Tồn kho</h2>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-3 italic">Hiệu chuẩn thủ công</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all group">
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="relative p-12 space-y-10 z-10 custom-scrollbar max-h-[75vh] overflow-y-auto">

          {/* Product Asset Context */}
          <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[60px] pointer-events-none" />

            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Package className="w-8 h-8 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 italic">SKU mục tiêu</p>
                <h3 className="text-xl font-[1000] text-slate-900 tracking-tight leading-none mb-2 truncate">{stockItem.productTemplate?.name || stockItem.product?.name}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-slate-900 text-indigo-400 rounded-xl font-mono text-[11px] font-black tracking-widest uppercase">{stockItem.productTemplate?.sku || stockItem.product?.sku}</span>
                  <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest">{stockItem.productTemplate?.category?.name || stockItem.product?.category?.name}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                  <Warehouse className="w-3.5 h-3.5" /> Điểm kho
                </p>
                <p className="text-xs font-black text-slate-900 italic">{stockItem.warehouse.name} ({stockItem.warehouse.code})</p>
              </div>
              <div className="p-5 bg-white border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tồn hiện tại</p>
                <p className="text-xl font-[1000] text-indigo-600 tracking-tighter leading-none">1 <span className="text-[10px] font-black text-slate-300 uppercase italic ml-1">Cái</span></p>
              </div>
            </div>
          </div>

          {/* Recalibration Inputs */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cân đối số lượng mới *</label>
                {newQuantity && (
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 ${quantityDiff >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Zap className="w-3 h-3" /> Chênh lệch: {quantityDiff >= 0 ? '+' : ''}{quantityDiff.toLocaleString()}
                  </div>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] font-[1000] text-3xl text-slate-900 focus:bg-white focus:border-indigo-400 transition-all outline-none shadow-inner"
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Lý do *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-900 focus:bg-white transition-all outline-none appearance-none"
                  required
                >
                  <option value="">-- Chọn lý do --</option>
                  <option value="Kiểm kê định kỳ">Kiểm kê định kỳ</option>
                  <option value="Hàng hỏng">Hàng hỏng</option>
                  <option value="Hàng thất lạc">Hàng thất lạc</option>
                  <option value="Điều chỉnh nhầm lẫn">Điều chỉnh nhầm</option>
                  <option value="Khuyến mại">Khuyến mại</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ghi chú xác thực</label>
                <div className="relative group/input">
                  <FileText className="absolute left-6 top-6 w-5 h-5 text-slate-300 group-focus-within/input:text-indigo-500 transition-colors" />
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] font-bold text-sm text-slate-900 focus:bg-white transition-all outline-none resize-none shadow-inner"
                    rows={1}
                    placeholder="Ghi chú nội bộ..."
                  />
                </div>
              </div>
            </div>
          </div>

          {adjustStockMutation.isError && (
            <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-xl shadow-rose-600/20">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <p className="text-lg font-black text-rose-900">Quá tải hệ thống</p>
                <p className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mt-0.5">Lỗi ghi số lẻ hoặc mất kết nối điểm kho.</p>
              </div>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <div className="relative sticky bottom-0 bg-slate-50 border-t border-slate-100 p-12 flex items-center justify-between z-20">
          <button
            type="button"
            onClick={handleClose}
            disabled={adjustStockMutation.isPending}
            className="px-10 py-5 text-sm font-black text-slate-400 uppercase tracking-[0.25em] hover:text-slate-900 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!newQuantity || !reason || adjustStockMutation.isPending}
            className="group px-14 py-6 bg-slate-950 hover:bg-black text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-[0_20px_50px_rgba(0,0,0,0.25)] active:scale-95 disabled:opacity-50 flex items-center gap-4 border-t border-slate-700"
          >
            {adjustStockMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> : (
              <>
                <Target className="w-6 h-6 text-indigo-400 group-hover:scale-125 transition-transform" />
                Lưu Hiệu chuẩn
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
