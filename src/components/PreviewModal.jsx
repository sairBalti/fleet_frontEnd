import { useState } from "react";

const PreviewModal = ({ data, onClose, onSave, errors = {} }) => {

    const [form, setForm] = useState(data);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">

            <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
                {errors?.general && (
                    <p className="text-red-500 text-sm mb-2">
                        {errors.general}
                    </p>
                )}

                <h2 className="text-lg font-semibold mb-4">
                    AI Preview
                </h2>

                {/* Company Name */}
                <div className="mb-3">
                    <label className="text-sm">Company Name</label>
                    <input
                        name="company_name"
                        value={form.company_name}
                        onChange={handleChange}
                        className={`border p-2 rounded w-full ${errors.company_name ? "border-red-400" : ""
                            }`}
                    />
                    {/*  ERROR MESSAGE */}
                    {errors.company_name && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.company_name}
                        </p>
                    )}

                </div>

                {/* Business Type */}
                <div className="mb-3">
                    <label className="text-sm">Business Type</label>
                    <input
                        name="business_type"
                        value={form.business_type}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {/* Number of Branches */}
                <div className="mb-3">
                    <label className="text-sm">Number of Branches</label>
                    <input
                        type="number"
                        name="number_of_branches"
                        value={form.number_of_branches}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {/* Total Admins */}
                <div className="mb-3">
                    <label className="text-sm">Total Admins</label>
                    <input
                        type="number"
                        name="total_admins"
                        value={form.total_admins}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => onSave(form)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PreviewModal;