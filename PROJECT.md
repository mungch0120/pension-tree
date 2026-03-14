# Pension Tree 🌳

> 개인 투자 포트폴리오 관리 & 분석 플랫폼

## 1. 프로젝트 개요

**Pension Tree**는 한국투자증권 OpenAPI를 활용한 개인 투자 포트폴리오 통합 관리 서비스입니다.
전체 계좌, 종목별, 증권사별로 포트폴리오 현황을 한눈에 파악하고, 기간별 수익률·매매 내역을 분석할 수 있습니다.

### 핵심 가치
- **한눈에 보는 내 자산**: 전 계좌 통합 대시보드
- **기간별 수익률 추적**: 일/주/월/분기/연간 + 커스텀 기간
- **매매 히스토리 분석**: 매수/매도 패턴, 수익/손실 종목 분석
- **모바일 퍼스트**: 언제 어디서나 내 포트폴리오 확인

---

## 2. 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| **Frontend** | Next.js 15 + TypeScript | App Router, RSC |
| **UI** | Tailwind CSS + shadcn/ui | 반응형 (모바일/데스크탑) |
| **차트** | Recharts 또는 Lightweight Charts | 수익률·포트폴리오 시각화 |
| **상태관리** | Zustand | 경량, 심플 |
| **Backend** | Next.js API Routes | 풀스택 |
| **DB** | SQLite (Drizzle ORM) | 로컬 우선, 경량 |
| **증권 API** | 한국투자증권 OpenAPI | REST + WebSocket |
| **MCP** | korea-investment-mcp | NestJS 기반 MCP 서버 (검토) |
| **인증** | 한투 OAuth (AppKey/AppSecret) | 토큰 자동 갱신 |
| **배포** | Vercel 또는 로컬 | 개인용 |

---

## 3. 핵심 기능

### 3.1 대시보드 (Overview)
- 전체 자산 총액 + 일간 변동률
- 계좌별 자산 비중 (파이 차트)
- 종목별 보유 비중 (트리맵 또는 도넛)
- 오늘의 수익/손실 요약
- 주요 지수 대비 내 수익률 비교 (KOSPI, S&P500)

### 3.2 포트폴리오 현황
- **전체 계좌 통합 뷰**
  - 보유 종목 리스트 (현재가, 평가금액, 수익률, 비중)
  - 정렬/필터: 수익률순, 평가금액순, 비중순
- **계좌별 뷰**
  - 증권사/계좌번호별 분리 조회
  - 계좌별 예수금, 총 평가, D+2 예수금
- **종목별 상세**
  - 매수 평균가, 현재가, 수익률
  - 해당 종목 매매 히스토리
  - 일봉/주봉 차트 + 내 매수/매도 포인트 표시

### 3.3 수익률 분석
- **기간별 수익률**: 1일, 1주, 1개월, 3개월, 6개월, 1년, YTD, 전체
- **커스텀 기간**: 날짜 범위 직접 선택
- **수익률 차트**: 일별 누적 수익률 라인 차트
- **벤치마크 비교**: KOSPI/KOSDAQ/S&P500 대비 초과 수익
- **MDD (최대 낙폭)**: 기간 내 최대 손실 구간 표시
- **VWAP 분석**: 거래량 가중평균 대비 현재가 위치

### 3.4 매매 내역
- **매수/매도 히스토리**: 날짜, 종목, 수량, 단가, 금액
- **실현 손익**: 매도 완료 종목의 확정 수익/손실
- **매매 패턴 분석**:
  - 요일별/시간대별 매매 빈도
  - 평균 보유 기간
  - 승률 (이익 매매 / 전체 매매)
- **세금/수수료 계산**: 거래세, 증권사 수수료 포함 실질 수익

### 3.5 자산 배분 분석
- **섹터별 비중**: 산업 분류 기준 파이 차트
- **자산 유형별**: 주식, ETF, 채권, 현금
- **시가총액별**: 대형/중형/소형주 비중
- **국내/해외 비중** (향후 해외주식 지원 시)

### 3.6 알림 & 리포트
- **목표가 알림**: 종목별 목표가/손절가 설정
- **리밸런싱 알림**: 목표 비중 대비 이탈 시 알림
- **주간/월간 리포트**: 자동 생성, 텔레그램 전송 (OpenClaw 연동)
- **배당 캘린더**: 보유 종목 배당일/배당금 정보

### 3.7 설정
- 계좌 연동 관리 (한투 AppKey/AppSecret)
- 다크/라이트 테마
- 알림 설정 (텔레그램, 이메일)
- 데이터 갱신 주기 설정

---

## 4. 한국투자증권 OpenAPI 활용 범위

### 필수 API
| API | 용도 |
|-----|------|
| 접근토큰 발급 | OAuth 인증 |
| 주식잔고조회 | 보유 종목, 수량, 평가 |
| 주식현재가 시세 | 실시간 가격 |
| 주식현재가 일별 | 차트 데이터 |
| 매매내역조회 | 체결 히스토리 |
| 예수금조회 | 현금 잔고 |
| 계좌손익조회 | 기간별 손익 |

### 보조 API
| API | 용도 |
|-----|------|
| 업종별 시세 | 벤치마크 지수 |
| 종목기본정보 | 섹터/산업 분류 |
| 배당정보 | 배당 캘린더 |
| 투자자매매동향 | 수급 분석 |

### MCP 서버 활용 (korea-investment-mcp)
- **GitHub**: `jissp/korea-investment-mcp` (NestJS, SSE 기반)
- **제공 도구**: 종목조회, 투자자매매동향, 거래량순위, 등락률순위, 신용잔고, 공매도 등
- **활용 방안**: 
  - AI 분석 기능 (OpenClaw 연동 시) → MCP를 통해 실시간 데이터 질의
  - 직접 API 호출 대비 장점: MCP 프로토콜로 표준화된 데이터 접근
- **한계**: 현재 잔고조회/매매내역 API 미지원 → 핵심 포트폴리오 기능은 직접 API 연동 필요
- **결론**: MCP는 **보조 분석용으로 활용**, 핵심 포트폴리오 데이터는 **직접 OpenAPI 연동**

---

## 5. 데이터 모델 (초안)

```
accounts          # 계좌 정보
├── id
├── broker        # 증권사 (한국투자증권)
├── account_no    # 계좌번호
├── alias         # 별칭 ("연금", "ISA" 등)
├── app_key
├── app_secret
└── created_at

holdings          # 현재 보유 종목 (스냅샷)
├── id
├── account_id    → accounts.id
├── symbol        # 종목코드
├── name          # 종목명
├── quantity      # 보유수량
├── avg_price     # 매수평균가
├── current_price # 현재가
├── eval_amount   # 평가금액
├── profit_loss   # 평가손익
├── profit_rate   # 수익률
├── sector        # 업종
└── updated_at

transactions      # 매매 내역
├── id
├── account_id    → accounts.id
├── symbol
├── name
├── type          # BUY / SELL
├── quantity
├── price
├── amount
├── fee           # 수수료
├── tax           # 세금
├── traded_at
└── created_at

daily_snapshots   # 일별 포트폴리오 스냅샷 (수익률 추적)
├── id
├── account_id    → accounts.id (null = 전체)
├── date
├── total_eval    # 총 평가금액
├── total_invest  # 총 투자원금
├── cash          # 예수금
├── profit_loss   # 평가손익
├── profit_rate   # 수익률
└── created_at

benchmarks        # 벤치마크 지수 일별
├── id
├── index_name    # KOSPI, KOSDAQ, S&P500
├── date
├── close_price
└── change_rate
```

---

## 6. 페이지 구조

```
/ (대시보드)
├── /portfolio            # 포트폴리오 현황
│   ├── /portfolio/all    # 전체 계좌
│   ├── /portfolio/[accountId]  # 계좌별
│   └── /portfolio/stock/[symbol]  # 종목 상세
├── /performance          # 수익률 분석
├── /transactions         # 매매 내역
├── /allocation           # 자산 배분
├── /reports              # 리포트
├── /alerts               # 알림 설정
└── /settings             # 설정 (계좌 연동 등)
```

### 반응형 레이아웃
- **모바일** (< 768px): 하단 탭 네비게이션, 카드형 리스트, 스와이프 인터랙션
- **데스크탑** (≥ 768px): 사이드바 네비게이션, 그리드 레이아웃, 상세 차트

---

## 7. 비기능 요구사항

| 항목 | 요구사항 |
|------|---------|
| **보안** | API 키 암호화 저장, HTTPS 필수, 세션 관리 |
| **성능** | 초기 로딩 < 2초, API 캐싱 (5분), 옵티미스틱 UI |
| **접근성** | WCAG 2.1 AA, 키보드 네비게이션, 스크린리더 |
| **오프라인** | 마지막 스냅샷 캐시, 오프라인 시 캐시 데이터 표시 |
| **다크모드** | 시스템 설정 연동 + 수동 토글 |

---

## 8. 개발 로드맵

### Phase 1: MVP (2주)
- [ ] 프로젝트 셋업 (Next.js + Tailwind + shadcn/ui + Drizzle)
- [ ] 한투 API 인증 플로우 (토큰 발급/갱신)
- [ ] 계좌 연동 & 잔고 조회
- [ ] 기본 대시보드 (총 자산, 보유 종목 리스트)
- [ ] 모바일/데스크탑 반응형 레이아웃

### Phase 2: 분석 기능 (2주)
- [ ] 일별 스냅샷 저장 & 수익률 차트
- [ ] 매매 내역 조회 & 리스트
- [ ] 종목별 상세 페이지 (차트 + 매매 포인트)
- [ ] 벤치마크 비교

### Phase 3: 고급 기능 (2주)
- [ ] 자산 배분 분석 (섹터, 유형, 시총)
- [ ] 매매 패턴 분석 (승률, 평균 보유기간)
- [ ] 알림 시스템 (목표가, 리밸런싱)
- [ ] 주간/월간 리포트 자동 생성

### Phase 4: 확장 (이후)
- [ ] 다중 증권사 지원 (키움, 미래에셋 등)
- [ ] 해외주식 포트폴리오
- [ ] MCP 서버 연동 (AI 분석)
- [ ] 세금 시뮬레이션 (양도세, 종합과세)
- [ ] 공유 기능 (읽기 전용 링크)

---

## 9. 한투 API 사전 준비

1. [한국투자증권 OpenAPI 포털](https://apiportal.koreainvestment.com/) 가입
2. 앱 생성 → **App Key** / **App Secret** 발급
3. 실전투자/모의투자 선택
4. API 사용 신청 (잔고조회, 주문, 시세 등)

### 환경변수
```env
KIS_APP_KEY=your_app_key
KIS_APP_SECRET=your_app_secret
KIS_ACCOUNT_NO=your_account_number
KIS_HTS_ID=your_hts_id
KIS_BASE_URL=https://openapi.koreainvestment.com:9443  # 실전
# KIS_BASE_URL=https://openapivts.koreainvestment.com:29443  # 모의
```

---

## 10. 참고 자료

- [한투 OpenAPI 공식 문서](https://apiportal.koreainvestment.com/apiservice)
- [한투 OpenAPI GitHub (공식 샘플)](https://github.com/koreainvestment/open-trading-api)
- [korea-investment-mcp (MCP 서버)](https://github.com/jissp/korea-investment-mcp)
- [한투 API 코딩 컨벤션](https://github.com/koreainvestment/open-trading-api/blob/master/docs/convention.md)
