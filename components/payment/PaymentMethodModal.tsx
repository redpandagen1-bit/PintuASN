'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import {
  PAYMENT_METHODS,
  METHOD_GROUPS,
  METHOD_LOGOS,
  formatRupiah,
  type PaymentMethod,
} from '@/constants/payment';

interface Props {
  selected: PaymentMethod | null;
  onSelect: (m: PaymentMethod) => void;
  onClose: () => void;
}

export default function PaymentMethodModal({ selected, onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-slate-900 text-base">Pilih Metode Pembayaran</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition"
          >
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Groups */}
        <div className="p-4 space-y-5 pb-8">
          {METHOD_GROUPS.map((group) => {
            const methods = PAYMENT_METHODS.filter(m => m.group === group);
            if (!methods.length) return null;
            return (
              <div key={group}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 px-1">{group}</p>
                <div className="space-y-2">
                  {methods.map((method) => {
                    const logo = METHOD_LOGOS[method.id];
                    const isSelected = selected?.id === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => { onSelect(method); onClose(); }}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left
                          ${isSelected
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                        `}
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-white border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                          {logo ? (
                            <Image src={logo} alt={method.name} width={36} height={36} className="object-contain p-1" unoptimized />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-600">{method.name.slice(0, 3).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{method.name}</p>
                          {method.adminFee > 0
                            ? <p className="text-xs text-slate-400">+{formatRupiah(method.adminFee)} biaya admin</p>
                            : <p className="text-xs text-emerald-500">Gratis biaya admin</p>
                          }
                        </div>
                        {/* Radio */}
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                          ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
