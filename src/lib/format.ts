/**
 * 숫자 포맷팅 유틸리티
 */

/** 원화 포맷 (예: ₩1,234,567) */
export function formatKRW(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num)) return "₩0";
  return `₩${num.toLocaleString("ko-KR")}`;
}

/** 퍼센트 포맷 (예: +12.34%) */
export function formatPercent(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0%";
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}

/** 거래량 포맷 (예: 1.4만, 2.3억) */
export function formatVolume(value: number | string): string {
  const num = typeof value === "string" ? parseInt(value, 10) : value;
  if (isNaN(num)) return "0";
  if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
  if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
  return num.toLocaleString();
}

/** 수익/손실 색상 클래스 */
export function profitColor(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num > 0) return "text-red-500";  // 한국 주식: 상승=빨강
  if (num < 0) return "text-blue-500"; // 하락=파랑
  return "text-gray-500";
}

/** 수익/손실 배경 색상 */
export function profitBg(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num > 0) return "bg-red-50 border-red-200";
  if (num < 0) return "bg-blue-50 border-blue-200";
  return "bg-gray-50 border-gray-200";
}
