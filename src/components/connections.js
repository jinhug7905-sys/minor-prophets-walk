import {reading} from './shared.js';
export function connectionReferences(c){
 const regex=/(?:왕하|마|눅|막|행|롬|갈|히|호|욜|암|옵|욘|미|나|합|습|학|슥|말|출|렘|사|스|느)\s+\d+(?::\d+(?:[ab])?)?(?:[~–]\d+(?::\d+)?)?(?:,\d+)*/g;
 return [...new Set((`${c.from} / ${c.to}`.match(regex)||[]).map(s=>s.replace(/(\d)[ab]/g,'$1')))];
}
export const connectionReadingCards=c=>connectionReferences(c).map(ref=>reading(ref,'본문을 먼저 읽고 연결 유형과 적용의 차이를 확인하세요.')).join('');
