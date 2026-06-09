'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { generateQuestions, STAGE_INFO, type Stage, type Question } from '@/lib/questions'
import ResultScreen from '@/components/ResultScreen'
import { renderMathDisplay, parseFraction } from '@/components/FractionDisplay'

const STAGE_THEME = {
  basic:    { bg:'bg-sky-50',    qBox:'bg-white border-sky-200',    choiceBase:'bg-white border-sky-200 text-sky-900', choiceOk:'bg-emerald-100 border-emerald-400 text-emerald-800', choiceBad:'bg-red-100 border-red-400 text-red-800', progress:'bg-emerald-400', gauge:'bg-emerald-400', gaugeTrack:'bg-emerald-100', gaugeTxt:'text-emerald-700', gaugeLabel:'🚀 연료', score:'bg-emerald-100 text-emerald-700 border-emerald-200', tag:'text-emerald-500', title:'text-sky-800' },
  mid:      { bg:'bg-violet-50', qBox:'bg-white border-violet-200', choiceBase:'bg-white border-violet-200 text-violet-900', choiceOk:'bg-violet-100 border-violet-400 text-violet-800', choiceBad:'bg-red-100 border-red-400 text-red-800', progress:'bg-violet-400', gauge:'bg-violet-400', gaugeTrack:'bg-violet-100', gaugeTxt:'text-violet-700', gaugeLabel:'🛸 목적지', score:'bg-violet-100 text-violet-700 border-violet-200', tag:'text-violet-500', title:'text-violet-800' },
  advanced: { bg:'bg-orange-50', qBox:'bg-white border-orange-200', choiceBase:'bg-white border-orange-200 text-orange-900', choiceOk:'bg-orange-100 border-orange-400 text-orange-800', choiceBad:'bg-red-100 border-red-400 text-red-800', progress:'bg-orange-400', gauge:'bg-orange-400', gaugeTrack:'bg-orange-100', gaugeTxt:'text-orange-700', gaugeLabel:'🪐 꾸미기', score:'bg-orange-100 text-orange-700 border-orange-200', tag:'text-orange-500', title:'text-orange-800' },
}

type ChoiceState = 'idle'|'correct'|'wrong'

interface WrongRecord {
  question: Question
  chosen: string
}

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
  const [isCorrect, setIsCorrect] = useState<boolean|null>(null)
  const [finished, setFinished] = useState(false)
  const [particles, setParticles] = useState<{id:number,x:number,y:number,emoji:string}[]>([])

  useEffect(()=>{
    setQuestions(generateQuestions(stage))
  },[stage])

  const q = questions[current]
  const progress = questions.length ? (current/questions.length)*100 : 0
  const gaugeProgress = questions.length ? (correctCount/questions.length)*100 : 0

  // 다음 문제로 이동
  const goNext = useCallback(() => {
    setChoiceStates({})
    setAnswered(false)
    setShowHint(false)
    setIsCorrect(null)
    setParticles([])
    if (current + 1 >= questions.length) {
      setFinished(true)
    } else {
      setCurrent(c => c + 1)
    }
  }, [current, questions.length])

  const handleAnswer = useCallback((choice: string) => {
    if (answered || !q) return
    setAnswered(true)
    const correct = choice === q.answer
    setIsCorrect(correct)
    setChoiceStates(prev => ({
      ...prev,
      [choice]: correct ? 'correct' : 'wrong',
      [q.answer]: 'correct',
    }))

    if (correct) {
      setCorrectCount(c => c + 1)
      // 파티클
      const newParticles = Array.from({length:8},(_,i) => ({
        id: Date.now()+i,
        x: 30 + Math.random()*40,
        y: 30 + Math.random()*40,
        emoji: ['⭐','✨','🌟','💫'][Math.floor(Math.random()*4)]
      }))
      setParticles(newParticles)
      // 정답은 1초 후 자동으로 다음 문제
      setTimeout(() => goNext(), 1000)
    } else {
      // 오답 기록
      setWrongRecords(prev => [...prev, { question: q, chosen: choice }])
      setShowHint(true)
      // 오답은 힌트 터치 대기 (자동 이동 없음)
    }
  }, [answered, q, goNext])

  if (!q && !finished) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-spin">🚀</div>
    </div>
  )

  if (finished) return (
    <ResultScreen
      stage={stage}
      correct={correctCount}
      total={questions.length}
      wrongRecords={wrongRecords}
      onRetry={() => {
        setQuestions(generateQuestions(stage))
        setCurrent(0); setCorrectCount(0); setAnswered(false)
        setChoiceStates({}); setShowHint(false); setFinished(false)
        setIsCorrect(null); setWrongRecords([])
      }}
      onNext={() => router.push('/')}
    />
  )

  return (
    <main className={`min-h-screen ${theme.bg} flex flex-col px-4 py-5 relative overflow-hidden`}>

      {/* 파티클 */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div key={p.id}
            className="absolute text-xl pointer-events-none z-50"
            style={{left:`${p.x}%`, top:`${p.y}%`}}
            initial={{scale:0,opacity:1,y:0}}
            animate={{scale:1.5,opacity:0,y:-60}}
            exit={{opacity:0}}
            transition={{duration:0.8,ease:'easeOut'}}
          >{p.emoji}</motion.div>
        ))}
      </AnimatePresence>

      {/* 상단 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => router.push('/')} className="text-gray-400 text-sm">← 홈</button>
        <div className="text-xs text-gray-400">{info.name} · {info.grade}</div>
        <div className={`text-xs font-medium px-3 py-1 rounded-full border ${theme.score}`}>{current+1} / {questions.length}</div>
      </div>

      {/* 진행 바 */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-3 overflow-hidden">
        <motion.div className={`h-2.5 rounded-full ${theme.progress}`}
          animate={{width:`${progress}%`}} transition={{duration:0.5}}/>
      </div>

      {/* 게이지 */}
      <div className={`flex items-center gap-2 ${theme.gaugeTrack} rounded-xl px-3 py-2 mb-4`}>
        <span className={`text-xs font-medium ${theme.gaugeTxt}`}>{theme.gaugeLabel}</span>
        <div className={`flex-1 ${theme.gaugeTrack} border border-white rounded-full h-2 overflow-hidden`}>
          <motion.div className={`h-2 rounded-full ${theme.gauge}`}
            animate={{width:`${gaugeProgress}%`}} transition={{duration:0.6,ease:'easeOut'}}/>
        </div>
        <span className={`text-xs font-medium ${theme.gaugeTxt}`}>{correctCount}/{questions.length}</span>
      </div>

      {/* 문제 박스 */}
      <AnimatePresence mode="wait">
        <motion.div key={current}
          className={`border-2 ${theme.qBox} rounded-2xl p-5 mb-4 text-center shadow-sm`}
          initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}}
          transition={{duration:0.25}}
        >
          <div className={`text-xs font-medium ${theme.tag} mb-2`}>{q?.type}</div>
          {q?.visual && (
            <div className="text-xl mb-2 leading-relaxed break-all">{q.visual}</div>
          )}
          <div className={`text-2xl font-bold ${theme.title} leading-relaxed`}>
            {q ? renderMathDisplay(q.display) : null}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 힌트 (오답 시 — 터치하면 다음 문제) */}
      <AnimatePresence>
        {showHint && q?.hint && (
          <motion.button
            className="w-full bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-3 text-sm text-yellow-700 text-center active:bg-yellow-100"
            initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            onClick={goNext}
            whileTap={{scale:0.97}}
          >
            <div className="font-medium mb-0.5">💡 {q.hint}</div>
            <div className="text-xs text-yellow-500">탭하면 다음 문제로 →</div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 선택지 */}
      <div className={`grid gap-3 ${q?.choices.length === 3 ? 'grid-cols-3' : q?.choices.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {q?.choices.map((choice, i) => {
          const state = choiceStates[choice] ?? 'idle'
          return (
            <motion.button key={choice+i}
              className={`py-4 rounded-2xl border-2 text-lg font-bold transition-colors flex items-center justify-center min-h-[60px]
                ${state === 'correct' ? theme.choiceOk :
                  state === 'wrong'   ? theme.choiceBad :
                  theme.choiceBase}`}
              onClick={() => handleAnswer(choice)}
              disabled={answered}
              animate={state === 'correct' ? {scale:[1,1.15,1]} : state === 'wrong' ? {x:[0,-8,8,-6,6,0]} : {}}
              transition={{duration:0.35}}
              whileTap={!answered ? {scale:0.93} : {}}
            >
              {/* 분수 보기 렌더링 */}
              {renderMathDisplay(choice)}
            </motion.button>
          )
        })}
      </div>

      {/* 문제 번호 도트 */}
      <div className="flex gap-1.5 justify-center mt-5 flex-wrap">
        {questions.map((_,i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all
            ${i < current ? theme.progress : i === current ? 'bg-gray-400 scale-125' : 'bg-gray-200'}`}/>
        ))}
      </div>
    </main>
  )
}
