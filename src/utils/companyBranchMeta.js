/**
 * Derives per-company branch counts from a flat branch list (expects company_id on each branch).
 * Marks companies with zero branches as disabled for dropdown usage.
 */
export function withBranchCounts(companyList, branchList) {
  const counts = {};
  for (const b of branchList || []) {
    const cid = b.company_id != null ? String(b.company_id) : "";
    if (!cid) continue;
    counts[cid] = (counts[cid] || 0) + 1;
  }
  return (companyList || []).map((c) => {
    const n = counts[String(c.id)] ?? 0;
    return {
      ...c,
      branchCount: n,
      disabled: n === 0,
    };
  });
}
