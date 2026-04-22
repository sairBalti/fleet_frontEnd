const Dropdown = ({ options, value = "", onChange, placeholder = "Select..." }) => {
    return (
        <div className="relative w-60">
            <select
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-10 px-4 py-2 pr-10 border rounded-md bg-white text-gray-700 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-200 "
            >
                <option className="text-gray-500 font-normal" value="">{placeholder}</option>

                {options.map((opt) => (
                    <option key={opt.id} value={opt.id} className="text-gray-700 font-normal">
                        {opt.name}
                    </option>
                ))}

            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </div>
    );
};

export default Dropdown;