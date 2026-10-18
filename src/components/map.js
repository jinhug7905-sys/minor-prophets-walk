import {locations,mapRules,targetAreas} from '../data/locations.js';
import {escape,prose} from './shared.js';
export function mapView(book,full=false){
 const ids=full?book.places:book.places.slice(0,5);
 const points=ids.map(id=>({id,...locations[id]}));
const markerPoints=book.id==='malachi'?points.filter(p=>p.id!=='judah'):points;
 const minLon=Math.min(...points.map(p=>p.lon)),maxLon=Math.max(...points.map(p=>p.lon));
 const minLat=Math.min(...points.map(p=>p.lat)),maxLat=Math.max(...points.map(p=>p.lat));
 const lonSpan=Math.max(maxLon-minLon,1.2),latSpan=Math.max(maxLat-minLat,1.2);
 const midLon=(minLon+maxLon)/2,midLat=(minLat+maxLat)/2;
 const xy=p=>[80+(p.lon-(midLon-lonSpan/2))/lonSpan*420,300-(p.lat-(midLat-latSpan/2))/latSpan*240];
 const target=book.id==='amos'?'bethel':book.id==='jonah'||book.id==='nahum'?'nineveh':book.id==='obadiah'?'edom':book.places.includes('jerusalem')?'jerusalem':book.places[0];
 const project=(lat,lon)=>xy({lat,lon}).join(',');
 const coast=[[36.5,36],[35.5,35.78],[34.7,35.6],[34.2,35.5],[33.56,35.37],[33.27,35.2],[32.8,35.08],[32.05,34.75],[31.5,34.5],[31,34],[31.15,33],[31.25,32.3],[31.5,31.5],[31.4,30.5]];
 const coastPoints=coast.map(([lat,lon])=>project(lat,lon)).join(' ');
 const seaPolygon=[project(38,26),project(36.5,36),...coast.map(([lat,lon])=>project(lat,lon)),project(29,26)].join(' ');
 const water=`<polygon class="map-water" points="${seaPolygon}"/><polyline class="coastline" points="${coastPoints}"/><polyline class="map-river" points="${[[32.8,35.6],[32.3,35.57],[31.8,35.55],[31.2,35.48]].map(([lat,lon])=>project(lat,lon)).join(' ')}"/><polyline class="map-river" points="${[[36.8,38],[35.7,39],[34.4,41],[32.5,44.4]].map(([lat,lon])=>project(lat,lon)).join(' ')}"/>`;
 const markers=markerPoints.map((p,i)=>{
  const [x,y]=xy(p);const cluster=points.some((other,j)=>j!==i&&Math.hypot(...xy(other).map((v,k)=>v-[x,y][k]))<40);
  const labelX=cluster?370+(i%2)*95:Math.min(490,Math.max(85,x));const labelY=cluster?60+i*44:Math.min(336,y+25);
  return `<g class="map-point" role="button" tabindex="0" data-place="${escape(p.id)}" aria-label="${escape(p.name)}: 장소 설명 보기" ><title>${escape(p.name)}</title>${cluster?`<path class="map-leader" d="M${x},${y} L${labelX},${labelY-5}"/>`:''}<circle class="${p.id===target?'target-area':'location-halo'}" cx="${x}" cy="${y}" r="${p.id===target?34:9}"/><circle class="map-dot" cx="${x}" cy="${y}" r="5"/><text class="map-label" x="${labelX}" y="${labelY}" text-anchor="middle">${p.id===target?'★ ':''}${escape(p.name)}</text></g>`;
 }).join('');
 let arrows='';
 const imperial = ['hosea','amos','micah','nahum','zephaniah'].includes(book.id)?['앗수르',book.id==='nahum'?'주변 열방':'북이스라엘 · 유다']:book.id==='habakkuk'?['갈대아 / 바벨론','유다']:null;
 const influence=imperial?`<div class="empire-influence"><strong>⚔️ 제국의 영향</strong><svg viewBox="0 0 580 70" role="img" aria-label="${escape(imperial.join('에서 '))}에 대한 제국 영향"><text x="20" y="40" font-size="19" fill="#6f543c">${escape(imperial[0])}</text><path d="M210 35 H365 M355 28 L365 35 L355 42" fill="none" stroke="#9b6944" stroke-width="3" stroke-dasharray="7 6"/><text x="390" y="40" font-size="19" fill="#6f543c">${escape(imperial[1])}</text></svg><small>점선은 제국의 영향 관계입니다. 특정 군대의 상세 이동 경로를 복원하지 않습니다.</small></div>`:'';
 if(book.id==='jonah'){
  const route=['israel','joppa','sea'].filter(id=>ids.includes(id)).map(id=>xy(locations[id]));
  arrows=`<polyline class="person-route" points="${route.map(p=>p.join(',')).join(' ')}" marker-end="url(#person-arrow${full?'full':''})"/><text x="70" y="55" class="map-caption">← 다시스 방향 (정확한 위치는 견해가 나뉨)</text>`;
 }
 return `<div class="map-frame"><svg viewBox="0 0 580 380" role="group" aria-label="${escape(book.name)} 핵심 지명 개략 지도"><defs><marker id="person-arrow${full?'full':''}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 Z" fill="#276f50"/></marker></defs><rect width="580" height="380" rx="15" fill="#eff3e9"/>${water}<path d="M20 85 H550 M20 180 H550 M20 275 H550 M140 35 V340 M285 35 V340 M430 35 V340" class="map-grid"/><text x="532" y="34" class="map-compass">↑ 북</text>${book.id==='malachi'?'<text x="285" y="285" class="map-label">유다</text>':''}<text x="28" y="363" class="map-caption">서 ← 지리 관계 개략도 → 동</text>${arrows}${markers}</svg></div><p class="map-target">◎ 예언 대상: ${escape(targetAreas[book.id])}</p>${book.id==='jonah'?'<div class="route-sequence"><strong>👣 실제 이동의 흐름</strong><p>이스라엘 → 욥바 → 다시스 방향 → 바다 → 니느웨</p><small>실선은 본문에 나타나는 이동 방향의 개략 표시입니다. 바다에서 니느웨까지의 상세 경로는 그리지 않습니다.</small></div>':'<p class="map-caption-text">선지자의 실제 이동이 명시되지 않은 곳에 가상 이동선을 만들지 않았습니다.</p>'}${influence}<div class="map-legend">${mapRules.legend.map(t=>`<span>${escape(t)}</span>`).join('')}</div><p class="fine-print">${escape(mapRules.note)} 색 영역은 해당 지명 중심의 예언 대상 강조이며 국경이 아닙니다.</p>${!full?`<button class="secondary" data-map>🗺️ 전체 지도 크게 보기</button>`:''}<h3>🔎 이 장소가 왜 중요한가?</h3><div class="place-list">${ids.map(id=>`<button class="place-button" data-place="${id}"><span>📍 ${escape(locations[id].name)}</span><span>설명 보기 →</span></button>`).join('')}</div>`;
}
