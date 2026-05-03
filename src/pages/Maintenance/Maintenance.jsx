import { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import SearchButton from "../../components/SearchButton";
import Pagination from "../../components/Pagination";
import AddButton from "../../components/AddButton";
import SortIcons from "../../components/SortIcons";
import Dropdown from "../../components/Dropdown";
import { getUserData } from "../../utils/auth";
import { useCompanyBranchFilters } from "../../hooks/useCompanyBranchFilters";
import {
  listMaintenanceWorkOrders,
  getMaintenanceVehicleOptions,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  patchWorkOrderStatus,
} from "../../services/maintenanceService";

const STATUS_OPTIONS = ["All", "Open", "In Progress", "Completed", "Cancelled"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const WORK_ORDER_STATUSES = ["Open", "In Progress", "Completed", "Cancelled"];

const priorityClass = (p) => {
  if (p === "Critical") return "bg-red-100 text-red-800";
  if (p === "High") return "bg-orange-100 text-orange-800";
  if (p === "Medium") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-700";
};

const statusClass = (s) => {
  if (s === "Completed") return "bg-green-100 text-green-800";
  if (s === "In Progress") return "bg-blue-100 text-blue-800";
  if (s === "Cancelled") return "bg-gray-200 text-gray-700";
  return "bg-slate-100 text-slate-800";
};

const emptyForm = () => ({
  vehicle_id: "",
  title: "",
  description: "",
  priority: "Medium",
  status: "Open",
  due_date: "",
});

const Maintenance = () => {
  const user = getUserData();
  const isBranchScopedUser = ["BranchManager", "Driver", "Maintenance"].includes(user?.role);

  const {
    companyId,
    branchId,
    companyOptions,
    branchOptions,
    companyDisabled,
    handleCompanyChange,
    handleBranchChange,
  } = useCompanyBranchFilters({
    presetRoles: ["CompanyAdmin", "CompanyManager", "BranchManager", "Driver", "Maintenance"],
    branchScopedUser: isBranchScopedUser,
  });

  const selectedBusinessType = useMemo(
    () =>
      companyOptions.find((item) => String(item.id) === String(companyId))?.business_type_name || "",
    [companyOptions, companyId]
  );

  const [rows, setRows] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortColumn, setSortColumn] = useState("due_date");
  const [sortDirection, setSortDirection] = useState("asc");

  const [filters, setFilters] = useState({
    status: "All",
    searchText: "",
  });

  const [applied, setApplied] = useState(null);
  const [skeleton, setSkeleton] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formSaving, setFormSaving] = useState(false);

  useEffect(() => {
    if (!applied) {
      setRows([]);
      setTotalEntries(0);
      setTotalPages(1);
      return;
    }
    fetchList();
  }, [applied, currentPage, pageSize, sortColumn, sortDirection]);

  const fetchList = async () => {
    if (!applied) return;
    setSkeleton(true);
    try {
      const res = await listMaintenanceWorkOrders({
        companyId: applied.companyId,
        branchId: applied.branchId,
        status: applied.status === "All" ? null : applied.status,
        searchText: applied.searchText?.trim() || null,
        sortColumn,
        sortDirection: sortDirection.toUpperCase(),
        pageNumber: currentPage,
        pageSize,
      });
      setRows(res.data || []);
      const totalRecords = res.pagination?.totalRecords || 0;
      setTotalEntries(totalRecords);
      setTotalPages(Math.ceil(totalRecords / pageSize) || 1);
    } catch (err) {
      console.error("Maintenance list failed:", err);
    } finally {
      setSkeleton(false);
    }
  };

  const loadVehiclesForForm = async () => {
    if (!applied?.companyId || !applied?.branchId) return;
    try {
      const res = await getMaintenanceVehicleOptions({
        companyId: applied.companyId,
        branchId: applied.branchId,
      });
      setVehicleOptions(res.data || []);
    } catch (e) {
      console.error(e);
      setVehicleOptions([]);
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
      alert("Please select business and branch.");
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

  const openCreate = async () => {
    if (!applied?.companyId || !applied?.branchId) {
      alert("Select business and branch, then Search.");
      return;
    }
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
    await loadVehiclesForForm();
  };

  const openEdit = async (id) => {
    if (!applied?.companyId || !applied?.branchId) return;
    setFormOpen(true);
    setFormSaving(true);
    setEditingId(id);
    await loadVehiclesForForm();
    try {
      const res = await getWorkOrderById(id);
      const w = res.data;
      setForm({
        vehicle_id: String(w.vehicle_id),
        title: w.title || "",
        description: w.description || "",
        priority: w.priority || "Medium",
        status: w.status || "Open",
        due_date: w.due_date ? String(w.due_date).slice(0, 10) : "",
      });
    } catch (e) {
      console.error(e);
      setFormOpen(false);
    } finally {
      setFormSaving(false);
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.title?.trim()) {
      alert("Title is required.");
      return;
    }
    if (!form.vehicle_id) {
      alert("Select a vehicle.");
      return;
    }
    if (!applied?.companyId || !applied?.branchId) return;

    setFormSaving(true);
    try {
      const payload = {
        company_id: Number(applied.companyId),
        branch_id: Number(applied.branchId),
        vehicle_id: Number(form.vehicle_id),
        title: form.title.trim(),
        description: form.description || null,
        priority: form.priority,
        status: form.status,
        due_date: form.due_date || null,
      };
      if (editingId) {
        await updateWorkOrder(editingId, {
          vehicle_id: payload.vehicle_id,
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          status: payload.status,
          due_date: payload.due_date,
        });
      } else {
        await createWorkOrder(payload);
      }
      closeForm();
      await fetchList();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Could not save work order.");
    } finally {
      setFormSaving(false);
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await patchWorkOrderStatus(id, nextStatus);
      setRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                status: nextStatus,
                completed_at: nextStatus === "Completed" ? new Date().toISOString() : null,
              }
            : row
        )
      );
    } catch (e) {
      console.error(e);
      fetchList();
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
            placeholder="Select branch"
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
          <AddButton label="New work order" onClick={openCreate} />
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
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={filters.searchText}
            onChange={(e) => setFilters((f) => ({ ...f, searchText: e.target.value }))}
            placeholder="Title, description, registration…"
            className="h-10 w-full min-w-0 max-w-full rounded-md border px-3 py-2 text-sm sm:w-56"
          />
          <SearchButton onClick={handleSearchClick} />
        </div>
      </div>

      <div className="bg-white overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-indigo-50 sticky top-0">
            <tr>
              {[
                { key: "title", label: "Work order" },
                { key: "registration", label: "Vehicle" },
                { key: "priority", label: "Priority" },
                { key: "due_date", label: "Due" },
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
                  <td colSpan={6} className="p-4">
                    Loading…
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">
                  {!applied
                    ? "Select business and branch, then click Search in the header."
                    : "No work orders found."}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{r.title}</div>
                    {r.description ? (
                      <div className="text-xs text-gray-500 line-clamp-2">{r.description}</div>
                    ) : null}
                  </td>
                  <td className="p-3 text-gray-700">
                    <div className="font-medium">{r.registration || "—"}</div>
                    <div className="text-xs text-gray-500">
                      {[r.manufacturer, r.model].filter(Boolean).join(" · ") || ""}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-semibold rounded px-2 py-1 ${priorityClass(r.priority)}`}
                    >
                      {r.priority}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700">
                    {r.due_date
                      ? new Date(r.due_date).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.id, e.target.value)}
                      className={`text-xs font-semibold rounded border px-2 py-1 max-w-[160px] ${statusClass(
                        r.status
                      )} border-transparent`}
                    >
                      {WORK_ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-800"
                      onClick={() => openEdit(r.id)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
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

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 text-gray-900 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit work order" : "New work order"}
            </h2>
            <form onSubmit={submitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                <select
                  required
                  value={form.vehicle_id}
                  onChange={(e) => setForm((f) => ({ ...f, vehicle_id: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Select vehicle</option>
                  {vehicleOptions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration}
                      {v.manufacturer || v.model
                        ? ` — ${[v.manufacturer, v.model].filter(Boolean).join(" ")}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm min-h-[88px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    {WORK_ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {formSaving ? "Saving…" : editingId ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Maintenance;
