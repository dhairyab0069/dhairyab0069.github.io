// Journey progress: how far along the main line of stages I am.
//
// Each chapter has a status: "done", "current" or "planned". Optional branches
// (the postdoc) are left out of the totals, because they may never happen, and are
// reported separately. "Reached" counts every stage that is done or in progress;
// "completed" counts only the finished ones.

/** Totals for a list of chapters `{ id, status, branch? }`. Unknown statuses count as planned. */
export function progress(chapters) {
  const main = chapters.filter(c => !c.branch);
  const optional = chapters.filter(c => c.branch);
  const completed = main.filter(c => c.status === 'done').length;
  const reached = completed + main.filter(c => c.status === 'current').length;
  const total = main.length;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  return { total, completed, reached, optional: optional.length, completedPct: pct(completed), reachedPct: pct(reached) };
}
