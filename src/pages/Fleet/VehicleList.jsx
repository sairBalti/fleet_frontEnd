import { useEffect, useState } from "react";
import {
  deleteMultipleVehicles,
  deleteVehicleById,
  getVehiclesList,
} from "../../services/VehicleService";
import { FaEdit, FaTrash } from "react-icons/fa";
import Checkbox from "../../components/Checkbox";
import SearchButton from "../../components/SearchButton";
import DateRangeFilter from "../../components/DateRangeFilter";
import StatusFilter from "../../components/StatusFilter";
import Pagination from "../../components/Pagination";
import AddButton from "../../components/AddButton";
import { useNavigate } from "react-router-dom";
import SortIcons from "../../components/SortIcons";
import { useLoader } from "../../context/LoaderContext";
import Dropdown from "../../components/dropdown";

// 🔹 TODO: replace with your real lookup services
// import { getCompanyList, getBranchList } from "../../services/LookupService";

const VehicleList = () => {
  /* ===========================
     🔹 DROPDOWN STATE
     =========================== */
  const [companyId, setCompanyId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  /* ===========================
     🔹 TABLE STATE
     =========================== */
  const [vehicles, setVehicles] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  /* ===========================
     🔹 PAGINATION & SORT
     =========================== */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  /* ===========================
     🔹 FILTERS
     =========================== */
  const [filters, setFilters] = useState({
    status: "All",
    start: null,
    end: null,
  });

  const [searchParams, setSearchParams] = useState({
    status: "All",
    start: null,
    end: null,
  });

  const [skeleton, setSkeleton] = useState(false);

  const navigate = useNavigate();
  const { setLoading } = useLoader();

  /* ===========================
     🔹 INITIAL LOOKUPS
     =========================== */
  useEffect(() => {
    // 🔹 Example only
    // getCompanyList().then(res => setCompanyOptions(res));
  }, []);

  useEffect(() => {
    if (!companyId) {
      setBranchId("");
      setBranchOptions([]);
      return;
    }

    // 🔹 Example only
    // getBranchList(companyId).then(res => setBranchOptions(res));
  }, [companyId]);

  /* ===========================
     🔹 DATA FETCH
     =========================== */
  useEffect(() => {
    fetchVehicleList();
  }, [searchParams, currentPage, pageSize, sortColumn, sortDirection]);

  const fetchVehicleList = async () => {
    if (!companyId || !branchId) return;

    setSkeleton(true);

    try {
      const payload = {
        companyId,
        branchId,
        statusId: searchParams.status === "All" ? null : searchParams.status,
        startDate: searchParams.start || null,
        endDate: searchParams.end || null,
        sortColumn,
        sortDirection: sortDirection.toUpperCase(),
        pageNumber: currentPage,
        pageSize,
      };

      const res = await getVehiclesList(payload);

      setVehicles(res.data || []);
      setTotalEntries(res.totalRecords || 0);
      const pages = Math.ceil(
        (res.pagination?.totalRecords || 0) / pageSize
      );
      setTotalPages(pages)
      setSelectAll(false);
      setSelectedIds([]);

    } catch (err) {
      console.error("Vehicle fetch failed:", err);
    } finally {
      setSkeleton(false);
    }
  };

  /* ===========================
     🔹 ACTIONS
     =========================== */
  const handleSearchClick = () => {
    if (!companyId || !branchId) {
      alert("Please select Business and Branch");
      setVehicles([]);
      setTotalEntries(0);
      setTotalPages(1);
      return;
    }

    setSearchParams({ ...filters });
    setCurrentPage(1);
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

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedIds(checked ? vehicles.map((v) => v.id) : []);
  };

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    await deleteVehicleById(id);
    fetchVehicleList();
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm("Delete selected vehicles?")) return;
    await deleteMultipleVehicles(selectedIds);
    fetchVehicleList();
  };

  /* ===========================
     🔹 NAVIGATION
     =========================== */
  const handleAddClick = () => {
    setLoading(true);
    navigate("/add-vehicle");
  };

  const handleEditClick = (id) => {
    setLoading(true);
    navigate(`/edit-vehicle/${id}`);
  };

  /* ===========================
     🔹 RENDER
     =========================== */
  return (
    <div className="space-y-4">
      {/* 🔹 HEADER */}
      <div className="p-6 bg-gray-50 flex justify-between">
        <div className="flex gap-3">
          <Dropdown
            options={companyOptions}
            value={companyId}
            onChange={(value) =>{
              setCompanyId(value)
              setBranchId(null)
            }}
            placeholder="Select business"
          />
          <Dropdown
            options={branchOptions}
            value={branchId}
            onChange={setBranchId}
            placeholder="Select Branch"
          />
        </div>
        <AddButton label="Add Vehicle" onClick={handleAddClick} />
      </div>

      {/* 🔹 FILTERS */}
      <div className="p-6 bg-gray-50">
        <div className="flex gap-4 items-end justify-end">
          <StatusFilter onChange={(v) => setFilters(f => ({ ...f, status: v }))} />
          <DateRangeFilter onChange={(v) => setFilters(f => ({ ...f, ...v }))} />
          <SearchButton onClick={handleSearchClick} />
          {selectedIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete Selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* 🔹 TABLE */}
      <div className="bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 sticky top-0">
            <tr>
              <th className="p-3">
                <Checkbox checked={selectAll} onChange={handleSelectAll} />
              </th>
              {["registration", "manufacturer", "date_registered"].map(col => (
                <th
                  key={col}
                  className="p-3 cursor-pointer"
                  onClick={() => handleSort(col)}
                >
                  <span className="flex items-center gap-1">
                    {col.replace("_", " ")}
                    <SortIcons
                      active={sortColumn === col}
                      direction={sortDirection}
                    />
                  </span>
                </th>
              ))}
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {skeleton ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan="6" className="p-4">Loading...</td></tr>
              ))
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-400">
                  {!companyId || !branchId
                    ? "Please select Business and Branch"
                    : "No record found"}
                </td>
              </tr>
            ) : (
              vehicles.map((v, i) => (
                <tr key={v.id} className="border-b">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedIds.includes(v.id)}
                      onChange={(c) => handleSelectOne(v.id, c)}
                    />
                  </td>
                  <td>{v.registration}</td>
                  <td>{v.manufacturer}</td>
                  <td>{new Date(v.date_registered).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold
                        ${v.status === "Available"
                          ? "bg-green-100 text-green-700"
                          : v.status === "Assigned"
                            ? "bg-blue-100 text-blue-700"
                            : v.status === "Maintenance"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="flex gap-3">
                    <FaEdit onClick={() => handleEditClick(v.id)} />
                    <FaTrash onClick={() => handleDelete(v.id)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        totalEntries={totalEntries}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};

export default VehicleList;
