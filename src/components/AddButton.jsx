const AddButton = ({ label = "Add", onClick }) => {
  return (
    <button
      onClick={onClick}
      id="AddButton"
      className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 min-w-[120px] h-10 flex items-center justify-center"
    >
      <span className="font-semibold">{label}</span>
    </button>
  );
};

export default AddButton;