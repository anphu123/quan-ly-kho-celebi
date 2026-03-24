import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowLeft, Trash2, CheckCircle,
  CreditCard, Banknote, AlertCircle, ShoppingCart
} from 'lucide-react';
import { usePosStore } from '../../stores/pos.store';
import { posApi, type PosProduct } from '../../api/pos.api';
import { warehousesApi } from '../../lib/api/warehouses.api';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
};

export default function POSPage() {
  const navigate = useNavigate();
  const { cart, addItem, removeItem, updatePrice, clearCart, getTotal, paymentMethod, setPaymentMethod, notes, setNotes } = usePosStore();

  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<PosProduct[]>([]);
  const [searching, setSearching] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load warehouses on mount
  useEffect(() => {
    warehousesApi.getAll().then(res => {
      setWarehouses(res.data);
      if (res.data.length > 0) {
        setSelectedWarehouseId(res.data[0].id);
      }
    });
  }, []);

  // Search items automatically with debounce
  useEffect(() => {
    if (!selectedWarehouseId || !keyword || keyword.length < 2) {
      setSearchResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setSearching(true);
        const results = await posApi.searchItems(selectedWarehouseId, keyword);
        setSearchResults(results);
      } catch (err) {
        console.error('Lỗi khi tìm kiếm sản phẩm:', err);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [keyword, selectedWarehouseId]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        warehouseId: selectedWarehouseId,
        paymentMethod: paymentMethod,
        notes: notes,
        items: cart.map(item => ({
          serialItemId: item.id,
          unitPrice: item.unitPrice,
          discount: item.discount
        }))
      };

      await posApi.checkout(payload);

      setSuccess(true);
      clearCart();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden font-sans">

      {/* ─── Top Navbar ─── */}
      <header className="h-16 bg-slate-900 text-white flex items-center px-4 justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-xl">CELEBI</span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Point of Sale</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <select
            className="bg-slate-800 border-none text-sm text-white rounded-lg px-4 py-2 font-medium focus:ring-0"
            value={selectedWarehouseId}
            onChange={(e) => setSelectedWarehouseId(e.target.value)}
          >
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          <div className="w-px h-8 bg-slate-800 mx-2"></div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex justify-center items-center font-bold text-sm">
              AD
            </div>
            <div className="text-sm font-medium">Admin</div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFTPANEL: Product Search */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">

          {/* Search Box */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
            <input
              type="text"
              className="w-full h-14 pl-14 pr-4 rounded-2xl border-none shadow-sm text-lg focus:ring-2 focus:ring-indigo-500 font-medium bg-white"
              placeholder="Quét mã vạch (Serial/IMEI) hoặc tìm tên máy..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {searching ? (
              <div className="flex justify-center p-8 text-slate-400">Đang tìm kiếm...</div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {searchResults.map(product => {
                  const inCart = cart.some(item => item.id === product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => !inCart && addItem(product)}
                      className={`
                        bg-white p-4 rounded-2xl cursor-pointer transition-all border-2
                        ${inCart ? 'border-indigo-500 opacity-60' : 'border-transparent hover:border-indigo-200 hover:shadow-md'}
                      `}
                    >
                      <div className="text-xs font-bold text-indigo-500 mb-1">{product.productTemplate.brand?.name}</div>
                      <h4 className="font-bold text-slate-800 leading-tight mb-2 h-10 line-clamp-2">
                        {product.productTemplate.name}
                      </h4>

                      <div className="flex flex-col gap-1 mb-3">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded inline-flex w-fit max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                          {product.serialNumber || product.internalCode}
                        </span>
                      </div>

                      <div className="flex justify-between items-end mt-auto">
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                          {product.grade || 'Mới'}
                        </span>
                        <div className="text-lg font-extrabold text-emerald-600">
                          {formatCurrency(product.suggestedPrice)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : keyword.length >= 2 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p>Không tìm thấy máy khả dụng (Trạng thái AVAILABLE).</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400 h-full">
                <ShoppingCart size={48} className="mb-4 opacity-20" />
                <p>Nhập mã IMEI hoặc tên máy để thêm vào giỏ.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHTPANEL: Cart & Checkout */}
        <div className="w-[480px] bg-white border-l border-slate-200 flex flex-col shrink-0">

          {/* Cart Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <ShoppingCart size={24} className="text-indigo-500" />
              Giỏ hàng
              <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">{cart.length} máy</span>
            </h2>
            <button
              onClick={clearCart}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                  <ShoppingCart size={40} className="text-slate-300" />
                </div>
                Giỏ hàng trống
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors relative group">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>

                  <div className="font-bold text-slate-800 text-sm mb-1">{item.productTemplate.name}</div>
                  <div className="font-mono text-xs text-slate-500 mb-3 block">
                    {item.serialNumber || item.internalCode}
                  </div>

                  <div className="flex items-end justify-between gap-4 mt-2">
                    <div className="flex flex-col w-1/2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 mb-1">Giá chốt bán</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updatePrice(item.id, Number(e.target.value))}
                        className="font-bold text-lg border-b border-slate-200 focus:border-indigo-500 outline-none pb-1 bg-transparent w-full"
                      />
                    </div>
                    {/* Optional explicit discount input could go here, but omitted for simplicity as price can be edited directly */}
                    <div className="text-right pb-1">
                      <div className="font-extrabold text-emerald-600">
                        {formatCurrency(item.unitPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Settings */}
          <div className="p-4 border-t border-slate-100">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all font-bold text-sm ${paymentMethod === 'CASH' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <Banknote size={20} /> Tiền mặt
              </button>
              <button
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={`flex-1 py-3 px-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all font-bold text-sm ${paymentMethod === 'BANK_TRANSFER' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <CreditCard size={20} /> Chuyển khoản
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Ghi chú đơn hàng..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Checkout Footer */}
          <div className="p-6 bg-slate-900 text-white rounded-tl-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">

            {error && (
              <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/20 text-emerald-200 p-3 rounded-lg mb-4 text-sm flex items-center justify-center gap-2 font-bold animate-pulse">
                <CheckCircle size={18} /> THÀNH TOÁN THÀNH CÔNG!
              </div>
            )}

            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 font-medium">Khách cần trả</span>
              <span className="text-4xl font-black text-emerald-400 tracking-tight">
                {formatCurrency(getTotal())}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || submitting}
              className="w-full bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-800 disabled:text-slate-500 text-white h-16 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-colors uppercase tracking-widest"
            >
              {submitting ? 'Đang xử lý...' : 'Thanh toán'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
