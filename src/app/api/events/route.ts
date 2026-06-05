import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured. Check .env.local file." },
        { status: 500 }
      );
    }

    const { data } = await supabase
      .from('events')
      .select('id, title, description, created_at')
      .order('created_at', { ascending: false });

    return NextResponse.json({ events: data || [] });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured. Check .env.local file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title, description, date, time, suggestedBy } = body;

    if (!title || !date || !suggestedBy) {
      return NextResponse.json(
        { error: "Missing required fields: title, date, or suggestedBy" },
        { status: 400 }
      );
    }

    // Validate that the date is not in the past using string comparison
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (date < todayStr) {
      return NextResponse.json(
        { error: "Cannot create event with a past date" },
        { status: 400 }
      );
    }

    // Validate year is exactly 4 digits
    const yearMatch = date.match(/^\d{4}-\d{2}-\d{2}$/);
    if (!yearMatch) {
      return NextResponse.json(
        { error: "Invalid date format. Year must be exactly 4 digits (YYYY-MM-DD)" },
        { status: 400 }
      );
    }

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({ title, description: description || null })
      .select()
      .single();

    if (eventError || !event) {
      console.error("Error creating event:", eventError);
      return NextResponse.json(
        { error: `Failed to create event: ${eventError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Create the initial date suggestion
    const { data: suggestion, error: suggestionError } = await supabase
      .from('date_suggestions')
      .insert({
        event_id: event.id,
        date,
        time: time || null,
        suggested_by: suggestedBy
      })
      .select()
      .single();

    if (suggestionError) {
      console.error("Error creating suggestion:", suggestionError);
      return NextResponse.json(
        { error: `Event created but failed to add date suggestion: ${suggestionError.message}` },
        { status: 500 }
      );
    }

    // Auto-vote "Yes" for the user who suggested the date
    if (suggestion) {
      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          suggestion_id: suggestion.id,
          voter_name: suggestedBy,
          vote_type: 'yes'
        });

      if (voteError) {
        console.error("Error creating auto-vote:", voteError);
      }
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}