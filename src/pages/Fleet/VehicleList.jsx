import { useEffect, useMemo, useState } from "react";
import {
  createVehicleAI,
  deleteMultipleVehicles,
  deleteVehicleById,
  getVehiclesList,
  updateVehicleById,
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
import Dropdown from "../../components/Dropdown";
import { getUserData } from "../../utils/auth";
import { useCompanyBranchFilters } from "../../hooks/useCompanyBranchFilters";
import AICommandBar from "../../components/AiCommandBar";

const DEFAULT_VEHICLE_STATUSES = ["Available", "Assigned", "Maintenance", "Active", "Unavailable"];

/** Distinct badge colors per vehicle status (matches lookup names from DB). */
const vehicleStatusBadgeClass = (status) => {
  const s = (status || "").trim();
  if (s === "Available") return "bg-emerald-50 text-emerald-900 border-emerald-200";
  if (s === "Assigned") return "bg-sky-50 text-sky-900 border-sky-200";
  if (s === "Maintenance") return "bg-amber-50 text-amber-950 border-amber-200";
  if (s === "Active") return "bg-lime-50 text-lime-900 border-lime-200";
  if (s === "Unavailable") return "bg-rose-50 text-rose-900 border-rose-200";
  if (s === "Inactive" || s === "Retired") return "bg-slate-100 text-slate-800 border-slate-300";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

const VehicleList = () => {
  /* ===========================
     🔹 DROPDOWN STATE
     =========================== */
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

  const [resetCommandBar, setResetCommandBar] = useState(false);
  const [commandError, setCommandError] = useState("");

  /* ===========================
     🔹 TABLE STATE
     =========================== */
  const [vehicles, setVehicles] = useState([]);
  const [vehicleStatusOptions, setVehicleStatusOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const statusChoices = useMemo(() => {
    const fromApi = (vehicleStatusOptions || []).filter(Boolean);
    const fromRows = (vehicles || []).map((v) => v.status).filter(Boolean);
    return [...new Set([...DEFAULT_VEHICLE_STATUSES, ...fromApi, ...fromRows])];
  }, [vehicleStatusOptions, vehicles]);

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
  const user = getUserData();
  const canUseVehicleAI = ["SuperAdmin", "Admin", "CompanyAdmin", "CompanyManager"].includes(user?.role);
  const isBranchScopedUser = ["BranchManager", "Driver"].includes(user?.role);

  /* ===========================
     🔹 INITIAL LOOKUPS
     =========================== */
  /* ===========================
     🔹 DATA FETCH
     =========================== */
  useEffect(() => {
    fetchVehicleList();
  }, [searchParams, currentPage, pageSize, sortColumn, sortDirection]);

  const fetchVehicleList = async () => {
    if (!companyId) return;
    if (isBranchScopedUser && !branchId) return;

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
      const sl = res.lookups?.statusList;
      if (Array.isArray(sl) && sl.length) {
        setVehicleStatusOptions(
          sl.map((row) => row.name ?? row.status_name ?? "").filter(Boolean)
        );
      }
      const totalRecords = res.pagination?.totalRecords || 0;
      setTotalEntries(totalRecords);
      const pages = Math.ceil(
        totalRecords / pageSize
      );
      setTotalPages(pages || 1);
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
    if (!companyId || (isBranchScopedUser && !branchId)) {
      alert(isBranchScopedUser ? "Please select Business and Branch" : "Please select Business");
      setVehicles([]);
      setTotalEntries(0);
      setTotalPages(1);
      return;
    }

    setSearchParams({ ...filters });
    setCurrentPage(1);
  };

  const handleTopSearchClick = () => {
    if (!companyId || (isBranchScopedUser && !branchId)) {
      alert(isBranchScopedUser ? "Please select Business and Branch" : "Please select Business");
      setVehicles([]);
      setTotalEntries(0);
      setTotalPages(1);
      return;
    }

    setCurrentPage(1);
    // Trigger API call through existing effect and payload path (portal_spVehicleMainPageData)
    setSearchParams({ ...filters });
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

  const handleVehicleStatusChange = async (vehicleId, nextStatus, row) => {
    if (!row) return;
    if (!companyId) {
      alert("Please select a business above.");
      return;
    }

    const branchNumeric =
      branchId != null && branchId !== ""
        ? Number(branchId)
        : row.branch_id != null
          ? Number(row.branch_id)
          : row.branchId != null
            ? Number(row.branchId)
            : null;

    if (
      ["SuperAdmin", "Admin"].includes(user?.role) &&
      (branchNumeric == null || Number.isNaN(branchNumeric))
    ) {
      alert("Please select a branch above (required to save changes).");
      return;
    }

    let dateRegistered = row.date_registered;
    if (dateRegistered != null && typeof dateRegistered === "string") {
      dateRegistered = dateRegistered.slice(0, 10);
    } else if (dateRegistered != null) {
      try {
        dateRegistered = new Date(dateRegistered).toISOString().slice(0, 10);
      } catch {
        dateRegistered = null;
      }
    }

    /** Full row required: `portal_spVehicleUpdate` overwrites all vehicle columns, not just status. */
    const payload = {
      company_id: Number(companyId),
      registration: row.registration ?? "",
      manufacturer: row.manufacturer ?? "",
      model: row.model ?? "",
      date_registered: dateRegistered,
      maintenance_interval_months:
        row.maintenance_interval_months !== undefined &&
        row.maintenance_interval_months !== null &&
        row.maintenance_interval_months !== ""
          ? Number(row.maintenance_interval_months)
          : null,
      fuel_type: row.fuel_type || undefined,
      status: nextStatus,
    };

    if (branchNumeric != null && !Number.isNaN(branchNumeric)) {
      payload.branch_id = branchNumeric;
    }
    if (row.fuel_type_id != null && row.fuel_type_id !== "") {
      payload.fuel_type_id = Number(row.fuel_type_id);
    }

    try {
      await updateVehicleById(vehicleId, payload);
      setVehicles((prev) =>
        prev.map((r) => (r.id === vehicleId ? { ...r, status: nextStatus } : r))
      );
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Could not update status.");
      fetchVehicleList();
    }
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
    navigate("/add-vehicle", { state: { companyId, branchId, businessType: selectedBusinessType } });
  };

  const handleVehicleAI = async ({ message, file }) => {
    try {
      setCommandError("");
      const response = await createVehicleAI({ message, file });
      await fetchVehicleList();
      setResetCommandBar((previous) => !previous);
      return response;
    } catch (error) {
      setCommandError(error?.response?.data?.message || "Unable to process vehicle AI command");
      throw error;
    }
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
      <div className="flex flex-col gap-4 bg-gray-50 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex w-full flex-wrap gap-3 lg:w-auto">
          <Dropdown
            options={companyOptions}
            value={companyId}
            onChange={handleCompanyChange}
            placeholder="Select business"
            disabled={companyDisabled}
            className="w-full min-w-0 sm:w-52"
          />
          <Dropdown
            options={branchOptions}
            value={branchId}
            disabled={!companyId}
            onChange={handleBranchChange}
            placeholder="Select Branch"
            className="w-full min-w-0 sm:w-52"
          />
          <button
            type="button"
            onClick={handleTopSearchClick}
            className="h-10 shrink-0 rounded-md bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Search
          </button>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:flex-1 lg:pl-4">
          {canUseVehicleAI ? (
            <AICommandBar
              placeholder="Add vehicle reg MH-12-AB-3456 manufacturer Tata model Ace company 1 branch 2"
              onExecute={handleVehicleAI}
              onSuccess={() => fetchVehicleList()}
              onError={() => {}}
              resetTrigger={resetCommandBar}
              maxWidthClass="min-w-0 w-full max-w-2xl sm:min-w-[10rem]"
            />
          ) : null}
          <AddButton label="Add Vehicle" onClick={handleAddClick} />
        </div>
      </div>
      {commandError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {commandError}
        </div>
      ) : null}
      {selectedBusinessType ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Fleet mode: <span className="font-semibold">{selectedBusinessType}</span>
        </div>
      ) : null}

      {/* 🔹 FILTERS */}
      <div className="bg-gray-50 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-start gap-3 md:justify-end">
          <StatusFilter
            value={filters.status}
            onChange={(v) => setFilters((f) => ({ ...f, status: v }))}
          />
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
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-indigo-50 sticky top-0">
            <tr>
              <th className="w-10 min-w-[2.5rem] px-3 py-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-gray-600">
                #
              </th>
              <th className="w-11 min-w-[2.75rem] px-3 py-3 align-middle">
                <div className="flex items-center justify-center">
                  <Checkbox checked={selectAll} onChange={handleSelectAll} />
                </div>
              </th>
              {["registration", "manufacturer", "date_registered"].map((col) => (
                <th
                  key={col}
                  className="cursor-pointer px-3 py-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-gray-600"
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.replace("_", " ")}
                    <SortIcons
                      active={sortColumn === col}
                      direction={sortDirection}
                    />
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-gray-600">
                Status
              </th>
              <th className="w-24 px-3 py-3 align-middle" aria-label="Actions" />
            </tr>
          </thead>

          <tbody>
            {skeleton ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan="7" className="p-4">Loading...</td></tr>
              ))
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-400">
                  {!companyId || (isBranchScopedUser && !branchId)
                    ? isBranchScopedUser
                      ? "Please select Business and Branch"
                      : "Please select Business"
                    : "No record found"}
                </td>
              </tr>
            ) : (
              vehicles.map((v, i) => (
                <tr key={v.id} className="border-b border-gray-100">
                  <td className="w-10 min-w-[2.5rem] px-3 py-3 align-middle text-gray-500 tabular-nums">
                    {(currentPage - 1) * pageSize + i + 1}
                  </td>
                  <td className="w-11 min-w-[2.75rem] px-3 py-3 align-middle">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedIds.includes(v.id)}
                        onChange={(c) => handleSelectOne(v.id, c)}
                      />
                    </div>
                  </td>
                  <td className="max-w-[10rem] truncate px-3 py-3 align-middle text-gray-900">
                    {v.registration}
                  </td>
                  <td className="max-w-[12rem] truncate px-3 py-3 align-middle text-gray-900">
                    {v.manufacturer}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 align-middle text-gray-900">
                    {new Date(v.date_registered).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <select
                        value={v.status || ""}
                        onChange={(e) => handleVehicleStatusChange(v.id, e.target.value, v)}
                        className={`max-w-[180px] cursor-pointer rounded border px-2 py-1 text-xs font-semibold ${vehicleStatusBadgeClass(v.status)} border-transparent`}
                      >
                        {statusChoices.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="w-24 px-3 py-3 align-middle">
                    <div className="flex items-center justify-end gap-3 leading-none text-gray-600">
                      <FaEdit
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer text-lg hover:text-indigo-600"
                        onClick={() => handleEditClick(v.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") handleEditClick(v.id);
                        }}
                      />
                      <FaTrash
                        role="button"
                        tabIndex={0}
                        className="cursor-pointer text-lg hover:text-red-600"
                        onClick={() => handleDelete(v.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") handleDelete(v.id);
                        }}
                      />
                    </div>
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
