export const dynamic = 'force-dynamic';  // Disable caching for this route
export const revalidate = 0;  // Disable revalidation


import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";


// GET challenges
export async function GET(request: NextRequest) {
  try {
    const { data: challengesData, error } = await supabase
      .from("challenges")
      .select('*')  // Get all fields and related tasks
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      challenges: challengesData || []
    });

  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}