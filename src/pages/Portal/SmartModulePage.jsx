import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { getPortalIntelligence } from "../../services/portalService";

const businessTypes = [
  "Logistics",
  "Transportations",
  "Delivery Services",
  "Constructions",
  "Maintaniance Services",
  "Rental Services",
  "Public Transport",
];

function SmartModulePage({ title, subtitle }) {
  const [businessType, setBusinessType] = useState("Logistics");
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  const badges = useMemo(
    () => [
      "AI Enabled",
      "Role Aware",
      "Business Type Adaptive",
      "Operational Intelligence",
    ],
    []
  );

  const loadInsights = async (selectedType) => {
    setLoading(true);
    try {
      const response = await getPortalIntelligence(selectedType);
      setInsights(response.data?.insights || []);
    } catch (error) {
      console.error("Failed to load portal intelligence:", error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-blue-100">{subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <span key={badge} className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Business Type Intelligence</h2>
            <p className="text-sm text-slate-600">Load AI suggestions tuned to your business segment.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={businessType}
              onChange={(event) => setBusinessType(event.target.value)}
              className="w-full min-w-0 rounded-md border px-3 py-2 text-sm sm:w-auto"
            >
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => loadInsights(businessType)}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white sm:w-auto"
            >
              {loading ? "Loading..." : "Generate Insights"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          {insights.length === 0 ? (
            <p className="text-sm text-slate-500">
              No insights loaded yet. Select business type and click Generate Insights.
            </p>
          ) : (
            insights.map((item) => (
              <article key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {item}
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

SmartModulePage.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
};

export default SmartModulePage;
