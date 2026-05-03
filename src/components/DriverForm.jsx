import { useState, useEffect } from "react";
import CustomLoader from "./CustomLoader";
import { useLoader } from "../context/LoaderContext";

const DRIVER_STATUSES = ["Active", "On Leave", "Suspended", "Inactive"];

const DriverForm = ({
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
  const { loading } = useLoader();

  const [formData, setFormData] = useState({
    company_id: "",
    branch_id: "",
    driver_name: "",
    email: "",
    driver_status: "Active",
    total_driving_hours: "",
    total_mileage: "",
    efficiency_score: "",
    safety_score: "",
    completion_rate: "",
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
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
    const payload = {
      company_id: formData.company_id ? Number(formData.company_id) : "",
      branch_id: formData.branch_id ? Number(formData.branch_id) : "",
      driver_name: formData.driver_name,
      email: formData.email || null,
      driver_status: formData.driver_status,
      total_driving_hours: formData.total_driving_hours === "" ? 0 : Number(formData.total_driving_hours),
      total_mileage: formData.total_mileage === "" ? 0 : Number(formData.total_mileage),
      efficiency_score: formData.efficiency_score === "" ? 0 : Number(formData.efficiency_score),
      safety_score: formData.safety_score === "" ? 0 : Number(formData.safety_score),
      completion_rate: formData.completion_rate === "" ? 0 : Number(formData.completion_rate),
    };
    onSubmit(payload);
  };

  return (
    <div className="relative">
      {loading && <CustomLoader />}
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        {selectedBusinessType ? (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
            Business type: <span className="font-semibold">{selectedBusinessType}</span>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">
              Driver name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="driver_name"
              value={formData.driver_name}
              onChange={handleChange}
              className="w-full h-11 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full h-11 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="driver_status"
              value={formData.driver_status}
              onChange={handleChange}
              className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
              required
            >
              {DRIVER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Driving hours (total)</label>
            <input
              type="number"
              step="0.01"
              name="total_driving_hours"
              value={formData.total_driving_hours}
              onChange={handleChange}
              className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Mileage (total)</label>
            <input
              type="number"
              step="0.01"
              name="total_mileage"
              value={formData.total_mileage}
              onChange={handleChange}
              className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Efficiency score</label>
            <input
              type="number"
              step="0.01"
              name="efficiency_score"
              value={formData.efficiency_score}
              onChange={handleChange}
              className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Safety score</label>
            <input
              type="number"
              step="0.01"
              name="safety_score"
              value={formData.safety_score}
              onChange={handleChange}
              className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Completion rate</label>
            <input
              type="number"
              step="0.01"
              name="completion_rate"
              value={formData.completion_rate}
              onChange={handleChange}
              className="w-full h-11 text-sm p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-gray-700"
            />
          </div>
        </div>

        <div className="flex justify-start space-x-8 pt-8">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 w-[120px] bg-gray-300 border border-transparent rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 w-[120px] bg-blue-500 border border-transparent rounded hover:bg-blue-400 text-white"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
