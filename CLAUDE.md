# mention-tracker 개발 가이드

## 프로젝트 개요

브랜드 키워드의 온라인 언급(멘션)을 주간 단위로 수집·시각화하는 모니터링 도구.

- **URL**: https://mention-tracker-production.up.railway.app
- **배포**: Railway (GitHub main 브랜치 push 시 자동 배포)
- **자동 수집**: 매주 월요일 오전 9시 (node-cron)

## 기술 스택

| 계층 | 기술 |
|------|------|
| 프론트엔드 | React 19 + TypeScript + Vite |
| 백엔드 | Node.js + Express 5 (ESM) |
| DB | Firebase Firestore (SDK 아닌 REST API 직접 호출) |
| 외부 API | 네이버 검색 API, Google Serper API |
| 배포 | Railway + Dockerfile + nixpacks.toml |

## 아키텍처

```
브라우저
  └─ React SPA (dist/ 정적 파일)
       └─ Express 서버 (server/index.js)
            ├─ /api/results      ← Firestore weeks 컬렉션 읽기
            ├─ /api/collect      ← 네이버+구글 수집 → Firestore 저장
            ├─ /api/keywords     ← Firestore config/keywords 읽기
            └─ /api/keywords POST ← config/keywords 저장
```

프론트엔드 정적 파일과 API 서버가 같은 Express 인스턴스에서 서빙됨.
개발 시에는 Vite dev server (5173) + Express 서버 (3001) 분리 운영.

## 핵심 데이터 구조

### Firestore 컬렉션

```
weeks/
  {YYYY-Www}/          ← 주차 라벨 (예: 2025-W18)
    collectedAt: ISO 날짜 문자열
    data: KeywordData[]  ← JSON.stringify로 직렬화 저장

config/
  keywords/
    list: string[]     ← 수집 키워드 목록
```

모든 필드는 `stringValue`로만 저장 (Firestore REST API 단순화).  
배열·객체는 `JSON.stringify` → `JSON.parse` 로 직렬화/역직렬화.

### TypeScript 핵심 타입 (`src/types/index.ts`)

```ts
MentionItem      { title, link, date?, snippet?, titleMatch? }
NaverTypeResult  { total, periodCount, items }   // periodCount = 최근 7일 건수
NaverResult      { blog, news, cafe }            // NaverTypeResult x 3
GoogleResult     { total, periodCount, items }
KeywordData      { keyword, naver, google }
WeeklyResult     { week, collectedAt, data }
```

## 수집 로직 핵심

### 네이버 (`server/api/naver.js`)
- 검색 타입: blog, news, cafearticle
- 쿼리 형식: `"키워드"` (정확도 100% 큰따옴표 필수)
- display: 100, sort: date
- `periodCount` = items 중 수집 시점 기준 최근 7일 이내 게시 건수
- 날짜 포맷: YYYYMMDD (blog) 또는 RFC2822 (news/cafe)
- `titleMatch` = 원문 title에 `<b>` 태그 포함 여부 (네이버가 키워드 강조 시 `<b>` 사용)

### 구글 (`server/api/google.js`)
- API: Google Serper (`https://google.serper.dev/search`)
- 파라미터: `gl: 'kr', hl: 'ko', num: 10`
- `total` = `searchInformation.totalResults` (없으면 organic 개수)
- `periodCount` = organic 결과 개수 (구글은 날짜 필터 없음)
- `titleMatch` = title에 keyword 문자열 포함 여부 (대소문자 무시)

### 데이터 보존 정책 (`server/data/store.js`)
- 84일(12주) 이상 지난 주차는 `items: []` 로 비워 메타데이터(total)만 유지
- `cleanupOldWeeks()` 는 수집(`/api/collect`) 실행마다 호출

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/results` | 모든 주차 결과 반환 |
| POST | `/api/collect` | 즉시 수집 실행. body: `{ keywords: string[] }` |
| GET | `/api/keywords` | 저장된 키워드 목록 반환 |
| POST | `/api/keywords` | 키워드 저장. body: `{ keywords: string[] }` |

## 프론트엔드 컴포넌트

```
App.tsx
  ├─ KeywordManager    키워드 추가/제거, 조회 기간 선택, 즉시 수집 버튼
  ├─ SummaryCards      선택 기간 내 총 멘션 수 요약 카드
  ├─ WeeklyChart       Recharts 기반 주간 추이 그래프
  └─ MentionList       수집 결과 상세 목록 (날짜/링크/titleMatch)
```

- `src/api/index.ts`: 백엔드 API 호출 래퍼 (axios)
- `src/utils.ts`: 날짜 파싱, 범위 레이블 생성

## 환경변수 (`.env`)

```
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
SERPER_API_KEY=
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
PORT=3001              # 기본값
```

## 로컬 개발

```bash
# 백엔드 서버 (포트 3001)
npm run server

# 프론트엔드 dev server (포트 5173)
npm run dev
```

Vite dev 서버는 `vite.config.ts`에서 `/api` 요청을 `localhost:3001`로 프록시.

## 배포

```bash
git push origin master   # Railway 자동 빌드·배포
```

빌드 순서: `npm run build` → `dist/` 생성 → Express가 정적 서빙.

---

## CSS 작업 주의사항

### 폰트 크기 일괄 변경 시 플레이스홀더 방식 필수
```bash
# 잘못된 방법 (연쇄 치환으로 12px→16px 되는 버그)
sed 's/font-size: 12px/font-size: 14px/g; s/font-size: 14px/font-size: 16px/g'

# 올바른 방법
sed 's/font-size: 12px/font-size: __C__/g; s/font-size: 14px/font-size: __E__/g; s/__C__/14px/g; s/__E__/16px/g'
```

### overflow 설정 위치
- `overflow: hidden` on sidebar → 사이드바 내용 사라짐 (하지 말 것)
- `overflow-x: clip` on sidebar → 렌더링 깨짐 (하지 말 것)
- `overflow-x: hidden` on `.app` → 왼쪽 콘텐츠 잘림 (하지 말 것)
- **올바른 위치**: `body`에 `overflow-x: hidden`

### flex/grid 자식 shrink
줄어들어야 하는 flex/grid 자식에는 반드시 `min-width: 0` 추가.
`.content`, `.platform-card` 등 `flex:1` 또는 `1fr` 쓰는 요소에 적용.

### 반응형 그리드
미디어 쿼리 하드코딩보다 `auto-fit minmax` 우선 사용:
```css
grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
```

## 반응형 breakpoint
- **1100px 이하**: summary-cards 2열, platform-grid 1열
- **900px 이하**: 사이드바 상단 배치 (flex-direction: column)
- **480px 이하**: 헤더 세로 정렬
