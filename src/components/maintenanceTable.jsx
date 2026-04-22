// src/components/MaintenanceTable.jsx
import { useEffect, useState } from "react";
import SortIcons from "./SortIcons";
import Pagination from "./Pagination";
import { getFleetOverview } from "../services/VehicleService";

const MaintenanceTable = () => {
  const [data, setData] = useState([]);
  const [skeleton, setSkeleton] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, sortColumn, sortDirection]);

  const fetchData = async () => {
    setSkeleton(true);
    try {
      const request = {
        pageNumber: currentPage,
        pageSize,
        sortBy: sortColumn,
        sortDirection,
      };
      const response = await getFleetOverview(request);
      setData(response.maintenanceAlerts || []);
      setTotalEntries(response.totalRecords);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching maintenance table:", error);
    } finally {
      setSkeleton(false);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  return (
    <div className="bg-white p-4 shadow rounded">
      <h3 className="text-lg font-semibold mb-2">Maintenance Alerts</h3>
      <div className="overflow-x-auto">
        <div className="max-h-[540px] overflow-y-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-indigo-50 text-gray-700 uppercase text-xs sticky top-0 z-10">
              <tr className="border-b">
                <th className="p-4">#</th>
                <th
                  className="p-4 cursor-pointer"
                  onClick={() => handleSort("registration")}
                >
                  <span className="flex items-center space-x-1">
                    <span>Registration</span>
                    <SortIcons active={sortColumn === "registration"} direction={sortDirection} />
                  </span>
                </th>
                <th
                  className="p-4 cursor-pointer"
                  onClick={() => handleSort("manufacturer")}
                >
                  <span className="flex items-center space-x-1">
                    <span>Manufacturer</span>
                    <SortIcons active={sortColumn === "manufacturer"} direction={sortDirection} />
                  </span>
                </th>
                <th className="p-4">Model</th>
                <th
                  className="p-4 cursor-pointer"
                  onClick={() => handleSort("maintenance_due_date")}
                >
                  <span className="flex items-center space-x-1">
                    <span>Due Date</span>
                    <SortIcons active={sortColumn === "maintenance_due_date"} direction={sortDirection} />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {skeleton
                ? [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse border-b">
                      {[...Array(5)].map((__, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                : data.map((v, index) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4">{v.registration}</td>
                      <td className="p-4">{v.manufacturer}</td>
                      <td className="p-4">{v.model}</td>
                      <td className="p-4">
                        {new Date(v.maintenance_due_date).toLocaleDateString("en-GB")}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pt-2 pb-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          totalEntries={totalEntries}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  );
};

export default MaintenanceTable;
