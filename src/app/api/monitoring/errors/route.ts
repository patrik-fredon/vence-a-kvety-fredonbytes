import { NextResponse } from "next/server";

// Removed unused ErrorLogRequest interface

export async function POST() {
  try {
    // TODO: Monitoring tables not yet implemented in database schema
    // This endpoint is disabled until the required tables are created
    return NextResponse.json({
      success: true,
      message: "Error logging is not yet implemented - database schema incomplete",
      status: "disabled",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in error logging endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // TODO: Monitoring tables not yet implemented in database schema
    // This endpoint is disabled until the required tables are created
    return NextResponse.json({
      success: true,
      message: "Error retrieval is not yet implemented - database schema incomplete",
      status: "disabled",
      data: [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in error logs fetch:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
