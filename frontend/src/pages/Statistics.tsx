import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GenresCard, KpiRow, StatusCard } from "@/components/stats/stats-parts";
import { useAuth } from "@/contexts/auth-provider";
import { userstats } from "@/lib/api";
import type { userStats } from "@shared/types/show";

function Message({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <Card role="status">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{text}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true" aria-label="Loading statistics">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px]" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-56" />
    </div>
  );
}

export default function Statistics() {
  const { user } = useAuth();
  const username = user?.username;
  const [stats, setStats] = useState<userStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const res = await userstats({ username });
      setStats(res.stats ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  let body: React.ReactNode;
  if (!username) {
    body = (
      <Message title="Sign in to see your statistics" text="Your statistics are built from your own watch list.">
        <Link to="/login" className={buttonVariants()}>
          Sign in
        </Link>
      </Message>
    );
  } else if (loading) {
    body = <StatsSkeleton />;
  } else if (error) {
    body = (
      <Message title="Couldn't load your statistics" text={error}>
        <Button variant="outline" onClick={load}>
          Try again
        </Button>
      </Message>
    );
  } else if (!stats || Number(stats.total_entries) === 0) {
    body = (
      <Message title="Nothing to show yet" text="Add shows and movies to your lists and your statistics will appear here.">
        <Link to="/search" className={buttonVariants()}>
          Find something to watch
        </Link>
      </Message>
    );
  } else {
    body = (
      <div className="space-y-4">
        <KpiRow stats={stats} />
        <StatusCard stats={stats} />
        <GenresCard stats={stats} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-grow space-y-6 px-4 py-8 text-foreground">
      <header>
        <h1 className="text-3xl font-semibold">Statistics</h1>
        <p className="text-sm text-muted-foreground">
          {username ? `A look at ${username}'s watch list` : "Your watch list at a glance"}
        </p>
      </header>
      {body}
    </div>
  );
}
