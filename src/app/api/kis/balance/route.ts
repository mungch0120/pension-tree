import { NextResponse } from "next/server";
import { getBalance } from "@/lib/kis";

export async function GET() {
  try {
    const data = await getBalance();
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
