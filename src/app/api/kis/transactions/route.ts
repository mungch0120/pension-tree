import { NextResponse } from "next/server";
import { getTransactions } from "@/lib/kis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { success: false, error: "startDate and endDate required (YYYYMMDD)" },
      { status: 400 }
    );
  }

  try {
    const data = await getTransactions(startDate, endDate);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
