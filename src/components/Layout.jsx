import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./SideBar";

const Layout = () => {
  return (
    <div className="flex h-screen min-h-0 overflow-hidden">
      {/* Sidebar */}
      <div className="h-full shrink-0">
        <Sidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 p-3 sm:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;