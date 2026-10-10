import './style.css';
import {books,sections,numerals,getBook} from './data/books.js';
import {stations} from './data/timeline.js';
import {deepViews} from './data/deepViews.js';
import {connections} from './data/connections.js';
import {locations} from './data/locations.js';
import {learning} from './components/learning.js';
import {mapView} from './components/map.js';
import {connectionReadingCards} from './components/connections.js';
import {escape,prose,reading,bookLink,deepCards} from './components/shared.js';
const root=document.querySelector('#app');
const storageKey='prophets-walk-v2';
let state={done:{},notes:{}};
try{
 const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
  for(const key of ['done','notes'])if(saved[key]&&typeof saved[key]==='object'&&!Array.isArray(saved[key]))state[key]=saved[key];
 }else{
  const old=JSON.parse(localStorage.getItem('prophets-walk')||'{}');
  for(const b of books)if(typeof old?.[`${b.id}-note`]==='string')state.notes[b.id]=old[`${b.id}-note`];
 }
}catch{ /* Storage problems must not prevent studying. */ }
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(state));return true;}catch{return false;}};
const completed=b=>sections.filter((_,i)=>state.done[`${b.id}-${i}`]===true).length;
let currentBook=null,currentStep=null;
const dialog=document.createElement('dialog');dialog.className='detail-dialog';document.body.append(dialog);
function openDialog(title,body){dialog.innerHTML=`<div class="dialog-head"><h2 id="dialog-title">${prose(title)}</h2><button class="close-dialog" data-close aria-label="상세 내용 닫기">✕</button></div><div class="dialog-body">${body}</div>`;dialog.setAttribute('aria-labelledby','dialog-title');if(!dialog.open)dialog.showModal();dialog.querySelector('[data-close]').focus();}
dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-close]'))dialog.close();else handleActions(e);});
dialog.addEventListener('keydown',activateMapPoint);
function render(){
 const [page='home',id,raw,focusId]=location.hash.slice(1).split('/');
 currentBook=page==='book'?getBook(id):null;
 currentStep=currentBook&&raw!==undefined&&/^\d$/.test(raw)&&Number(raw)<6?Number(raw):null;
 if(dialog.open)dialog.close();
 document.title=`${currentBook?currentBook.name+' · ':''}소선지서 시간 속을 걷다`;
 const view=currentBook?bookPage(currentBook,currentStep):page==='timeline'?timelinePage(id):page==='journey'?journeyPage():page==='compare'?comparison(id,raw):home();
 root.innerHTML=`<a href="#main-content" class="skip-link">본문으로 바로가기</a><header><a class="brand" href="#home"><span class="mark">길</span><span>소선지서 시간 속을 걷다<small>MINOR PROPHETS · A WALK THROUGH TIME</small></span></a><nav aria-label="주 메뉴"><a href="#home" ${page==='home'?'aria-current="page"':''}>12권 탐색</a><a href="#timeline" ${page==='timeline'?'aria-current="page"':''}>역사 시간표</a><a href="#journey" ${page==='journey'?'aria-current="page"':''}>나의 여정</a></nav></header><main id="main-content" tabindex="-1" class="${currentBook?'book-main':''}" style="--accent:${currentStep===null?'#234f45':sections[currentStep].color}">${view}</main><footer>보면 이해되고, 누르면 깊어지고, 결국 성경 본문으로 돌아갑니다.<span>연대 견해 · 본문 해석 · 묵상 표현은 각 카드에서 구분합니다.</span></footer>${currentBook?stepNavigation(currentBook,currentStep):''}`;
 if(currentStep===2&&focusId?.startsWith('flow-')){
  const n=Number(focusId.slice(5));const node=root.querySelector(`[data-flow="${n}"]`);if(node){node.classList.add('highlighted');node.focus();node.scrollIntoView({block:'center'});}
 }else if(page==='timeline'&&id){const node=root.querySelector(`[data-station="${CSS.escape(id)}"]`);node?.scrollIntoView({block:'center'});}
}
function home(){return `<section class="hero"><div class="eyebrow">열두 목소리, 하나의 이야기</div><h1>소선지서<br>시간 속을 걷다</h1><p>12명의 선지자와 함께 구약 역사의 시간 속을 걸어갑니다</p><div class="hero-actions"><a class="button" href="#catalog">👀 12권 한눈에 보기</a><a class="hero-secondary" href="#timeline">🕰️ 역사 시간표로 보기 →</a></div><div class="hero-foot">시대 → 장소 → 본문 → 핵심 말씀 → 앞뒤 성경 → 전체 역사</div><div class="orbit" aria-hidden="true"><span>말씀</span><span>역사</span><span>삶</span></div></section><section class="library" id="catalog"><div class="section-head"><div><div class="eyebrow">THE TWELVE · 성경책 순서</div><h2>어느 이야기부터 걸어볼까요?</h2></div><label for="search">책 이름 · 주제 찾기<input id="search" type="search" placeholder="예: 호세아, 정의" autocomplete="off"></label></div><p class="fine-print">아래 배열은 성경책 순서입니다. 사역 시기는 겹칠 수 있으며, 역사 순서는 별도 시간표에서 봅니다.</p><div class="book-grid">${books.map(card).join('')}</div><p id="search-status" role="status" aria-live="polite">12권을 살펴볼 수 있습니다.</p><p class="fine-print">* 요엘과 오바댜의 연대는 교재 기준이며 견해가 나뉩니다.</p></section>`;}
function card(b,i){return `<a class="book-card" href="#book/${b.id}" data-book="${b.id}"><div class="card-top"><span>BOOK ${String(i+1).padStart(2,'0')}</span><span aria-hidden="true">${b.symbol}</span></div><h3>${b.name}<span aria-hidden="true">↗</span></h3><div class="date">${escape(b.date)}</div><p class="message">${escape(b.message)}</p>${b.id==='joel'||b.id==='obadiah'?'<span class="date-caution">📘 교재 기준 · ⚠️ 연대 견해 나뉨</span>':''}<div class="card-bottom"><span>여섯 걸음의 배움</span><span class="card-count">${completed(b)}/6</span></div><div class="progress" aria-label="6단계 중 ${completed(b)}단계 완료"><i style="width:${completed(b)/6*100}%"></i></div></a>`;}
function stepNavigation(b,index){return `<nav class="step-nav" aria-label="공통 학습 6단계">${sections.map((s,i)=>`<a href="#book/${b.id}/${i}" aria-label="${numerals[i]} ${s.title}" ${index===i?'aria-current="step"':''} style="--step-color:${s.color}"><span>${numerals[i]} ${s.icon}</span><small>${s.title}</small></a>`).join('')}</nav>`;}
function bookPage(b,index){return `<div class="book-toolbar"><a href="#home">← 소선지서 12권</a><span>${b.name} · ${index===null?'여정의 시작':`${numerals[index]} ${sections[index].title}`}</span></div><div class="sticky-era"><strong class="book-date">${escape(b.date)}</strong><span>${b.id==='joel'||b.id==='obadiah'?'📘 교재 기준 · ⚠️ 연대 견해 나뉨':'구약 역사의 현재 위치'}</span></div>${index===null?landing(b):`<div class="lesson-title"><div class="eyebrow">${b.symbol} ${b.name} · STEP ${index+1} / 6</div><h1>${numerals[index]} ${sections[index].icon} ${sections[index].title}</h1></div><article class="lesson">${learning(b,index)}<section class="reflection"><label for="note">✍️ ${b.name}를 읽으며 떠오른 질문과 생각</label><textarea id="note" rows="3" placeholder="내가 발견한 연결과 질문을 남겨 보세요…">${escape(typeof state.notes[b.id]==='string'?state.notes[b.id]:'')}</textarea><small id="save-status" role="status">메모는 이 브라우저에 저장됩니다.</small></section><div class="lesson-actions"><button id="complete" class="button" aria-pressed="${state.done[`${b.id}-${index}`]===true}">${state.done[`${b.id}-${index}`]===true?'✓ 학습 표시 해제':'이 단계 학습 완료'}</button><span id="progress-status" role="status"></span>${index<5?`<a class="text-link" href="#book/${b.id}/${index+1}">다음 단계 ${numerals[index+1]} →</a>`:`<a class="text-link" href="#journey">나의 여정 보기 →</a>`}</div></article>`}`;}
function landing(b){return `<section class="book-landing"><div class="landing-symbol" aria-hidden="true">${b.symbol}</div><div class="eyebrow">열두 선지서의 여정 · ${books.indexOf(b)+1} / 12</div><h1>${b.name}</h1><p class="landing-message">${escape(b.message)}</p><div class="position-card"><small>지금 우리는…</small><p>${escape(b.era)}를 걷고 있습니다.</p>${b.id==='joel'||b.id==='obadiah'?'<small>이 연대는 교재 기준이며 정확한 연대 견해는 나뉩니다.</small>':''}</div><a class="button" href="#book/${b.id}/0">시작하기 👣</a><p class="fine-print">여섯 걸음을 순서대로 걷거나, 아래에서 궁금한 단계를 선택하세요.</p></section>`;}
function timelinePage(selected){return `<section class="page-heading"><div class="eyebrow">TIME & CONNECTIONS</div><h1>🕰️ 역사 시간표로 보기</h1><p>성경책 순서 ≠ 역사 순서 ≠ 주제 연결</p><p class="notice">이 시간표는 주요 사건과 겹치는 사역 범위를 연결합니다. 엄격한 단선적 순서가 아닙니다. 요엘·오바댜의 연대에는 견해가 나뉩니다.</p><a class="secondary" href="#home">👀 성경책 순서로 12권 보기</a></section><ol class="global-timeline">${stations.map(s=>`<li class="station ${selected===s.id?'selected':''}" data-station="${s.id}"><a class="station-date" href="#timeline/${s.id}">${escape(s.date)}</a><h2>${escape(s.title)}</h2><p>${escape(s.text)}</p><div class="related-links">${s.books.map(id=>{const b=getBook(id);return `<a class="timeline-book" href="#book/${id}"><strong>${b.symbol} ${b.name}</strong><span>${escape(b.date)}</span></a>`;}).join('')}</div><button class="text-button" data-station-open="${s.id}">이 역사 정거장 자세히 보기 →</button></li>`).join('')}</ol>`;}
function comparison(aId,bId){const a=getBook(aId),b=getBook(bId);if(!a||!b)return `<h1>비교할 책을 찾을 수 없습니다.</h1><a class="secondary" href="#home">12권으로 돌아가기</a>`;return `<section class="page-heading"><div class="eyebrow">함께 읽기 · 같은 시대, 다른 시선</div><h1>${a.name}와 ${b.name} 비교하기</h1><p>같은 시기를 걷더라도 예언의 대상과 메시지는 다릅니다.</p></section><div class="comparison-grid">${[a,b].map(book=>`<article class="comparison-card"><h2>${book.symbol} ${book.name}</h2><strong>${escape(book.date)}</strong><p>${escape(book.era)}</p><h3>메시지</h3><p>${escape(book.message)}</p><h3>역사 흐름</h3><ul>${book.history.map(t=>`<li>${escape(t)}</li>`).join('')}</ul>${bookLink(book,'이 책의 여정 시작하기')}</article>`).join('')}</div><a class="secondary" href="#timeline/750">🕰️ 겹치는 시대를 시간표에서 보기</a>`;}
function journeyPage(){return `<section class="page-heading"><div class="eyebrow">MY JOURNEY</div><h1>나의 여정</h1><p>작은 발걸음이 모여 하나의 길이 됩니다.</p><div class="stat">${books.reduce((n,b)=>n+completed(b),0)}<span> / 72단계 완료</span></div><p class="notice">기록과 메모는 현재 브라우저에 저장됩니다. 계정 동기화는 제공하지 않습니다.</p></section><div class="book-grid">${books.map(card).join('')}</div>`;}
function handleActions(e){
 const el=e.target.closest('button,[data-place]');if(!el)return;
 if(el.hasAttribute('data-reading')){const t=JSON.parse(el.dataset.reading);openDialog(`📖 ${t.fullBook?t.reference+' 전체 읽기':t.reference}`,`<p>${escape(t.reason)}</p><dl class="target-metadata"><dt>제공처</dt><dd>${escape(t.provider)}</dd><dt>번역</dt><dd>${escape(t.translation)}</dd><dt>본문 범위</dt><dd>${escape(t.reference)}</dd><dt>연결 상태</dt><dd>${escape(t.status)}</dd></dl><p class="notice">확인되지 않은 성경 URL을 생성하지 않았습니다. 공식 본문 링크가 확인될 때까지 성경책이나 대한성서공회에서 위 본문 범위를 직접 찾아 읽어 주세요.</p><button class="secondary" disabled>대한성서공회 개역개정에서 본문 읽기 →</button>`);return;}
 if(el.hasAttribute('data-station-open')){const s=stations.find(s=>s.id===el.dataset.stationOpen);openDialog(`${s.date} · ${s.title}`,`<p>${escape(s.text)}</p><div class="related-links">${s.books.map(id=>bookLink(getBook(id))).join('')}</div>${s.passage?reading(s.passage,'역사 정거장을 관련 성경 본문에서 확인하세요.'):''}`);return;}
 if(!currentBook)return;
 if(el.hasAttribute('data-deep')){const d=deepViews[currentBook.id].find(d=>d.id===el.dataset.deep);if(d)openDialog(d.title,`<span class="tag">${escape(d.type)}</span><p>${prose(d.text)}</p>${d.passages.map(ref=>reading(ref,'설명과 함께 본문의 앞뒤 문맥을 확인하세요.')).join('')}`);return;}
 if(el.hasAttribute('data-map')){openDialog(`🗺️ ${currentBook.name} · 전체 지도`,mapView(currentBook,true));return;}
 if(el.hasAttribute('data-place')){const p=locations[el.dataset.place];if(p)openDialog(`📍 ${p.name}`,`<div class="eyebrow">현재 위치 → 왜 중요한가 → 관련 사건</div><p>${prose(p.why)}</p>${p.note?`<p class="notice">${escape(p.note)}</p>`:''}${reading(p.passage,'이 장소와 사건이 본문에서 어떤 역할을 하는지 살펴보세요.')}`);return;}
 if(el.hasAttribute('data-flow')){const at=Number(el.dataset.flow),f=currentBook.flow[at];if(!f)return;openDialog(`${f[0]} · ${f[1]}`,`<p>${prose(f[2])}</p><div class="context-pair"><p><strong>앞 구간</strong><br>${at>0?escape(currentBook.flow[at-1][1]):'책의 시작'}</p><p><strong>다음 구간</strong><br>${at<currentBook.flow.length-1?escape(currentBook.flow[at+1][1]):'책의 마지막 도착점'}</p></div>${reading(f[0],'이 구간을 직접 읽고 앞뒤 흐름과 핵심 의미를 확인하세요.')}${deepCards(deepViews[currentBook.id].filter(d=>d.steps.includes(2)))}<a class="text-link" href="#book/${currentBook.id}/3">💎 핵심 말씀으로 이어 읽기 →</a>`);return;}
 if(el.hasAttribute('data-connection')){const c=connections[currentBook.id][Number(el.dataset.connection)];if(c)openDialog(`${c.from} → ${c.to}`,`<span class="tag">${escape(c.category)} · ${escape(c.kind)}</span><p>${prose(c.explanation)}</p>${connectionReadingCards(c)}`);return;}
 if(el.hasAttribute('data-filter')){
  const type=el.dataset.filter;root.querySelectorAll('[data-filter]').forEach(n=>{n.classList.toggle('active',n===el);n.setAttribute('aria-pressed',String(n===el));});let count=0;root.querySelectorAll('[data-category]').forEach(n=>{n.hidden=type!=='all'&&n.dataset.category!==type;if(!n.hidden)count++;});root.querySelector('#filter-empty').hidden=count>0;return;
 }
 if(el.id==='complete'&&currentStep!==null){const key=`${currentBook.id}-${currentStep}`;state.done[key]=!state.done[key];const ok=save();el.setAttribute('aria-pressed',String(state.done[key]));el.textContent=state.done[key]?'✓ 학습 표시 해제':'이 단계 학습 완료';root.querySelector('#progress-status').textContent=ok?'기록을 저장했습니다.':'이 브라우저에 저장할 수 없습니다.';}
}
function activateMapPoint(e){if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-place]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}}
root.addEventListener('click',handleActions);
root.addEventListener('keydown',activateMapPoint);
root.addEventListener('input',e=>{
 if(e.target.id==='note'&&currentBook){state.notes[currentBook.id]=e.target.value;const ok=save();root.querySelector('#save-status').textContent=ok?'이 기기에 저장했습니다.':'저장할 수 없습니다. 메모를 따로 복사해 주세요.';}
 if(e.target.id==='search'){const query=e.target.value.trim();let count=0;root.querySelectorAll('.book-card').forEach(card=>{card.hidden=!card.textContent.includes(query);if(!card.hidden)count++;});root.querySelector('#search-status').textContent=count?`${count}권을 살펴볼 수 있습니다.`:'검색 결과가 없습니다. 다른 이름이나 주제를 입력해 주세요.';}
});
window.addEventListener('hashchange',()=>{if(location.hash==='#catalog'){if(!document.querySelector('#catalog'))render();document.querySelector('#catalog')?.scrollIntoView();return;}if(location.hash==='#main-content'){root.querySelector('main')?.focus();return;}window.scrollTo(0,0);render();});
render();
