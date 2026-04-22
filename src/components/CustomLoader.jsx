
import "../style/Loader.css";

const CustomLoader = () => {
  return (
    <div className="fixed inset-0 bg-gray-50 backdrop-blur-sm z-50 flex items-center justify-center">
      <img
        src="" // from public folder
        alt="Loading..."
        className="w-24 h-24 animate-spin-custom"
      />
    </div>
  );
};

export default CustomLoader;