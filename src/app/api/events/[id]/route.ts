import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !ADMIN_PASSWORD || authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured. Check .env.local file." },
        { status: 500 }
      );
    }

    await supabase
      .from('votes')
      .delete()
      .in('suggestion_id',
        (await supabase.from('date_suggestions').select('id').eq('event_id', id)).data?.map(s => s.id) || []
      );

    await supabase
      .from('date_suggestions')
      .delete()
      .eq('event_id', id);

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting event:", error);
      return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}