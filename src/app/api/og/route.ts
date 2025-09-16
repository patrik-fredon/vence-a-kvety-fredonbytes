import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import React from 'react';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  return new ImageResponse(
    React.createElement('div', {
      style: {
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'black'
      }
    }, 'Hello World'),
    { width: 1200, height: 630 }
  );
}
