// The problems #4471 holds, one ticket each. causes.ts tells `parser` from `hint` by tenant; a report the
// desk read as a one-day move (desk-notes.json) is neither: its date moved by a day, not by a month.
import notes from '#lib/data/desk-notes.json';
import { causeOf, CAUSES, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';
export const PROBLEMS: readonly Problem[] = [...CAUSES, 'one-day'];

// Where each problem is tracked: the issues that split #4471.
export const TICKET_REPO = 'https://github.com/JurekMueller/mega-s01-e03';
export const TICKETS: Record<Problem, number> = { parser: 4, hint: 5, 'one-day': 6 };

export function problemOf(
  r: Pick<Report, 'id' | 'channel'>,
  t: Tenant | undefined,
  oneDayMove: readonly string[] = notes.oneDayMove,
): Problem | null {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t);
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: number;
  // The tenant's locale, not the reporter's browser: locale → count.
  locales: Record<string, number>;
  subjects: Set<string>;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined): ProblemGroup[] {
  const byProblem = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of reports) {
    const problem = problemOf(r, tenantOf(r)) ?? 'unplaced';
    byProblem.set(problem, [...(byProblem.get(problem) ?? []), r]);
  }
  const order = [...PROBLEMS, 'unplaced'];
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        locales: rs.reduce<Record<string, number>>((n, r) => {
          const locale = tenantOf(r)?.locale ?? 'unknown';
          return { ...n, [locale]: (n[locale] ?? 0) + 1 };
        }, {}),
        subjects: new Set(rs.map((r) => r.subject)),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => order.indexOf(a.problem) - order.indexOf(b.problem));
}

// Subject lines that turn up in more than one problem: why merging on subject (decision 0001) put them in one ticket.
export function sharedSubjects(groups: ProblemGroup[]): string[] {
  const all = groups.flatMap((g) => [...g.subjects]);
  return [...new Set(all.filter((s, i) => all.indexOf(s) !== i))].sort();
}
