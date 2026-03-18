import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface QRScannerModalProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
    title?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
    onScan,
    onClose,
    title = 'Quét mã QR',
}) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Initialize scanner
        const scanner = new Html5QrcodeScanner(
            'qr-reader',
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                supportedScanTypes: [0], // 0 stands for CAMERA
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            },
      /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                // Stop scanner and callback
                scanner.clear().then(() => {
                    onScan(decodedText);
                }).catch(err => {
                    console.error("Failed to clear scanner", err);
                    onScan(decodedText);
                });
            },
            () => {
                // silent check errors
            }
        );

        scannerRef.current = scanner;

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error(err));
            }
        };
    }, [onScan]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Camera size={20} />
                        <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff'
                    }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '20px' }}>
                    <div id="qr-reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
                    <p style={{
                        textAlign: 'center',
                        marginTop: '16px',
                        fontSize: '13px',
                        color: '#64748b',
                        lineHeight: 1.5
                    }}>
                        Di chuyển camera đến gần mã QR để quét.<br />
                        Mã QR thường nằm trên tem thiết bị.
                    </p>
                </div>

                <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 30px',
                            borderRadius: '10px',
                            border: '1.5px solid #e2e8f0',
                            background: '#fff',
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#475569',
                            cursor: 'pointer'
                        }}
                    >
                        Đóng
                    </button>
                </div>
            </div>
            <style>{`
        #qr-reader {
          border: none !important;
        }
        #qr-reader img {
          display: none;
        }
        #qr-reader__dashboard_section_csr button {
          background: #6366f1 !important;
          color: white !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin-top: 10px !important;
        }
        #qr-reader__status_span {
            display: none !important;
        }
      `}</style>
        </div>
    );
};
