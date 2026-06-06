import Link from "next/link";
import { CalendarDays, ChevronRight, Clock3, Sparkles, Users, ShieldCheck, ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

type EventSummary = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

const pillars = [
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Fast setup",
    description: "Create an event, add a first date, and share it in seconds.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Simple voting",
    description: "Friends vote yes, no, or maybe with no account required.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Clear outcome",
    description: "The best date rises to the top automatically.",
  },
];

async function getEvents(): Promise<EventSummary[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from("events")
    .select("id, title, description, created_at")
    .order("created_at", { ascending: false });

  return data || [];
}

export default async function Home() {
  const events = await getEvents();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,212,170,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_24%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(135deg,_rgba(0,212,170,0.18),_rgba(16,185,129,0.06),_transparent)] blur-3xl" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-8 md:px-6 md:py-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">Group Date Planner</p>
              <p className="text-xs text-muted-foreground">Plan, vote, decide</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground">
                Admin
              </Button>
            </Link>
            <Link href="/create">
              <Button size="sm" className="gap-2">
                Create event
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
              <Sparkles className="h-4 w-4" />
              Easier group planning, better looking by default
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
              Pick a date everyone can live with.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              Create a private planning page, share it with your group, and let the best date rise naturally from votes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/create">
                <Button size="lg" className="h-12 gap-2 px-6 text-base">
                  Start planning
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#events">
                <Button size="lg" variant="outline" className="h-12 gap-2 px-6 text-base">
                  View events
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <Card className="border-white/10 bg-white/5 shadow-2xl shadow-primary/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-xl">How it works</CardTitle>
              <CardDescription>Three steps from idea to decision.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pillars.map((pillar) => (
                <div key={pillar.title} className="flex gap-4 rounded-2xl border border-white/8 bg-black/10 p-4">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    {pillar.icon}
                  </div>
                  <div>
                    <h2 className="font-medium">{pillar.title}</h2>
                    <p className="text-sm text-muted-foreground">{pillar.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="events" className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Your events</p>
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Recent planning rooms</h2>
            </div>
            <Link href="/create" className="hidden md:block">
              <Button variant="ghost" className="gap-2 text-muted-foreground">
                New event
                <CalendarDays className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {events.length === 0 ? (
            <Card className="border-dashed border-white/15 bg-white/3">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PlayCircle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-medium">No events yet</h3>
                  <p className="mt-2 max-w-md text-muted-foreground">
                    Create your first planning page to start collecting votes.
                  </p>
                </div>
                <Link href="/create">
                  <Button className="gap-2">
                    Create your first event
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <Link key={event.id} href={`/event/${event.id}`} className="group">
                  <Card className="h-full border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/7 hover:shadow-2xl hover:shadow-primary/10">
                    <CardHeader className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                          <Clock3 className="h-3 w-3" />
                          Active room
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                      <CardTitle className="text-2xl leading-tight">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2 min-h-10 text-sm">
                        {event.description || "No description added yet."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between pb-6 text-sm text-muted-foreground">
                      <span>Created {new Date(event.created_at).toLocaleDateString()}</span>
                      <span className="text-primary">Open room</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
