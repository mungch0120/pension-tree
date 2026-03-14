import { NextResponse } from "next/server";
import { getPrice } from "@/lib/kis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ success: false, error: "symbol required" }, { status: 400 });
  }

  try {
    const data = await getPrice(symbol);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
