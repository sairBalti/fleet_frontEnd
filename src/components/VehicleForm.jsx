import { useState, useEffect } from "react";
import CustomLoader from "./CustomLoader";
import { useLoader } from "../context/LoaderContext";

const VehicleForm = ({ initialData = {}, onSubmit, onCancel}) => {
  const {loading} = useLoader();

  const [formData, setFormData] = useState({
    registration: "",
    manufacturer: "",
    model: "",
    date_registered: "",
    maintenance_interval_months: "",
    fuel_type: "",
    status: "",
  });

  useEffect(() => {
    if (
      initialData &&
      JSON.stringify(initialData) !== JSON.stringify(formData)
    ) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="relative">
    { loading && <CustomLoader /> }
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      <div className="grid grid-cols-3 gap-6">
        {/* Registration */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Registration <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="registration"
            value={formData.registration}
            onChange={handleChange}
            className="w-full h-11 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
            required
          />
        </div>

        {/* Manufacturer */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Manufacturer <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleChange}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            required
          />
        </div>

        {/* Model */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Model <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            required
          />
        </div>

        {/* Date Registered */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Date Registered <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="date_registered"
            value={formData.date_registered}
            onChange={handleChange}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            required
          />
        </div>

        {/* Maintenance Interval */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Maintenance Interval (months) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="maintenance_interval_months"
            value={formData.maintenance_interval_months}
            onChange={handleChange}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            required
          />
        </div>

        {/* Fuel Type */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleChange}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            required
          />
        </div>

        {/* Status */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            required
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="flex justify-start space-x-8 pt-12">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 w-[120px]  bg-gray-300 border border-transparent rounded hover:bg-gray-200 hover:border-white hover:border-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled= {loading}
          className="px-4 py-2  w-[120px] bg-blue-500 border border-transparent rounded hover:bg-blue-300 text-white hover:border-white hover:border-2"
        >
          Submit
        </button>
      </div>
    </form>

    </div>
    
  );
};

export default VehicleForm;