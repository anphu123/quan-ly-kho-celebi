import React from 'react';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';

interface ProductLabelProps {
    name: string;
    ram?: string;
    rom?: string;
    imei: string;
    qrValue?: string;
    barcodeType?: '1D' | '2D';
    price?: string;
}

export const ProductLabel: React.FC<ProductLabelProps> = ({
    name,
    ram,
    rom,
    imei,
    qrValue,
    barcodeType = '1D',
    price
}) => {
    // Generate spec string if RAM/ROM exists
    const specString = [ram, rom].filter(Boolean).join(' / ');
    const displayName = specString ? `${name} (${specString})` : name;
    
    // Value for Barcode/QR
    const codeValue = qrValue || imei;

    return (
        <div 
            className="print-only-zone bg-white flex flex-col justify-between items-center box-border overflow-hidden"
            style={{ 
                width: '52.5mm', 
                height: '37mm', 
                padding: '2mm',
            }}
        >
            <div className="w-full h-full flex flex-col justify-between items-center">
                {/* Tên sản phẩm */}
                <div 
                    className="text-center font-bold text-black" 
                    style={{ 
                        fontSize: '10px', 
                        lineHeight: '1.2', 
                        width: '100%', 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                    }}
                >
                    {displayName || 'Tên sản phẩm'}
                </div>

                {/* Mã Vạch / QR */}
                <div 
                    className="flex-1 flex flex-col items-center justify-center w-full my-auto" 
                    style={{ minHeight: 0 }}
                >
                    {barcodeType === '1D' ? (
                        <Barcode 
                            value={codeValue || 'SKU'} 
                            format="CODE128" 
                            displayValue={false} 
                            height={35} 
                            width={1.2} 
                            margin={0}
                            background="transparent"
                        />
                    ) : (
                        <QRCodeSVG 
                            value={codeValue || 'SKU'} 
                            size={60}
                            level="M"
                        />
                    )}
                </div>

                {/* SKU and Price */}
                <div className="w-full flex justify-between items-end mt-auto px-1">
                    <span className="text-black font-semibold" style={{ fontSize: '9px' }}>{imei}</span>
                    <span className="text-black font-bold" style={{ fontSize: '10px' }}>{price || ''}</span>
                </div>
            </div>
        </div>
    );
};
