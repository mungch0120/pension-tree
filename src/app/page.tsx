"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKRW, formatPercent, profitColor } from "@/lib/format";

interface Holding {
  pdno: string;
  prdt_name: string;
  hldg_qty: string;
  pchs_avg_pric: string;
  prpr: string;
  evlu_amt: string;
  evlu_pfls_amt: string;
  evlu_pfls_rt: string;
}

interface Summary {
  dnca_tot_amt: string;
  tot_evlu_amt: string;
  pchs_amt_smtl_amt: string;
  evlu_amt_smtl_amt: string;
  evlu_pfls_smtl_amt: string;
}

export default function DashboardPage() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenOk, setTokenOk] = useState<boolean | null>(null);

  useEffect(() => {
    // Test token first
    fetch("/api/kis/token")
      .then((r) => r.json())
      .then((d) => {
        setTokenOk(d.success);
        if (d.success) loadBalance();
        else {
          setError("API 토큰 발급 실패. 설정을 확인하세요.");
          setLoading(false);
        }
      })
      .catch(() => {
        setTokenOk(false);
        setError("API 연결 실패");
        setLoading(false);
      });
  }, []);

  const loadBalance = async () => {
    try {
      const res = await fetch("/api/kis/balance");
      const data = await res.json();
      if (data.success) {
        setHoldings(data.holdings?.filter((h: Holding) => parseInt(h.hldg_qty) > 0) || []);
        setSummary(data.summary || null);
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalEval = summary ? parseInt(summary.tot_evlu_amt || "0") : 0;
  const totalProfit = summary ? parseInt(summary.evlu_pfls_smtl_amt || "0") : 0;
  const totalPurchase = summary ? parseInt(summary.pchs_amt_smtl_amt || "0") : 0;
  const profitRate = totalPurchase > 0 ? (totalProfit / totalPurchase) * 100 : 0;
  const cash = summary ? parseInt(summary.dnca_tot_amt || "0") : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-sm text-gray-500 mt-1">포트폴리오 현황 요약</p>
      </div>

      {/* API Status */}
      {tokenOk !== null && (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${tokenOk ? "bg-emerald-500" : "bg-red-500"}`} />
          <span className="text-xs text-gray-500">
            {tokenOk ? "API 연결됨" : "API 연결 실패"}
          </span>
        </div>
      )}

      {error && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-800">⚠️ {error}</p>
            {error.includes("ACCOUNT_NO") && (
              <p className="text-xs text-amber-600 mt-1">
                설정 페이지에서 계좌번호를 입력하세요.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          title="총 평가금액"
          value={loading ? null : formatKRW(totalEval)}
          loading={loading}
        />
        <SummaryCard
          title="총 수익/손실"
          value={loading ? null : formatKRW(totalProfit)}
          sub={loading ? null : formatPercent(profitRate)}
          valueColor={profitColor(totalProfit)}
          loading={loading}
        />
        <SummaryCard
          title="투자원금"
          value={loading ? null : formatKRW(totalPurchase)}
          loading={loading}
        />
        <SummaryCard
          title="예수금"
          value={loading ? null : formatKRW(cash)}
          loading={loading}
        />
      </div>

      {/* Holdings List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">보유 종목</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : holdings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-sm">보유 종목이 없습니다</p>
              <p className="text-xs mt-1">계좌번호 설정 후 조회해보세요</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Desktop header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 px-3 py-2 text-xs text-gray-400 border-b">
                <span>종목</span>
                <span className="text-right">현재가</span>
                <span className="text-right">평균단가</span>
                <span className="text-right">수량</span>
                <span className="text-right">평가금액</span>
                <span className="text-right">수익률</span>
              </div>
              {holdings.map((h) => (
                <HoldingRow key={h.pdno} holding={h} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  sub,
  valueColor,
  loading,
}: {
  title: string;
  value: string | null;
  sub?: string | null;
  valueColor?: string;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs text-gray-500">{title}</p>
        {loading ? (
          <Skeleton className="h-6 w-24 mt-1" />
        ) : (
          <>
            <p className={`text-lg font-bold mt-1 ${valueColor || "text-gray-900"}`}>
              {value}
            </p>
            {sub && (
              <p className={`text-xs mt-0.5 ${valueColor || "text-gray-500"}`}>{sub}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function HoldingRow({ holding: h }: { holding: Holding }) {
  const profit = parseFloat(h.evlu_pfls_rt);
  const profitAmt = parseInt(h.evlu_pfls_amt);

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-4 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors border md:border-0 border-gray-100">
      {/* 종목명 */}
      <div>
        <p className="font-medium text-sm text-gray-900">{h.prdt_name}</p>
        <p className="text-xs text-gray-400">{h.pdno}</p>
      </div>

      {/* 모바일: 수익률 오른쪽 상단 */}
      <div className="md:hidden text-right">
        <Badge variant={profit >= 0 ? "destructive" : "secondary"} className="text-xs">
          {formatPercent(profit)}
        </Badge>
      </div>

      {/* 현재가 */}
      <div className="text-right hidden md:block">
        <p className="text-sm">{formatKRW(h.prpr)}</p>
      </div>

      {/* 평균단가 */}
      <div className="text-right hidden md:block">
        <p className="text-sm text-gray-500">{formatKRW(h.pchs_avg_pric)}</p>
      </div>

      {/* 수량 */}
      <div className="text-right hidden md:block">
        <p className="text-sm">{parseInt(h.hldg_qty).toLocaleString()}주</p>
      </div>

      {/* 평가금액 */}
      <div className="text-right">
        <p className="text-sm font-medium">{formatKRW(h.evlu_amt)}</p>
        <p className={`text-xs ${profitColor(profitAmt)}`}>
          {formatKRW(profitAmt)}
        </p>
      </div>

      {/* 수익률 (데스크탑) */}
      <div className="text-right hidden md:block">
        <p className={`text-sm font-medium ${profitColor(profit)}`}>
          {formatPercent(profit)}
        </p>
      </div>
    </div>
  );
}
