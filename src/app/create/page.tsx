'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Sparkles, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const today = new Date().toISOString().split('T')[0];

export default function CreateEventPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState(today);

  const formHint = useMemo(() => {
    if (!name || !date) return 'Add the essentials to get started.';
    return `Ready to create a planning room for ${name}.`;
  }, [date, name]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const selectedDate = String(formData.get('date') || '').trim();
    const time = String(formData.get('time') || '').trim();
    const suggestedBy = String(formData.get('suggestedBy') || '').trim();

    if (!title || !selectedDate || !suggestedBy) {
      setError('Fill out the title, your name, and the first date.');
      setLoading(false);
      return;
    }

    if (selectedDate < today) {
      setError('Choose today or a future date.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date: selectedDate,
          time: time || null,
          suggestedBy,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Unable to create event.');
        setLoading(false);
        return;
      }

      router.push(`/event/${data.event.id}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Network error.');
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-6 md:py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.15),_transparent_30%),radial-gradient(circle_at_90%_20%,_rgba(56,189,248,0.12),_transparent_22%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-8">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
              <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                Create a new planning room
              </div>
              <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight md:text-6xl">
                Start with one date. Let the group shape the rest.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground md:text-lg">
                Keep it focused: name the event, add a starting option, and share a clean page that people actually want to use.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <CalendarDays className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">One-page setup</p>
                <p className="mt-1 text-sm text-muted-foreground">No extra steps or clutter.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                <Clock3 className="h-5 w-5 text-primary" />
                <p className="mt-3 font-medium">Fast sharing</p>
                <p className="mt-1 text-sm text-muted-foreground">Create, copy, and send the link.</p>
              </div>
            </div>
          </section>

          <Card className="surface-strong border-white/10 shadow-2xl shadow-black/20">
            <CardHeader className="space-y-3 border-b border-white/10 pb-6">
              <CardTitle className="text-3xl">Create event</CardTitle>
              <CardDescription className="text-base">Set the room up once. Voting starts immediately.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {error ? (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : (
                <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
                  {formHint}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Event title</Label>
                  <Input id="title" name="title" placeholder="Team dinner, weekend trip, birthday night" className="h-12 rounded-2xl bg-black/10 px-4" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Input id="description" name="description" placeholder="Optional context, neighborhood, or idea" className="h-12 rounded-2xl bg-black/10 px-4" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suggestedBy" className="text-sm font-medium">Your name</Label>
                  <Input id="suggestedBy" name="suggestedBy" value={name} onChange={(event) => setName(event.target.value)} placeholder="Who is setting this up?" className="h-12 rounded-2xl bg-black/10 px-4" required />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">First date</Label>
                    <Input id="date" name="date" type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} className="h-12 rounded-2xl bg-black/10 px-4" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">Time</Label>
                    <Input id="time" name="time" type="time" className="h-12 rounded-2xl bg-black/10 px-4" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-muted-foreground">
                  <User className="mb-2 h-4 w-4 text-primary" />
                  The first suggestion is auto-voted as yes by the creator.
                </div>

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button type="submit" size="lg" className="h-12 flex-1 gap-2 rounded-2xl text-base" disabled={loading}>
                    {loading ? 'Creating...' : 'Create event'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Link href="/" className="sm:w-auto">
                    <Button type="button" variant="outline" size="lg" className="h-12 w-full rounded-2xl text-base">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
