import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const challengeId = params.id;
    
    // Validate UUID format
    if (!validate(challengeId)) {
      return NextResponse.json(
        { error: "Invalid challenge ID format" },
        { status: 400 }
      );
    }

    const { data: challenge, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (error) {
      throw error;
    }

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ challenge });

  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
} 