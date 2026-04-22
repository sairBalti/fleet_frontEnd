import { useState, useEffect } from "react";
import CustomLoader from "./CustomLoader";
import { useLoader } from "../context/LoaderContext";
import { FaStar } from "react-icons/fa";

const categories = ["Exterior","Mirrors","Tires","Engine", "Lights","Interior","Engine","Safety Equip","Fluid Leaks"];

const InspectionForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const { loading } = useLoader();

  const [formData, setFormData] = useState({
    vehicle_id: "",
    inspector_name: "",
    inspection_date: "",
    overall_score: "",
    result: "",
    ratings: {},
    notes: "",
    action_taken: "",
    documents: null,
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
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };
  const handleRatingChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: value,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="relative">
      {loading && <CustomLoader />}
      <form onSubmit={handleSubmit} className="space-y-6 mt-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Vehicle ID */}
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">
              Vehicle ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className="w-full h-11 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
              required
            />
          </div>

          {/* Inspector Name */}
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">
              Inspector Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="inspector_name"
              value={formData.inspector_name}
              onChange={handleChange}
              className="w-full h-11 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
              required
            />
          </div>

          {/* Inspection Date */}
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">
              Inspection Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="inspection_date"
              value={formData.inspection_date}
              onChange={handleChange}
              className="w-full h-11 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
              required
            />
          </div>

          {/* Overall Score */}
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">
              Overall Score (1–5) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="overall_score"
              value={formData.overall_score}
              onChange={handleChange}
              min="1"
              max="5"
              className="w-full h-11 p-2 border rounded focuse:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
              required
            />
          </div>

          {/* Result */}
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">
              Result <span className="text-red-500">*</span>
            </label>
            <select
              name="result"
              value={formData.result}
              onChange={handleChange}
              className="w-full h-11 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
              required
            >
              <option value="">Select Result</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Notes */}
          <div className="flex flex-col space-y-2 col-span-3">
            <label className="font-medium text-gray-700">
              Notes / Comments
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full h-24 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
            />
          </div>

          {/* Action Taken */}
          <div className="flex flex-col space-y-2 col-span-3">
            <label className="font-medium text-gray-700">Action Taken</label>
            <textarea
              name="action_taken"
              value={formData.action_taken}
              onChange={handleChange}
              className="w-full h-24 p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
            />
          </div>

          {/* Documents */}
          <div className="flex flex-col space-y-2 col-span-3">
            <label className="font-medium text-gray-700">Upload Documents</label>
            <input
              type="file"
              name="documents"
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-200 text-sm text-gray-700"
            />
          </div>
          {/* Ratings Section */}
          <div className="flex flex-col space-y-2 col-span-3">
            <label className="font-medium text-gray-700">
              Ratings <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div key={cat} className="flex flex-col">
                  <span className="text-sm text-gray-600 mb-1">{cat}</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        size={20}
                        className={`cursor-pointer ${
                          (formData.ratings[cat] || 0) >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleRatingChange(cat, star)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
         
        </div>

        {/* Buttons */}
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
            disabled={loading}
            className="px-4 py-2  w-[120px] bg-blue-500 border border-transparent rounded hover:bg-blue-300 text-white hover:border-white hover:border-2"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default InspectionForm;
