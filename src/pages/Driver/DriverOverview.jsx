import { useEffect, useMemo, useState } from "react";
import {
  deleteDriverById,
  getDriversList,
  patchDriverStatus,
} from "../../services/driverService";
import { FaEdit, FaTrash } from "react-icons/fa";
import Checkbox from "../../components/Checkbox";
import SearchButton from "../../components/SearchButton";
import Pagination from "../../components/Pagination";
import AddButton from "../../components/AddButton";
import { useNavigate } from "react-router-dom";
import SortIcons from "../../components/SortIcons";
import { useLoader } from "../../context/LoaderContext";
import Dropdown from "../../components/Dropdown";
import { getUserData } from "../../utils/auth";
import { useCompanyBranchFilters } from "../../hooks/useCompanyBranchFilters";

const DRIVER_STATUSES = ["All", "Active", "On Leave", "Suspended", "Inactive"];

const statusBadgeClass = (status) => {
  if (status === "Active") return "bg-green-100 text-green-800";
  if (status === "On Leave") return "bg-amber-100 text-amber-800";
  if (status === "Suspended") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-700";
};

const DriverOverview = () => {
  const {
    companyId,
    branchId,
    companyOptions,
    branchOptions,
    companyDisabled,
    handleCompanyChange,
    handleBranchChange,
  } = useCompanyBranchFilters();

  const selectedBusinessType = useMemo(
    () =>
      companyOptions.find((item) => String(item.id) === String(companyId))?.business_type_name || "",
    [companyOptions, companyId]
  );

  const [drivers, setDrivers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortColumn, setSortColumn] = useState("driver_name");
  const [sortDirection, setSortDirection] = useState("asc");

  const [filters, setFilters] = useState({
    status: "All",
    searchText: "",
  });

  /** Committed query: set when user clicks header Search; drives API + table. */
  const [applied, setApplied] = useState(null);

  const [skeleton, setSkeleton] = useState(false);

  const navigate = useNavigate();
  const { setLoading } = useLoader();
  const user = getUserData();
  const isBranchScopedUser = ["BranchManager", "Driver"].includes(user?.role);

  useEffect(() => {
    if (!applied) {
      setDrivers([]);
      setTotalEntries(0);
      setTotalPages(1);
      return;
    }
    fetchDriverList();
  }, [applied, currentPage, pageSize, sortColumn, sortDirection]);

  const fetchDriverList = async () => {
    if (!applied) return;

    setSkeleton(true);

    try {
      const payload = {
        companyId: applied.companyId,
        branchId: applied.branchId,
        status: applied.status,
        searchText: applied.searchText?.trim() || null,
        sortColumn,
        sortDirection: sortDirection.toUpperCase(),
        pageNumber: currentPage,
        pageSize,
      };

      const res = await getDriversList(payload);

      setDrivers(res.data || []);
      const totalRecords = res.pagination?.totalRecords || 0;
      setTotalEntries(totalRecords);
      setTotalPages(Math.ceil(totalRecords / pageSize) || 1);
      setSelectAll(false);
      setSelectedIds([]);
    } catch (err) {
      console.error("Driver fetch failed:", err);
    } finally {
      setSkeleton(false);
    }
  };

  const handleSearchClick = () => {
    if (!applied) {
      alert("Select business and branch, then click Search in the header.");
      return;
    }
    setApplied((a) => ({
      ...a,
      status: filters.status,
      searchText: filters.searchText || "",
    }));
    setCurrentPage(1);
  };

  const handleTopSearchClick = () => {
    if (!companyId) {
      alert("Please select a business.");
      return;
    }
    if (branchOptions.length > 0 && !branchId) {
      alert("Please select a branch.");
      return;
    }
    if (isBranchScopedUser && !branchId) {
      alert("Please select Business and Branch.");
      return;
    }

    setApplied({
      companyId,
      branchId: branchId || null,
      status: filters.status,
      searchText: filters.searchText || "",
    });
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
    setSelectedIds(checked ? drivers.map((d) => d.id) : []);
  };

  const handleSelectOne = (id, checked) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this driver? Schedule and performance history for this driver will be deleted.")) return;
    try {
      setLoading(true);
      await deleteDriverById(id);
      await fetchDriverList();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Remove ${selectedIds.length} driver(s)?`)) return;
    try {
      setLoading(true);
      await Promise.all(selectedIds.map((id) => deleteDriverById(id)));
      await fetchDriverList();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setLoading(true);
    navigate("/add-driver", { state: { companyId, branchId, businessType: selectedBusinessType } });
  };

  const handleEditClick = (id) => {
    setLoading(true);
    navigate(`/edit-driver/${id}`);
  };

  const handleStatusChange = async (driverId, nextStatus) => {
    try {
      await patchDriverStatus(driverId, nextStatus);
      setDrivers((prev) =>
        prev.map((row) => (row.id === driverId ? { ...row, status: nextStatus } : row))
      );
    } catch (e) {
      console.error(e);
      fetchDriverList();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 bg-gray-50 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex w-full flex-wrap gap-3 lg:w-auto">
          <Dropdown
            options={companyOptions}
            value={companyId}
            onChange={async (value) => {
              setApplied(null);
              await handleCompanyChange(value);
            }}
            placeholder="Select business"
            disabled={companyDisabled}
            optionListMaxHeightClass="max-h-32"
            className="w-full min-w-0 sm:w-52"
          />
          <Dropdown
            options={branchOptions}
            value={branchId}
            disabled={!companyId}
            onChange={(value) => {
              setApplied(null);
              handleBranchChange(value);
            }}
            placeholder="Select Branch"
            className="w-full min-w-0 sm:w-52"
          />
          <button
            type="button"
            onClick={handleTopSearchClick}
            className="h-10 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
        <div className="flex items-center gap-3">
          <AddButton label="Add Driver" onClick={handleAddClick} />
        </div>
      </div>

      {selectedBusinessType ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Business type: <span className="font-semibold">{selectedBusinessType}</span>
        </div>
      ) : null}

      <div className="bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="h-10 w-full min-w-0 max-w-full rounded-md border bg-white px-3 py-2 text-sm sm:w-48"
          >
            {DRIVER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => setFilters((f) => ({ ...f, searchText: e.target.value }))}
            placeholder="Name, email, branch…"
            className="h-10 w-full min-w-0 max-w-full rounded-md border px-3 py-2 text-sm sm:w-56"
          />
          <SearchButton onClick={handleSearchClick} />
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="bg-red-500 text-white px-4 py-2 rounded h-10"
            >
              Delete selected ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 sticky top-0">
            <tr>
              <th className="p-3">
                <Checkbox checked={selectAll} onChange={handleSelectAll} />
              </th>
              {[
                { key: "driver_name", label: "Driver" },
                { key: "email", label: "Email" },
                { key: "branch_name", label: "Branch" },
                { key: "efficiency_score", label: "Efficiency" },
              ].map(({ key, label }) => (
                <th key={key} className="p-3 cursor-pointer text-left" onClick={() => handleSort(key)}>
                  <span className="flex items-center gap-1">
                    {label}
                    <SortIcons active={sortColumn === key} direction={sortDirection} />
                  </span>
                </th>
              ))}
              <th className="p-3 text-left">Status</th>
              <th className="p-3 w-24" />
            </tr>
          </thead>

          <tbody>
            {skeleton ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="p-4">
                    Loading...
                  </td>
                </tr>
              ))
            ) : drivers.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
                  {!applied
                    ? "Select business and branch, then click Search in the header to load drivers."
                    : "No drivers found"}
                </td>
              </tr>
            ) : (
              drivers.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <Checkbox
                      checked={selectedIds.includes(d.id)}
                      onChange={(c) => handleSelectOne(d.id, c)}
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900">{d.driver_name}</td>
                  <td className="p-3 text-gray-600">{d.email || "—"}</td>
                  <td className="p-3">{d.branch_name}</td>
                  <td className="p-3">{d.efficiency_score != null ? Number(d.efficiency_score).toFixed(1) : "—"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={d.status}
                        onChange={(e) => handleStatusChange(d.id, e.target.value)}
                        className={`text-xs font-semibold rounded border px-2 py-1 max-w-[140px] ${statusBadgeClass(d.status)} border-transparent`}
                      >
                        {DRIVER_STATUSES.filter((s) => s !== "All").map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3 text-indigo-600">
                      <FaEdit className="cursor-pointer" onClick={() => handleEditClick(d.id)} title="Edit" />
                      <FaTrash className="cursor-pointer text-red-500" onClick={() => handleDelete(d.id)} title="Delete" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

export default DriverOverview;
