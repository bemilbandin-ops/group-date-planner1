import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Calendar, Clock, Users, ChevronLeft, User } from "lucide-react";

interface Vote {
  id: string;
  voter_name: string;
  vote_type: 'yes' | 'no' | 'maybe';
}

interface DateSuggestion {
  id: string;
  event_id: string;
  date: string;
  time: string | null;
  suggested_by: string;
  created_at: string;
  votes: Vote[];
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  date_suggestions: DateSuggestion[];
}

function getVoteCount(suggestion: DateSuggestion, type: 'yes' | 'no' | 'maybe') {
  return suggestion.votes.filter(v => v.vote_type === type).length;
}

function getSortedSuggestions(suggestions: DateSuggestion[]) {
  return [...suggestions].sort((a, b) => {
    const aYes = getVoteCount(a, 'yes');
    const bYes = getVoteCount(b, 'yes');
    const aNo = getVoteCount(a, 'no');
    const bNo = getVoteCount(b, 'no');
    
    if (bYes !== aYes) return bYes - aYes;
    if (aNo !== bNo) return aNo - bNo;
    return (b.votes?.length || 0) - (a.votes?.length || 0);
  });
}

function VoteBreakdown({ suggestion }: { suggestion: DateSuggestion }) {
  const yesVotes = suggestion.votes.filter(v => v.vote_type === 'yes');
  const noVotes = suggestion.votes.filter(v => v.vote_type === 'no');
  const maybeVotes = suggestion.votes.filter(v => v.vote_type === 'maybe');

  return (
    <div className="mt-4 space-y-3 text-sm">
      {yesVotes.length > 0 && (
        <div>
          <h4 className="font-semibold text-green-400 mb-1">Yes</h4>
          <div className="flex flex-wrap gap-1">
            {yesVotes.map(v => (
              <span key={v.id} className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs">
                {v.voter_name}
              </span>
            ))}
          </div>
        </div>
      )}
      {noVotes.length > 0 && (
        <div>
          <h4 className="font-semibold text-red-400 mb-1">No</h4>
          <div className="flex flex-wrap gap-1">
            {noVotes.map(v => (
              <span key={v.id} className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-xs">
                {v.voter_name}
              </span>
            ))}
          </div>
        </div>
      )}
      {maybeVotes.length > 0 && (
        <div>
          <h4 className="font-semibold text-yellow-400 mb-1">Don&apos;t Know</h4>
          <div className="flex flex-wrap gap-1">
            {maybeVotes.map(v => (
              <span key={v.id} className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs">
                {v.voter_name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let event: Event | null = null;
  
  if (supabase) {
    try {
      const { data } = await supabase
        .from('events')
        .select(`
          *,
          date_suggestions (
            *,
            votes (*)
          )
        `)
        .eq('id', id)
        .single();
      
      event = data;
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sortedSuggestions = getSortedSuggestions(event.date_suggestions || []);

  async function addVote(formData: FormData) {
    'use server';

    if (!supabase) return;

    const voterName = formData.get('voterName') as string;
    const suggestionId = formData.get('suggestionId') as string;
    const voteType = formData.get('voteType') as 'yes' | 'no' | 'maybe';

    if (!voterName || !suggestionId || !voteType) return;

    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('suggestion_id', suggestionId)
      .eq('voter_name', voterName)
      .single();

    if (existingVote) {
      await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id);
    } else {
      await supabase
        .from('votes')
        .insert({
          suggestion_id: suggestionId,
          voter_name: voterName,
          vote_type: voteType
        });
    }

    revalidatePath(`/event/${id}`);
  }

    async function addSuggestion(formData: FormData) {
    'use server';

    if (!supabase) return;

    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const suggestedBy = formData.get('suggestedBy') as string;

    if (!date || !suggestedBy) return;

    const todayStr = new Date().toISOString().split('T')[0];

    if (date < todayStr) return;

    const { data: suggestion, error: suggestionError } = await supabase
      .from('date_suggestions')
      .insert({
        event_id: id,
        date,
        time: time || null,
        suggested_by: suggestedBy
      })
      .select()
      .single();

    if (!suggestionError && suggestion) {
      await supabase
        .from('votes')
        .insert({
          suggestion_id: suggestion.id,
          voter_name: suggestedBy,
          vote_type: 'yes'
        });
    }

    revalidatePath(`/event/${id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              {event.description && (
                <p className="text-lg text-muted-foreground mb-1">{event.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Created: {new Date(event.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <CopyLinkButton />
            </div>
          </div>
        </div>

        {/* Best Date Section */}
        {sortedSuggestions.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Best Date</h2>
            </div>
            <Card className="border-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background shadow-lg">
              <CardContent className="text-center py-6 px-6">
                <Calendar className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-2">
                  {new Date(sortedSuggestions[0].date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                {sortedSuggestions[0].time && (
                  <div className="flex items-center justify-center gap-2 text-base text-primary mb-3">
                    <Clock className="h-4 w-4" />
                    {sortedSuggestions[0].time}
                  </div>
                )}
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-xl text-green-400">{getVoteCount(sortedSuggestions[0], 'yes')}</div>
                    <div className="text-muted-foreground">Yes</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-red-400">{getVoteCount(sortedSuggestions[0], 'no')}</div>
                    <div className="text-muted-foreground">No</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-xl text-yellow-400">{getVoteCount(sortedSuggestions[0], 'maybe')}</div>
                    <div className="text-muted-foreground">Maybe</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Suggested Dates Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Suggested Dates</h2>
          </div>
          
          {sortedSuggestions.length === 0 ? (
            <Card>
              <CardContent className="pt-8 pb-8 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-base text-muted-foreground">No date suggestions yet. Be the first to add one below!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedSuggestions.map((suggestion: DateSuggestion) => (
                <Card key={suggestion.id} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {new Date(suggestion.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      {suggestion.time && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Clock className="h-3 w-3" />
                          <span>{suggestion.time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>Suggested by {suggestion.suggested_by}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pt-0">
                    <div className="flex gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {getVoteCount(suggestion, 'yes')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Yes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {getVoteCount(suggestion, 'no')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">No</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                          {getVoteCount(suggestion, 'maybe')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Maybe</div>
                      </div>
                    </div>

                    {/* Visual Vote Diagram */}
                    {suggestion.votes.length > 0 && (
                      <div className="mb-4">
                        <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-700">
                          {(() => {
                            const total = suggestion.votes.length;
                            const yesCount = getVoteCount(suggestion, 'yes');
                            const noCount = getVoteCount(suggestion, 'no');
                            const maybeCount = getVoteCount(suggestion, 'maybe');
                            const yesWidth = (yesCount / total) * 100;
                            const noWidth = (noCount / total) * 100;
                            const maybeWidth = (maybeCount / total) * 100;
                            
                            return (
                              <>
                                {yesWidth > 0 && (
                                  <div 
                                    className="bg-green-500 h-full transition-all duration-300" 
                                    style={{ width: `${yesWidth}%` }}
                                    title={`Yes: ${yesCount}`}
                                  />
                                )}
                                {noWidth > 0 && (
                                  <div 
                                    className="bg-red-500 h-full transition-all duration-300" 
                                    style={{ width: `${noWidth}%` }}
                                    title={`No: ${noCount}`}
                                  />
                                )}
                                {maybeWidth > 0 && (
                                  <div 
                                    className="bg-yellow-500 h-full transition-all duration-300" 
                                    style={{ width: `${maybeWidth}%` }}
                                    title={`Maybe: ${maybeCount}`}
                                  />
                                )}
                              </>
                            );
                          })()}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                          <span className="text-green-400">{getVoteCount(suggestion, 'yes')} Yes</span>
                          <span className="text-red-400">{getVoteCount(suggestion, 'no')} No</span>
                          <span className="text-yellow-400">{getVoteCount(suggestion, 'maybe')} Maybe</span>
                        </div>
                      </div>
                    )}

                    <VoteBreakdown suggestion={suggestion} />

<form action={addVote} className="mt-4 space-y-2">
                        <input type="hidden" name="suggestionId" value={suggestion.id} />
                        <Input
                          name="voterName"
                          placeholder="Your name"
                          required
                          className="text-sm h-9"
                        />
                        <div className="grid grid-cols-3 gap-1.5">
                          <Button
                            type="submit"
                            name="voteType"
                            value="yes"
                            variant="ghost"
                            size="sm"
                            className="bg-green-900/30 hover:bg-green-900/50 text-green-300 text-xs font-medium"
                          >
                            Yes
                          </Button>
                          <Button
                            type="submit"
                            name="voteType"
                            value="no"
                            variant="ghost"
                            size="sm"
                            className="bg-red-900/30 hover:bg-red-900/50 text-red-300 text-xs font-medium"
                          >
                            No
                          </Button>
                          <Button
                            type="submit"
                            name="voteType"
                            value="maybe"
                            variant="ghost"
                            size="sm"
                            className="bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-300 text-xs font-medium"
                          >
                            Maybe
                          </Button>
                        </div>
                      </form>
                   </CardContent>
                 </Card>
               ))}
             </div>
           )}
         </section>

        {/* Add New Date Suggestion Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Add New Date Suggestion</h2>
          </div>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <form action={addSuggestion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="suggestedBy" className="text-sm font-medium">Your Name *</Label>
                    <Input
                      id="suggestedBy"
                      name="suggestedBy"
                      placeholder="Enter your name"
                      required
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">Date *</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm font-medium">Time</Label>
                    <Input
                      id="time"
                      name="time"
                      type="time"
                      className="h-10"
                    />
                  </div>
                </div>
                <Button type="submit" size="default" className="px-6">
                  Add Suggestion
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}