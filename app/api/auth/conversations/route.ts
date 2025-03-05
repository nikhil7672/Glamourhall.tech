import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
    try {
      const { userId, initialMessage, title } = await request.json();
  
      if (!userId || !initialMessage) {
        return NextResponse.json(
          { error: "User ID and initial message are required" },
          { status: 400 }
        );
      }
  
      const { data, error } = await supabase
        .from("conversations")
        .insert([{ 
          user_id: userId, 
          messages: initialMessage, 
          title: initialMessage[0]?.content?.substring(0, 50) || 'New Chat',
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();
  
      if (error) {
        throw error;
      }
  
      return NextResponse.json(data, { status: 201 });
    } catch (error) {
      console.error("Error creating conversation:", error);
      return NextResponse.json(
        { error: "Failed to create conversation" },
        { status: 500 }
      );
    }
  }

  export async function GET() {
    try {
      const { data, error } = await supabase.from("conversations").select("*");
  
      if (error) {
        throw error;
      }
  
      return NextResponse.json(data, { status: 200 });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }
  }