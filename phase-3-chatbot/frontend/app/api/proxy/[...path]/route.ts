import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://tayyabaali-phase3-hack2-backend.hf.space";

// Proxy all API requests to the backend (except auth which has its own proxy)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, params);
}

async function proxyRequest(
  request: NextRequest,
  paramsPromise: Promise<{ path: string[] }>
) {
  const { path } = await paramsPromise;
  const apiPath = path.join("/");
  const url = `${BACKEND_URL}/api/${apiPath}`;

  // Forward query parameters
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const fullUrl = queryString ? `${url}?${queryString}` : url;

  console.log(`[API Proxy] ${request.method} ${fullUrl}`);

  try {
    // Get request body for non-GET requests
    let body = undefined;
    if (request.method !== "GET") {
      body = await request.text();
    }

    // Forward the request to backend
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward important headers
    const headersToForward = ["cookie", "origin", "referer", "user-agent", "authorization"];
    headersToForward.forEach((headerName) => {
      const value = request.headers.get(headerName);
      if (value) {
        headers[headerName] = value;
      }
    });

    // Set origin if not present
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
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });

    // Forward Set-Cookie headers from backend
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append("Set-Cookie", cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error("[API Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}
