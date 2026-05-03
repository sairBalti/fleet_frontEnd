import { useEffect, useState } from "react";
import { getMonthlyReports } from "../../services/reportsService";

const businessTypes = [
  "",
  "Logistics",
  "Transportation",
  "Delivery Services",
  "Construction",
  "Maintenance Services",
  "Rental Services",
  "Public Transport",
];

function MonthlyReports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({});
  const [rows, setRows] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getMonthlyReports({ year, month, businessType });
      setSummary(response.data?.summary || {});
      setRows(response.data?.byBusinessType || []);
    } catch (error) {
      console.error("Failed to load monthly reports:", error);
      setSummary({});
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [year, month, businessType]);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 to-blue-800 p-6 text-white">
        <h1 className="text-2xl font-bold">Monthly Reports</h1>
        <p className="mt-2 text-sm text-blue-100">
          Monthly operational view by business type, role-scoped for your access.
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm grid gap-3 md:grid-cols-4">
        <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded border px-3 py-2 text-sm">
          {[2024, 2025, 2026, 2027].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <select value={month} onChange={(event) => setMonth(Number(event.target.value))} className="rounded border px-3 py-2 text-sm">
          {Array.from({ length: 12 }).map((_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <select
          value={businessType}
          onChange={(event) => setBusinessType(event.target.value)}
          className="rounded border px-3 py-2 text-sm"
        >
          {businessTypes.map((type) => (
            <option key={type || "all"} value={type}>
              {type || "All Business Types"}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={loadData}
          className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Companies</p>
          <p className="mt-1 text-2xl font-bold">{summary.totalCompanies ?? 0}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Branches</p>
          <p className="mt-1 text-2xl font-bold">{summary.totalBranches ?? 0}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Vehicles</p>
          <p className="mt-1 text-2xl font-bold">{summary.totalVehicles ?? 0}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Demo Requests</p>
          <p className="mt-1 text-2xl font-bold">{summary.totalDemoRequests ?? 0}</p>
        </article>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Business Type Breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-2 text-left">Business Type</th>
              <th className="p-2 text-left">Companies</th>
              <th className="p-2 text-left">Active Companies</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-3 text-center text-slate-400">
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.business_type_name} className="border-b">
                  <td className="p-2">{row.business_type_name || "-"}</td>
                  <td className="p-2">{row.companies}</td>
                  <td className="p-2">{row.activeCompanies}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default MonthlyReports;
