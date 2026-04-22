const StatusFilter = ({ value, onChange }) => {
  // Determine dynamic ring and text color
  const getFocusRingColor = () => {
    if (value === "Active") return "focus:ring-green-100";
    if (value === "Unavailable") return "focus:ring-red-100";
    if (value === "Maintenance") return "focus:ring-yellow-100";
    return "text-gray-500"; // Default style
  };

  return (
    <select
      value={value}
      id="SelectStatus"
      onChange={(e) => onChange(e.target.value)}
      className={`border px-3 py-2 rounded-md focus:outline-none focus:ring-1 text-sm h-10 w-60 bg-white ${getFocusRingColor()}`}
    >
      <option disabled value="">Select Status</option>
      <option value="All">All</option>
      <option value="Active">Active</option>
      <option value="Unavailable">Unavailable</option>
      <option value="Maintenance">Maintenance</option>
    </select>
  );
};

export default StatusFilter;
