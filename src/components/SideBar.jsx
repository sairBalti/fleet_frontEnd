import { useState, useEffect } from "react";
import { getUserData } from "../utils/auth";
import { Link, useLocation } from "react-router-dom";
import { 
  FaTachometerAlt, FaTruck, FaChartBar, FaUser, FaCogs, FaTools, 
  FaRoute, FaComments, FaQuestionCircle, FaBuilding
} from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { RiMenuFoldLine, RiMenuUnfoldLine } from "react-icons/ri";
import { getPortalNavigation } from "../services/portalService";
import BrandLogo from "./BrandLogo";

const SIDEBAR_COLLAPSED_KEY = "fleet-sidebar-collapsed";

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [openModule, setOpenModule] = useState(null);
  const [flyoutPos, setFlyoutPos] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubmodule, setSelectedSubmodule] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const userData = getUserData();

  useEffect(() => {
    setFlyoutPos(null);
    if (collapsed) setOpenModule(null);
  }, [location.pathname, collapsed]);

  const iconMap = {
    dashboard: <FaTachometerAlt />,
    businesses: <FaBuilding />,
    fleet: <FaTruck />,
    reports: <FaChartBar />,
    driver: <FaUser />,
    settings: <FaCogs />,
    maintenance: <FaTools />,
    trips: <FaRoute />,
    chat: <FaComments />,
    help: <FaQuestionCircle />,
  };

  useEffect(() => {
    const loadNavigation = async () => {
      try {
        const response = await getPortalNavigation();
        const normalized = (response.data || []).map((module) => {
          const submodules = module.submodules || [];
          if (submodules.length > 1) {
            return {
              title: module.title,
              icon: iconMap[module.iconKey] || <FaQuestionCircle />,
              submodules,
            };
          }

          if (submodules.length === 1) {
            return {
              title: module.title,
              icon: iconMap[module.iconKey] || <FaQuestionCircle />,
              path: submodules[0].path,
            };
          }

          return {
            title: module.title,
            icon: iconMap[module.iconKey] || <FaQuestionCircle />,
            path: "/dashboard/kpis",
          };
        });
        setMenuItems(normalized);
      } catch (error) {
        console.error("Failed to load portal navigation:", error);
      }
    };
    if (userData?.role) {
      loadNavigation();
    }
  }, [userData?.role]);

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const toggleCollapsed = () => {
    setOpenModule(null);
    setFlyoutPos(null);
    setCollapsed((c) => !c);
  };

  const handleModuleClick = (index, event) => {
    const item = menuItems[index];
    if (!item?.submodules) return;

    setSelectedModule(index);
    setSelectedSubmodule(null);

    if (collapsed) {
      if (openModule === index) {
        setOpenModule(null);
        setFlyoutPos(null);
      } else {
        setOpenModule(index);
        const rect = event.currentTarget.getBoundingClientRect();
        setFlyoutPos({ top: rect.top, left: rect.right + 6 });
      }
      return;
    }

    setFlyoutPos(null);
    setOpenModule(openModule === index ? null : index);
  };

  const handleSubmoduleClick = (subIndex) => {
    setSelectedSubmodule(subIndex);
  };

  const closeFlyout = () => {
    setOpenModule(null);
    setFlyoutPos(null);
  };

  const flyoutItem =
    collapsed && openModule !== null && menuItems[openModule]?.submodules
      ? menuItems[openModule]
      : null;

  return (
    <>
    <div
      className={`flex flex-col h-screen bg-white text-neutral-500 text-sm font-semibold border-r border-neutral-100 transition-[width] duration-200 ease-out shrink-0 ${
        collapsed ? "w-16 p-2" : "w-60 p-4"
      }`}
    >
      <div className="shrink-0">
        <BrandLogo theme={collapsed ? "sidebarCompact" : "sidebar"} />
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-2">
              {item.submodules ? (
                <>
                  <button
                    type="button"
                    title={item.title}
                    onClick={(e) => handleModuleClick(index, e)}
                    className={`flex items-center w-full p-2 rounded ${
                      collapsed ? "justify-center" : "justify-between"
                    } ${selectedModule === index ? "text-blue-500" : "text-neutral-500"}`}
                  >
                    <div
                      className={`flex items-center min-w-0 ${
                        collapsed ? "" : "flex-1"
                      }`}
                    >
                      <span className={collapsed ? "" : "mr-3"}>{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </div>
                    {!collapsed && (
                      <span className="shrink-0">
                        {openModule === index ? <IoIosArrowUp /> : <IoIosArrowDown />}
                      </span>
                    )}
                  </button>

                  {openModule === index && !collapsed && (
                    <ul className="pl-6 mt-1">
                      {item.submodules.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <Link
                            to={subItem.path}
                            onClick={() => handleSubmoduleClick(subIndex)}
                            className={`block p-2 rounded transition-all ${
                              selectedModule === index && selectedSubmodule === subIndex
                                ? "text-blue-500 font-semibold"
                                : "text-neutral-500"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  title={collapsed ? item.title : undefined}
                  to={item.path}
                  onClick={() => {
                    setSelectedModule(index);
                    setSelectedSubmodule(null);
                  }}
                  className={`flex items-center rounded transition-all w-full p-2 ${
                    collapsed ? "justify-center" : ""
                  } ${
                    selectedModule === index
                      ? "text-blue-500 font-semibold"
                      : "text-neutral-500"
                  }`}
                >
                  <span className={collapsed ? "" : "mr-2 shrink-0"}>{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 pt-3 mt-auto border-t border-neutral-100/90">
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-white to-slate-50/90 py-2.5 text-slate-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-slate-200/80 transition-all duration-300 hover:text-blue-600 hover:shadow-[0_8px_24px_-6px_rgba(37,99,235,0.22)] hover:ring-blue-200/70 active:scale-[0.97]"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/[0.06] via-transparent to-teal-500/[0.06] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {collapsed ? (
            <RiMenuUnfoldLine
              className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              aria-hidden
            />
          ) : (
            <RiMenuFoldLine
              className="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110"
              aria-hidden
            />
          )}
        </button>
      </div>
    </div>

    {flyoutPos && flyoutItem && (
      <>
        <div
          className="fixed inset-0 z-40 bg-transparent"
          aria-hidden
          onClick={closeFlyout}
        />
        <ul
          className="fixed z-50 min-w-[180px] max-h-[min(320px,70vh)] overflow-y-auto rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
          style={{ top: flyoutPos.top, left: flyoutPos.left }}
        >
          {flyoutItem.submodules.map((subItem, subIndex) => (
            <li key={subIndex}>
              <Link
                to={subItem.path}
                onClick={() => {
                  handleSubmoduleClick(subIndex);
                  closeFlyout();
                }}
                className={`block px-3 py-2 text-left text-sm transition-all ${
                  selectedModule === openModule && selectedSubmodule === subIndex
                    ? "text-blue-500 font-semibold"
                    : "text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                {subItem.name}
              </Link>
            </li>
          ))}
        </ul>
      </>
    )}
    </>
  );
};

export default Sidebar;
