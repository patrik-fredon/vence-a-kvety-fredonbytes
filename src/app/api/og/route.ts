import { ImageResponse } from "next/og";

import React from "react";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        },
      },
      "Hello World"
    ),
    { width: 1200, height: 630 }
  );
}
