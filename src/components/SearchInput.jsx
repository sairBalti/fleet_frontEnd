import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"; // or any variant you want

const SearchInput = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative w-[350px]">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-blue-500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-100 rounded pl-10 pr-3 py-2 text-sm text-blue-500 placeholder-blue-500 focus:outline-none focus:ring-1 focus:border-blue-300 w-full"
      />
    </div>
  );
};

export default SearchInput;
