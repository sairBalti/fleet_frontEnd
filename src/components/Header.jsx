
import { useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import SearchInput from "./SearchInput";

const Header = () => {
  const navigate = useNavigate();
  const role =  getUserRole();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="flex justify-between p-4 bg-white-600text-neutral-500">
      <SearchInput />
      
      <nav>
        {role === "Manager" && <a href="/manager" className="mr-4">Manager Panel</a>}
        {role === "Driver" && <a href="/driver" className="mr-4">Driver Panel</a>}
      </nav>

      <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded-md">
        Logout
      </button>
    </header>
  );
};

export default Header;