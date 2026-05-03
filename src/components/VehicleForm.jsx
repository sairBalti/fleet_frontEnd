import { useState, useEffect } from "react";
import CustomLoader from "./CustomLoader";
import { useLoader } from "../context/LoaderContext";

const featureHintsByBusinessType = {
  Logistics: ["Prioritize maintenance interval tracking", "Fuel optimization is critical"],
  Transportation: ["Focus on route availability", "Monitor active status consistency"],
  "Delivery Services": ["Frequent status updates required", "Compact vehicle assignment"],
  Construction: ["Heavy-duty manufacturer/model focus", "Longer maintenance windows"],
  "Maintenance Services": ["Service vehicle availability checks", "Technician routing support"],
  "Rental Services": ["Utilization and status turnover", "Registration lifecycle monitoring"],
  "Public Transport": ["High uptime requirements", "Strict maintenance compliance"],
};

const VehicleForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  companyOptions = [],
  branchOptions = [],
  companyDisabled = false,
  branchDisabled = false,
  selectedBusinessType = "",
  onCompanyChange,
}) => {
  const {loading} = useLoader();

  const [formData, setFormData] = useState({
    company_id: "",
    branch_id: "",
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
    if (name === "company_id") {
      onCompanyChange?.(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="relative">
    { loading && <CustomLoader /> }
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      {selectedBusinessType && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          <p className="font-semibold">{selectedBusinessType} feature guidance</p>
          <ul className="mt-1 list-disc pl-5">
            {(featureHintsByBusinessType[selectedBusinessType] || []).map((hint) => (
              <li key={hint}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        {/* Company */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Business <span className="text-red-500">*</span>
          </label>
          <select
            name="company_id"
            value={formData.company_id}
            onChange={handleChange}
            disabled={companyDisabled}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700 disabled:bg-gray-100"
            required
          >
            <option value="">Select Business</option>
            {companyOptions.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Branch */}
        <div className="flex flex-col space-y-2">
          <label className="font-medium text-gray-700">
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            disabled={branchDisabled}
            className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700 disabled:bg-gray-100"
            required
          >
            <option value="">Select Branch</option>
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

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