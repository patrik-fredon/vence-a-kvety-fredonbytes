import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { title } from 'process';
import { title } from 'process';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Pohřební věnce';
    const subtitle = searchParams.get('subtitle') || '';
    const category = searchParams.get('category') || '';
    const price = searchParams.get('price') || '';
    const locale = searchParams.get('locale') || 'cs';

    return new ImageResponse(
      (
        <div
          style= {{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1f2937',
      position: 'relative',
    }}
        >
    <div
            style={
    {
      display: 'flex',
        flexDirection: 'column',
          alignItems: 'center',
            justifyContent: 'center',
              textAlign: 'center',
                padding: '80px',
                  maxWidth: '1000px',
            }
  }
          >
    <div
              style={
    {
      display: 'flex',
        alignItems: 'center',
          marginBottom: '40px',
              }
  }
            >
    <div
                style={
    {
      width: '60px',
        height: '60px',
          backgroundColor: '#10b981',
            borderRadius: '50%',
              display: 'flex',
                alignItems: 'center',
                  justifyContent: 'center',
                    marginRight: '20px',
                }
  }
              >
    <div
                  style={
    {
      color: 'white',
        fontSize: '24px',
          fontWeight: 'bold',
                  }
  }
                >
                  🌸
  </div>
    </div>
    < div
  style = {{
    color: '#10b981',
      fontSize: '24px',
        fontWeight: '600',
                }
}
              >
  Ketingmar s.r.o.
              </div>
    </div>

    < h1
style = {{
  color: 'white',
    fontSize: '64px',
      fontWeight: 'bold',
        lineHeight: '1.1',
          marginBottom: '20px',
            textAlign: 'center',
              maxWidth: '800px',
              }}
            >
  { title }
  </h1>

{
  subtitle && (
    <p
                style={
    {
      color: '#d1d5db',
        fontSize: '28px',
          fontWeight: '400',
            lineHeight: '1.3',
              marginBottom: '30px',
                textAlign: 'center',
                  maxWidth: '700px',
                }
  }
              >
    { subtitle }
    </p>
            )
}

<div
              style={
  {
    display: 'flex',
      alignItems: 'center',
        gap: '30px',
          marginBottom: '40px',
              }
}
            >
  { category && (
    <div
                  style={
  {
    backgroundColor: '#374151',
      color: '#10b981',
        padding: '12px 24px',
          borderRadius: '25px',
            fontSize: '20px',
              fontWeight: '500',
                  }
}
                >
  { category }
  </div>
              )}

{
  price && (
    <div
                  style={
    {
      backgroundColor: '#10b981',
        color: 'white',
          padding: '12px 24px',
            borderRadius: '25px',
              fontSize: '24px',
                fontWeight: 'bold',
                  }
  }
                >
    { price } Kč
      </div>
              )
}
</div>

  < div
style = {{
  color: '#9ca3af',
    fontSize: '20px',
      fontWeight: '400',
        textAlign: 'center',
              }}
            >
  { locale === 'cs'
  ? 'Prémiové pohřební věnce • Ruční výroba • Rychlé dodání'
  : 'Premium funeral wreaths • Handcrafted • Fast delivery'
              }
</div>
  </div>
  </div>
      ),
{
  width: 1200,
    height: 630,
      }
    );
  } catch (e: any) {
  console.error('Error generating OG image:', e.message);
  return new Response(`Failed to generate the image: ${e.message}`, {
    status: 500,
  });
}
}
