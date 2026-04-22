import { useNavigate } from 'react-router-dom';

const SessionExpirationModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOk = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Close modal and redirect to login
    onClose();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-xl border border-white/30 text-white">
        {/* Close Button */}
        <button
          className="absolute top-3 right-4 text-white text-lg font-bold hover:text-red-400"
          onClick={handleOk}
        >
          &times;
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Session Expired</h2>
          <p className="text-gray-100 mb-6">
            Your session has expired. Please log in again to continue.
          </p>

          {/* OK Button */}
          <button
            onClick={handleOk}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpirationModal;
