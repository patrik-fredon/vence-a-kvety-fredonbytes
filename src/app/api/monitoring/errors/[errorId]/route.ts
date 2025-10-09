import { NextResponse } from "next/server";

export async function PATCH() {
  // Fast return - endpoint not implemented
  // TODO: Implement when monitoring database tables are created
  return NextResponse.json(
    {
      success: false,
      error: "Not implemented",
      message: "Error resolution endpoint is disabled - database schema not yet implemented",
    },
    { status: 501 }
  );
}
