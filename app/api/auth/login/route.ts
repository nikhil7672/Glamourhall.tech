import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { supabase } from "@/lib/supabaseClient";
// Input validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string()
});

type LoginInput = z.infer<typeof loginSchema>;

export async function POST(request: Request) {
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    return NextResponse.json(
      { error: "Server configuration is missing" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const validatedInput = loginSchema.safeParse(body);
    if (!validatedInput.success) {
      return NextResponse.json(
        { error: validatedInput.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password }: LoginInput = validatedInput.data;

    // Check if the user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If user logged in with OAuth (Google, etc.)
    if (!user.password) {
      return NextResponse.json(
        { 
          error: "This account was created using Google Sign-In. Please login with Google." 
        },
        { status: 400 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session using Supabase Auth
       // Generate JWT token
    const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
    // Remove sensitive data before sending response
    const { password: _, ...safeUserData } = user;

    return NextResponse.json({
      message: "Login successful",
      user: safeUserData,
      token,
      
    },
    { status: 200 }
);

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

