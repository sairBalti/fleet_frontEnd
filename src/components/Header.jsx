
import { Link, useNavigate } from "react-router-dom";
import { getUserRole } from "../utils/auth";
import SearchInput from "./SearchInput";

const Header = () => {
  const navigate = useNavigate();
  const role = getUserRole();

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-neutral-100 bg-white p-3 text-neutral-600 sm:p-4">
      <div className="min-w-0 w-full sm:w-auto sm:max-w-md sm:flex-1">
        <SearchInput />
      </div>

      <nav className="flex flex-wrap items-center gap-3 text-sm">
        {role === "Manager" && (
          <Link to="/manager" className="text-indigo-600 hover:underline">
            Manager Panel
          </Link>
        )}
        {role === "Driver" && (
          <Link to="/driver" className="text-indigo-600 hover:underline">
            Driver Panel
          </Link>
        )}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="ml-auto shrink-0 rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
      >
        Logout
      </button>
    </header>
  );
};

export default Header;
