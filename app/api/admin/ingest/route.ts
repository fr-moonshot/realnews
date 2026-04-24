import { NextRequest, NextResponse } from "next/server";

import { runIngestion } from "@/lib/ingestion";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  return handleIngest(secret);
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  const headerSecret = request.headers.get("x-admin-ingest-secret");
  let secret = headerSecret;

  if (!secret && contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    secret = String(formData.get("secret") ?? "");
  }

  return handleIngest(secret);
}

async function handleIngest(secret: string | null) {
  const expectedSecret = process.env.ADMIN_INGEST_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      {
        error: "ADMIN_INGEST_SECRET is not configured."
      },
      { status: 500 }
    );
  }

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      {
        error: "Unauthorized ingestion request."
      },
      { status: 401 }
    );
  }

  const result = await runIngestion();
  return NextResponse.json(result, { status: 200 });
}
