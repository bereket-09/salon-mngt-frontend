// Single source of truth for the admin "branch selector" / multi-branch view.
//
// The selector stores the active branch id in localStorage. The sentinel value
// 'all' means the admin is viewing the AGGREGATED (all-branches-combined) view,
// which we represent to the API as "no branch filter".
//
// Always read the active branch through these helpers so every page handles the
// 'all' / aggregated case identically (this was previously inconsistent and is
// the root cause of the multi-branch confusion).

export function getSelectedBranchId() {
  const v = localStorage.getItem('selectedBranchId');
  return v && v !== 'all' ? v : null; // null => aggregated / no filter
}

export function isAggregated() {
  return localStorage.getItem('selectedBranchId') === 'all';
}

export function getSelectedBranchName() {
  return localStorage.getItem('selectedBranchName') || '';
}

// Returns a query fragment like "branchId=3" (no separator), or '' when aggregated.
export function branchParam() {
  const id = getSelectedBranchId();
  return id ? `branchId=${id}` : '';
}

// Convenience: append the branch filter to an existing query string.
// prefix is the separator to use when a filter is present ('?' or '&').
export function withBranch(prefix = '&') {
  const p = branchParam();
  return p ? `${prefix}${p}` : '';
}
