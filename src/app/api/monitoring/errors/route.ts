import { NextResponse } from "next/server";

// Removed unused ErrorLogRequest interface

export async function POST() {
  // Fast return - endpoint not implemented
  // TODO: Implement when monitoring database tables are created
  return NextResponse.json(
    {
      success: false,
      error: "Not implemented",
      message: "Error logging endpoint is disabled - database schema not yet implemented",
    },
    { status: 501 }
  );
}

export async function GET() {
  // Fast return - endpoint not implemented
  // TODO: Implement when monitoring database tables are created
  return NextResponse.json(
    {
      success: false,
      error: "Not implemented",
      message: "Error retrieval endpoint is disabled - database schema not yet implemented",
      data: [],
    },
    { status: 501 }
  );
}
