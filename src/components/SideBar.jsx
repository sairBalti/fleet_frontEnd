import { useState, useEffect } from "react";
import { getUserData } from "../utils/auth";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, FaTruck, FaChartBar, FaUser, FaCogs, FaTools, 
  FaRoute, FaComments, FaQuestionCircle, FaBuilding
} from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

const Sidebar = () => {
  const location = useLocation();
  const [openModule, setOpenModule] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubmodule, setSelectedSubmodule] = useState(null);

  const userData = getUserData();
  const userRole = userData?.role;

  // Update active item when location changes
  useEffect(() => {
    // Keep selected states for styling, don't reset on route change
  }, [location]);

  // Sidebar menu data
  const menuItems = [
    {
      title: "Dashboard",
      icon: <FaTachometerAlt />,
      submodules: [
        { name: "KPIs", path: "/dashboard/kpis" },
        { name: "Real Time Statistics", path: "/dashboard/realtime" },
      ],
    },
    {
      title: "Businesses",
      icon: <FaBuilding />,
      submodules: userRole === "BranchManager"
        ?[
            { name: "OnBoards", path: "/branches" }
        ]

      :[
        { name: "OnBoards", path: "/businesses/live" },
        { name: "Targets",  path: "/businesses/targets" } ,
      ]
    },
    {
      title: "Fleet",
      icon: <FaTruck />,
      submodules: [
        { name: "Vehicle List", path: "/fleet/vehicles" },
        { name: "Fleet Overview", path: "/fleet/overview" },
        { name: "Fleet Inspection", path: "/fleet/inspection" },
        { name: "Fleet Assignment", path: "/fleet/assignment" },
      ],
    },
    {
      title: "Reports",
      icon: <FaChartBar />,
      submodules: [
        { name: "Monthly Reports", path: "/reports/monthly" },
        { name: "Annual Reports", path: "/reports/annual" },
      ],
    },
    {
      title: "Driver",
      icon: <FaUser />,
      submodules: [
        { name: "Driver Overview", path: "/driver/overview" },
        { name: "Driver Schedule", path: "/driver/schedule" },
        { name: "Driver Performance", path: "/driver/performance" },
      ],
    },
    { title: "Maintenance", icon: <FaTools />, path: "/maintenance" },
    { title: "Trips", icon: <FaRoute />, path: "/trips" },
    { title: "Chat", icon: <FaComments />, path: "/chat" },
    {
      title: "Settings",
      icon: <FaCogs />,
      submodules: [
        { name: "Account Settings", path: "/settings/account" },
        { name: "User Management", path: "/settings/users" },
        { name: "System Preferences", path: "/settings/preferences" },
      ],
    },
    { title: "Help Desk", icon: <FaQuestionCircle />, path: "/helpdesk" },
  ];

  // Toggle Submodule Visibility
  const toggleSubmenu = (index) => {
    setOpenModule(openModule === index ? null : index);
    setSelectedModule(index);
    setSelectedSubmodule(null);
  };

  const handleModuleClick = (index) => {
    setSelectedModule(index);
    setSelectedSubmodule(null);
    if (openModule === index) {
      setOpenModule(null);
    } else {
      setOpenModule(index);
    }
  };

  const handleSubmoduleClick = (subIndex) => {
    setSelectedSubmodule(subIndex);
  };

  return (
    <div className="w-60 bg-white text-neutral-500 text-sm font-semibold h-screen p-4">
      <h2 className="text-xl font-bold text-center mb-4">Fleet Portal</h2>
      <ul>
        {menuItems.map((item, index) => (
          <li key={index} className="mb-2">
            {item.submodules ? (
              <>
                {/* Module with Submodules */}
                <button
                  onClick={() => handleModuleClick(index)}
                  className={`flex items-center justify-between w-full p-2 rounded 
                    ${selectedModule === index ? "text-blue-500" : "text-neutral-500"}
                  `}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  <span>{openModule === index ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
                </button>

                {/* Submodules */}
                {openModule === index && (
                  <ul className="pl-6 mt-1">
                    {item.submodules.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={subItem.path}
                          onClick={() => handleSubmoduleClick(subIndex)}
                          className={`block p-2 rounded transition-all 
                            ${selectedModule === index && selectedSubmodule === subIndex ? "text-blue-500 font-semibold" : "text-neutral-500"}
                          `}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              // Module without Submodules
              <Link
                to={item.path}
                onClick={() => { setSelectedModule(index); setSelectedSubmodule(null); }}
                className={`flex items-center p-2 rounded transition-all w-full 
                  ${selectedModule === index ? "text-blue-500 font-semibold" : "text-neutral-500"}
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
