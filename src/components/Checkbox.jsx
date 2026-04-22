
const Checkbox = ({checked, onChange}) => {
    return(
        <input
        type="checkbox"
        checked ={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text=blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
    );
};
export default Checkbox;