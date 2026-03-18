import { useState, useRef } from 'react';
import { Printer, Settings, QrCode } from 'lucide-react';
import { ProductLabel } from '../../components/inventory/ProductLabel';

export default function LabelPrinterPage() {
  const [sku, setSku] = useState('SKU-123456');
  const [productName, setProductName] = useState('Sản phẩm Test Celebi');
  const [price, setPrice] = useState('250.000 ₫');
  const [barcodeType, setBarcodeType] = useState<'1D' | '2D'>('1D');
  
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full p-4 lg:p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <QrCode className="w-5 h-5 lg:w-6 lg:h-6" /> In tem nhãn (1/4 A7 - 52.5x37mm)
        </h1>
        <button 
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Printer className="w-5 h-5" /> In tem ngay
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full relative">
        {/* Form cấu hình */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 text-gray-700">
            <Settings className="w-5 h-5" /> Cấu hình thông tin
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm</label>
            <input 
              type="text" 
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="VD: Áo thun nam"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mã SKU / Barcode</label>
            <input 
              type="text" 
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Nhập mã SKU ngắn gọn"
              maxLength={15}
            />
            <p className="text-xs text-gray-500 mt-1">* Mã 1D nên dưới 15 ký tự để quét tốt nhất</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán / Thông tin phụ</label>
            <input 
              type="text" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="VD: 250.000đ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại mã vạch</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="barcodeType" 
                  value="1D" 
                  checked={barcodeType === '1D'}
                  onChange={(e) => setBarcodeType(e.target.value as '1D' | '2D')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Mã vạch 1D (Code 128)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="barcodeType" 
                  value="2D" 
                  checked={barcodeType === '2D'}
                  onChange={(e) => setBarcodeType(e.target.value as '1D' | '2D')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Mã QR Code (2D)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Preview & Area for Printing */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
          <h2 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Bản xem trước tính bằng thẻ thật</h2>
          
          <div ref={printRef}>
            <ProductLabel 
              name={productName} 
              imei={sku} 
              barcodeType={barcodeType} 
              price={price} 
            />
          </div>

          <p className="text-xs text-gray-400 mt-6 text-center max-w-[250px] leading-relaxed">
            Khung hiển thị tương đương kích thước thật <strong>52.5 x 37 mm</strong>.<br/>
            Nhấn (Ctrl+P) để in.
          </p>
        </div>
      </div>
    </div>
  );
}
