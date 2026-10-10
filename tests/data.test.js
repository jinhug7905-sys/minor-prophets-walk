import {test} from 'node:test';
import assert from 'node:assert/strict';
import {books,sections,getBook,numerals} from '../src/data/books.js';
import {locations} from '../src/data/locations.js';
import {stations} from '../src/data/timeline.js';
import {connections} from '../src/data/connections.js';
import {deepViews} from '../src/data/deepViews.js';
import {readingTarget} from '../src/data/readings.js';
import {connectionReferences} from '../src/components/connections.js';
import {mapView} from '../src/components/map.js';
import {learning} from '../src/components/learning.js';
import {prose} from '../src/components/shared.js';
const expectedDates=['B.C.760~720','약 B.C.830~820*','B.C.760~750','B.C.586 이전*','약 B.C.760','B.C.750~680','B.C.663~612 사이','B.C.609~605','약 B.C.630년대','B.C.520','B.C.520부터','약 B.C.450~430'];
const corpus=JSON.stringify({books,connections,deepViews,stations,locations});
test('성경책 순서 12권과 6단계의 정확한 제목',()=>{
 assert.deepEqual(books.map(b=>b.name),['호세아','요엘','아모스','오바댜','요나','미가','나훔','하박국','스바냐','학개','스가랴','말라기']);
 assert.equal(new Set(books.map(b=>b.id)).size,12);
 assert.deepEqual(numerals,['①','②','③','④','⑤','⑥']);
 assert.deepEqual(sections.map(s=>s.title),['역사 속을 걸어보기','지금 어디에 있는가?','본문을 걸어보기','핵심 말씀','앞뒤 성경 연결하기','한 장 정리']);
});
test('12권 확정 연대, 모든 ①/⑥과 역사 시간표의 공유 데이터 일치',()=>{
 assert.deepEqual(books.map(b=>b.date),expectedDates);assert.ok(!corpus.includes('B.C.610~605'));
 for(const b of books){assert.ok(learning(b,0).includes(b.date));assert.ok(learning(b,5).includes(b.date));assert.ok(stations.some(s=>s.books.includes(b.id)));}
 assert.ok(deepViews.joel.some(d=>d.text.includes('견해')));assert.ok(deepViews.obadiah.some(d=>d.text.includes('견해')));
});
test('모든 데이터 참조와 핵심 말씀의 본문 위치가 유효하고 72개 화면이 렌더링된다',()=>{
 for(const b of books){
  assert.ok(b.history.length&&b.flow.length&&b.keys.length&&b.places.length);
  for(const p of b.places)assert.ok(locations[p],p);
  for(const id of b.related)assert.ok(getBook(id),id);
  assert.ok(stations.some(s=>s.id===b.next));
  for(const [, ,at,,context] of b.keys){for(const n of Array.isArray(at)?at:[at])assert.ok(b.flow[n]);assert.ok(context);}
  for(const c of connections[b.id]){assert.ok(c.category&&c.kind&&c.explanation);for(const id of c.bookIds)assert.ok(getBook(id));}
  assert.equal(new Set(deepViews[b.id].map(d=>d.id)).size,deepViews[b.id].length);
  for(let i=0;i<6;i++)assert.ok(learning(b,i).length>200);
 }
});
test('히브리어의 바로 다음에 한글 발음이 있고 아모스는 히브리어 언어유희다',()=>{
 for(const match of corpus.matchAll(/[\u0590-\u05ff]+/g)){
  assert.match(corpus.slice(match.index+match[0].length),/^\s*\([^)]*[가-힣][^)]*\)/,match[0]);
 }
 assert.ok(corpus.includes('קַיִץ (카이츠, 여름 과일)'));assert.ok(corpus.includes('קֵץ (케츠, 끝)'));
 assert.ok(corpus.includes('히브리어 언어유희'));assert.ok(!corpus.includes('히브리어 말놀이'));
 assert.match(prose('חֶסֶד (헤세드)'),/lang="he"/);
});
test('성경 URL은 검증 전 null이며 정확한 본문 metadata만 제공한다',()=>{
 const t=readingTarget('합 2:1~5','문맥 읽기');assert.equal(t.url,null);assert.equal(t.status,'공식 링크 확인 필요');assert.equal(t.reference,'합 2:1~5');assert.equal(t.translation,'개역개정');
 for(const b of books){assert.ok(learning(b,5).includes(`${b.name} 전체 읽기`));for(const c of connections[b.id])for(const r of connectionReferences(c))assert.match(r,/\d/);}
 assert.ok(!corpus.includes('https://'));
});
test('요나에만 실제 인물 이동선, 제국 영향은 점선이며 국경 안내가 있다',()=>{
 for(const b of books){const map=mapView(b);assert.equal(map.includes('<polyline class="person-route"'),b.id==='jonah');assert.ok(map.includes('시대별 국경'));assert.ok(map.includes('점선 화살표'));}
 assert.ok(mapView(getBook('jonah')).includes('이스라엘 → 욥바 → 다시스 방향 → 바다 → 니느웨'));
 assert.ok(mapView(getBook('habakkuk')).includes('stroke-dasharray="7 6"'));
 assert.equal(locations.olives.passage,'슥 14:4');assert.ok(locations.olives.why.includes('직접 연결하지 않는다'));
});
test('하박국 두루마리 배경과 요시야/여호야김 비교가 인과 단정 없이 보존된다',()=>{
 const d=deepViews.habakkuk.find(d=>d.id==='scroll');assert.ok(d.text.includes('불에 태운다'));assert.ok(d.text.includes('단정하지 않는다'));assert.ok(d.passages.includes('렘 36'));
 assert.ok(deepViews.habakkuk.find(d=>d.id==='kings'));
 assert.equal(getBook('habakkuk').keys[1][4],'합 2:1~5');
});
test('말라기 여섯 논쟁+에필로그, 두 사자·정경적 해석·묵상 구분이 보존된다',()=>{
 assert.equal(getBook('malachi').flow.length,7);
 const text=JSON.stringify(deepViews.malachi);
 for(const word of ['3:1a','3:1b','세례 요한','레위 자손','예수라는 이름을 명시하지는 않는다','하나님의 아픈 마음','묵상적 표현','학습적 종합 표현','기념책','특별한 소유','복합 인용','번역상의 뉘앙스'])assert.ok(text.includes(word),word);
 assert.ok(connections.malachi.some(c=>c.kind.includes('직접 인용 아님')));
});
test('역사 겹침, 주요 정거장과 니느웨·바사 역사의 순서를 보존한다',()=>{
 for(const id of ['722','612','586','return','520','516'])assert.ok(stations.find(s=>s.id===id));
 const at=id=>stations.findIndex(s=>s.id===id);assert.ok(at('612')<at('609'));assert.ok(at('586')<at('return'));assert.ok(at('458')<at('malachi')&&at('malachi')<at('444'));
 assert.ok(deepViews.jonah[0].text.includes('B.C.705'));assert.ok(deepViews.nahum[1].text.includes('교재'));
 assert.ok(learning(getBook('micah'),0).includes('같은 시대, 두 왕국'));
 for(const id of ['haggai','zechariah'])assert.ok(connections[id].some(c=>c.kind.includes('B.C.520')));
});
