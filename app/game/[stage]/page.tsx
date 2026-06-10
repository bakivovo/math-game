'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { generateQuestions, STAGE_INFO, type Stage, type Question } from '@/lib/questions'
import ResultScreen from '@/components/ResultScreen'
import { renderMathDisplay } from '@/components/FractionDisplay'
import { playCorrect, playWrong, playCombo, playItemGet, playItemUse } from '@/lib/sound'

const STAGE_THEME = {
  basic:    { bg:'bg-sky-50',    qBox:'bg-white border-sky-200',    choiceBase:'bg-white border-sky-200 text-sky-900', choiceOk:'bg-emerald-100 border-emerald-400 text-emerald-800', choiceBad:'bg-red-100 border-red-400 text-red-800', choiceDim:'bg-gray-100 border-gray-200 text-gray-400 line-through', progress:'bg-emerald-400', gauge:'bg-emerald-400', gaugeTrack:'bg-emerald-100', gaugeTxt:'text-emerald-700', gaugeLabel:'🚀 연료', score:'bg-emerald-100 text-emerald-700 border-emerald-200', tag:'text-emerald-500', title:'text-sky-800', combo:'bg-emerald-500', itemBg:'bg-emerald-50 border-emerald-300' },
  mid:      { bg:'bg-violet-50', qBox:'bg-white border-violet-200', choiceBase:'bg-white border-violet-200 text-violet-900', choiceOk:'bg-violet-100 border-violet-400 text-violet-800', choiceBad:'bg-red-100 border-red-400 text-red-800', choiceDim:'bg-gray-100 border-gray-200 text-gray-400 line-through', progress:'bg-violet-400', gauge:'bg-violet-400', gaugeTrack:'bg-violet-100', gaugeTxt:'text-violet-700', gaugeLabel:'🛸 목적지', score:'bg-violet-100 text-violet-700 border-violet-200', tag:'text-violet-500', title:'text-violet-800', combo:'bg-violet-500', itemBg:'bg-violet-50 border-violet-300' },
  advanced: { bg:'bg-orange-50', qBox:'bg-white border-orange-200', choiceBase:'bg-white border-orange-200 text-orange-900', choiceOk:'bg-orange-100 border-orange-400 text-orange-800', choiceBad:'bg-red-100 border-red-400 text-red-800', choiceDim:'bg-gray-100 border-gray-200 text-gray-400 line-through', progress:'bg-orange-400', gauge:'bg-orange-400', gaugeTrack:'bg-orange-100', gaugeTxt:'text-orange-700', gaugeLabel:'🪐 꾸미기', score:'bg-orange-100 text-orange-700 border-orange-200', tag:'text-orange-500', title:'text-orange-800', combo:'bg-orange-500', itemBg:'bg-orange-50 border-orange-300' },
}

type ChoiceState = 'idle'|'correct'|'wrong'|'dim'
type ItemType = 'reveal'|'hint'|'retry'
interface WrongRecord { question: Question; chosen: string }

const ITEM_INFO: Record<ItemType, { icon: string; label: string; desc: string }> = {
  reveal: { icon:'🔍', label:'정답 공개', desc:'오답 보기 1개 제거' },
  hint:   { icon:'💡', label:'힌트',     desc:'힌트 바로 보기' },
  retry:  { icon:'🔄', label:'재도전',   desc:'오답 시 다시 시도' },
}

const ITEM_TYPES: ItemType[] = ['reveal','hint','retry']

export default function GamePage() {
  const { stage: stageParam } = useParams()
  const router = useRouter()
  const stage = Number(stageParam) as Stage
  const info = STAGE_INFO[stage]
  const theme = STAGE_THEME[info.group]

  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongRecords, setWrongRecords] = useState<WrongRecord[]>([])
  const [choiceStates, setChoiceStates] = useState<Record<string,ChoiceState>>({})
  const [answered, setAnswered] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState(false)
  const [particles, setParticles] = useState<{id:number;x:number;y:number;emoji:string}[]>([])

  // 콤보 시스템
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [comboText, setComboText] = useState('')

  // 아이템 시스템
  const [items, setItems] = useState<ItemType[]>([])
  const [showItemGet, setShowItemGet] = useState(false)
  const [activeItem, setActiveItem] = useState<ItemType|null>(null)
  const [retryUsed, setRetryUsed] = useState(false) // 현재 문제 재도전 사용 여부
  const [removedChoice, setRemovedChoice] = useState<string|null>(null) // 제거된 오답 보기

  useEffect(() => { setQuestions(generateQuestions(stage)) }, [stage])

  const q = questions[current]
  const progress = questions.length ? (current/questions.length)*100 : 0
  const gaugeProgress = questions.length ? (correctCount/questions.length)*100 : 0

  const goNext = useCallback(() => {
    setChoiceStates({})
    setAnswered(false)
    setShowHint(false)
    setActiveItem(null)
    setRetryUsed(false)
    setRemovedChoice(null)
    setParticles([])
    if (current + 1 >= questions.length) setFinished(true)
    else setCurrent(c => c + 1)
  }, [current, questions.length])

  // 콤보 연출
  const triggerCombo = useCallback((newCombo: number) => {
    if (newCombo < 2) return
    setShowCombo(true)
    if (newCombo >= 10) setComboText(`🔥 ${newCombo}연속!! 최강!`)
    else if (newCombo >= 7) setComboText(`⚡ ${newCombo}연속! 굉장해!`)
    else if (newCombo >= 5) setComboText(`🌟 ${newCombo}연속! 대단해!`)
    else if (newCombo >= 3) setComboText(`✨ ${newCombo}연속! 잘하고 있어!`)
    else setComboText(`👍 ${newCombo}연속!`)
    playCombo(newCombo)
    setTimeout(() => setShowCombo(false), 1200)

    // 콤보 5 달성 시 아이템 지급
    if (newCombo % 5 === 0) {
      const newItem = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)]
      setItems(prev => [...prev, newItem])
      setShowItemGet(true)
      playItemGet()
      setTimeout(() => setShowItemGet(false), 2000)
    }
  }, [])

  const handleAnswer = useCallback((choice: string) => {
    if (answered || !q) return
    // 재도전 아이템 사용 중이면 초기화
    const isCorrect = choice === q.answer

    setAnswered(true)
    setChoiceStates(prev => ({
      ...prev,
      [choice]: isCorrect ? 'correct' : 'wrong',
      [q.answer]: 'correct',
    }))

    if (isCorrect) {
      playCorrect()
      setCorrectCount(c => c + 1)
      const newCombo = combo + 1
      setCombo(newCombo)
      setMaxCombo(m => Math.max(m, newCombo))
      triggerCombo(newCombo)

      // 파티클
      setParticles(Array.from({length:8},(_,i) => ({
        id: Date.now()+i,
        x: 20+Math.random()*60, y: 20+Math.random()*50,
        emoji: ['⭐','✨','🌟','💫','🎉'][Math.floor(Math.random()*5)]
      })))
      setTimeout(() => goNext(), 950)
    } else {
      playWrong()
      setCombo(0) // 콤보 리셋
      // 재도전 아이템이 있고 아직 사용 안했으면
      if (items.includes('retry') && !retryUsed) {
        // 재도전은 버튼으로 선택 (자동 X)
      }
      setWrongRecords(prev => [...prev, { question: q, chosen: choice }])
      setShowHint(true)
    }
  }, [answered, q, combo, triggerCombo, goNext, items, retryUsed])

  // 아이템 사용
  const useItem = useCallback((item: ItemType) => {
    if (!q || answered) return
    playItemUse()

    if (item === 'reveal') {
      // 오답 1개 제거
      const wrongChoices = q.choices.filter(c => c !== q.answer)
      if (wrongChoices.length > 0) {
        const toRemove = wrongChoices[Math.floor(Math.random()*wrongChoices.length)]
        setRemovedChoice(toRemove)
      }
      setItems(prev => { const i=[...prev]; i.splice(i.indexOf('reveal'),1); return i })
    } else if (item === 'hint') {
      setShowHint(true)
      setItems(prev => { const i=[...prev]; i.splice(i.indexOf('hint'),1); return i })
    } else if (item === 'retry') {
      setActiveItem('retry')
    }
    setActiveItem(item === 'retry' ? 'retry' : null)
  }, [q, answered])

  // 재도전 아이템: 오답 후 다시 시도
  const handleRetry = useCallback(() => {
    if (!items.includes('retry')) return
    playItemUse()
    setItems(prev => { const i=[...prev]; i.splice(i.indexOf('retry'),1); return i })
    setRetryUsed(true)
    setAnswered(false)
    setShowHint(false)
    // 오답 기록 마지막 거 제거
    setWrongRecords(prev => prev.slice(0,-1))
    setChoiceStates({})
    setActiveItem(null)
  }, [items])

  if (!q && !finished) return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
      <div className="text-5xl animate-spin">🚀</div>
    </div>
  )

  if (finished) return (
    <ResultScreen
      stage={stage} correct={correctCount} total={questions.length}
      wrongRecords={wrongRecords} maxCombo={maxCombo}
      onRetry={() => {
        setQuestions(generateQuestions(stage))
        setCurrent(0); setCorrectCount(0); setAnswered(false)
        setChoiceStates({}); setShowHint(false); setFinished(false)
        setCombo(0); setMaxCombo(0); setItems([]); setWrongRecords([])
        setRemovedChoice(null); setRetryUsed(false)
      }}
      onNext={() => router.push('/')}
    />
  )

  return (
    <main className={`min-h-screen ${theme.bg} flex flex-col px-4 pt-4 pb-6`}>

      {/* 파티클 */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div key={p.id} className="absolute text-2xl pointer-events-none z-50"
            style={{left:`${p.x}%`,top:`${p.y}%`}}
            initial={{scale:0,opacity:1,y:0}} animate={{scale:1.6,opacity:0,y:-80}}
            exit={{opacity:0}} transition={{duration:0.9,ease:'easeOut'}}
          >{p.emoji}</motion.div>
        ))}
      </AnimatePresence>

      {/* 콤보 팝업 */}
      <AnimatePresence>
        {showCombo && (
          <motion.div className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 ${theme.combo} text-white px-6 py-2.5 rounded-full text-lg font-bold shadow-lg`}
            initial={{scale:0.5,opacity:0,y:-20}} animate={{scale:1,opacity:1,y:0}}
            exit={{scale:0.8,opacity:0,y:-20}} transition={{type:'spring',stiffness:400}}
          >{comboText}</motion.div>
        )}
      </AnimatePresence>

      {/* 아이템 획득 팝업 */}
      <AnimatePresence>
        {showItemGet && (
          <motion.div className="fixed top-32 left-1/2 -translate-x-1/2 z-50 bg-yellow-400 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg"
            initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}}
            exit={{scale:0.8,opacity:0}} transition={{type:'spring',stiffness:300}}
          >🎁 아이템 획득!</motion.div>
        )}
      </AnimatePresence>

      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => router.push('/')} className="text-gray-400 text-sm px-1">← 홈</button>
        <div className="text-xs text-gray-400 text-center">{info.name} · {info.grade}</div>
        <div className={`text-xs font-medium px-3 py-1 rounded-full border ${theme.score}`}>{current+1} / {questions.length}</div>
      </div>

      {/* 콤보 바 */}
      {combo >= 2 && (
        <motion.div className={`flex items-center justify-center gap-1 mb-2`}
          initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',stiffness:400}}
        >
          {Array.from({length:Math.min(combo,10)}).map((_,i) => (
            <motion.div key={i} className={`w-3 h-3 rounded-full ${theme.combo}`}
              initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.03}}/>
          ))}
          <span className={`text-xs font-bold ml-1 ${theme.gaugeTxt}`}>{combo}콤보!</span>
        </motion.div>
      )}

      {/* 진행 바 */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
        <motion.div className={`h-2.5 rounded-full ${theme.progress}`}
          animate={{width:`${progress}%`}} transition={{duration:0.5}}/>
      </div>

      {/* 게이지 */}
      <div className={`flex items-center gap-2 ${theme.gaugeTrack} rounded-xl px-3 py-2 mb-3`}>
        <span className={`text-xs font-medium ${theme.gaugeTxt}`}>{theme.gaugeLabel}</span>
        <div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden">
          <motion.div className={`h-2.5 rounded-full ${theme.gauge}`}
            animate={{width:`${gaugeProgress}%`}} transition={{duration:0.6,ease:'easeOut'}}/>
        </div>
        <span className={`text-xs font-medium ${theme.gaugeTxt}`}>{correctCount}/{questions.length}</span>
      </div>

      {/* 아이템 슬롯 */}
      {items.length > 0 && (
        <motion.div className={`flex gap-2 mb-3 p-2.5 rounded-xl border ${theme.itemBg}`}
          initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
        >
          <span className="text-xs text-gray-400 self-center mr-1">아이템</span>
          {items.map((item, i) => (
            <motion.button key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-white border-2 shadow-sm
                ${answered && item !== 'retry' ? 'opacity-40' : 'border-yellow-300 text-yellow-700'}`}
              whileTap={{scale:0.92}}
              onClick={() => item === 'retry' && answered ? handleRetry() : !answered ? useItem(item) : null}
              disabled={answered && item !== 'retry'}
            >
              <span>{ITEM_INFO[item].icon}</span>
              <span className="text-xs">{ITEM_INFO[item].label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}

      {/* 문제 박스 */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          className={`border-2 ${theme.qBox} rounded-2xl p-6 mb-4 text-center shadow-sm flex-shrink-0`}
          initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}}
          transition={{duration:0.25}}
          style={{minHeight:'140px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}
        >
          <div className={`text-xs font-medium ${theme.tag} mb-2`}>{q?.type}</div>
          {q?.visual && <div className="text-2xl mb-3 leading-relaxed break-all">{q.visual}</div>}
          <div className={`text-3xl font-bold ${theme.title} leading-relaxed`}>
            {q ? renderMathDisplay(q.display) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 힌트 */}
      <AnimatePresence>
        {showHint && q?.hint && (
          <motion.button
            className="w-full bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-3 text-sm text-yellow-700 text-center"
            initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            onClick={goNext} whileTap={{scale:0.97}}
          >
            <div className="font-medium mb-0.5">💡 {q.hint}</div>
            <div className="text-xs text-yellow-500">탭하면 다음 문제 →</div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 재도전 버튼 (오답 후 retry 아이템 있을 때) */}
      <AnimatePresence>
        {answered && !showHint && items.includes('retry') && !retryUsed && (
          <motion.button
            className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3 text-sm text-blue-600 font-medium text-center"
            initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
            onClick={handleRetry} whileTap={{scale:0.97}}
          >🔄 재도전 아이템 사용하기</motion.button>
        )}
      </AnimatePresence>

      {/* 선택지 버튼 */}
      <div className={`grid gap-3 flex-1
        ${q?.choices.length === 3 ? 'grid-cols-3' : q?.choices.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}
      >
        {q?.choices.map((choice, i) => {
          const isRemoved = removedChoice === choice
          const state = choiceStates[choice] ?? 'idle'
          return (
            <motion.button key={choice+i}
              className={`rounded-2xl border-2 text-xl font-bold transition-colors flex items-center justify-center
                ${isRemoved ? theme.choiceDim :
                  state === 'correct' ? theme.choiceOk :
                  state === 'wrong'   ? theme.choiceBad :
                  theme.choiceBase}`}
              style={{minHeight:'80px'}}
              onClick={() => !isRemoved && handleAnswer(choice)}
              disabled={answered || isRemoved}
              animate={state === 'correct' ? {scale:[1,1.12,1]} : state === 'wrong' ? {x:[0,-8,8,-6,6,0]} : {}}
              transition={{duration:0.35}}
              whileTap={!answered && !isRemoved ? {scale:0.93} : {}}
            >
              {renderMathDisplay(choice)}
            </motion.button>
          )
        })}
      </div>

      {/* 문제 번호 도트 */}
      <div className="flex gap-1.5 justify-center mt-4 flex-wrap">
        {questions.map((_,i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all
            ${i < current ? theme.progress : i === current ? 'bg-gray-400 scale-125' : 'bg-gray-200'}`}/>
        ))}
      </div>
    </main>
  )
}
