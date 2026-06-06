import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, Copy, Gauge, MessageSquareMore, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { supabase } from "@/lib/supabase";
import { getSortedSuggestions } from "@/lib/event-utils";
import { revalidatePath } from "next/cache";

type VoteRecord = {
  id: string;
  voter_name: string;
  vote_type: "yes" | "no" | "maybe";
};

type DateSuggestion = {
  id: string;
  event_id: string;
  date: string;
  time: string | null;
  suggested_by: string;
  created_at: string;
  votes: VoteRecord[];
};

type EventRecord = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  date_suggestions: DateSuggestion[];
};

export const dynamic = "force-dynamic";

async function getEvent(id: string): Promise<EventRecord | null> {
  if (!supabase) return null;

  const { data } = await supabase
    .from("events")
    .select(`
      id,
      title,
      description,
      created_at,
      date_suggestions (
        id,
        event_id,
        date,
        time,
        suggested_by,
        created_at,
        votes ( id, voter_name, vote_type )
      )
    `)
    .eq("id", id)
    .single();

  return data || null;
}

function tallyVotes(suggestion: DateSuggestion) {
  const yes = suggestion.votes.filter((vote) => vote.vote_type === "yes").length;
  const no = suggestion.votes.filter((vote) => vote.vote_type === "no").length;
  const maybe = suggestion.votes.filter((vote) => vote.vote_type === "maybe").length;
  return { yes, no, maybe, total: suggestion.votes.length };
}

function VoteChip({ label, count, tone }: { label: string; count: number; tone: "green" | "red" | "amber" }) {
  const toneClasses = {
    green: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    red: "border-rose-500/20 bg-rose-500/10 text-rose-200",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-200",
  };

  return (
    <div className={`rounded-2xl border px-3 py-2 text-center ${toneClasses[tone]}`}>
      <div className="text-xl font-semibold">{count}</div>
      <div className="text-xs uppercase tracking-[0.18em]">{label}</div>
    </div>
  );
}

function VoteBar({ suggestion }: { suggestion: DateSuggestion }) {
  const { yes, no, maybe, total } = tallyVotes(suggestion);

  if (!total) return null;

  return (
    <div className="space-y-2">
      <div className="flex h-2 overflow-hidden rounded-full bg-white/8">
        <div className="bg-emerald-400" style={{ width: `${(yes / total) * 100}%` }} />
        <div className="bg-rose-400" style={{ width: `${(no / total) * 100}%` }} />
        <div className="bg-amber-400" style={{ width: `${(maybe / total) * 100}%` }} />
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="text-emerald-200">{yes} yes</span>
        <span className="text-rose-200">{no} no</span>
        <span className="text-amber-200">{maybe} maybe</span>
      </div>
    </div>
  );
}

async function addVote(id: string, formData: FormData) {
  'use server';

  if (!supabase) return;

  const voterName = String(formData.get('voterName') || '').trim();
  const suggestionId = String(formData.get('suggestionId') || '').trim();
  const voteType = formData.get('voteType') as "yes" | "no" | "maybe" | null;

  if (!voterName || !suggestionId || !voteType) return;

  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('suggestion_id', suggestionId)
    .eq('voter_name', voterName)
    .single();

  if (existingVote) {
    await supabase.from('votes').update({ vote_type: voteType }).eq('id', existingVote.id);
  } else {
    await supabase.from('votes').insert({ suggestion_id: suggestionId, voter_name: voterName, vote_type: voteType });
  }

  revalidatePath(`/event/${id}`);
}

async function addSuggestion(id: string, formData: FormData) {
  'use server';

  if (!supabase) return;

  const suggestedBy = String(formData.get('suggestedBy') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const time = String(formData.get('time') || '').trim();

  if (!suggestedBy || !date) return;

  const { data: suggestion } = await supabase
    .from('date_suggestions')
    .insert({
      event_id: id,
      date,
      time: time || null,
      suggested_by: suggestedBy,
    })
    .select('id')
    .single();

  if (suggestion) {
    await supabase.from('votes').insert({
      suggestion_id: suggestion.id,
      voter_name: suggestedBy,
      vote_type: 'yes',
    });
  }

  revalidatePath(`/event/${id}`);
}

function formatDate(date: string, withTime = false) {
  const base = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return withTime ? base : base;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return { title: 'Event not found' };
  }

  return {
    title: `${event.title} | Group Date Planner`,
    description: event.description || 'Vote on dates and find the best time to meet.',
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const suggestions = getSortedSuggestions(event.date_suggestions || []);
  const topSuggestion = suggestions[0];

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(52,211,153,0.15),_transparent_24%),radial-gradient(circle_at_90%_20%,_rgba(56,189,248,0.12),_transparent_20%)]" />
      <div className="relative mx-auto w-full max-w-7xl space-y-8">
        <header className="surface-strong rounded-[2rem] p-5 shadow-2xl shadow-black/20 md:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                <Vote className="h-4 w-4" />
                Live planning room
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{event.title}</h1>
                {event.description && <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">{event.description}</p>}
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Created {new Date(event.created_at).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <MessageSquareMore className="h-4 w-4 text-primary" />
                  {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CopyLinkButton />
            </div>
          </div>
        </header>

        {topSuggestion && (
          <section>
            <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.24em] text-muted-foreground">
              <Gauge className="h-4 w-4 text-primary" />
              Top choice
            </div>
            <Card className="surface-strong border-white/10 shadow-2xl shadow-black/20">
              <CardContent className="grid gap-6 p-6 md:grid-cols-[1.25fr_0.75fr] md:items-center md:p-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    <CheckCircle2 className="h-3 w-3" />
                    Leading date
                  </div>
                  <h2 className="text-3xl font-semibold md:text-4xl">{formatDate(topSuggestion.date)}</h2>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {topSuggestion.time && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                        <Clock3 className="h-4 w-4 text-primary" />
                        {topSuggestion.time}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                      Suggested by {topSuggestion.suggested_by}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const tally = tallyVotes(topSuggestion);
                    return (
                      <>
                        <VoteChip label="Yes" count={tally.yes} tone="green" />
                        <VoteChip label="No" count={tally.no} tone="red" />
                        <VoteChip label="Maybe" count={tally.maybe} tone="amber" />
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Suggestions</h2>
                <p className="text-sm text-muted-foreground">Compare dates and vote in one glance.</p>
              </div>
            </div>

            {suggestions.length === 0 ? (
              <Card className="surface border-white/10">
                <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                  <CalendarDays className="h-12 w-12 text-primary/70" />
                  <h3 className="text-xl font-medium">No dates yet</h3>
                  <p className="max-w-md text-muted-foreground">Add the first suggestion and let the group start voting.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {suggestions.map((suggestion) => {
                  const tally = tallyVotes(suggestion);

                  return (
                    <Card key={suggestion.id} className="surface h-full border-white/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-black/20">
                      <CardHeader className="space-y-3 border-b border-white/10 pb-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-2xl leading-tight">{formatDate(suggestion.date)}</CardTitle>
                            {suggestion.time && (
                              <CardDescription className="mt-2 inline-flex items-center gap-2 text-sm">
                                <Clock3 className="h-4 w-4 text-primary" />
                                {suggestion.time}
                              </CardDescription>
                            )}
                          </div>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                            {suggestion.votes.length} vote{suggestion.votes.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Suggested by {suggestion.suggested_by}</p>
                      </CardHeader>
                      <CardContent className="space-y-5 pt-5">
                        <div className="grid grid-cols-3 gap-3">
                          <VoteChip label="Yes" count={tally.yes} tone="green" />
                          <VoteChip label="No" count={tally.no} tone="red" />
                          <VoteChip label="Maybe" count={tally.maybe} tone="amber" />
                        </div>

                        <VoteBar suggestion={suggestion} />

                        <form action={addVote.bind(null, id)} className="space-y-3">
                          <input type="hidden" name="suggestionId" value={suggestion.id} />
                          <div className="space-y-2">
                            <Label htmlFor={`name-${suggestion.id}`} className="text-sm font-medium">Your name</Label>
                            <Input id={`name-${suggestion.id}`} name="voterName" placeholder="Add your vote" className="h-11 rounded-2xl bg-black/10 px-4" required />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Button type="submit" name="voteType" value="yes" variant="outline" className="rounded-2xl border-emerald-500/20 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20">Yes</Button>
                            <Button type="submit" name="voteType" value="maybe" variant="outline" className="rounded-2xl border-amber-500/20 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20">Maybe</Button>
                            <Button type="submit" name="voteType" value="no" variant="outline" className="rounded-2xl border-rose-500/20 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20">No</Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="surface-strong border-white/10 shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-2xl">Add suggestion</CardTitle>
                <CardDescription>Drop in another date and auto-vote it yes.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={addSuggestion.bind(null, id)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="suggestedBy" className="text-sm font-medium">Your name</Label>
                    <Input id="suggestedBy" name="suggestedBy" placeholder="Who suggested this?" className="h-11 rounded-2xl bg-black/10 px-4" required />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                      <Input id="date" name="date" type="date" className="h-11 rounded-2xl bg-black/10 px-4" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time" className="text-sm font-medium">Time</Label>
                      <Input id="time" name="time" type="time" className="h-11 rounded-2xl bg-black/10 px-4" />
                    </div>
                  </div>
                  <Button type="submit" className="h-11 w-full rounded-2xl text-base">Add suggestion</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="surface border-white/10">
              <CardHeader>
                <CardTitle className="text-xl">Quick guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3 rounded-2xl border border-white/8 bg-black/10 p-4">
                  <Vote className="mt-0.5 h-4 w-4 text-primary" />
                  <p>Everyone can vote directly from this page.</p>
                </div>
                <div className="flex gap-3 rounded-2xl border border-white/8 bg-black/10 p-4">
                  <Gauge className="mt-0.5 h-4 w-4 text-primary" />
                  <p>Suggestions are sorted by support, then by lower opposition.</p>
                </div>
                <div className="flex gap-3 rounded-2xl border border-white/8 bg-black/10 p-4">
                  <Copy className="mt-0.5 h-4 w-4 text-primary" />
                  <p>Copy the link and share the room with your group.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
