const ScheduleAiPreviewModal = ({
  open,
  onClose,
  previewBlocks,
  summary,
  hints,
  onConfirm,
  committing,
}) => {
  if (!open) return null;

  const validRows = (previewBlocks || []).filter((r) => r.ok);
  const invalidRows = (previewBlocks || []).filter((r) => !r.ok);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl flex flex-col">
        <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Preview schedule changes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Review rows before applying. Existing entries for the same driver and date will be replaced.
            </p>
          </div>
          <button type="button" className="text-gray-500 hover:text-gray-800 text-sm" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
          {summary ? (
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-800">{summary.validRows ?? 0}</span> valid row(s) out of{" "}
              <span className="font-medium">{summary.totalBlocks ?? 0}</span> block(s).
            </p>
          ) : null}

          {hints?.length ? (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              {hints.map((h, i) => (
                <p key={i}>{h}</p>
              ))}
            </div>
          ) : null}

          {validRows.length > 0 ? (
            <div className="overflow-x-auto rounded border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="p-2">Driver</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Route</th>
                    <th className="p-2">Fleet</th>
                    <th className="p-2">Station</th>
                    <th className="p-2">Time</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validRows.map((row, idx) => (
                    <tr key={`${row.driver_id}-${row.schedule_date}-${idx}`} className="border-t border-gray-100">
                      <td className="p-2 font-medium text-gray-900">{row.driver_name}</td>
                      <td className="p-2">{row.schedule_date}</td>
                      <td className="p-2">{row.route_name}</td>
                      <td className="p-2">{row.fleet_assigned}</td>
                      <td className="p-2">{row.station}</td>
                      <td className="p-2 whitespace-nowrap">
                        {row.start_time} – {row.end_time}
                      </td>
                      <td className="p-2">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No valid schedule rows to apply. Adjust your command and try again.</p>
          )}

          {invalidRows.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Could not resolve</p>
              <ul className="list-disc pl-5 text-xs text-red-600 space-y-1">
                {invalidRows.map((row, i) => (
                  <li key={i}>
                    {(row.warnings || []).join(" ") || "Unresolved driver or invalid fields."}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="border-t border-gray-200 px-4 py-3 flex justify-end gap-2 bg-gray-50">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={committing}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            onClick={onConfirm}
            disabled={committing || validRows.length === 0}
          >
            {committing ? "Applying…" : "Apply schedules"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleAiPreviewModal;
