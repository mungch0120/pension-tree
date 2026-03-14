import { NextResponse } from "next/server";
import { getToken } from "@/lib/kis";

export async function GET() {
  try {
    const token = await getToken();
    return NextResponse.json({ success: true, token: token.substring(0, 10) + "..." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
