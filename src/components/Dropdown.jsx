import { useState, useRef, useEffect } from "react";

const Dropdown = ({
  options,
  value = "",
  onChange,
  placeholder = "Select...",
  disabled = false,
  selectClassName = "",
  /** Max height of the open list (scrolls inside). Keeps long option lists compact and aligned. */
  optionListMaxHeightClass = "max-h-48",
  /** Width of control + list panel (business/branch rows stay aligned). */
  className = "w-52",
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const baseSelectClass =
    "w-full h-10 px-4 py-2 pr-10 border rounded-md bg-white text-gray-700 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const selected = options.find((o) => String(o.id) === String(value));
  const selectionBlocked = Boolean(selected?.disabled);

  return (
    <div className={`relative min-w-0 shrink-0 ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`${baseSelectClass} flex items-center text-left ${selectClassName} ${
          selectionBlocked ? "border-gray-200 bg-gray-50 text-gray-400" : ""
        }`.trim()}
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selectionBlocked ? "text-gray-400" : selected ? "text-gray-700" : "text-gray-500"
          }`}
        >
          {selected?.name || placeholder}
        </span>
      </button>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg
          className="w-4 h-4 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
      {open && !disabled ? (
        <ul
          className={`absolute left-0 right-0 z-50 mt-1 max-w-full list-none rounded-md border border-gray-200 bg-white py-1 shadow-lg ${optionListMaxHeightClass} overflow-y-auto overflow-x-hidden`}
          role="listbox"
        >
          <li role="option">
            <button
              type="button"
              className="w-full min-w-0 px-4 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <span className="block truncate">{placeholder}</span>
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.id} role="option">
              <button
                type="button"
                disabled={Boolean(opt.disabled)}
                className={`w-full min-w-0 px-4 py-2 text-left text-sm disabled:cursor-not-allowed ${
                  opt.disabled
                    ? "text-gray-400 opacity-80"
                    : String(opt.id) === String(value)
                      ? "bg-indigo-50 text-indigo-800 font-medium hover:bg-indigo-50"
                      : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  if (opt.disabled) return;
                  onChange(String(opt.id));
                  setOpen(false);
                }}
              >
                <span className="block truncate" title={opt.name}>
                  {opt.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default Dropdown;
