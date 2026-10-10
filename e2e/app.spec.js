import {test,expect} from '@playwright/test';
import {books,sections} from '../src/data/books.js';
import {deepViews} from '../src/data/deepViews.js';
const close=async page=>{await page.getByRole('button',{name:'상세 내용 닫기'}).click();await expect(page.locator('dialog')).not.toBeVisible();};
const noOverflow=async page=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
test('12권 홈·랜딩·72단계와 연대 일치, 모바일 가로 넘침 및 런타임 오류 없음',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width:320,height:740});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await expect(page.locator('.book-card')).toHaveCount(12);await noOverflow(page);
 for(const b of books){
  await expect(page.locator(`[data-book="${b.id}"] .date`)).toHaveText(b.date);
 }
 for(const b of books){
  await page.goto(`/#book/${b.id}`);await expect(page.locator('.book-landing h1')).toHaveText(b.name);
  await expect(page.locator('.sticky-era .book-date')).toHaveText(b.date);await noOverflow(page);
  for(let i=0;i<6;i++){
   await page.locator('.step-nav a').nth(i).click();await expect(page.locator('.lesson-title h1')).toContainText(sections[i].title);
   await expect(page.locator('.step-nav a').nth(i)).toHaveAttribute('aria-current','step');await noOverflow(page);
   if(i===0||i===5){for(const date of await page.locator('.book-date').allTextContents())expect(date).toBe(b.date);}
   if(i===5)await expect(page.getByRole('button',{name:`📖 ${b.name} 전체 읽기`,exact:true})).toBeVisible();
   for(const h of await page.locator('[lang="he"]').all())expect(await h.evaluate(n=>n.parentElement.textContent)).toMatch(/[\u0590-\u05ff]+\s+\([^)]*[가-힣]/);
  }
 }
 expect(errors).toEqual([]);
});
test('모든 본문 구간과 깊이 보기가 열리고 정확한 읽기 metadata를 제공한다',async({page})=>{
 test.setTimeout(90000);
 for(const b of books){
  await page.goto(`/#book/${b.id}/2`);
  for(let i=0;i<b.flow.length;i++){
   await page.locator(`[data-flow="${i}"]`).click();await expect(page.locator('#dialog-title')).toContainText(b.flow[i][0]);
   await expect(page.locator('dialog .context-pair')).toBeVisible();
   const target=await page.locator('dialog [data-reading]').first().getAttribute('data-reading');expect(JSON.parse(target).reference).toBe(b.flow[i][0]);await close(page);
  }
  await page.goto(`/#book/${b.id}/5`);
  for(const d of deepViews[b.id]){
   await page.locator(`.summary-sheet [data-deep="${d.id}"]`).click();await expect(page.locator('#dialog-title')).toContainText(d.title);await expect(page.locator('.dialog-body')).toContainText(d.text);
   for(const h of await page.locator('dialog [lang="he"]').all())expect(await h.evaluate(n=>n.parentElement.textContent)).toMatch(/[가-힣]/);
   await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();
  }
 }
});
test('요나의 실제 이동, 가상 이동선 금지, 전체 지도와 키보드 장소 탐색',async({page})=>{
 for(const b of books){await page.goto(`/#book/${b.id}/1`);await expect(page.locator('.map-point')).toHaveCount(Math.min(b.places.length,5));await expect(page.locator('.person-route')).toHaveCount(b.id==='jonah'?1:0);await expect(page.locator('.map-legend')).toContainText('점선 화살표');}
 await page.goto('/#book/joel/1');await page.getByRole('button',{name:'🗺️ 전체 지도 크게 보기'}).click();await expect(page.locator('dialog .map-point')).toHaveCount(8);await noOverflow(page);await close(page);
 await page.goto('/#book/zechariah/1');const point=page.locator('.map-point[data-place="olives"]');await point.focus();await page.keyboard.press('Enter');await expect(page.locator('dialog')).toContainText('슥 14:4');await expect(page.locator('dialog')).toContainText('직접 연결하지 않는다');await close(page);await expect(point).toBeFocused();
 await page.goto('/#book/jonah/1');await expect(page.locator('.route-sequence')).toContainText('이스라엘 → 욥바 → 다시스 방향 → 바다 → 니느웨');
});
test('아모스 8장은 히브리어 언어유희이며 발음이 병기된다',async({page})=>{
 await page.goto('/#book/amos/3');await page.locator('[data-deep="wordplay"]').click();await expect(page.locator('#dialog-title')).toContainText('히브리어 언어유희');await expect(page.locator('dialog')).toContainText('קַיִץ (카이츠, 여름 과일)');await expect(page.locator('dialog')).toContainText('קֵץ (케츠, 끝)');await expect(page.locator('dialog')).not.toContainText('히브리어 말놀이');await expect(page.locator('dialog')).toContainText('여름 과일 → 끝 → 심판');
});
test('하박국 역사 배경, 합 2:4 문맥으로 읽기 및 ③ 위치 연결',async({page})=>{
 await page.goto('/#book/habakkuk/0');await expect(page.locator('.sticky-era')).toContainText('B.C.609~605');await page.locator('[data-deep="scroll"]').click();await expect(page.locator('dialog')).toContainText('하박국 본문은 두 사건을 직접 연결하지 않는다');await close(page);
 await page.goto('/#book/habakkuk/3');const key=page.locator('.key-card').filter({hasText:'책의 중심축'});await expect(key).toContainText('파수대에서 기다린 다음');const meta=JSON.parse(await key.locator('[data-reading]').getAttribute('data-reading'));expect(meta.reference).toBe('합 2:1~5');await key.getByRole('link',{name:'③ 본문 흐름에서 위치 보기 →'}).click();await expect(page.locator('[data-flow="4"]')).toHaveClass(/highlighted/);await expect(page.locator('[data-flow="4"]')).toBeFocused();
});
test('말라기 두 사자, 묵상 표현과 신약 연결의 구분',async({page})=>{
 await page.goto('/#book/malachi/2');await expect(page.locator('.flow-card')).toHaveCount(7);await expect(page.locator('aside')).toContainText('기념책');await expect(page.locator('aside')).toContainText('학습적 종합 표현');
 await page.locator('[data-deep="messengers"]').click();for(const phrase of ['3:1a','3:1b','세례 요한','정경적 해석','예수라는 이름을 명시하지는 않는다'])await expect(page.locator('dialog')).toContainText(phrase);await close(page);
 await page.locator('[data-deep="love"]').click();await expect(page.locator('dialog')).toContainText('하나님의 아픈 마음');await expect(page.locator('dialog')).toContainText('묵상적 표현');await close(page);
 await page.goto('/#book/malachi/4');await page.getByRole('button',{name:'✝️ 신약',exact:true}).click();await expect(page.locator('.connection-card:visible')).toHaveCount(4);await expect(page.locator('.connection-card:visible').filter({hasText:'의로운 해'})).toContainText('직접 인용 아님');
});
test('역사 정거장, 미가 비교 및 성경책 순서가 구분된다',async({page})=>{
 await page.goto('/#timeline');await expect(page.locator('.page-heading')).toContainText('성경책 순서 ≠ 역사 순서 ≠ 주제 연결');for(const id of ['722','612','586','return','520','516']){await page.locator(`[data-station-open="${id}"]`).click();await expect(page.locator('dialog')).toBeVisible();await close(page);}
 await expect(page.locator('[data-station="705"]')).toContainText('산헤립');await expect(page.locator('[data-station="malachi"]')).toContainText('B.C.444');await expect(page.locator('[data-station="444"]')).toContainText('시간적으로 겹칩니다');
 await page.goto('/#book/micah/0');await page.getByRole('link',{name:'🔗 호세아와 미가 비교하기'}).click();await expect(page.locator('.comparison-card')).toHaveCount(2);await expect(page.locator('h1')).toContainText('호세아와 미가');
 await page.goto('/#book/haggai/5');await expect(page.locator('.canonical-nav')).toContainText('스바냐');await expect(page.locator('.canonical-nav')).toContainText('스가랴');await expect(page.locator('.next-card')).toContainText('B.C.516');
});
test('공식 URL을 생성하지 않고 12권 전체 읽기의 확인 필요 상태를 표시한다',async({page})=>{
 for(const b of books){await page.goto(`/#book/${b.id}/5`);await page.getByRole('button',{name:`📖 ${b.name} 전체 읽기`,exact:true}).click();await expect(page.locator('.target-metadata')).toContainText('공식 링크 확인 필요');await expect(page.locator('.target-metadata')).toContainText('개역개정');await expect(page.locator('dialog button[disabled]')).toHaveCount(1);await expect(page.locator('a[href^="http"]')).toHaveCount(0);await close(page);}
});
test('검색·완료·메모 영속 저장, 손상된 저장소 및 메모 HTML 안전 처리',async({page})=>{
 await page.goto('/');await page.locator('#search').fill('아모스');await expect(page.locator('.book-card:visible')).toHaveCount(1);await page.locator('#search').fill('존재하지 않는 책');await expect(page.locator('#search-status')).toContainText('검색 결과가 없습니다');
 await page.goto('/#book/amos/3');await page.locator('#complete').click();await page.locator('#note').fill('<script>window.bad = true</script> 나의 질문');await page.reload();await expect(page.locator('#complete')).toHaveAttribute('aria-pressed','true');await expect(page.locator('#note')).toHaveValue('<script>window.bad = true</script> 나의 질문');expect(await page.evaluate(()=>window.bad)).toBeUndefined();
 await page.getByRole('link',{name:'나의 여정',exact:true}).click();await expect(page.locator('.stat')).toContainText('1 / 72');
 await page.evaluate(()=>localStorage.setItem('prophets-walk-v2','{"done":null,"notes":[]}'));await page.reload();await expect(page.locator('.stat')).toContainText('0 / 72');
});
test('데스크톱 반응형과 실제 화면 캡처',async({page})=>{
 await page.goto('/');await page.screenshot({path:'/tmp/prophets-home-mobile.png',fullPage:true});await page.goto('/#book/micah/1');await page.screenshot({path:'/tmp/prophets-map-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:900});await page.goto('/');await noOverflow(page);await page.screenshot({path:'/tmp/prophets-home-desktop.png',fullPage:true});await page.goto('/#book/malachi/5');await noOverflow(page);
});
