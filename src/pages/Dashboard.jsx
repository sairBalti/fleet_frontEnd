import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { getDashboardKpis } from "../services/dashboardService";
import Dropdown from "../components/Dropdown";
import { useCompanyBranchFilters } from "../hooks/useCompanyBranchFilters";
import { getUserData } from "../utils/auth";

const COLORS = ["#93C5FD", "#FBBF24", "#2563EB"];

function Dashboard() {
  const user = getUserData();
  const isBranchScopedUser = ["BranchManager", "Driver"].includes(user?.role);
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
  const [loading, setLoading] = useState(false);

  const [summary, setSummary] = useState({});
  const [driverProductivity, setDriverProductivity] = useState([]);
  const [routeCompliance, setRouteCompliance] = useState({});
  const [driversList, setDriversList] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const routeComplianceData = useMemo(
    () => [
      { name: "Non", value: Number(routeCompliance.non_compliant || 0) },
      { name: "Partially", value: Number(routeCompliance.partially_compliant || 0) },
      { name: "Fully", value: Number(routeCompliance.fully_compliant || 0) },
    ],
    [routeCompliance]
  );

  const fetchDashboard = async () => {
    if (!companyId || (isBranchScopedUser && !branchId)) return;
    setLoading(true);
    try {
      const response = await getDashboardKpis({
        companyId,
        branchId: branchId || null,
      });
      const payload = response.data || {};
      setSummary(payload.summary || {});
      setDriverProductivity(payload.driverProductivity || []);
      setRouteCompliance(payload.routeCompliance || {});
      setDriversList(payload.driversList || []);
      setNotifications(payload.notifications || []);
    } catch (error) {
      console.error("Failed to load dashboard KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filtersReady) return;
    fetchDashboard();
  }, [companyId, branchId, filtersReady]);

  const cardClass = "rounded-xl p-4";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4">
        <Dropdown
          options={companyOptions}
          value={companyId}
          disabled={companyDisabled}
          onChange={handleCompanyChange}
          placeholder="Select Business"
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
        <button onClick={fetchDashboard} className="h-10 rounded bg-indigo-600 px-4 text-sm font-semibold text-white">
          {loading ? "Loading..." : "Filter"}
        </button>
      </div>

      <div className="rounded-xl bg-white p-4">
        <h2 className="mb-4 text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className={`${cardClass} bg-blue-50`}>
            <p className="text-xs text-gray-500">Total Drivers</p>
            <p className="text-3xl font-bold text-gray-800">{summary.totalDrivers || 0}</p>
          </div>
          <div className={`${cardClass} bg-orange-50`}>
            <p className="text-xs text-gray-500">Drivers Attendance</p>
            <p className="text-3xl font-bold text-gray-800">{summary.driversAttendance || 0}%</p>
          </div>
          <div className={`${cardClass} bg-green-50`}>
            <p className="text-xs text-gray-500">Safety Score</p>
            <p className="text-3xl font-bold text-gray-800">{summary.safetyScore || 0}</p>
          </div>
          <div className={`${cardClass} bg-indigo-50`}>
            <p className="text-xs text-gray-500">Total Vehicles</p>
            <p className="text-3xl font-bold text-gray-800">{summary.totalVehicles || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-4 xl:col-span-2">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Driver Productivity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={driverProductivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3253DC" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-white p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Route Compliance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={routeComplianceData} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {routeComplianceData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-3 text-xs text-gray-500">
            {routeComplianceData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-xl bg-white p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Drivers List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="p-3 text-left">Driver Name</th>
                  <th className="p-3 text-left">Id Lead</th>
                  <th className="p-3 text-left">Fleet Assigned</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {driversList.length ? driversList.map((item) => (
                  <tr key={`${item.driver_name}-${item.lead_id}`} className="border-t">
                    <td className="p-3">{item.driver_name}</td>
                    <td className="p-3">{item.lead_id}</td>
                    <td className="p-3">{item.fleet_assigned}</td>
                    <td className="p-3">
                      <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-400">No drivers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">Notifications</h3>
          <div className="space-y-3">
            {notifications.length ? notifications.map((item) => (
              <div key={item.notification_id} className="rounded-lg border p-3">
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="mt-1 text-xs text-gray-500">{item.message}</p>
              </div>
            )) : (
              <p className="text-sm text-gray-500">No notifications available</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;