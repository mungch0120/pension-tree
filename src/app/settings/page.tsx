export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-sm text-gray-500 mt-1">계좌 연동 · 알림 · 테마</p>
      </div>
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h2 className="font-medium text-gray-900">계좌 연동</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            <span className="font-medium">API 상태:</span>{" "}
            <span className="text-emerald-600">연결됨</span>
          </p>
          <p className="text-xs text-gray-400">
            계좌번호와 HTS ID는 .env.local 파일에서 설정합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
