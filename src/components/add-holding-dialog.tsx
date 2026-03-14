"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addManualHolding, BROKERS } from "@/lib/manual-holdings";

interface Props {
  onAdded: () => void;
}

export function AddHoldingDialog({ onAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [broker, setBroker] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgPrice, setAvgPrice] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const handleSymbolSearch = async () => {
    if (!symbol.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/kis/price?symbol=${symbol.trim()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSearchResult(`현재가: ₩${parseInt(data.data.stck_prpr).toLocaleString()}`);
      } else {
        setSearchResult("종목을 찾을 수 없습니다");
      }
    } catch {
      setSearchResult("조회 실패");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = () => {
    if (!broker || !symbol.trim() || !name.trim() || !quantity || !avgPrice) return;

    addManualHolding({
      broker,
      symbol: symbol.trim(),
      name: name.trim(),
      quantity: parseInt(quantity),
      avgPrice: parseFloat(avgPrice),
    });

    // Reset
    setBroker("");
    setSymbol("");
    setName("");
    setQuantity("");
    setAvgPrice("");
    setSearchResult(null);
    setOpen(false);
    onAdded();
  };

  const isValid = broker && symbol.trim() && name.trim() && quantity && avgPrice;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer">
        + 종목 추가
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>보유 종목 수동 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {/* 증권사 */}
          <div className="space-y-1.5">
            <Label htmlFor="broker">증권사</Label>
            <Select value={broker} onValueChange={(v) => setBroker(v || "")}>
              <SelectTrigger>
                <SelectValue placeholder="증권사 선택" />
              </SelectTrigger>
              <SelectContent>
                {BROKERS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 종목코드 + 검색 */}
          <div className="space-y-1.5">
            <Label htmlFor="symbol">종목코드</Label>
            <div className="flex gap-2">
              <Input
                id="symbol"
                placeholder="005930"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSymbolSearch}
                disabled={searching || !symbol.trim()}
              >
                {searching ? "..." : "조회"}
              </Button>
            </div>
            {searchResult && (
              <p className="text-xs text-gray-500">{searchResult}</p>
            )}
          </div>

          {/* 종목명 */}
          <div className="space-y-1.5">
            <Label htmlFor="name">종목명</Label>
            <Input
              id="name"
              placeholder="삼성전자"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 수량 & 평균단가 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">보유수량</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="avgPrice">매수평균가</Label>
              <Input
                id="avgPrice"
                type="number"
                placeholder="65000"
                value={avgPrice}
                onChange={(e) => setAvgPrice(e.target.value)}
              />
            </div>
          </div>

          {/* 예상 금액 */}
          {quantity && avgPrice && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              매수금액: ₩{(parseInt(quantity) * parseFloat(avgPrice)).toLocaleString()}
            </div>
          )}

          {/* 제출 */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full"
          >
            추가
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
