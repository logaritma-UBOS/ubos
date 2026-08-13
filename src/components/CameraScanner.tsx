'use client';

import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface CameraScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onScan, onClose }: CameraScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // We create the scanner instance when the component mounts
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 }, 
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA] 
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Automatically stop scanning after a successful scan
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onScan(decodedText);
      },
      (error) => {
        // Ignore background scanning errors which trigger for every frame
      }
    );

    // Cleanup when the component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner. ", error);
        });
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-4 w-full max-w-sm flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Camera size={16} />
            </div>
            <h3 className="font-bold text-slate-800">Scan Barcode / SKU</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scanner Container */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-square flex items-center justify-center mb-2">
          <div id="reader" className="w-full h-full [&_video]:object-cover [&_video]:w-full [&_video]:h-full border-none"></div>
        </div>

        <p className="text-center text-xs font-medium text-slate-500 mt-2 relative z-10">
          Arahkan kamera HP ke barcode pada kemasan produk Anda.
        </p>

        {/* Global CSS overrides for the html5-qrcode injected elements */}
        <style dangerouslySetInnerHTML={{__html: `
          #reader {
            border: none !important;
          }
          #reader__dashboard_section_csr span button {
            background-color: var(--primary) !important;
            color: white !important;
            border: none !important;
            padding: 8px 16px !important;
            border-radius: 8px !important;
            font-weight: bold !important;
            margin-top: 10px !important;
            cursor: pointer !important;
          }
          #reader__dashboard_section_swaplink {
            color: var(--primary) !important;
            text-decoration: underline !important;
            margin-top: 10px !important;
          }
          #reader img {
            display: none !important; 
          }
        `}} />
      </div>
    </div>
  );
}
