export const dynamic = 'force-dynamic';  // Disable caching for this route
export const revalidate = 0;  // Disable revalidation


import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const { data, error } = await supabase
      .from("conversations")
      .select(`
        id,
        messages,
        created_at,
        title
      `)
      .eq("user_id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversations for user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user conversations" },
      { status: 500 }
    );
  }
}
