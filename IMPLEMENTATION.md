# 구현 안내

## 기술

Vite 7, JavaScript ES modules, CSS, SVG, HTML dialog, localStorage. 백엔드 없이 정적 데이터로 실행합니다. Node.js 기본 테스트 러너와 Playwright/Chromium으로 검증합니다. 외부 지도나 글꼴 서비스에 의존하지 않습니다.

## 콘텐츠 규모

12권 상세 랜딩, 공통 72개 학습 화면, 본문 구간 52개, 핵심 말씀 카드 48개, 더 깊이 보기 37개, 성경 연결 48개, 역사 정거장 18개를 제공합니다.

## 경로

- `#home` / `#catalog`: 홈·12권
- `#book/hosea`: 책 상세 랜딩
- `#book/hosea/0` ~ `/5`: ①~⑥
- `#book/habakkuk/2/flow-4`: ③의 해당 구간 강조
- `#timeline` / `#timeline/722`: 역사 시간표·특정 정거장
- `#compare/hosea/micah`: 두 왕국의 선지서 비교
- `#journey`: 나의 여정

해시 경로를 사용하므로 정적 호스팅에서 서버 측 라우트 재작성 없이 동작합니다.

## 파일 목록

| 파일 | 역할 |
| --- | --- |
| `README.md`, `IMPLEMENTATION.md` | 실행·구현 문서 |
| `docs/CONTENT_GUIDE.md`, `docs/VALIDATION.md` | 콘텐츠 규칙·명세 검증 대응 |
| `package.json`, `package-lock.json` | 의존성·명령·잠금 파일 |
| `.gitignore`, `index.html` | 생성물 제외·앱 진입점 |
| `src/main.js` | 라우팅·화면 조립·이벤트·저장·모달 |
| `src/style.css` | 반응형 스타일·단계 색상·접근성 |
| `src/data/books.js` | 확정 연대·본문 흐름·핵심 말씀·인물·역사 |
| `src/data/locations.js` | 지리·장소 설명·범례·관련 본문 |
| `src/data/timeline.js` | 전체 역사 정거장·겹치는 사역 |
| `src/data/connections.js` | 연결 유형·인용·적용·주제의 구별 |
| `src/data/deepViews.js` | 책별 깊이 보기·견해·묵상 구별 |
| `src/data/readings.js` | 공식 URL 확인 전 읽기 metadata |
| `src/components/shared.js` | 공통 카드·히브리어 병기·텍스트 이스케이프 |
| `src/components/learning.js` | 공통 ①~⑥ 학습 UI |
| `src/components/map.js` | 개략 지도·실제 이동·제국 영향 구분 |
| `src/components/connections.js` | 정확한 읽기 참조 추출 |
| `tests/data.test.js` | 콘텐츠·참조·히브리어·역사 규칙 검증 |
| `playwright.config.js`, `e2e/app.spec.js` | 실제 브라우저 동작 검증 |

`node_modules`, `dist`, `test-results`는 생성물이며 Git에서 제외합니다.

## 실행과 테스트

```sh
cd /workspace/minor-prophets-walk
npm ci --cache /tmp/prophets-npm-cache
npm run dev -- --port 5173
```

```sh
npm run build
npm test
npm run test:e2e
```

브라우저 테스트는 포트 4173에서 자체 서버를 실행하므로 해당 포트가 비어 있어야 합니다. 기본 Chromium 경로는 `/usr/bin/chromium`입니다.

## 저장 정책

현재 스키마 키는 `prophets-walk-v2`입니다. 초기 임시 화면의 메모는 이전 저장소에서 읽어 보존합니다. 이전 임시 6단계의 학습 완료 기록은 의미가 바뀌었으므로 새 6단계 완료로 재해석하지 않습니다. 이전 저장소를 삭제하지 않습니다. 저장 불가나 데이터 손상은 학습 화면을 막지 않습니다.

## 제한과 의도적 미연결

- 공식 본문 URL 검증은 네트워크 403 때문에 미완료입니다. 읽기 카드·본문 범위·번역·제공처와 전체 읽기 UI는 구현했지만 외부 이동은 비활성 상태입니다.
- 지도는 좌표 기반 개략도입니다. 상세 고대 국경과 행군 경로를 복원하지 않습니다. 요나의 다시스·바다 좌표도 확정하지 않습니다.
- 온라인 계정, 클라우드 동기화, 성경 전문 복제는 제공하지 않습니다.
- 변경은 로컬 작업 폴더에 있으며 Git 커밋·푸시와 환경 게시를 수행하지 않았습니다.
