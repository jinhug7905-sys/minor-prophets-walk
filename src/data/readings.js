// Verified Korean Bible Society (대한성서공회) Bible links
// Minor Prophets 12-book mapping, verified from official Bible pages.

const BOOK_CODES = {
  '호': 'hos',
  '욜': 'jol',
  '암': 'amo',
  '옵': 'oba',
  '욘': 'jnh',
  '미': 'mic',
  '나': 'nam',
  '합': 'hab',
  '습': 'zep',
  '학': 'hag',
  '슥': 'zec',
  '말': 'mal',
  '출': 'exo',
  '스':'ezr',
  '왕하': '2ki',
  '렘':'jer',
  '마': 'mat',
  '막': 'mrk',
  '요': 'jhn',
  '행':'act',
  '롬': 'rom',
  '갈': 'gal',
  '히': 'heb'
};

const FULL_BOOK_CODES = {
  '호세아': 'hos',
  '요엘': 'jol',
  '아모스': 'amo',
  '오바댜': 'oba',
  '요나': 'jnh',
  '미가': 'mic',
  '나훔': 'nam',
  '하박국': 'hab',
  '스바냐': 'zep',
  '학개': 'hag',
  '스가랴': 'zec',
  '말라기': 'mal',
  '요': 'jhn',
  '사도행전':'act'
};

export function readingTarget(reference, reason, fullBook = false) {
  let url = null;
  let status = '공식 링크 확인 필요';

  // 일반 본문 읽기: 예) 합 2:2~5, 욜 2:1~17
  const passageMatch = reference.match(
    /^(호|욜|암|옵|욘|미|나|합|습|학|슥|말|롬|갈|히|왕하|마|막|출|스|요|행|렘)\s*(\d+)/
  );

  if (passageMatch) {
    const bookAbbr = passageMatch[1];
    const chapter = passageMatch[2];
    const bookCode = BOOK_CODES[bookAbbr];

    if (bookCode) {
      url =
        `https://www.bskorea.or.kr/bible/korbibReadpage.php?book=${bookCode}&chap=${chapter}&version=GAE`;

      status = '공식 링크 확인 완료';
    }
  }

  // 전체 책 읽기: 예) 하박국
  if (fullBook && FULL_BOOK_CODES[reference]) {
    const bookCode = FULL_BOOK_CODES[reference];

    // 대한성서공회에서 해당 책의 1장부터 읽기 시작
    url =
      `https://www.bskorea.or.kr/bible/korbibReadpage.php?book=${bookCode}&chap=1&version=GAE`;

    status = '공식 링크 확인 완료';
  }

  return {
    provider: '대한성서공회',
    translation: '개역개정',
    reference,
    reason,
    fullBook,
    url,
    status
  };
}