"use client";

import { useState, useRef, useEffect } from "react";
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

interface SearchResult {
  code: string;
  name: string;
  market: string;
}

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

  // 검색 관련
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 현재가 조회
  const [priceInfo, setPriceInfo] = useState<string | null>(null);

  // 검색어 변경 시 debounce 검색
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/kis/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // 클릭 외부 닫기
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectStock = async (stock: SearchResult) => {
    setSymbol(stock.code);
    setName(stock.name);
    setSearchQuery(`${stock.name} (${stock.code})`);
    setShowResults(false);

    // 현재가 자동 조회
    setPriceInfo("조회 중...");
    try {
      const res = await fetch(`/api/kis/price?symbol=${stock.code}`);
      const data = await res.json();
      if (data.success && data.data) {
        const price = parseInt(data.data.stck_prpr);
        const change = data.data.prdy_ctrt;
        const sign = parseFloat(change) >= 0 ? "+" : "";
        setPriceInfo(`현재가: ₩${price.toLocaleString()} (${sign}${change}%)`);
      } else {
        setPriceInfo("현재가 조회 불가");
      }
    } catch {
      setPriceInfo("조회 실패");
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
    setSearchQuery("");
    setPriceInfo(null);
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
            <Label>증권사</Label>
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

          {/* 종목 검색 */}
          <div className="space-y-1.5" ref={searchRef}>
            <Label>종목 검색</Label>
            <div className="relative">
              <Input
                placeholder="종목명 또는 종목코드 입력 (예: 삼성전자, 005930)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // 직접 입력 시 선택 해제
                  if (symbol) {
                    setSymbol("");
                    setName("");
                    setPriceInfo(null);
                  }
                }}
                onFocus={() => {
                  if (searchResults.length > 0) setShowResults(true);
                }}
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                </div>
              )}

              {/* 검색 결과 드롭다운 */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.code}
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0"
                      onClick={() => selectStock(stock)}
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          {stock.name}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">{stock.code}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                        {stock.market}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {showResults && searchQuery.trim().length >= 1 && searchResults.length === 0 && !searchLoading && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-4 text-center text-sm text-gray-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>

            {/* 선택된 종목 정보 */}
            {symbol && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded px-2.5 py-1.5 flex items-center justify-between">
                <span>
                  ✅ {name} ({symbol})
                </span>
                {priceInfo && <span>{priceInfo}</span>}
              </div>
            )}
          </div>

          {/* 수량 & 평균단가 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>보유수량</Label>
              <Input
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>매수평균가</Label>
              <Input
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
