import { NextResponse } from "next/server";
import stocksData from "@/data/stocks.json";

interface Stock {
  c: string; // code
  n: string; // name
  m: string; // market (K=KOSPI, Q=KOSDAQ)
}

const stocks = stocksData as Stock[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // 종목코드 또는 종목명으로 검색
  const results = stocks
    .filter(
      (s) =>
        s.n.toLowerCase().includes(query) ||
        s.c.includes(query)
    )
    .slice(0, 20)
    .map((s) => ({
      code: s.c,
      name: s.n,
      market: s.m === "K" ? "KOSPI" : "KOSDAQ",
    }));

  return NextResponse.json({ results });
}
