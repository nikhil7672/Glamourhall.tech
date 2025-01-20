import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Supabase configuration is missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { email } = await request.json();

    // Check if the user's email already exists in the Supabase database
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUserError) {
      return NextResponse.json(
        { error: "An error occurred while checking for existing user" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json({ exists: true }, { status: 200 });
    } else {
      return NextResponse.json({ exists: false }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking for existing user:", error);
    return NextResponse.json(
      { error: "An error occurred while checking for existing user" },
      { status: 500 }
    );
  }
}