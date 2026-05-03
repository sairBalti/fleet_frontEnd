import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { getDriverPerformanceData } from "../../services/driverService";
import { getUserData } from "../../utils/auth";
import Pagination from "../../components/Pagination";
import Dropdown from "../../components/Dropdown";
import { useCompanyBranchFilters } from "../../hooks/useCompanyBranchFilters";

const DriverPerformance = () => {
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

  const [driverId, setDriverId] = useState("");
  const [driverOptions, setDriverOptions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [trends, setTrends] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPerformance = async () => {
    if (!companyId || (isBranchScopedUser && !branchId)) return;
    setLoading(true);
    try {
      const response = await getDriverPerformanceData({
        companyId,
        branchId: branchId || null,
        driverId: driverId || null,
        pageNumber,
        pageSize,
      });
      setProfile(response.data?.profile || null);
      setTrends(response.data?.trends || []);
      setMetrics(response.data?.metrics || []);
      setDriverOptions(response.data?.driverOptions || []);
      setTotalRecords(response.pagination?.totalRecords || 0);
      if (!driverId && response.data?.profile?.driver_id) {
        setDriverId(String(response.data.profile.driver_id));
      }
    } catch (error) {
      console.error("Failed to load driver performance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filtersReady) return;
    fetchPerformance();
  }, [companyId, branchId, driverId, pageNumber, pageSize, filtersReady]);

  const insightText = useMemo(() => {
    if (!profile) return "Insights will appear when data is available.";
    if (profile.safety_score >= 85 && profile.efficiency_score >= 85) {
      return `${profile.driver_name} is performing strongly across safety and efficiency. Keep route planning consistent and continue monthly coaching.`;
    }
    return `${profile.driver_name} has room to improve in safety/efficiency. Recommend weekly coaching, route balancing, and fuel discipline checks.`;
  }, [profile]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Dropdown
            options={companyOptions}
            value={companyId}
            disabled={companyDisabled}
            onChange={async (value) => {
              setDriverId("");
              setPageNumber(1);
              await handleCompanyChange(value);
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
              setDriverId("");
              setPageNumber(1);
            }}
            placeholder="Select Branch"
            className="w-full min-w-0 sm:w-52"
          />
          <Dropdown
            options={driverOptions}
            value={driverId}
            onChange={(value) => {
              setDriverId(value);
              setPageNumber(1);
            }}
            placeholder="Select Driver"
            className="w-full min-w-0 sm:w-52"
          />
        </div>

        {profile ? (
          <div className="mb-4 grid grid-cols-1 gap-4 rounded border bg-gray-50 p-4 md:grid-cols-5">
            <div className="col-span-2">
              <p className="text-lg font-semibold">{profile.driver_name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Driving Hours</p>
              <p className="text-lg font-semibold">{profile.total_driving_hours}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Mileage</p>
              <p className="text-lg font-semibold">{profile.total_mileage}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Completion Rate</p>
              <p className="text-lg font-semibold">{profile.completion_rate}%</p>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded border p-3">
            <p className="mb-2 text-sm font-semibold">Mileage Over Time</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip />
                <Line dataKey="mileage" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded border p-3">
            <p className="mb-2 text-sm font-semibold">Driving Hours Over Time</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip />
                <Line dataKey="driving_hours" stroke="#16A34A" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded border p-3">
            <p className="mb-2 text-sm font-semibold">Safety Score Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip />
                <Line dataKey="safety_score" stroke="#0EA5E9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded border p-3">
            <p className="mb-2 text-sm font-semibold">Efficiency Trend</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="efficiency_score" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 rounded border bg-indigo-50 p-3 text-sm text-indigo-900">
          <p className="font-semibold">Insights and Recommendations</p>
          <p className="mt-1">{insightText}</p>
        </div>

        <div className="mt-4 overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Mileage</th>
                <th className="p-3 text-left">Hours</th>
                <th className="p-3 text-left">Efficiency</th>
                <th className="p-3 text-left">Safety Score</th>
                <th className="p-3 text-left">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-4">Loading...</td></tr>
              ) : metrics.length ? (
                metrics.map((row) => (
                  <tr key={row.period_month} className="border-t">
                    <td className="p-3">{new Date(row.period_month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</td>
                    <td className="p-3">{row.mileage}</td>
                    <td className="p-3">{row.driving_hours}</td>
                    <td className="p-3">{row.efficiency_score}%</td>
                    <td className="p-3">{row.safety_score}%</td>
                    <td className="p-3">{row.completion_rate}%</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-4 text-center text-gray-400">No performance data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
    </div>
  );
};

export default DriverPerformance;
