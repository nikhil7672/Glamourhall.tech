import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// POST: Add user challenge progress
export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId } = await request.json();

    if (!userId || !challengeId) {
      return NextResponse.json({ error: "Missing userId or challengeId" }, { status: 400 });
    }

    // Check if user already started the challenge
    const { data: existingProgress, error: existingError } = await supabase
      .from("user_challenge_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .single();

    if (existingProgress) {
      return NextResponse.json({ message: "Challenge already started!" });
    }

    // Insert new progress entry
    const { data, error } = await supabase
      .from("user_challenge_progress")
      .insert([{ user_id: userId, challenge_id: challengeId, start_date: new Date().toISOString() }]);

    if (error) throw error;

    return NextResponse.json({ message: "Challenge started successfully!", progress: data });

  } catch (error) {
    console.error("Error adding user challenge progress:", error);
    return NextResponse.json({ error: "Failed to start challenge" }, { status: 500 });
  }
}

// GET: Get user challenge progress
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId");
      const challengeId = searchParams.get("challengeId");
  
      if (!userId || !challengeId) {
        return NextResponse.json({ error: "Missing userId or challengeId" }, { status: 400 });
      }
  
      // Get user's challenge progress
      const { data: progress, error: progressError } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId)
        .single();
  
      if (!progress) {
        return NextResponse.json({ error: "Challenge progress not found" }, { status: 404 });
      }
  
      // Calculate current day
      const startDate = new Date(progress.start_date);
      const today = new Date();
      const currentDay = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
      // Get tasks for the challenge (up to the current day)
      const { data: tasks, error: tasksError } = await supabase
        .from("challenge_tasks")
        .select("*")
        .eq("challenge_id", challengeId)
        .lte("day", currentDay) // Get tasks only up to the current day
        .order("day", { ascending: true });
  
      if (tasksError) throw tasksError;
  
      return NextResponse.json({
        progress: {
          ...progress,
          current_day: currentDay,
          tasks: tasks || []
        }
      });
  
    } catch (error) {
      console.error("Error fetching user challenge progress:", error);
      return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
    }
  }