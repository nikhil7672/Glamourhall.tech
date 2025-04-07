import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// POST: Add/update user challenge progress
export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, taskId, isCompleted } = await request.json();

    if (!userId || !challengeId || !taskId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing progress for this specific task
    const { data: existingProgress, error: existingError } = await supabase
      .from("user_task_progress")
      .select("id, is_completed")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .eq("task_id", taskId)
      .single();

    if (existingProgress) {
    //   if (existingProgress.is_completed) {
    //     return NextResponse.json({ message: "Task already completed!" }, { status: 400 });
    //   }
      
      // Update existing entry
      const { data, error } = await supabase
        .from("user_task_progress")
        .update({ 
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq("id", existingProgress.id);

      if (error) throw error;
      return NextResponse.json({ message: "Task progress updated!", progress: data });
    }

    // Insert new entry if no existing progress
    const { data, error } = await supabase
      .from("user_task_progress")
      .insert([{ 
        user_id: userId, 
        challenge_id: challengeId,
        task_id: taskId,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      }]);

    if (error) throw error;

    return NextResponse.json({ message: "Task progress updated!", progress: data });

  } catch (error) {
    console.error("Error adding user challenge progress:", error);
    return NextResponse.json({ error: "Failed to start challenge" }, { status: 500 });
  }
}

// GET: Get user task  progress
export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId");
      const challengeId = searchParams.get("challengeId");
  
      if (!userId || !challengeId) {
        return NextResponse.json({ error: "Missing userId or challengeId" }, { status: 400 });
      }

      // Get all task progress for this user and challenge
      const { data: taskProgress, error: progressError } = await supabase
        .from("user_task_progress")
        .select("*")
        .eq("user_id", userId)
        .eq("challenge_id", challengeId);

      if (progressError) throw progressError;

      return NextResponse.json({
        taskProgress: taskProgress || []
      });

    } catch (error) {
      console.error("Error fetching user task progress:", error);
      return NextResponse.json({ error: "Failed to fetch task progress" }, { status: 500 });
    }
  }