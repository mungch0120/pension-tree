"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddHoldingDialog } from "@/components/add-holding-dialog";
import {
  ManualHolding,
  getManualHoldings,
  deleteManualHolding,
} from "@/lib/manual-holdings";
import { formatKRW, formatPercent, profitColor } from "@/lib/format";

interface EnrichedHolding extends ManualHolding {
  currentPrice?: number;
  evalAmount?: number;
  profitLoss?: number;
  profitRate?: number;
  loading?: boolean;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<EnrichedHolding[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHoldings = useCallback(async () => {
    const manual = getManualHoldings();
    // 초기 로딩 상태
    const enriched: EnrichedHolding[] = manual.map((h) => ({ ...h, loading: true }));
    setHoldings(enriched);
    setLoading(false);

    // 현재가 조회 (병렬)
    const updated = await Promise.all(
      manual.map(async (h) => {
        try {
          const res = await fetch(`/api/kis/price?symbol=${h.symbol}`);
          const data = await res.json();
          if (data.success && data.data) {
            const currentPrice = parseInt(data.data.stck_prpr);
            const evalAmount = currentPrice * h.quantity;
            const purchaseAmount = h.avgPrice * h.quantity;
            const profitLoss = evalAmount - purchaseAmount;
            const profitRate = purchaseAmount > 0 ? (profitLoss / purchaseAmount) * 100 : 0;
            return { ...h, currentPrice, evalAmount, profitLoss, profitRate, loading: false };
          }
        } catch {}
        return { ...h, loading: false };
      })
    );
    setHoldings(updated);
  }, []);

  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    deleteManualHolding(id);
    loadHoldings();
  };

  // 증권사별 그룹핑
  const brokerGroups = holdings.reduce<Record<string, EnrichedHolding[]>>((acc, h) => {
    if (!acc[h.broker]) acc[h.broker] = [];
    acc[h.broker].push(h);
    return acc;
  }, {});

  const totalEval = holdings.reduce((sum, h) => sum + (h.evalAmount || 0), 0);
  const totalPurchase = holdings.reduce((sum, h) => sum + h.avgPrice * h.quantity, 0);
  const totalProfit = totalEval - totalPurchase;
  const totalProfitRate = totalPurchase > 0 ? (totalProfit / totalPurchase) * 100 : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">포트폴리오</h1>
          <p className="text-sm text-gray-500 mt-1">수동 입력 종목 관리</p>
        </div>
        <AddHoldingDialog onAdded={loadHoldings} />
      </div>

      {/* 요약 */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SummaryCard title="총 평가" value={formatKRW(totalEval)} />
          <SummaryCard
            title="총 손익"
            value={formatKRW(totalProfit)}
            sub={formatPercent(totalProfitRate)}
            color={profitColor(totalProfit)}
          />
          <SummaryCard title="총 매수금액" value={formatKRW(totalPurchase)} />
          <SummaryCard title="종목 수" value={`${holdings.length}개`} />
        </div>
      )}

      {/* 탭: 전체 / 증권사별 */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          {Object.keys(brokerGroups).map((broker) => (
            <TabsTrigger key={broker} value={broker}>
              {broker} ({brokerGroups[broker].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <HoldingsList
            holdings={holdings}
            onDelete={handleDelete}
            loading={loading}
          />
        </TabsContent>

        {Object.entries(brokerGroups).map(([broker, items]) => (
          <TabsContent key={broker} value={broker}>
            <HoldingsList
              holdings={items}
              onDelete={handleDelete}
              loading={loading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  sub,
  color,
}: {
  title: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <p className="text-xs text-gray-500">{title}</p>
        <p className={`text-lg font-bold mt-1 ${color || "text-gray-900"}`}>{value}</p>
        {sub && <p className={`text-xs mt-0.5 ${color || "text-gray-500"}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

function HoldingsList({
  holdings,
  onDelete,
  loading,
}: {
  holdings: EnrichedHolding[];
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  if (!loading && holdings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-400">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm">등록된 종목이 없습니다</p>
            <p className="text-xs mt-1">상단의 &quot;+ 종목 추가&quot; 버튼으로 추가하세요</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Desktop header */}
        <div className="hidden md:grid md:grid-cols-8 gap-3 px-3 py-2 text-xs text-gray-400 border-b">
          <span>증권사</span>
          <span>종목</span>
          <span className="text-right">현재가</span>
          <span className="text-right">평균단가</span>
          <span className="text-right">수량</span>
          <span className="text-right">평가금액</span>
          <span className="text-right">수익률</span>
          <span className="text-right">관리</span>
        </div>

        <div className="divide-y divide-gray-50">
          {holdings.map((h) => (
            <div
              key={h.id}
              className="grid grid-cols-2 md:grid-cols-8 gap-2 md:gap-3 px-3 py-3 hover:bg-gray-50 transition-colors"
            >
              {/* 증권사 + 종목명 (모바일) */}
              <div className="md:contents">
                <div className="col-span-1 md:col-span-1">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {h.broker}
                  </Badge>
                </div>
                <div className="md:hidden text-right">
                  {h.profitRate !== undefined && (
                    <span className={`text-sm font-medium ${profitColor(h.profitRate)}`}>
                      {formatPercent(h.profitRate)}
                    </span>
                  )}
                </div>
              </div>

              {/* 종목 */}
              <div className="hidden md:block">
                <p className="text-sm font-medium">{h.name}</p>
                <p className="text-xs text-gray-400">{h.symbol}</p>
              </div>

              {/* 모바일 종목명 */}
              <div className="md:hidden col-span-2">
                <p className="text-sm font-medium">{h.name} <span className="text-gray-400 text-xs">{h.symbol}</span></p>
              </div>

              {/* 현재가 */}
              <div className="text-right">
                <p className="text-sm">
                  {h.loading ? "..." : h.currentPrice ? formatKRW(h.currentPrice) : "-"}
                </p>
              </div>

              {/* 평균단가 */}
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-500">{formatKRW(h.avgPrice)}</p>
              </div>

              {/* 수량 */}
              <div className="text-right hidden md:block">
                <p className="text-sm">{h.quantity.toLocaleString()}주</p>
              </div>

              {/* 평가금액 */}
              <div className="text-right">
                <p className="text-sm font-medium">
                  {h.evalAmount ? formatKRW(h.evalAmount) : "-"}
                </p>
                {h.profitLoss !== undefined && (
                  <p className={`text-xs ${profitColor(h.profitLoss)}`}>
                    {formatKRW(h.profitLoss)}
                  </p>
                )}
              </div>

              {/* 수익률 (데스크탑) */}
              <div className="text-right hidden md:block">
                {h.profitRate !== undefined && (
                  <p className={`text-sm font-medium ${profitColor(h.profitRate)}`}>
                    {formatPercent(h.profitRate)}
                  </p>
                )}
              </div>

              {/* 삭제 */}
              <div className="text-right hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(h.id)}
                  className="text-gray-400 hover:text-red-500 h-7 px-2"
                >
                  삭제
                </Button>
              </div>

              {/* 모바일 삭제 */}
              <div className="md:hidden col-span-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(h.id)}
                  className="text-xs text-gray-400 hover:text-red-500 h-6 px-2"
                >
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
