import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Wallet, Receipt, Package, User, Loader2, Sparkles, ChevronRight, Zap, Target, Layers } from 'lucide-react';
import { productsApi, type Product } from '../../lib/api/products.api';
import { ordersApi, type CreateOrderDto } from '../../lib/api/orders.api';
import { customersApi, type Customer, type CustomersResponse } from '../../lib/api/customers.api';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD'>('CASH');

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: () => productsApi.getAll({ limit: 50, search: searchTerm }),
  });

  const { data: customersResponse } = useQuery<CustomersResponse>({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll({ limit: 100 }),
  });

  const customers = customersResponse?.data || [];

  const createOrderMutation = useMutation({
    mutationFn: (dto: CreateOrderDto) => ordersApi.create(dto),
    onSuccess: () => {
      setCart([]);
      setSelectedCustomerId('');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      alert('Đơn hàng đã được khởi tạo thành công trên hệ thống!');
    },
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.product.sellingPrice) * item.quantity), 0);
  const total = subtotal; // Can add discount logic later

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const checkoutData: CreateOrderDto = {
      customerId: selectedCustomerId || undefined,
      items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity, price: Number(item.product.sellingPrice) })),
      paymentMethod,
      totalAmount: total,
    };
    createOrderMutation.mutate(checkoutData);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in overflow-hidden px-4 lg:px-0">

      {/* Left Column: Product Catalog Catalysts */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">

        {/* Sleek Search Header */}
        <div className="card bg-slate-900 border-none relative overflow-hidden shrink-0 group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="card-body p-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 group/input">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Quét mã vạch hoặc nhập tên SKU sản phẩm..."
                  className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button className="w-14 h-14 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all flex items-center justify-center border border-slate-700 shadow-xl">
                  <Target className="w-6 h-6" />
                </button>
                <button className="w-14 h-14 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all flex items-center justify-center border border-slate-700 shadow-xl">
                  <Layers className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid - Industrial Style */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-dark pr-2">
          {isLoadingProducts ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Initializing Terminal UI</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productsData?.data.map((product) => {
                const inCart = cart.find(item => item.product.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="group relative flex flex-col items-start p-4 bg-white border border-slate-200 rounded-[2rem] hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 text-left overflow-hidden active:scale-[0.98]"
                  >
                    {inCart && (
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-[1000] shadow-lg animate-scale-in">
                        {inCart.quantity}
                      </div>
                    )}

                    <div className="w-full aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                      <Package className="w-12 h-12 text-slate-200 group-hover:text-indigo-200 transition-colors" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{product.category?.name}</p>
                      <h3 className="font-extrabold text-slate-900 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{product.sku}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-between">
                      <div className="font-[1000] text-lg text-slate-900 tracking-tighter">
                        {formatPrice(Number(product.sellingPrice))}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                        <Plus className="w-4 h-4" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Checkout Sidebar (Glassmorphism Dark) */}
      <div className="w-full lg:w-[420px] shrink-0 flex flex-col card bg-slate-900 border-none shadow-[0_20px_100px_rgba(0,0,0,0.5)] relative overflow-hidden">

        {/* Animated Background Elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Cart Header */}
          <div className="p-6 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-tight">Giỏ hàng Hiện tại</h2>
                <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-slate-500 mt-0.5">
                  <Zap className="w-3 h-3 text-amber-400" /> Terminal ID: 001
                </div>
              </div>
            </div>
            <button
              onClick={() => setCart([])}
              className="text-[10px] font-black uppercase text-slate-500 hover:text-rose-400 transition-colors tracking-widest"
              disabled={cart.length === 0}
            >
              Làm rỗng
            </button>
          </div>

          {/* Customer Selection */}
          <div className="p-4 bg-slate-950/30 border-b border-slate-800/50">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
              <select
                className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[13px] font-bold text-slate-300 outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">Khách vãng lai (Guest)</option>
                {customers.map((c: Customer) => (
                  <option key={c.id} value={c.id}>{c.fullName} - {c.phone}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar-dark p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-slate-700" />
                </div>
                <div>
                  <p className="text-slate-300 font-black text-lg">Giỏ hàng trống</p>
                  <p className="text-slate-500 text-[13px] font-medium mt-1">Chọn sản phẩm từ danh mục để bắt đầu thanh toán</p>
                </div>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="group relative flex items-center gap-4 p-3.5 bg-slate-950/40 rounded-2xl border border-slate-800/50 hover:border-slate-700/50 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-600 shrink-0">
                    <Package className="w-6 h-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-extrabold text-white truncate leading-tight">{item.product.name}</h4>
                    <p className="text-[11px] font-bold text-indigo-400 mt-0.5">{formatPrice(Number(item.product.sellingPrice))}</p>

                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-7">
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2.5 hover:bg-slate-800 text-slate-500 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-[12px] font-black text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2.5 hover:bg-slate-800 text-slate-500 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.product.id)} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout Summary */}
          <div className="p-6 bg-slate-950/80 backdrop-blur-2xl border-t border-slate-800 space-y-6">

            <div className="space-y-3">
              <div className="flex justify-between items-center text-slate-500 font-bold text-sm tracking-tight">
                <span className="uppercase text-[10px] tracking-widest">Tạm tính:</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.2em] mb-1">Tổng cộng hóa đơn</span>
                  <span className="text-3xl font-[1000] text-white tracking-tighter">{formatPrice(total)}</span>
                </div>
                <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest pb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Thuế 0%
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CASH' as const, icon: Wallet, label: 'Tiền mặt' },
                { id: 'BANK_TRANSFER' as const, icon: CreditCard, label: 'Chuyển khoản' },
                { id: 'CARD' as const, icon: Receipt, label: 'Thẻ ATM' },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${paymentMethod === method.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none">{method.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || createOrderMutation.isPending}
              className="relative w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50 group flex items-center justify-center overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              {createOrderMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <CreditCard className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                  Xử lý thanh toán
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
