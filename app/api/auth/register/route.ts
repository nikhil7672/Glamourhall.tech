import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Input validation schema
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string(),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name must not exceed 50 characters"),
  provider: z.enum(["email", "google"]).default("email"),
});

type RegisterInput = z.infer<typeof registerSchema>;

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const SALT_ROUNDS = 10; // for bcrypt

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Server configuration is missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const body = await request.json();

    // Validate input
    const validatedInput = registerSchema.safeParse(body);
    if (!validatedInput.success) {
      return NextResponse.json(
        { error: validatedInput.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, fullName, provider }: RegisterInput =
      validatedInput.data;

    // Check if user already exists
    const { data: existingUser, error: existingUserError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUserError && existingUserError.code !== "PGRST116") {
      console.error("Database error:", existingUserError);
      return NextResponse.json(
        { error: "An error occurred while checking user existence" },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);


    // Create user in custom users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          email: email.toLowerCase(),
          full_name: fullName,
          password: hashedPassword,
          provider,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error("Database error:", userError);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Remove sensitive data before sending response
    const { password: _, ...safeUserData } = userData;

    return NextResponse.json(
      {
        message: "Registration successful. Please verify your email.",
        user: safeUserData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export const runtime = 'edge'; // 'nodejs' | 'edge'
export const dynamic = 'force-dynamic';
export const revalidate = 0;
