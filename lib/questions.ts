// lib/questions.ts
// 12단계 문제 생성 엔진

export type Group = 'basic' | 'mid' | 'advanced'
export type Stage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface Question {
  id: number
  type: string
  display: string        // 화면에 보여줄 문제 텍스트
  visual?: string        // 이모지 시각화 (선택)
  choices: string[]      // 보기 4~6개
  answer: string         // 정답
  hint?: string          // 오답 시 힌트
}

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const FRUITS = ['🍎','🍊','🍋','🍇','🍓','🍑','🍒','🍌','🥝','🍍']

// ─── 1단계: 100까지 수 세기·크기 비교 ───────────────────────────
function stage1Questions(): Question[] {
  const qs: Question[] = []

  // 수 세기 (5문제)
  for (let i = 0; i < 5; i++) {
    const count = rand(1, 20)
    const fruit = FRUITS[rand(0, FRUITS.length - 1)]
    const visual = fruit.repeat(count)
    const wrong = shuffle([...new Set([rand(1,25),rand(1,25),rand(1,25),rand(1,25),count+rand(1,3)])].filter(v=>v!==count)).slice(0,5)
    qs.push({
      id: i, type: '수 세기',
      display: `${fruit}이 몇 개인가요?`,
      visual,
      choices: shuffle([String(count), ...wrong.map(String)]).slice(0, 6),
      answer: String(count),
      hint: `하나씩 손가락으로 세어 봐요!`,
    })
  }
  // 크기 비교 (5문제)
  for (let i = 0; i < 5; i++) {
    const a = rand(1, 999), b = rand(1, 999)
    const ans = a > b ? '>' : a < b ? '<' : '='
    qs.push({
      id: 5+i, type: '크기 비교',
      display: `${a} ○ ${b}\n어떤 부등호가 들어갈까요?`,
      choices: shuffle(['>', '<', '=']),
      answer: ans,
      hint: `큰 수가 입을 벌려요! 큰 쪽을 향해 >`,
    })
  }
  // 순서 맞추기 (5문제)
  for (let i = 0; i < 5; i++) {
    const start = rand(1, 95)
    const pos = rand(1, 4)
    const seq = [start, start+1, start+2, start+3, start+4]
    const missing = seq[pos]
    const display = seq.map((v,idx) => idx===pos ? '?' : String(v)).join(' → ')
    const wrong = shuffle([missing-1,missing+1,missing+2,missing-2].filter(v=>v>0&&v!==missing)).slice(0,5)
    qs.push({
      id: 10+i, type: '순서 맞추기',
      display: `빠진 숫자를 찾아요!\n${display}`,
      choices: shuffle([String(missing), ...wrong.map(String)]).slice(0,6),
      answer: String(missing),
      hint: `숫자는 하나씩 커져요!`,
    })
  }
  // 앞뒤 수 찾기 (5문제)
  for (let i = 0; i < 5; i++) {
    const num = rand(2, 99)
    const askBefore = Math.random() > 0.5
    const ans = askBefore ? num - 1 : num + 1
    const wrong = shuffle([ans-1,ans+1,ans+2,ans-2].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({
      id: 15+i, type: '앞뒤 수 찾기',
      display: `${num}보다 ${askBefore ? '1 작은' : '1 큰'} 수는?`,
      choices: shuffle([String(ans), ...wrong.map(String)]).slice(0,6),
      answer: String(ans),
      hint: `수직선에서 ${askBefore ? '왼쪽' : '오른쪽'}으로 한 칸!`,
    })
  }
  return shuffle(qs).map((q,i) => ({...q, id: i}))
}

// ─── 2단계: 10까지 덧셈·뺄셈 ─────────────────────────────────────
function stage2Questions(): Question[] {
  const qs: Question[] = []

  // 덧셈 (5문제)
  for (let i = 0; i < 5; i++) {
    const a = rand(1, 9), b = rand(1, 10 - a)
    const ans = a + b
    const wrong = shuffle([ans-1,ans+1,ans-2,ans+2].filter(v=>v>=0&&v<=10&&v!==ans)).slice(0,5)
    qs.push({
      id: i, type: '덧셈',
      display: `${a} + ${b} = ?`,
      choices: shuffle([String(ans), ...wrong.map(String)]).slice(0,6),
      answer: String(ans),
      hint: `손가락 ${a}개 + ${b}개를 세어봐요!`,
    })
  }
  // 뺄셈 (5문제)
  for (let i = 0; i < 5; i++) {
    const a = rand(2, 10), b = rand(1, a)
    const ans = a - b
    const wrong = shuffle([ans-1,ans+1,ans-2,ans+2].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({
      id: 5+i, type: '뺄셈',
      display: `${a} - ${b} = ?`,
      choices: shuffle([String(ans), ...wrong.map(String)]).slice(0,6),
      answer: String(ans),
      hint: `${a}에서 ${b}를 빼면 몇 개 남을까요?`,
    })
  }
  // 빈칸 채우기 (5문제)
  for (let i = 0; i < 5; i++) {
    const a = rand(1, 8), b = rand(1, 9-a), sum = a+b
    const isLeft = Math.random() > 0.5
    const ans = isLeft ? a : b
    const display = isLeft ? `? + ${b} = ${sum}` : `${a} + ? = ${sum}`
    const wrong = shuffle([ans-1,ans+1,ans-2,ans+2].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({
      id: 10+i, type: '빈칸 채우기',
      display,
      choices: shuffle([String(ans), ...wrong.map(String)]).slice(0,6),
      answer: String(ans),
      hint: `합이 ${sum}이 되려면 얼마가 필요할까요?`,
    })
  }
  // 그림 연산 (5문제)
  for (let i = 0; i < 5; i++) {
    const fruit = FRUITS[rand(0, FRUITS.length-1)]
    const a = rand(1, 5), b = rand(1, 10-a), ans = a+b
    const wrong = shuffle([ans-1,ans+1,ans-2,ans+2].filter(v=>v>0&&v<=10&&v!==ans)).slice(0,5)
    qs.push({
      id: 15+i, type: '그림 연산',
      display: `${fruit.repeat(a)} + ${fruit.repeat(b)} = ?`,
      choices: shuffle([String(ans), ...wrong.map(String)]).slice(0,6),
      answer: String(ans),
      hint: `그림을 하나씩 세어봐요!`,
    })
  }
  return shuffle(qs).map((q,i) => ({...q, id: i}))
}

// ─── 3단계: 50까지 연산·자릿값·크기비교 ──────────────────────────
function stage3Questions(): Question[] {
  const qs: Question[] = []

  for (let i = 0; i < 5; i++) {
    const a = rand(10, 39), b = rand(10, 50-a)
    const ans = a+b
    const wrong = shuffle([ans-1,ans+1,ans-10,ans+10].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({ id:i, type:'덧셈', display:`${a} + ${b} = ?`, choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6), answer:String(ans), hint:`십의 자리끼리, 일의 자리끼리 더해요!` })
  }
  for (let i = 0; i < 5; i++) {
    const b = rand(10, 40), a = rand(b, 50)
    const ans = a-b
    const wrong = shuffle([ans-1,ans+1,ans-10,ans+10].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({ id:5+i, type:'뺄셈', display:`${a} - ${b} = ?`, choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6), answer:String(ans), hint:`십의 자리끼리, 일의 자리끼리 빼요!` })
  }
  for (let i = 0; i < 5; i++) {
    const num = rand(11, 49)
    const tens = Math.floor(num/10), ones = num%10
    const askTens = Math.random()>0.5
    const ans = askTens ? tens : ones
    const wrong = shuffle([ans+1,ans-1,ans+2,ans+3].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({ id:10+i, type:'자릿값', display:`${num}에서\n${askTens?'십의 자리':'일의 자리'} 숫자는?`, choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6), answer:String(ans), hint:`${num} = 10×${tens} + ${ones}` })
  }
  for (let i = 0; i < 5; i++) {
    const a = rand(10, 49), b = rand(10, 49)
    const ans = a>b?'>':a<b?'<':'='
    qs.push({ id:15+i, type:'크기 비교', display:`${a}  ○  ${b}`, choices:shuffle(['>','<','=']), answer:ans, hint:`십의 자리를 먼저 비교해요!` })
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 4단계: 100까지 받아올림·받아내림·세로식 ────────────────────
function stage4Questions(): Question[] {
  const qs: Question[] = []

  for (let i = 0; i < 5; i++) {
    const a = rand(15, 60), b = rand(15, 99-a)
    const ans = a+b
    const wrong = shuffle([ans-1,ans+1,ans-10,ans+10].filter(v=>v>0&&v<=100&&v!==ans)).slice(0,5)
    qs.push({ id:i, type:'받아올림 덧셈', display:`${a} + ${b} = ?`, choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6), answer:String(ans), hint:`일의 자리가 10을 넘으면 십의 자리로 올려요!` })
  }
  for (let i = 0; i < 5; i++) {
    const b = rand(15, 50), a = rand(b+1, 99)
    const ans = a-b
    const wrong = shuffle([ans-1,ans+1,ans-10,ans+10].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({ id:5+i, type:'받아내림 뺄셈', display:`${a} - ${b} = ?`, choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6), answer:String(ans), hint:`일의 자리가 모자라면 십의 자리에서 빌려요!` })
  }
  for (let i = 0; i < 5; i++) {
    const a = rand(15, 60), sum = rand(a+10, 99)
    const b = sum-a
    const wrong = shuffle([b-1,b+1,b-10,b+10].filter(v=>v>0&&v!==b)).slice(0,5)
    qs.push({ id:10+i, type:'빈칸 채우기', display:`${a} + ? = ${sum}`, choices:shuffle([String(b),...wrong.map(String)]).slice(0,6), answer:String(b), hint:`${sum} - ${a} = ?` })
  }
  for (let i = 0; i < 5; i++) {
    const isAdd = Math.random()>0.5
    const a = rand(15, 55), b = rand(15, isAdd?99-a:a)
    const ans = isAdd?a+b:a-b
    const aT=Math.floor(a/10),aO=a%10,bT=Math.floor(b/10),bO=b%10
    const wrong = shuffle([ans-1,ans+1,ans-10,ans+10].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({
      id:15+i, type:'세로식 계산',
      display:`  ${String(a).padStart(3)}\n${isAdd?'+':'-'} ${String(b).padStart(3)}\n──────`,
      choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),
      answer:String(ans),
      hint:`일의 자리(${aO}${isAdd?'+':'-'}${bO})부터 계산해요!`,
    })
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 5단계: 세 자리 수 연산·자릿값 분해·세로식 ──────────────────
function stage5Questions(): Question[] {
  const qs: Question[] = []
  for (let i = 0; i < 5; i++) {
    const a=rand(100,600),b=rand(100,999-a)
    const ans=a+b
    const wrong=shuffle([ans-1,ans+1,ans-100,ans+100].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:i,type:'세 자리 덧셈',display:`${a} + ${b} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`자릿수를 맞춰 더해요!`})
  }
  for (let i = 0; i < 5; i++) {
    const b=rand(100,500),a=rand(b+1,999)
    const ans=a-b
    const wrong=shuffle([ans-1,ans+1,ans-100,ans+100].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({id:5+i,type:'세 자리 뺄셈',display:`${a} - ${b} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`자릿수를 맞춰 빼요!`})
  }
  for (let i = 0; i < 5; i++) {
    const num=rand(100,999)
    const h=Math.floor(num/100),t=Math.floor((num%100)/10),o=num%10
    const part=['백','십','일'][rand(0,2)]
    const ans=part==='백'?h:part==='십'?t:o
    const wrong=shuffle([ans+1,ans-1,ans+2,ans+3].filter(v=>v>=0&&v<=9&&v!==ans)).slice(0,5)
    qs.push({id:10+i,type:'자릿값 분해',display:`${num}에서 ${part}의 자리 숫자는?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`${num} = ${h}×100 + ${t}×10 + ${o}`})
  }
  for (let i = 0; i < 5; i++) {
    const isAdd=Math.random()>0.5
    const a=rand(100,500),b=rand(100,isAdd?999-a:a)
    const ans=isAdd?a+b:a-b
    const wrong=shuffle([ans-1,ans+1,ans-100,ans+100].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({id:15+i,type:'세로식 계산',display:`  ${a}\n${isAdd?'+':`-`} ${b}\n────`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`일→십→백 자리 순서로 계산해요!`})
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 6단계: 곱셈 개념·구구단 2~5단 ──────────────────────────────
function stage6Questions(): Question[] {
  const qs: Question[] = []
  const tables=[2,3,4,5]
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],n=rand(1,9),ans=t*n
    const wrong=shuffle([ans-t,ans+t,ans-1,ans+1].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:i,type:'구구단',display:`${t} × ${n} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`${t}단: ${t}씩 ${n}번 더하면?`})
  }
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],n=rand(2,6)
    const fruit=FRUITS[rand(0,FRUITS.length-1)]
    const ans=t*n
    const wrong=shuffle([ans-t,ans+t,ans-1,ans+1].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:5+i,type:'곱셈 개념',display:`${fruit} ${t}개씩 ${n}묶음이면?`,visual:Array(n).fill(fruit.repeat(t)).join(' / '),choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`${t}×${n} = ${t}를 ${n}번 더해요!`})
  }
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],n=rand(1,9),ans=t*n
    const isLeft=Math.random()>0.5
    const display=isLeft?`? × ${n} = ${ans}`:`${t} × ? = ${ans}`
    const blank=isLeft?t:n
    const wrong=shuffle([blank-1,blank+1,blank-2,blank+2].filter(v=>v>0&&v!==blank)).slice(0,5)
    qs.push({id:10+i,type:'빈칸 채우기',display,choices:shuffle([String(blank),...wrong.map(String)]).slice(0,6),answer:String(blank),hint:`구구단 ${t}단을 생각해봐요!`})
  }
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],n=rand(2,5)
    const addStr=Array(n).fill(String(t)).join('+')
    const ans=t*n
    const wrong=shuffle([ans-t,ans+t,ans-1,ans+1].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:15+i,type:'곱셈으로 덧셈 대체',display:`${addStr} = ${t} × ?`,choices:shuffle([String(n),...wrong.map(String)]).slice(0,6),answer:String(n),hint:`같은 수를 몇 번 더했나요?`})
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 7단계: 구구단 6~9단·나눗셈·나머지 ──────────────────────────
function stage7Questions(): Question[] {
  const qs: Question[] = []
  const tables=[6,7,8,9]
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],n=rand(1,9),ans=t*n
    const wrong=shuffle([ans-t,ans+t,ans-1,ans+1].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:i,type:'구구단',display:`${t} × ${n} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`${t}단을 외워봐요!`})
  }
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],n=rand(1,9),product=t*n
    const ans=n
    const wrong=shuffle([ans-1,ans+1,ans-2,ans+2].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:5+i,type:'나눗셈 기초',display:`${product} ÷ ${t} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`${t} × ? = ${product}`})
  }
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],n=rand(1,9),product=t*n
    const isLeft=Math.random()>0.5
    const blank=isLeft?product:n
    const display=isLeft?`? ÷ ${t} = ${n}`:`${product} ÷ ${t} = ?`
    const wrong=shuffle([blank-1,blank+1,blank-t,blank+t].filter(v=>v>0&&v!==blank)).slice(0,5)
    qs.push({id:10+i,type:'빈칸 채우기',display,choices:shuffle([String(blank),...wrong.map(String)]).slice(0,6),answer:String(blank),hint:`곱셈으로 생각해봐요!`})
  }
  for (let i = 0; i < 5; i++) {
    const t=tables[rand(0,3)],q=rand(1,9),r=rand(1,t-1)
    const dividend=t*q+r
    const ans=`${q}…${r}`
    const wrong=[`${q+1}…${r}`,`${q}…${r+1}`,`${q-1}…${r}`,`${q}…${r-1}`].filter(v=>v!==ans)
    qs.push({id:15+i,type:'나머지 나눗셈',display:`${dividend} ÷ ${t} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`몫: ${dividend}에서 ${t}를 몇 번 뺄 수 있나요?`})
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 8단계: 두 자리 곱나눗셈·분수 입문 ──────────────────────────
function stage8Questions(): Question[] {
  const qs: Question[] = []
  for (let i = 0; i < 5; i++) {
    const a=rand(11,30),b=rand(2,9),ans=a*b
    const wrong=shuffle([ans-b,ans+b,ans-10,ans+10].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:i,type:'두 자리 곱셈',display:`${a} × ${b} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`(${Math.floor(a/10)}×10 + ${a%10}) × ${b}`})
  }
  for (let i = 0; i < 5; i++) {
    const b=rand(2,9),q=rand(10,20),ans=q
    const dividend=b*q
    const wrong=shuffle([ans-1,ans+1,ans-2,ans+2].filter(v=>v>0&&v!==ans)).slice(0,5)
    qs.push({id:5+i,type:'두 자리 나눗셈',display:`${dividend} ÷ ${b} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`${b} × ? = ${dividend}`})
  }
  const fracs=[['1/2','2','반'],['1/3','3','셋'],['1/4','4','넷'],['2/3','3','셋'],['3/4','4','넷']]
  for (let i = 0; i < 5; i++) {
    const [frac,denom,word]=fracs[i]
    const total=parseInt(denom)*rand(2,4)
    const ans=String(total/parseInt(denom))
    const wrong=shuffle([Number(ans)-1,Number(ans)+1,Number(ans)*2,parseInt(denom)].filter(v=>v>0&&v!==Number(ans))).slice(0,5)
    qs.push({id:10+i,type:'분수 입문',display:`${total}개의 ${frac}은 몇 개?`,choices:shuffle([ans,...wrong.map(String)]).slice(0,6),answer:ans,hint:`${total}을 ${denom}으로 똑같이 나눠요!`})
  }
  const wholeFracs=['1/2','1/3','1/4','2/3','3/4']
  for (let i = 0; i < 5; i++) {
    const frac=wholeFracs[rand(0,wholeFracs.length-1)]
    const [num,den]=[parseInt(frac.split('/')[0]),parseInt(frac.split('/')[1])]
    const total=den*rand(2,5)
    const ans=String(num*(total/den))
    const wrong=shuffle([Number(ans)-1,Number(ans)+1,Number(ans)+2,total].filter(v=>v>0&&v!==Number(ans))).slice(0,5)
    qs.push({id:15+i,type:'전체와 부분',display:`${total}조각 중 ${frac}은 몇 조각?`,choices:shuffle([ans,...wrong.map(String)]).slice(0,6),answer:ans,hint:`전체를 ${den}으로 나눠서 ${num}만큼!`})
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 9단계: 혼합연산·분수 덧뺄셈·대분수 ─────────────────────────
function stage9Questions(): Question[] {
  const qs: Question[] = []
  // 혼합연산
  for (let i = 0; i < 5; i++) {
    const a=rand(2,10),b=rand(2,5),c=rand(1,5)
    const isAddFirst=Math.random()>0.5
    const [ans,display]=isAddFirst?[a+b*c,`${a} + ${b} × ${c}`]:[(a-b)*c,`(${a} - ${b}) × ${c}`]
    const wrong=shuffle([ans-1,ans+1,ans-b,ans+b].filter(v=>v>=0&&v!==ans)).slice(0,5)
    qs.push({id:i,type:'혼합 연산',display:`${display} = ?`,choices:shuffle([String(ans),...wrong.map(String)]).slice(0,6),answer:String(ans),hint:`× 먼저, 그 다음 +/-!`})
  }
  // 동분모 분수 덧셈
  for (let i = 0; i < 5; i++) {
    const den=rand(3,8),a=rand(1,den-1),b=rand(1,den-a)
    const sumN=a+b
    const ans=sumN>=den?`${Math.floor(sumN/den)}과${sumN%den}/${den}`:`${sumN}/${den}`
    const wrong=[`${a+b+1}/${den}`,`${a+b-1}/${den}`,`${a}/${den}`,`${b}/${den}`].filter(v=>v!==ans)
    qs.push({id:5+i,type:'분수 덧셈',display:`${a}/${den} + ${b}/${den} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`분모가 같으면 분자끼리 더해요!`})
  }
  // 동분모 분수 뺄셈
  for (let i = 0; i < 5; i++) {
    const den=rand(3,8),b=rand(1,den-2),a=rand(b+1,den-1)
    const ans=`${a-b}/${den}`
    const wrong=[`${a-b+1}/${den}`,`${a-b-1}/${den}`,`${a+b}/${den}`,`${den}/${a-b}`].filter(v=>v!==ans)
    qs.push({id:10+i,type:'분수 뺄셈',display:`${a}/${den} - ${b}/${den} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`분모가 같으면 분자끼리 빼요!`})
  }
  // 대분수 변환
  for (let i = 0; i < 5; i++) {
    const den=rand(2,6),whole=rand(1,3),num=rand(1,den-1)
    const improper=whole*den+num
    const isToDen=Math.random()>0.5
    if(isToDen){
      const ans=`${improper}/${den}`
      const wrong=[`${improper+1}/${den}`,`${improper-1}/${den}`,`${whole*den}/${den}`,`${improper}/${den+1}`].filter(v=>v!==ans)
      qs.push({id:15+i,type:'대분수 변환',display:`${whole}과${num}/${den} → 가분수로?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`(${whole}×${den})+${num} = ${improper}를 분자로!`})
    } else {
      const ans=`${whole}과${num}/${den}`
      const wrong=[`${whole+1}과${num}/${den}`,`${whole}과${num+1}/${den}`,`${whole-1}과${num}/${den}`,`${whole}과${num-1}/${den}`].filter(v=>v!==ans&&!v.includes('-'))
      qs.push({id:15+i,type:'대분수 변환',display:`${improper}/${den} → 대분수로?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`${improper}÷${den} = 몫 ${whole} 나머지 ${num}`})
    }
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 10단계: 약분·통분·대분수 덧셈 ──────────────────────────────
const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b)
const lcm=(a:number,b:number)=>a*b/gcd(a,b)

function stage10Questions(): Question[] {
  const qs: Question[] = []
  // 약분
  for (let i = 0; i < 5; i++) {
    const d=rand(2,6),n=rand(1,5)*d,den=rand(n/d+1,6)*d
    const g=gcd(n,den),an=n/g,ad=den/g
    const ans=`${an}/${ad}`
    const wrong=[`${n/2}/${den/2}`,`${an+1}/${ad}`,`${an}/${ad+1}`,`${n}/${den}`].filter(v=>v!==ans)
    qs.push({id:i,type:'약분',display:`${n}/${den}을 기약분수로?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`최대공약수 ${g}로 나눠요!`})
  }
  // 통분 후 덧셈
  for (let i = 0; i < 5; i++) {
    const d1=rand(2,5),d2=rand(2,5)
    if(d1===d2){i--;continue}
    const l=lcm(d1,d2),n1=rand(1,d1-1),n2=rand(1,d2-1)
    const num=n1*(l/d1)+n2*(l/d2),g=gcd(num,l)
    const ans=num>=l?`${Math.floor(num/l)}과${(num%l)/g}/${l/g}`:`${num/g}/${l/g}`
    const wrong=[`${n1+n2}/${d1+d2}`,`${n1}/${d1}`,`${(n1+n2)}/${l}`,`${num}/${l}`].filter(v=>v!==ans)
    qs.push({id:5+i,type:'통분 후 덧셈',display:`${n1}/${d1} + ${n2}/${d2} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`공통분모 ${l}로 통분해요!`})
  }
  // 통분 후 뺄셈
  for (let i = 0; i < 5; i++) {
    const d1=rand(2,5),d2=rand(2,5)
    if(d1===d2){i--;continue}
    const l=lcm(d1,d2),n1=rand(2,d1-1),n2=rand(1,d2-1)
    const big=n1*(l/d1),small=n2*(l/d2)
    if(big<=small){i--;continue}
    const num=big-small,g=gcd(num,l)
    const ans=`${num/g}/${l/g}`
    const wrong=[`${n1-n2}/${d1-d2||1}`,`${n1}/${d2}`,`${(n1+n2)}/${l}`,`${num}/${l}`].filter(v=>v!==ans&&!v.startsWith('-'))
    qs.push({id:10+i,type:'통분 후 뺄셈',display:`${n1}/${d1} - ${n2}/${d2} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`공통분모 ${l}로 통분해요!`})
  }
  // 대분수 덧셈
  for (let i = 0; i < 5; i++) {
    const d1=rand(2,4),d2=rand(2,4)
    if(d1===d2){i--;continue}
    const l=lcm(d1,d2)
    const w1=rand(1,3),n1=rand(1,d1-1),w2=rand(1,3),n2=rand(1,d2-1)
    const totalN=n1*(l/d1)+n2*(l/d2)
    const wholeAdd=Math.floor(totalN/l),remN=totalN%l
    const totalW=w1+w2+wholeAdd,g=remN?gcd(remN,l):1
    const ans=remN?`${totalW}과${remN/g}/${l/g}`:`${totalW}`
    const wrong=[`${totalW+1}과${remN}/${l}`,`${totalW-1}과${remN}/${l}`,`${w1+w2}과${n1+n2}/${d1}`,ans+'1'].filter(v=>v!==ans)
    qs.push({id:15+i,type:'대분수 덧셈',display:`${w1}과${n1}/${d1} + ${w2}과${n2}/${d2} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`정수끼리, 분수끼리 따로 더해요!`})
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 11단계: 소수 연산·비와 비율 ─────────────────────────────────
function stage11Questions(): Question[] {
  const qs: Question[] = []
  for (let i = 0; i < 5; i++) {
    const a=parseFloat((rand(10,99)/10).toFixed(1)),b=parseFloat((rand(10,99)/100).toFixed(2))
    const ans=(a+b).toFixed(2)
    const wrong=[(Number(ans)+0.1).toFixed(2),(Number(ans)-0.1).toFixed(2),(Number(ans)+1).toFixed(2),(a+Math.round(b)).toFixed(2)].filter(v=>v!==ans)
    qs.push({id:i,type:'소수 덧셈',display:`${a} + ${b} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`소수점 위치를 맞춰 더해요!`})
  }
  for (let i = 0; i < 5; i++) {
    const b=parseFloat((rand(10,99)/100).toFixed(2)),a=parseFloat((rand(Math.ceil(b*10)+10,99)/10).toFixed(1))
    const ans=(a-b).toFixed(2)
    const wrong=[(Number(ans)+0.1).toFixed(2),(Number(ans)-0.1).toFixed(2),(Number(ans)+1).toFixed(2),(a-Math.round(b)).toFixed(2)].filter(v=>v!==ans&&Number(v)>=0)
    qs.push({id:5+i,type:'소수 뺄셈',display:`${a} - ${b} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`소수점 위치를 맞춰 빼요!`})
  }
  for (let i = 0; i < 5; i++) {
    const a=rand(1,9),b=rand(a+1,12)
    const ratio=`${a}:${b}`
    const ans=(a/b).toFixed(2)
    const wrong=[(Number(ans)+0.1).toFixed(2),(b/a).toFixed(2),(a/(a+b)).toFixed(2),(Number(ans)-0.1).toFixed(2)].filter(v=>v!==ans)
    qs.push({id:10+i,type:'비와 비율',display:`${ratio}에서 비율은? (소수로)`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`비율 = 앞 수 ÷ 뒷 수`})
  }
  const percents=[10,20,25,30,50]
  for (let i = 0; i < 5; i++) {
    const p=percents[rand(0,percents.length-1)]
    const total=[1000,2000,4000,5000,10000][rand(0,4)]
    const ans=String(total*p/100)
    const wrong=[String(total*p/100+100),String(total*p/100-100),String(total*p/10),String(total/p)].filter(v=>v!==ans&&Number(v)>0)
    qs.push({id:15+i,type:'비율 응용',display:`${total.toLocaleString()}원의 ${p}%는?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`${total} × ${p}/100`})
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 12단계: 분수 사칙연산·비례식·동치비율 ───────────────────────
function stage12Questions(): Question[] {
  const qs: Question[] = []
  for (let i = 0; i < 5; i++) {
    const [n1,d1,n2,d2]=[rand(1,4),rand(2,6),rand(1,4),rand(2,6)]
    const rn=n1*n2,rd=d1*d2,g=gcd(rn,rd)
    const ans=`${rn/g}/${rd/g}`
    const wrong=[`${n1+n2}/${d1+d2}`,`${n1*d2}/${d1*n2}`,`${rn+1}/${rd}`,`${rn}/${rd+1}`].filter(v=>v!==ans)
    qs.push({id:i,type:'분수 곱셈',display:`${n1}/${d1} × ${n2}/${d2} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`분자끼리, 분모끼리 곱해요!`})
  }
  for (let i = 0; i < 5; i++) {
    const [n1,d1,n2,d2]=[rand(1,5),rand(2,6),rand(1,5),rand(2,6)]
    const rn=n1*d2,rd=d1*n2,g=gcd(rn,rd)
    const ans=`${rn/g}/${rd/g}`
    const wrong=[`${n1-n2}/${d1-d2||1}`,`${n1*n2}/${d1*d2}`,`${rn+1}/${rd}`,`${rn}/${rd+1}`].filter(v=>v!==ans&&!v.startsWith('-'))
    qs.push({id:5+i,type:'분수 나눗셈',display:`${n1}/${d1} ÷ ${n2}/${d2} = ?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`나누는 분수를 뒤집어 곱해요!`})
  }
  for (let i = 0; i < 5; i++) {
    const a=rand(1,6),b=rand(a+1,9),c=a*rand(2,4)
    const ans=String(b*(c/a))
    const wrong=[String(Number(ans)+b),String(Number(ans)-a),String(Number(ans)*2),String(c*b)].filter(v=>v!==ans)
    qs.push({id:10+i,type:'비례식',display:`${a}:${b} = ${c}:?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`내항의 곱 = 외항의 곱!`})
  }
  for (let i = 0; i < 5; i++) {
    const a=rand(1,6),b=rand(a+1,9),mul=rand(2,5)
    const ca=a*mul,ans=String(b*mul)
    const wrong=[String(b*mul+mul),String(b*mul-a),String(b+mul),String(a*b)].filter(v=>v!==ans)
    qs.push({id:15+i,type:'동치비율 활용',display:`${a}:${b} = ${ca}:?`,choices:shuffle([ans,...wrong]).slice(0,4),answer:ans,hint:`${ca}는 ${a}의 ${mul}배, 그러면 ?는?`})
  }
  return shuffle(qs).map((q,i)=>({...q,id:i}))
}

// ─── 메인 익스포트 ────────────────────────────────────────────────
export function generateQuestions(stage: Stage): Question[] {
  const generators: Record<Stage, ()=>Question[]> = {
    1:stage1Questions, 2:stage2Questions, 3:stage3Questions, 4:stage4Questions,
    5:stage5Questions, 6:stage6Questions, 7:stage7Questions, 8:stage8Questions,
    9:stage9Questions, 10:stage10Questions, 11:stage11Questions, 12:stage12Questions,
  }
  const allQ = generators[stage]()
  // 4유형 × 5문제 = 20문제 보장
  return allQ.slice(0, 20).map((q,i)=>({...q,id:i}))
}

export const STAGE_INFO: Record<Stage, { name: string; grade: string; group: Group }> = {
  1:  { name: '수 세기·크기 비교',      grade: '7세',         group: 'basic' },
  2:  { name: '10까지 덧셈·뺄셈',       grade: '7세',         group: 'basic' },
  3:  { name: '50까지 연산',            grade: '1학년 1학기',  group: 'basic' },
  4:  { name: '받아올림·받아내림',       grade: '1학년 2학기',  group: 'basic' },
  5:  { name: '세 자리 수 연산',         grade: '2학년 1학기',  group: 'mid' },
  6:  { name: '구구단 2~5단',           grade: '2학년 2학기',  group: 'mid' },
  7:  { name: '구구단 6~9단·나눗셈',    grade: '3학년 1학기',  group: 'mid' },
  8:  { name: '두 자리 곱나눗셈·분수',  grade: '3학년 2학기',  group: 'mid' },
  9:  { name: '혼합 연산·분수',         grade: '4학년',        group: 'advanced' },
  10: { name: '약분·통분',              grade: '5학년 1학기',  group: 'advanced' },
  11: { name: '소수·비율',              grade: '5학년 2학기',  group: 'advanced' },
  12: { name: '분수 사칙·비례식',        grade: '6학년',        group: 'advanced' },
}

export const GROUP_STAGES: Record<Group, Stage[]> = {
  basic:    [1,2,3,4],
  mid:      [5,6,7,8],
  advanced: [9,10,11,12],
}
