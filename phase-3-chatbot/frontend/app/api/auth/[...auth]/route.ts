import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://tayyabaali-phase3-hack2-backend.hf.space";

// Proxy all auth requests to the backend
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ auth: string[] }> }
) {
  const { auth } = await params;
  return proxyRequest(request, auth);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ auth: string[] }> }
) {
  const { auth } = await params;
  return proxyRequest(request, auth);
}

async function proxyRequest(request: NextRequest, authPath: string[]) {
  const path = authPath.join("/");
  const url = `${BACKEND_URL}/api/auth/${path}`;

  // Forward query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  console.log(`[Auth Proxy] ${request.method} ${fullUrl}`);

  try {
    // Get request body for POST requests
    let body = undefined;
    if (request.method === "POST") {
      body = await request.text();
    }

    // Forward the request to backend
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward important headers
    const headersToForward = ["cookie", "origin", "referer", "user-agent"];
    headersToForward.forEach((headerName) => {
      const value = request.headers.get(headerName);
      if (value) {
        headers[headerName] = value;
      }
    });

    // If no origin header, set it to the frontend URL
    if (!headers["origin"]) {
      headers["origin"] = request.nextUrl.origin;
    }

    const response = await fetch(fullUrl, {
      method: request.method,
      headers,
      body,
      credentials: "include",
    });

    // Get response body
    const data = await response.text();

    // Create Next.js response
    const nextResponse = new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Forward Set-Cookie headers from backend
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append("Set-Cookie", cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error("[Auth Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}
