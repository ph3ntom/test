// app/api/check-id/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const reqBody = await request.json();
    const { userId } = reqBody;

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    console.log("API Route - Calling backend CheckId with userId:", userId);

    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register/CheckId`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    console.log("API Route - response status:", backendResponse.status);


    const backendResponseText = await backendResponse.text();
    console.log("API Route - raw response text:", backendResponseText);

    let backendData;
    try {
        backendData = JSON.parse(backendResponseText);
        console.log("API Route - Backend parsed JSON data:", backendData);
    } catch (e) {
        console.error("API Route - Failed to parse backend response as JSON:", e);
        return NextResponse.json({ message: 'Invalid JSON response from backend', rawResponse: backendResponseText }, { status: 500 });
    }

    if (!backendResponse.ok) {
      return NextResponse.json(backendData, { status: backendResponse.status });
    }

    return NextResponse.json(backendData, { status: backendResponse.status });

  } catch (error) {
    console.error('API Route - Error during backend fetch or processing:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'API Route Internal Error', details: errorMessage }, { status: 500 });
  }
}
