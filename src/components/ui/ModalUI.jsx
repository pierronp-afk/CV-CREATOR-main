import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Reusable Modal UI for confirmations, alerts, and notices.
 */
const ModalUI = ({ 
  title, 
  children, 
  onClose, 
  onConfirm, 
  confirmText = "Confirmer", 
  icon = <AlertCircle size={32} />, 
  danger = true 
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 text-left">
      <div className="p-6 text-left">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#3b72ff]'}`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">{String(title)}</h3>
        <div className="text-sm text-slate-500 mb-8 text-left">{children}</div>
        <div className="flex gap-3">
          {onClose && (
            <button 
              onClick={onClose} 
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold transition-colors"
            >
              Annuler
            </button>
          )}
          <button 
            onClick={onConfirm} 
            className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition-colors ${danger ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-[#3b72ff] hover:bg-[#ff8054] shadow-blue-200'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default ModalUI;
