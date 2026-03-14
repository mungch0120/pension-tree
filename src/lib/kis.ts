/**
 * KIS (Korea Investment & Securities) OpenAPI Client
 * 한국투자증권 OpenAPI 클라이언트
 */

const BASE_URL = process.env.KIS_BASE_URL || "https://openapi.koreainvestment.com:9443";
const APP_KEY = process.env.KIS_APP_KEY || "";
const APP_SECRET = process.env.KIS_APP_SECRET || "";
const ACCOUNT_NO = process.env.KIS_ACCOUNT_NO || "";
const ACCOUNT_PROD = process.env.KIS_ACCOUNT_PROD || "01";

// Token cache (in-memory, server-side)
let tokenCache: { token: string; expiresAt: Date } | null = null;

/**
 * 접근토큰 발급/캐싱
 */
export async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > new Date()) {
    return tokenCache.token;
  }

  const res = await fetch(`${BASE_URL}/oauth2/tokenP`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      appkey: APP_KEY,
      appsecret: APP_SECRET,
    }),
  });

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status}`);
  }

  const data = await res.json();
  tokenCache = {
    token: data.access_token,
    expiresAt: new Date(data.access_token_token_expired),
  };

  return tokenCache.token;
}

/**
 * KIS API 공통 GET 요청
 */
export async function kisGet(path: string, trId: string, params: Record<string, string> = {}) {
  const token = await getToken();
  const query = new URLSearchParams(params).toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      authorization: `Bearer ${token}`,
      appkey: APP_KEY,
      appsecret: APP_SECRET,
      tr_id: trId,
      custtype: "P",
    },
  });

  const data = await res.json();
  if (data.rt_cd !== "0") {
    throw new Error(`KIS API Error [${data.msg_cd}]: ${data.msg1}`);
  }

  return data;
}

/**
 * KIS API 공통 POST 요청
 */
export async function kisPost(path: string, trId: string, body: Record<string, string> = {}) {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      authorization: `Bearer ${token}`,
      appkey: APP_KEY,
      appsecret: APP_SECRET,
      tr_id: trId,
      custtype: "P",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (data.rt_cd !== "0") {
    throw new Error(`KIS API Error [${data.msg_cd}]: ${data.msg1}`);
  }

  return data;
}

// ─── Account APIs ───

export interface Holding {
  pdno: string;         // 종목코드
  prdt_name: string;    // 종목명
  hldg_qty: string;     // 보유수량
  pchs_avg_pric: string; // 매수평균가
  pchs_amt: string;     // 매수금액
  prpr: string;         // 현재가
  evlu_amt: string;     // 평가금액
  evlu_pfls_amt: string; // 평가손익
  evlu_pfls_rt: string;  // 수익률(%)
  fltt_rt: string;      // 등락률
}

export interface AccountSummary {
  dnca_tot_amt: string;        // 예수금
  scts_evlu_amt: string;       // 유가증권평가
  tot_evlu_amt: string;        // 총평가금액
  pchs_amt_smtl_amt: string;   // 매입금액합계
  evlu_amt_smtl_amt: string;   // 평가금액합계
  evlu_pfls_smtl_amt: string;  // 평가손익합계
  asst_icdc_erng_rt: string;   // 자산증감수익률
}

/**
 * 주식잔고조회
 */
export async function getBalance() {
  if (!ACCOUNT_NO) {
    throw new Error("KIS_ACCOUNT_NO not configured");
  }

  const data = await kisGet(
    "/uapi/domestic-stock/v1/trading/inquire-balance",
    "TTTC8434R",
    {
      CANO: ACCOUNT_NO,
      ACNT_PRDT_CD: ACCOUNT_PROD,
      AFHR_FLPR_YN: "N",
      OFL_YN: "",
      INQR_DVSN: "02", // 종목별
      UNPR_DVSN: "01",
      FUND_STTL_ICLD_YN: "N",
      FNCG_AMT_AUTO_RDPT_YN: "N",
      PRCS_DVSN: "00",
      CTX_AREA_FK100: "",
      CTX_AREA_NK100: "",
    }
  );

  return {
    holdings: (data.output1 || []) as Holding[],
    summary: (data.output2?.[0] || data.output2 || {}) as AccountSummary,
  };
}

// ─── Quotation APIs ───

export interface StockPrice {
  stck_prpr: string;    // 현재가
  prdy_vrss: string;    // 전일대비
  prdy_vrss_sign: string; // 부호
  prdy_ctrt: string;    // 전일대비율
  stck_oprc: string;    // 시가
  stck_hgpr: string;    // 고가
  stck_lwpr: string;    // 저가
  acml_vol: string;     // 누적거래량
  hts_avls: string;     // 시가총액(억)
  per: string;
  pbr: string;
}

/**
 * 주식현재가 조회
 */
export async function getPrice(symbol: string): Promise<StockPrice> {
  const data = await kisGet(
    "/uapi/domestic-stock/v1/quotations/inquire-price",
    "FHKST01010100",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: symbol,
    }
  );

  return data.output as StockPrice;
}

export interface DailyPrice {
  stck_bsop_date: string; // 영업일자
  stck_oprc: string;      // 시가
  stck_hgpr: string;      // 고가
  stck_lwpr: string;      // 저가
  stck_clpr: string;      // 종가
  acml_vol: string;       // 거래량
  prdy_vrss: string;      // 전일대비
}

/**
 * 일별 시세 조회 (차트용)
 */
export async function getDailyPrices(
  symbol: string,
  startDate: string,
  endDate: string,
  period: "D" | "W" | "M" | "Y" = "D"
): Promise<DailyPrice[]> {
  const data = await kisGet(
    "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
    "FHKST03010100",
    {
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: symbol,
      FID_INPUT_DATE_1: startDate,
      FID_INPUT_DATE_2: endDate,
      FID_PERIOD_DIV_CODE: period,
      FID_ORG_ADJ_PRC: "0", // 수정주가
    }
  );

  return (data.output2 || []) as DailyPrice[];
}

// ─── Transaction APIs ───

export interface Transaction {
  ord_dt: string;           // 주문일자
  sll_buy_dvsn_cd: string;  // 01:매도, 02:매수
  sll_buy_dvsn_cd_name: string;
  pdno: string;             // 종목코드
  prdt_name: string;        // 종목명
  ord_qty: string;          // 주문수량
  ord_unpr: string;         // 주문단가
  ccld_qty: string;         // 체결수량
  ccld_pric: string;        // 체결단가
  tot_ccld_amt: string;     // 총체결금액
}

/**
 * 일별주문체결조회 (매매내역)
 */
export async function getTransactions(startDate: string, endDate: string) {
  if (!ACCOUNT_NO) {
    throw new Error("KIS_ACCOUNT_NO not configured");
  }

  const data = await kisGet(
    "/uapi/domestic-stock/v1/trading/inquire-daily-ccld",
    "TTTC8001R",
    {
      CANO: ACCOUNT_NO,
      ACNT_PRDT_CD: ACCOUNT_PROD,
      INQR_STRT_DT: startDate,
      INQR_END_DT: endDate,
      SLL_BUY_DVSN_CD: "00", // 전체
      INQR_DVSN: "00",       // 역순
      PDNO: "",               // 전체종목
      CCLD_DVSN: "01",       // 체결만
      ORD_GNO_BRNO: "",
      ODNO: "",
      INQR_DVSN_3: "00",     // 전체
      INQR_DVSN_1: "",
      CTX_AREA_FK100: "",
      CTX_AREA_NK100: "",
    }
  );

  return {
    transactions: (data.output1 || []) as Transaction[],
    summary: data.output2,
  };
}
