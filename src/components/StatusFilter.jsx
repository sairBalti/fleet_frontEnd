const StatusFilter = ({ value, onChange }) => {
  // Determine dynamic ring and text color
  const getFocusRingColor = () => {
    if (value === "Active") return "focus:ring-green-100";
    if (value === "Unavailable") return "focus:ring-red-100";
    if (value === "Maintenance") return "focus:ring-yellow-100";
    return "focus:ring-gray-200";
  };

  return (
    <select
      value={value ?? "All"}
      id="SelectStatus"
      onChange={(e) => onChange(e.target.value)}
      className={`h-10 w-full min-w-0 max-w-full rounded-md border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 sm:w-60 ${getFocusRingColor()}`}
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
