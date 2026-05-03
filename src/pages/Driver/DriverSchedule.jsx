import { useEffect, useMemo, useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import {
  getDriverScheduleData,
  previewDriverScheduleAi,
  commitDriverScheduleAi,
} from "../../services/driverService";
import { getUserData } from "../../utils/auth";
import Pagination from "../../components/Pagination";
import Dropdown from "../../components/Dropdown";
import { useCompanyBranchFilters } from "../../hooks/useCompanyBranchFilters";
import { FaEdit, FaTrash } from "react-icons/fa";
import AICommandBar from "../../components/AiCommandBar";
import ScheduleAiPreviewModal from "../../components/ScheduleAiPreviewModal";

const DriverSchedule = () => {
  const user = getUserData();
  const isBranchScopedUser = ["BranchManager", "Driver"].includes(user?.role);
  const canUseScheduleAi = ["SuperAdmin", "Admin", "CompanyAdmin", "CompanyManager", "BranchManager", "Manager"].includes(
    user?.role
  );

  const {
    companyId,
    branchId,
    companyOptions,
    branchOptions,
    companyDisabled,
    filtersReady,
    handleCompanyChange,
    handleBranchChange,
  } = useCompanyBranchFilters();

  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState("driver_name");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [viewMode, setViewMode] = useState("Daily View");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [summary, setSummary] = useState({});
  const [rows, setRows] = useState([]);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const [schedulePreview, setSchedulePreview] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [committingAi, setCommittingAi] = useState(false);
  const [resetCommandBar, setResetCommandBar] = useState(false);

  const weekdays = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const fetchSchedule = async () => {
    if (!companyId || (isBranchScopedUser && !branchId)) return;
    setLoading(true);
    try {
      const response = await getDriverScheduleData({
        companyId,
        branchId: branchId || null,
        weekStart: format(weekStart, "yyyy-MM-dd"),
        searchText: searchText || null,
        sortColumn,
        sortDirection,
        pageNumber,
        pageSize,
      });
      setSummary(response.data?.summary || {});
      setRows(response.data?.rows || []);
      setDailyBreakdown(response.data?.dailyBreakdown || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
    } catch (error) {
      console.error("Failed to load driver schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filtersReady) return;
    fetchSchedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- search applies on Search button only
  }, [companyId, branchId, weekStart, pageNumber, pageSize, sortColumn, sortDirection, filtersReady]);

  const handleScheduleAiPreview = async ({ message, file }) => {
    if (!companyId || !branchId) {
      throw new Error("Select business and branch above, then run preview.");
    }
    const res = await previewDriverScheduleAi({
      message: message || "",
      companyId,
      branchId,
      file,
    });
    if (!res.success) {
      throw new Error(res.message || "Preview failed");
    }
    setSchedulePreview(res.data);
    setPreviewOpen(true);
    return res;
  };

  const handleCommitScheduleAi = async () => {
    if (!schedulePreview?.preview?.length) return;
    const rows = schedulePreview.preview
      .filter((r) => r.ok)
      .map((r) => ({
        driver_id: r.driver_id,
        schedule_date: r.schedule_date,
        route_name: r.route_name,
        fleet_assigned: r.fleet_assigned,
        station: r.station,
        start_time: r.start_time,
        end_time: r.end_time,
        status: r.status,
        notes: r.notes || "Standard Parcel",
      }));
    if (!rows.length) return;
    setCommittingAi(true);
    try {
      const res = await commitDriverScheduleAi({
        rows,
        companyId,
        branchId,
      });
      if (!res.success) {
        throw new Error(res.message || "Commit failed");
      }
      setPreviewOpen(false);
      setSchedulePreview(null);
      setResetCommandBar((x) => !x);
      await fetchSchedule();
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Could not apply schedules.");
    } finally {
      setCommittingAi(false);
    }
  };

  const dayMap = useMemo(() => {
    const map = {};
    dailyBreakdown.forEach((item) => {
      map[item.schedule_date] = item;
    });
    return map;
  }, [dailyBreakdown]);

  const weeklyByDriver = useMemo(() => {
    const grouped = {};
    rows.forEach((row) => {
      const dateKey = row.schedule_date ? format(new Date(row.schedule_date), "yyyy-MM-dd") : null;
      if (!grouped[row.driver_name]) {
        grouped[row.driver_name] = { name: row.driver_name, days: {} };
      }
      if (dateKey) grouped[row.driver_name].days[dateKey] = row;
    });
    return Object.values(grouped);
  }, [rows]);

  const dailyRows = useMemo(
    () => rows.filter((row) => row.schedule_date && format(new Date(row.schedule_date), "yyyy-MM-dd") === selectedDate),
    [rows, selectedDate]
  );
  const weekLabel = useMemo(() => {
    const dayOfMonth = Number(format(weekStart, "d"));
    const weekNo = Math.max(1, Math.ceil(dayOfMonth / 7));
    return `Week# ${String(weekNo).padStart(2, "0")}`;
  }, [weekStart]);
  const weekRangeLabel = useMemo(
    () => `${format(weekStart, "MMM dd")} - ${format(addDays(weekStart, 6), "MMM dd, yyyy")}`,
    [weekStart]
  );

  const getStatusClass = (status) => {
    const normalized = (status || "").toLowerCase();
    if (normalized.includes("route") || normalized.includes("active")) return "bg-green-50 text-green-700 border-green-200";
    if (normalized.includes("rescue") || normalized.includes("break")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (normalized.includes("standby")) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Driver Schedule</h2>
          <div className="flex items-center gap-2">
            {viewMode === "Daily View" ? (
              <>
            <button
              className="rounded border px-3 py-2 text-sm"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              Prev Week
            </button>
            <button
              className="rounded border px-3 py-2 text-sm"
              onClick={() => setWeekStart(addDays(weekStart, 7))}
            >
              Next Week
            </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Dropdown
            options={companyOptions}
            value={companyId}
            disabled={companyDisabled}
            onChange={async (value) => {
              await handleCompanyChange(value);
              setPageNumber(1);
            }}
            placeholder="Select Business"
            className="w-full min-w-0 sm:w-52"
          />
          <Dropdown
            options={branchOptions}
            value={branchId}
            disabled={!companyId}
            onChange={(value) => {
              handleBranchChange(value);
              setPageNumber(1);
            }}
            placeholder="Select Branch"
            className="w-full min-w-0 sm:w-52"
          />
          <input
            className="h-10 min-w-0 flex-1 rounded border px-3 text-sm sm:max-w-xs sm:flex-initial"
            placeholder="Search driver"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <button
            className="h-10 rounded bg-indigo-600 px-4 text-sm font-medium text-white"
            onClick={() => {
              setPageNumber(1);
              fetchSchedule();
            }}
          >
            Search
          </button>
          <select
            className="h-10 rounded border px-3 text-sm"
            value={viewMode}
            onChange={(event) => setViewMode(event.target.value)}
          >
            <option>Daily View</option>
            <option>Weekly View</option>
          </select>
        </div>

        {canUseScheduleAi ? (
          <div className="mb-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 relative z-10">
            <p className="mb-2 text-sm font-medium text-gray-800">Schedule assistant</p>
            <p className="mb-2 text-xs text-gray-600">
              Select <strong>business</strong> and <strong>branch</strong> above. Press <strong>Enter</strong> to open the
              preview modal. Use natural-language lines (semicolon or blank line between rows), or attach a{" "}
              <strong>CSV</strong> (columns:{" "}
              <code className="rounded bg-white px-1">
                driver_id or driver_name, schedule_date, start_time, end_time, route_name, fleet_assigned, station, status,
                notes
              </code>
              ).
            </p>
            <AICommandBar
              accept=".csv,text/csv"
              placeholder='e.g. driver "Alex Rivera" date 2026-05-12 route Route A fleet CDV station WAK-1 09:15-18:00 status Route'
              onExecute={handleScheduleAiPreview}
              onSuccess={() => {}}
              onError={() => {}}
              resetTrigger={resetCommandBar}
            />
          </div>
        ) : null}

        {viewMode === "Daily View" && (
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded bg-orange-50 p-3">
            <p className="text-xs text-gray-500">Total Routes Scheduled</p>
            <p className="text-2xl font-bold text-gray-800">{summary.totalRoutesScheduled || 0}</p>
          </div>
          <div className="rounded bg-blue-50 p-3">
            <p className="text-xs text-gray-500">Total Drivers Scheduled</p>
            <p className="text-2xl font-bold text-gray-800">{summary.totalDriversScheduled || 0}</p>
          </div>
          <div className="rounded bg-indigo-50 p-3">
            <p className="text-xs text-gray-500">Station Routes</p>
            <p className="text-2xl font-bold text-gray-800">{summary.activeRoutes || 0}</p>
          </div>
        </div>
        )}

        {viewMode === "Daily View" ? (
        <div className="overflow-x-auto rounded border">
          <div className="flex items-center justify-between border-b bg-gray-50 px-3 py-2">
            <p className="text-sm font-semibold text-gray-700">Driver Schedule</p>
            <select
              className="h-8 rounded border px-2 text-sm"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
            >
              {weekdays.map((day) => (
                <option key={day.toISOString()} value={format(day, "yyyy-MM-dd")}>
                  {format(day, "EEE, MMM d")}
                </option>
              ))}
            </select>
          </div>
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {[
                  ["driver_name", "Driver Name"],
                  ["driver_id", "ID"],
                  ["fleet_assigned", "Fleet Assigned"],
                  ["route_name", "Schedule Route"],
                  ["status", "Status"],
                  ["station", "Station"],
                  ["start_time", "Start-End Time"],
                ].map(([key, label]) => (
                  <th
                    key={key}
                    className="cursor-pointer p-3 text-left"
                    onClick={() => {
                      if (sortColumn === key) {
                        setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
                      } else {
                        setSortColumn(key);
                        setSortDirection("ASC");
                      }
                    }}
                  >
                    {label}
                  </th>
                ))}
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-4">Loading...</td></tr>
              ) : dailyRows.length ? (
                dailyRows.map((row) => (
                  <tr key={row.schedule_id} className="border-t">
                    <td className="p-3">{row.driver_name}</td>
                    <td className="p-3">{row.driver_id}</td>
                    <td className="p-3">{row.fleet_assigned}</td>
                    <td className="p-3">{row.route_name}</td>
                    <td className="p-3">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getStatusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-3">{row.station}</td>
                    <td className="p-3">{row.start_time} - {row.end_time}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-3 text-gray-400">
                        <FaEdit className="cursor-pointer hover:text-indigo-600" />
                        <FaTrash className="cursor-pointer hover:text-red-600" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="p-4 text-center text-gray-400">No schedule data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="overflow-x-auto rounded border bg-white">
            <div className="border-b border-indigo-100 bg-indigo-50 px-3 py-2 text-center">
              <div className="flex items-center justify-center gap-4 text-indigo-700">
                <button
                  className="rounded px-2 py-1 hover:bg-indigo-100"
                  onClick={() => setWeekStart(addDays(weekStart, -7))}
                >
                  &#8249;
                </button>
                <p className="font-semibold">
                  {weekLabel} <span className="ml-2 font-normal">{weekRangeLabel}</span>
                </p>
                <button
                  className="rounded px-2 py-1 hover:bg-indigo-100"
                  onClick={() => setWeekStart(addDays(weekStart, 7))}
                >
                  &#8250;
                </button>
              </div>
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-white">
                <tr className="text-gray-500">
                  <th className="w-56 p-3 text-left font-semibold"> </th>
                  {weekdays.map((day, index) => (
                    <th key={day.toISOString()} className="p-3 text-left font-semibold">
                      <div className="flex items-center justify-between">
                        <span>{format(day, "EEE, MMM dd")}</span>
                        {index < weekdays.length - 1 ? <span className="text-gray-400">&#8942;</span> : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {["workBlocks", "associations", "extraTime"].map((metric) => (
                  <tr key={metric} className="border-t align-top">
                    <td className="p-3 text-gray-600 font-semibold">
                      {metric === "workBlocks" ? "Work Block Rostered" : metric === "associations" ? "Schedule Association" : "Voluntary Extra Time"}
                    </td>
                    {weekdays.map((day) => {
                      const key = format(day, "yyyy-MM-dd");
                      const value = dayMap[key]?.[metric] ?? 0;
                      return (
                        <td key={key} className="p-3 text-gray-500 font-semibold">
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {weeklyByDriver.length ? weeklyByDriver.map((driver) => (
                  <tr key={driver.name} className="border-t align-top">
                    <td className="p-3">
                      <p className="font-semibold text-indigo-700">{driver.name}</p>
                      <p className="text-xs text-gray-500">Standard Parcel</p>
                      <p className="text-xs text-gray-400">10h / 20h</p>
                    </td>
                    {weekdays.map((day) => {
                      const key = format(day, "yyyy-MM-dd");
                      const item = driver.days[key];
                      return (
                        <td key={key} className="p-2 align-top">
                          {item ? (
                            <div className={`min-w-[130px] rounded border p-2 text-xs ${getStatusClass(item.status)}`}>
                              <p className="font-semibold">{item.start_time} - {item.end_time}</p>
                              <p>{item.route_name}</p>
                              <p className="text-[11px] opacity-80">{item.notes || "Standard Parcel"}</p>
                            </div>
                          ) : (
                            <div className="h-16 rounded border border-dashed border-gray-200 bg-gray-50/40" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-gray-400">
                      No weekly schedule data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ScheduleAiPreviewModal
        open={previewOpen}
        onClose={() => {
          if (!committingAi) {
            setPreviewOpen(false);
          }
        }}
        previewBlocks={schedulePreview?.preview || []}
        summary={schedulePreview?.summary}
        hints={schedulePreview?.hints || []}
        onConfirm={handleCommitScheduleAi}
        committing={committingAi}
      />

      {viewMode === "Daily View" && (
      <Pagination
        currentPage={pageNumber}
        totalPages={Math.max(1, Math.ceil(totalRecords / pageSize))}
        totalEntries={totalRecords}
        pageSize={pageSize}
        onPageChange={setPageNumber}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPageNumber(1);
        }}
      />
      )}
    </div>
  );
};

export default DriverSchedule;
