import { NextRequest, NextResponse } from 'next/server';

const STRIKE_API_BASE = 'https://api.strike.me/v1';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = process.env.STRIKE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Strike API key not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    const strikeUrl = `${STRIKE_API_BASE}/${path}${searchParams ? `?${searchParams}` : ''}`;

    const response = await fetch(strikeUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { 
          error: 'Strike API request failed',
          status: response.status,
          message: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Strike API Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Strike API' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = process.env.STRIKE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Strike API key not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const body = await request.json();
    const strikeUrl = `${STRIKE_API_BASE}/${path}`;

    const response = await fetch(strikeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { 
          error: 'Strike API request failed',
          status: response.status,
          message: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Strike API Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Strike API' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = process.env.STRIKE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Strike API key not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const body = await request.json();
    const strikeUrl = `${STRIKE_API_BASE}/${path}`;

    const response = await fetch(strikeUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { 
          error: 'Strike API request failed',
          status: response.status,
          message: errorData 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Strike API Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Strike API' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const apiKey = process.env.STRIKE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Strike API key not configured' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const strikeUrl = `${STRIKE_API_BASE}/${path}`;

    const response = await fetch(strikeUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { 
          error: 'Strike API request failed',
          status: response.status,
          message: errorData 
        },
        { status: response.status }
      );
    }

    // DELETE requests might not return JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      return NextResponse.json({ success: true });
    }

  } catch (error) {
    console.error('Strike API Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with Strike API' },
      { status: 500 }
    );
  }
} 