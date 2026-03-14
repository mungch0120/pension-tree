export default function PerformancePage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">수익률 분석</h1>
        <p className="text-sm text-gray-500 mt-1">기간별 수익률 · 벤치마크 비교</p>
      </div>
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">📈</p>
          <p className="text-sm">데이터 수집 후 분석 가능합니다</p>
        </div>
      </div>
    </div>
  );
}
