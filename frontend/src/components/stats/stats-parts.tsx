import { Cell, Pie, PieChart } from "recharts";
import { CheckCircle2, Clapperboard, Percent, Star } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { userStats } from "@shared/types/show";

const STATUSES = [
  { key: "watching", label: "Watching", color: "hsl(var(--chart-1))", field: "watching_count" },
  { key: "completed", label: "Completed", color: "hsl(var(--chart-3))", field: "completed_count" },
  { key: "planToWatch", label: "Plan to Watch", color: "hsl(var(--chart-5))", field: "plan_to_watch_count" },
  { key: "onHold", label: "On Hold", color: "hsl(var(--chart-4))", field: "on_hold_count" },
  { key: "dropped", label: "Dropped", color: "hsl(var(--chart-2))", field: "dropped_count" },
] as const;

const chartConfig = Object.fromEntries(STATUSES.map((s) => [s.key, { label: s.label, color: s.color }])) satisfies ChartConfig;

const num = (v: unknown) => Number(v) || 0;

/** "Drama (4), Comedy (2)" -> [{ name: "Drama", count: 4 }, ...] */
function parseGenres(raw: string | null | undefined) {
  if (!raw) return [];
  return raw
    .split(", ")
    .map((part) => /^(.*) \((\d+)\)$/.exec(part))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => ({ name: m[1], count: Number(m[2]) }));
}

function Kpi({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="rounded-md bg-muted p-2 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold leading-tight tabular-nums">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function KpiRow({ stats }: { stats: userStats }) {
  const total = num(stats.total_entries);
  const completed = num(stats.completed_count);
  const score = stats.mean_score == null ? null : Number(stats.mean_score);
  const rate = total ? Math.round((completed / total) * 100) : 0;
  return (
    <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi icon={<Clapperboard className="h-5 w-5" />} label="Total entries" value={String(total)} />
      <Kpi icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={String(completed)} />
      <Kpi icon={<Percent className="h-5 w-5" />} label="Completion rate" value={`${rate}%`} hint="of all entries" />
      <Kpi
        icon={<Star className="h-5 w-5" />}
        label="Average score"
        value={score === null || Number.isNaN(score) ? "—" : score.toFixed(1)}
        hint={score === null ? "No scores yet" : "out of 10"}
      />
    </section>
  );
}

export function StatusCard({ stats }: { stats: userStats }) {
  const total = num(stats.total_entries);
  const data = STATUSES.map((s) => ({ ...s, count: num(stats[s.field]) }));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Watch list status</CardTitle>
        <CardDescription>How your entries are split across lists</CardDescription>
      </CardHeader>
      <CardContent className="grid items-center gap-6 sm:grid-cols-[220px_1fr]">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[220px]">
          <PieChart accessibilityLayer>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <Pie data={data} dataKey="count" nameKey="key" innerRadius={62} outerRadius={90} strokeWidth={3}>
              {data.map((d) => (
                <Cell key={d.key} fill={`var(--color-${d.key})`} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul className="space-y-3">
          {data.map((d) => {
            const pct = total ? Math.round((d.count / total) * 100) : 0;
            return (
              <li key={d.key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: d.color }} aria-hidden="true" />
                    {d.label}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {d.count} · {pct}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: d.color }} />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

export function GenresCard({ stats }: { stats: userStats }) {
  const genres = parseGenres(stats.top_genres);
  const max = Math.max(1, ...genres.map((g) => g.count));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top genres</CardTitle>
        <CardDescription>Most common genres among your completed shows</CardDescription>
      </CardHeader>
      <CardContent>
        {genres.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Complete a few shows and your favourite genres will appear here.
          </p>
        ) : (
          <ol className="space-y-3">
            {genres.map((g, i) => (
              <li key={g.name} className="grid grid-cols-[1.5rem_7rem_1fr_2rem] items-center gap-2 text-sm">
                <span className="tabular-nums text-muted-foreground">{i + 1}</span>
                <span className="truncate">{g.name}</span>
                <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(g.count / max) * 100}%` }} />
                </div>
                <span className="text-right tabular-nums">{g.count}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
