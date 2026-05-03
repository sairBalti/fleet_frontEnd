import { useEffect, useMemo, useState } from "react";
import { getAnnualReports } from "../../services/reportsService";

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

function AnnualReports() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [businessType, setBusinessType] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getAnnualReports({ year, businessType });
      setRows(response.data || []);
    } catch (error) {
      console.error("Failed to load annual reports:", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [year, businessType]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, item) => ({
          companies: acc.companies + Number(item.companies || 0),
          branches: acc.branches + Number(item.branches || 0),
          vehicles: acc.vehicles + Number(item.vehicles || 0),
          demoRequests: acc.demoRequests + Number(item.demoRequests || 0),
        }),
        { companies: 0, branches: 0, vehicles: 0, demoRequests: 0 }
      ),
    [rows]
  );

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-800 p-6 text-white">
        <h1 className="text-2xl font-bold">Annual Reports</h1>
        <p className="mt-2 text-sm text-cyan-100">
          Year-wide monthly progression for operations and growth indicators.
        </p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm grid gap-3 md:grid-cols-3">
        <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded border px-3 py-2 text-sm">
          {[2024, 2025, 2026, 2027].map((value) => (
            <option key={value} value={value}>
              {value}
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
          className="rounded bg-cyan-700 px-3 py-2 text-sm font-semibold text-white"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Companies / Year</p>
          <p className="mt-1 text-2xl font-bold">{totals.companies}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Branches / Year</p>
          <p className="mt-1 text-2xl font-bold">{totals.branches}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Vehicles / Year</p>
          <p className="mt-1 text-2xl font-bold">{totals.vehicles}</p>
        </article>
        <article className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-slate-500">Demo Requests / Year</p>
          <p className="mt-1 text-2xl font-bold">{totals.demoRequests}</p>
        </article>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Monthly Trend</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="p-2 text-left">Month</th>
              <th className="p-2 text-left">Companies</th>
              <th className="p-2 text-left">Branches</th>
              <th className="p-2 text-left">Vehicles</th>
              <th className="p-2 text-left">Demo Requests</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-3 text-center text-slate-400">
                  No data for selected filters
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.monthNumber} className="border-b">
                  <td className="p-2">{row.monthName}</td>
                  <td className="p-2">{row.companies}</td>
                  <td className="p-2">{row.branches}</td>
                  <td className="p-2">{row.vehicles}</td>
                  <td className="p-2">{row.demoRequests}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AnnualReports;
