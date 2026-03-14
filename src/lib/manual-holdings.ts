/**
 * 수동 입력 보유종목 관리 (localStorage 기반)
 */

export interface ManualHolding {
  id: string;
  broker: string;       // 증권사명
  symbol: string;       // 종목코드
  name: string;         // 종목명
  quantity: number;      // 보유수량
  avgPrice: number;      // 매수평균가
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "pension-tree-manual-holdings";

export function getManualHoldings(): ManualHolding[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveManualHoldings(holdings: ManualHolding[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
}

export function addManualHolding(holding: Omit<ManualHolding, "id" | "createdAt" | "updatedAt">): ManualHolding {
  const holdings = getManualHoldings();
  const now = new Date().toISOString();
  const newHolding: ManualHolding = {
    ...holding,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  holdings.push(newHolding);
  saveManualHoldings(holdings);
  return newHolding;
}

export function updateManualHolding(id: string, updates: Partial<ManualHolding>) {
  const holdings = getManualHoldings();
  const idx = holdings.findIndex((h) => h.id === id);
  if (idx === -1) return;
  holdings[idx] = { ...holdings[idx], ...updates, updatedAt: new Date().toISOString() };
  saveManualHoldings(holdings);
}

export function deleteManualHolding(id: string) {
  const holdings = getManualHoldings().filter((h) => h.id !== id);
  saveManualHoldings(holdings);
}

/** 증권사 목록 */
export const BROKERS = [
  "한국투자증권",
  "삼성증권",
  "미래에셋증권",
  "NH투자증권",
  "KB증권",
  "키움증권",
  "신한투자증권",
  "하나증권",
  "대신증권",
  "메리츠증권",
  "토스증권",
  "카카오페이증권",
  "기타",
] as const;
