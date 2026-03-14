export default function TransactionsPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">매매 내역</h1>
        <p className="text-sm text-gray-500 mt-1">매수/매도 히스토리 · 실현손익</p>
      </div>
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">계좌번호 설정 후 조회 가능합니다</p>
        </div>
      </div>
    </div>
  );
}
