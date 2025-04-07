export const dynamic = "force-dynamic"; // Disable caching
export const revalidate = 0; // No revalidation

import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// GET tasks by challenge_id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");
    const day = searchParams.get("day");


    if (!challengeId) {
      return NextResponse.json({ error: "Challenge ID is required" }, { status: 400 });
    }

    const { data: tasksData, error } = await supabase
      .from("challenge_tasks")
      .select('*')
      .eq("challenge_id", challengeId)
      .order("day", { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      tasks: tasksData || []
    });

  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
