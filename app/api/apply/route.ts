import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Input validation schema
const applicationSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  instagramHandle: z.string().min(1, "Instagram handle is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  email: z.string().email("Invalid email format"),
});

type ApplicationInput = z.infer<typeof applicationSchema>;

export async function POST(request: Request) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

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
    const validatedInput = applicationSchema.safeParse(body);
    if (!validatedInput.success) {
      return NextResponse.json(
        { error: validatedInput.error.errors[0].message },
        { status: 400 }
      );
    }

    const { storeName, instagramHandle, location, description, email }: ApplicationInput = validatedInput.data;

    // Insert application into Supabase
    const { error } = await supabase
      .from("store_applications")
      .insert([{
        store_name: storeName,
        instagram_handle: instagramHandle,
        location: location,
        description: description,
        email: email,
        created_at: new Date().toISOString(),
      }]);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
} 