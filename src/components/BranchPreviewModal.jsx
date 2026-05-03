import { useState } from "react";

const BranchPreviewModal = ({ data, onClose, onSave, errors = {} }) => {
  const [form, setForm] = useState(data);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-[420px] shadow-lg">
        {errors?.general && <p className="text-red-500 text-sm mb-2">{errors.general}</p>}
        <h2 className="text-lg font-semibold mb-4">Branch AI Preview</h2>

        <div className="mb-3">
          <label className="text-sm">Branch Name</label>
          <input
            name="branch_name"
            value={form.branch_name || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-3">
          <label className="text-sm">Branch Location</label>
          <input
            name="branch_location"
            value={form.branch_location || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-3">
          <label className="text-sm">Company ID</label>
          <input
            name="company_id"
            value={form.company_id || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-indigo-600 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchPreviewModal;
