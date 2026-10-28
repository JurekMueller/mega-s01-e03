<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, sharedSubjects, TICKET_REPO, TICKETS } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const rows = $derived((reports as Report[]).filter((r) => r.mergedInto === ticket));
  const merged = $derived(uniqueById(rows));
  const groups = $derived(groupByProblem(merged, tenantOf));
  const shared = $derived(sharedSubjects(groups));
  const placed = $derived(groups.reduce((n, g) => n + g.reports.length, 0));
  const locales = (g: { locales: Record<string, number> }) =>
    Object.entries(g.locales)
      .sort((a, b) => b[1] - a[1])
      .map(([locale, n]) => `${locale} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>
<p class="note">
  The export has {rows.length} rows for #{ticket}; {rows.length - merged.length} reports come twice (overlapping pages).
  One id, one report.
</p>

<table>
  <thead>
    <tr><th>problem</th><th>ticket</th><th>reports</th><th>tenants</th><th>seen</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr class:unplaced={g.problem === 'unplaced'}>
        <td><code>{g.problem}</code></td>
        <td>
          {#if g.problem === 'unplaced'}none{:else}<a href="{TICKET_REPO}/issues/{TICKETS[g.problem]}">#{TICKETS[g.problem]}</a>{/if}
        </td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
      </tr>
      <tr class="detail"><td></td><td colspan="4">tenant locales: {locales(g)}</td></tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td></td><td>{placed}</td><td colspan="2">{placed === merged.length ? 'every report in exactly one ticket' : 'does not add up'}</td></tr>
  </tfoot>
</table>

<p class="note">
  {shared.length} of {new Set(merged.map((r) => r.subject)).size} subject lines turn up in more than one problem, so merging on
  subject alone could not keep them apart.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .note { color: var(--muted); font-size: 0.85em; }
  .detail td { color: var(--muted); font-size: 0.85em; border-bottom-width: 2px; }
  tfoot td { font-weight: 600; }
  .unplaced td { background: var(--warn-bg); }
</style>
