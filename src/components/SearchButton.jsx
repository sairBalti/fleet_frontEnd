
const SearchButton = ({onclick}) => {
    return(
        <button
            onClick={onclick}
            id="tableSearch"
            className="bg-blue-500 text-white px-4 rounded hover:bg-blue-600 min-w-[120px] h-10 flex items-center justify-center"
        >
            <span className="font-semibold">Search</span>

        </button>
        
        
    );
};
export default SearchButton;