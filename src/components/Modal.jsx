
const Modal = ({isOpen,  onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl shadow-xl border border-white/30 text-white">
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-white text-lg font-bold hover:text-red-400"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Modal Content */}
        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;