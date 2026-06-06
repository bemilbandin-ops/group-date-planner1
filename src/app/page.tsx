import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Shield, Sparkles } from "lucide-react";
import { FeatureSection } from "@/components/feature-cards";
import { supabase } from "@/lib/supabase";

interface Event {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default async function Home() {
  let events: Event[] = [];

  if (supabase) {
    try {
      const { data } = await supabase
        .from("events")
        .select(`
          id, title, description, created_at
        `)
        .order("created_at", { ascending: false });

      events = data || [];
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <FeatureSection
          title="Group Date Planning Made Simple"
          description="Create events, suggest dates, and let your friends vote. The best date wins based on real-time results."
          features={[
            {
              icon: <CalendarDays className="h-6 w-6 text-primary" />,
              title: "Easy Setup",
              description: "Create an event in seconds",
              href: "/create",
            },
            {
              icon: <Users className="h-6 w-6 text-primary" />,
              title: "Vote Together",
              description: "Friends vote on dates",
              href: "/create",
            },
            {
              icon: <Shield className="h-6 w-6 text-primary" />,
              title: "Real Results",
              description: "See the best date",
              href: "/create",
            },
          ]}
        />
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Events</h2>
            <Link href="/create">
              <Button variant="ghost" className="gap-2">
                Create New<CalendarDays className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-4">No events yet.</p>
              <Link href="/create">
                <Button>Create Event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="group block hover:shadow-lg transition-shadow"
                >
                  <div className="bg-card/50 p-6 rounded-xl hover:bg-card/70 transition-colors">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground">{event.description || "No description"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
