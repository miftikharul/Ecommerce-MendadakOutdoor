'use client';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-medium text-white ${
        type === 'success' ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200' : 'bg-red-950/90 border-red-700 text-red-200'
      }`}>
        <span>{type === 'success' ? '✅' : '⚠️'}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}