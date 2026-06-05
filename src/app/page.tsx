import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Users, ArrowRight, Sparkles, Shield } from "lucide-react";

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
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-8">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Group Date Planning Made Simple</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Find the Perfect Date<br />for Your Group
          </h1>
<p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Create events, suggest dates, and let your friends vote.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create"><Button size="lg" className="h-12 px-8 text-base">Create Event<ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
          </div>
          <div className="mt-6">
            <Link href="/admin"><Button variant="link" className="text-sm text-muted-foreground">Admin Login</Button></Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="border-0 bg-card/50 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4"><CalendarDays className="h-6 w-6 text-primary" /></div>
              <CardTitle className="text-xl">Easy Setup</CardTitle>
              <CardDescription>Create an event in seconds</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-card/50 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4"><Users className="h-6 w-6 text-primary" /></div>
              <CardTitle className="text-xl">Vote Together</CardTitle>
              <CardDescription>Friends vote on dates</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-0 bg-card/50 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4"><Shield className="h-6 w-6 text-primary" /></div>
              <CardTitle className="text-xl">Real Results</CardTitle>
              <CardDescription>See the best date</CardDescription>
            </CardHeader>
          </Card>
        </div>
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Your Events</h2>
            <Link href="/create"><Button variant="ghost" className="gap-2">Create New<CalendarDays className="h-4 w-4" /></Button></Link>
          </div>
          {events.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">No events yet.</p>
                <Link href="/create"><Button>Create Event</Button></Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all">
                  <CardHeader><CardTitle className="text-xl">{event.title}</CardTitle></CardHeader>
                  <CardContent>
                    <Link href={"/event/" + event.id}><Button variant="outline" className="w-full">View Event</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
