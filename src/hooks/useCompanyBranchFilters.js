import { useCallback, useEffect, useRef, useState } from "react";
import { getCompanyBranchLookup } from "../services/LookupService";
import { getUserData } from "../utils/auth";
import { withBranchCounts } from "../utils/companyBranchMeta";
import { readCompanyBranchFilters, writeCompanyBranchFilters } from "../utils/companyBranchStorage";

const DEFAULT_PRESET_ROLES = ["CompanyAdmin", "CompanyManager", "BranchManager", "Driver"];

function pickScopedBranch(branches, user, restoreBranchId) {
  if (!branches?.length) return "";
  if (
    restoreBranchId != null &&
    restoreBranchId !== "" &&
    branches.some((b) => String(b.id) === String(restoreBranchId))
  ) {
    return String(restoreBranchId);
  }
  if (user?.branch_id) {
    const match = branches.find((b) => String(b.id) === String(user.branch_id));
    if (match) return String(match.id);
  }
  return String(branches[0].id);
}

/**
 * Shared business / branch filters with session persistence and zero-branch company disabling.
 *
 * @param {object} options
 * @param {string[]} [options.presetRoles] Roles that auto-lock to their company (first selectable company).
 * @param {boolean} [options.branchScopedUser] Override branch-scoped detection (e.g. Maintenance page includes Maintenance role).
 */
export function useCompanyBranchFilters(options = {}) {
  const { presetRoles = DEFAULT_PRESET_ROLES, branchScopedUser: branchScopedOverride } = options;
  const user = getUserData();
  const isBranchScopedUser =
    branchScopedOverride !== undefined
      ? branchScopedOverride
      : ["BranchManager", "Driver"].includes(user?.role);

  const [companyId, setCompanyId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [companyDisabled, setCompanyDisabled] = useState(false);
  const [filtersReady, setFiltersReady] = useState(false);

  const companyIdRef = useRef("");
  useEffect(() => {
    companyIdRef.current = companyId;
  }, [companyId]);

  const persist = useCallback((c, b) => {
    writeCompanyBranchFilters(c, b);
  }, []);

  const loadBranchLookup = useCallback(
    async (nextCompanyId, restoreBranchId) => {
      if (!nextCompanyId) {
        setBranchOptions([]);
        setBranchId("");
        persist("", "");
        return;
      }
      const response = await getCompanyBranchLookup({
        companyId: nextCompanyId || null,
        returnCompanyData: false,
        returnBranchData: true,
      });
      const branches = response.data?.branchList || [];
      setBranchOptions(branches);

      if (isBranchScopedUser && branches.length > 0) {
        const pick = pickScopedBranch(branches, user, restoreBranchId);
        setBranchId(pick);
        persist(nextCompanyId, pick);
        return;
      }

      const canRestore =
        restoreBranchId != null &&
        restoreBranchId !== "" &&
        branches.some((item) => String(item.id) === String(restoreBranchId));

      if (canRestore) {
        const b = String(restoreBranchId);
        setBranchId(b);
        persist(nextCompanyId, b);
      } else {
        setBranchId("");
        persist(nextCompanyId, "");
      }
    },
    [isBranchScopedUser, persist, user]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getCompanyBranchLookup({
          returnCompanyData: true,
          returnBranchData: true,
        });
        if (cancelled) return;

        const companies = response.data?.companyList || [];
        const branches = response.data?.branchList || [];
        const augmented = withBranchCounts(companies, branches);
        setCompanyOptions(augmented);

        const persisted = readCompanyBranchFilters();
        const restoreCompanyId = persisted.companyId || "";
        const restoreBranchId = persisted.branchId || "";

        const applyPreset = presetRoles.includes(user?.role) && augmented.length > 0;

        if (applyPreset) {
          const preset = augmented.find((c) => !c.disabled);
          setCompanyDisabled(true);
          if (preset) {
            const pid = String(preset.id);
            setCompanyId(pid);
            await loadBranchLookup(pid, restoreBranchId);
          } else {
            setCompanyId("");
            setBranchId("");
            persist("", "");
          }
        } else {
          const sel = augmented.find(
            (c) => String(c.id) === restoreCompanyId && !c.disabled
          );
          if (sel) {
            const cid = String(sel.id);
            setCompanyId(cid);
            await loadBranchLookup(cid, restoreBranchId);
          } else {
            setCompanyId("");
            setBranchId("");
            persist("", "");
          }
        }
      } catch (e) {
        console.error("Company/branch lookup failed:", e);
      } finally {
        if (!cancelled) setFiltersReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount: lookup + session restore must not re-run when deps identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompanyChange = useCallback(
    async (value) => {
      setCompanyId(value);
      await loadBranchLookup(value, undefined);
    },
    [loadBranchLookup]
  );

  const handleBranchChange = useCallback(
    (value) => {
      setBranchId(value);
      persist(companyIdRef.current, value);
    },
    [persist]
  );

  return {
    companyId,
    branchId,
    companyOptions,
    branchOptions,
    companyDisabled,
    filtersReady,
    loadBranchLookup,
    handleCompanyChange,
    handleBranchChange,
    setCompanyId,
    setBranchId,
  };
}
