import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const { newMessage } = await request.json();

    if (!conversationId || !newMessage) {
      return NextResponse.json(
        { error: "conversationId and messages are required" },
        { status: 400 }
      );
    }

    const { data: existingConversation, error: fetchError } = await supabase
      .from("conversations")
      .select("messages")
      .eq("id", conversationId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Append new message to existing messages
    const updatedMessages = [...existingConversation.messages, ...newMessage]

    const { data, error } = await supabase
      .from("conversations")
      .update({
        messages: updatedMessages,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error adding message to conversation:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Fetch conversation
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .single();

    if (error) {
      throw error;
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(conversation, { status: 200 });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Delete conversation
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: "Conversation deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
