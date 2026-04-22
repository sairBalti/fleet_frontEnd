import { HiSelector, HiSortAscending, HiSortDescending } from "react-icons/hi"

const SortIcons = ({active, direction}) =>{
    if (!active) return < HiSelector className="w-4 h-4 text-gray-400" />;
    return direction === "asc" ? (
        <HiSortAscending className="w-4 h-4 text-blue-500" />
    ) : (
        <HiSortDescending className="w-4 h-4 text-blue-500" />
    );

};
export default SortIcons;