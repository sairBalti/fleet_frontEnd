import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const SearchInput = ({ value, onChange, placeholder = "Search" }) => {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState("");
  const displayValue = isControlled ? value : internal;

  const handleChange = (next) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className="relative w-full max-w-full sm:max-w-sm md:max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-blue-500" />
      </div>
      <input
        type="text"
        value={displayValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded bg-gray-100 py-2 pl-10 pr-3 text-sm text-blue-500 placeholder-blue-500 focus:border-blue-300 focus:outline-none focus:ring-1"
      />
    </div>
  );
};

export default SearchInput;
