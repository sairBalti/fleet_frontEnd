const STORAGE_KEY = "fleet.portal.companyBranch.v1";

export function readCompanyBranchFilters() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { companyId: "", branchId: "" };
    const o = JSON.parse(raw);
    return {
      companyId: o.companyId != null ? String(o.companyId) : "",
      branchId: o.branchId != null ? String(o.branchId) : "",
    };
  } catch {
    return { companyId: "", branchId: "" };
  }
}

export function writeCompanyBranchFilters(companyId, branchId) {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: companyId || "",
        branchId: branchId || "",
      })
    );
  } catch {
    /* ignore */
  }
}
