import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Smartphone, Upload, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { buildUpiPayUri } from '../lib/orderServices';
import { adminStore } from '../lib/adminStore';

interface UpiPaymentViewProps {
  upiId: string;
  payeeName: string;
  amount: number;
  orderId: string;
  utr: string;
  setUtr: (val: string) => void;
  receiptUrl: string;
  setReceiptUrl: (val: string) => void;
}

export const UpiPaymentView: React.FC<UpiPaymentViewProps> = ({
  upiId,
  payeeName,
  amount,
  orderId,
  utr,
  setUtr,
  receiptUrl,
  setReceiptUrl,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cleanUpiId = (upiId || 'cakehouse.erattupetta@oksbi').trim();
  const cleanPayee = (payeeName || 'Cake House Erattupetta').trim();
  const upiUri = buildUpiPayUri({
    upiId: cleanUpiId,
    payeeName: cleanPayee,
    amount,
    orderId,
  });

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(upiUri, {
      margin: 1,
      width: 240,
      color: {
        dark: '#141210',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(err => {
        console.error('Failed to generate UPI QR code', err);
      });

    return () => {
      isMounted = false;
    };
  }, [upiUri]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(cleanUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingReceipt(true);
      setUploadError('');
      const dataUrl = await adminStore.uploadLocalImage(file);
      setReceiptUrl(dataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload receipt screenshot');
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-[#141210] border border-[#2d2722] rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#241e1a]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#d4af37]/10 rounded-lg text-[#d4af37]">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs text-[#f5f5f4]">
              Instant UPI Transfer &amp; QR
            </div>
            <div className="text-[10px] text-[#a8a29e]">
              GPay · PhonePe · Paytm · BHIM · Any Banking App
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
          Zero Convenience Fee
        </span>
      </div>

      {/* Main UPI Body: QR Code and App Button */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Left: Scannable QR Code */}
        <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner text-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan to pay via UPI"
              className="w-44 h-44 object-contain rounded-lg"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-stone-500">
              Generating dynamic QR...
            </div>
          )}
          <span className="text-[11px] font-bold text-stone-800 mt-1">
            Scan with any UPI App
          </span>
          <span className="text-[10px] text-stone-500">
            Pay exact ₹{amount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Right: Direct Pay & Account Details */}
        <div className="space-y-3">
          {/* Mobile Direct Pay Button */}
          <a
            href={upiUri}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#d4af37] to-[#e2be53] hover:from-[#e2be53] hover:to-[#eed06e] text-[#12100e] text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            <span>Pay ₹{amount.toLocaleString('en-IN')} via UPI App</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
          </a>

          <div className="text-[11px] text-[#78716c] text-center">
            Tap button if on mobile phone, or scan QR code from another device.
          </div>

          {/* Copyable Details */}
          <div className="space-y-2 pt-1 text-xs">
            <div className="p-2.5 bg-[#1a1714] border border-[#2d2722] rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#78716c]">Store UPI ID</div>
                <div className="font-mono font-semibold text-[#f5f5f4]">{cleanUpiId}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#d4af37] bg-[#221e1a] hover:bg-[#2b2520] border border-[#332d28] rounded-lg transition-colors"
              >
                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-2.5 bg-[#1a1714] border border-[#2d2722] rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[10px] text-[#78716c]">Payee Name &amp; Exact Total</div>
                <div className="font-semibold text-[#f5f5f4]">
                  {cleanPayee} · <span className="text-[#d4af37] font-mono">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyAmount}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#a8a29e] hover:text-[#f5f5f4] bg-[#221e1a] hover:bg-[#2b2520] border border-[#332d28] rounded-lg transition-colors"
              >
                {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAmount ? 'Copied' : 'Copy ₹'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Verification Step: UTR / Reference ID & Screenshot */}
      <div className="pt-3 border-t border-[#241e19] space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#f5f5f4]">
          <span className="w-5 h-5 rounded-full bg-[#d4af37] text-[#12100e] text-[11px] flex items-center justify-center font-bold">
            ✓
          </span>
          <span>Verification Step: Enter 12-Digit UTR / Transaction ID</span>
        </div>

        <div>
          <input
            type="text"
            placeholder="e.g. 427819283741 or Bank Ref / Transaction ID *"
            value={utr}
            maxLength={32}
            onChange={e => setUtr(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#1a1714] border border-[#2d2722] focus:border-[#d4af37] rounded-xl text-xs font-mono text-[#f5f5f4] placeholder-[#78716c] focus:outline-none"
          />
          <div className="flex items-center gap-1 text-[10px] text-[#a8a29e] mt-1.5">
            <Info className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
            <span>
              Found in your GPay / PhonePe / Paytm receipt under "UPI Transaction ID" or "UTR".
            </span>
          </div>
        </div>

        {/* Optional Screenshot upload */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-[#a8a29e] mb-1.5">
            <span>Payment Screenshot / Receipt (Optional, speeds up confirmation)</span>
            {receiptUrl && (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10px]">
                <CheckCircle2 className="w-3 h-3" /> Attached
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleReceiptUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingReceipt}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1a1714] hover:bg-[#25201b] border border-[#2d2722] rounded-xl text-xs text-[#f5f5f4] transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isUploadingReceipt ? 'Uploading screenshot...' : receiptUrl ? 'Change Receipt Photo' : 'Upload Payment Screenshot'}</span>
            </button>

            {receiptUrl && (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#332d28] bg-black">
                <img src={receiptUrl} alt="Receipt preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {uploadError && (
            <div className="text-red-400 text-[10px] mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
