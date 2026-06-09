'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GROUP_STAGES, STAGE_INFO, type Group, type Stage } from '@/lib/questions'

const GROUP_THEME = {
  basic:    { bg:'bg-sky-50',    text:'text-emerald-700', accent:'bg-emerald-500', label:'초급', sub:'지구 발사 준비', icon:'🌍', spinBg:'bg-emerald-100', border:'border-emerald-300' },
  mid:      { bg:'bg-violet-50', text:'text-violet-700',  accent:'bg-violet-500',  label:'중급', sub:'우주 비행 중',   icon:'🌌', spinBg:'bg-violet-100',  border:'border-violet-300' },
  advanced: { bg:'bg-orange-50', text:'text-orange-700',  accent:'bg-orange-500',  label:'고급', sub:'행성 도착',      icon:'🪐', spinBg:'bg-orange-100',  border:'border-orange-300' },
}

export default function SelectPage() {
  const router = useRouter()
  const params = useSearchParams()
  const group = (params.get('group') ?? 'basic') as Group
  const theme = GROUP_THEME[group]
  const stages = GROUP_STAGES[group]

  const [spinning, setSpinning] = useState(false)
  const [displayStage, setDisplayStage] = useState<Stage>(stages[0])
  const [selected, setSelected] = useState<Stage|null>(null)
  const [done, setDone] = useState(false)

  const spin = () => {
    if(spinning) return
    setSpinning(true)
    setDone(false)
    setSelected(null)

    const finalStage = stages[Math.floor(Math.random()*stages.length)]
    let count = 0
    const total = 24 + Math.floor(Math.random()*10)

    const interval = setInterval(()=>{
      setDisplayStage(stages[count % stages.length])
      count++
      if(count >= total) {
        clearInterval(interval)
        setDisplayStage(finalStage)
        setSelected(finalStage)
        setSpinning(false)
        setDone(true)
      }
    }, count < total*0.6 ? 80 : count < total*0.85 ? 150 : 250)

    // 속도 조절을 위한 동적 인터벌
    let elapsed = 0
    const dynamicInterval = setInterval(()=>{
      elapsed++
      if(elapsed >= total) clearInterval(dynamicInterval)
    }, 100)
  }

  return (
    <main className={`min-h-screen ${theme.bg} flex flex-col items-center px-4 py-8`}>
      {/* 헤더 */}
      <motion.button
        className="self-start text-sm text-gray-400 mb-6 flex items-center gap-1"
        onClick={()=>router.push('/')}
        whileTap={{scale:0.9}}
      >← 뒤로</motion.button>

      <motion.div className="text-5xl mb-2"
        animate={{y:[0,-10,0]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}>
        {theme.icon}
      </motion.div>
      <h1 className={`text-xl font-bold ${theme.text} mb-1`}>{theme.label} — {theme.sub}</h1>
      <p className="text-sm text-gray-400 mb-8">돌림판을 돌려 오늘의 단계를 골라요!</p>

      {/* 돌림판 */}
      <div className="relative flex items-center justify-center mb-6">
        <motion.div
          className={`w-44 h-44 rounded-full ${theme.spinBg} border-4 ${theme.border} flex items-center justify-center shadow-lg`}
          animate={spinning ? { rotate:[0,360*3] } : {}}
          transition={spinning ? { duration:2.5, ease:'easeOut' } : {}}
        >
          <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
            <span className="text-xs text-gray-400">STAGE</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={displayStage}
                className={`text-3xl font-bold ${theme.text}`}
                initial={{scale:0.5,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.5,opacity:0}}
                transition={{duration:0.1}}
              >{displayStage}</motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 화살표 */}
        <div className={`absolute -bottom-3 text-2xl ${done?'animate-bounce':''}`}>▼</div>
      </div>

      {/* 단계 칩 */}
      <div className="flex gap-2 mb-8">
        {stages.map(s=>(
          <motion.div key={s}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-all
              ${displayStage===s ? `${theme.accent} text-white border-transparent` : `bg-white ${theme.text} ${theme.border}`}`}
            animate={displayStage===s?{scale:1.1}:{scale:1}}
          >{s}단계</motion.div>
        ))}
      </div>

      {/* 돌림판 버튼 */}
      {!done && (
        <motion.button
          className={`w-full max-w-sm py-4 rounded-2xl text-white font-bold text-lg ${theme.accent} shadow-md`}
          whileTap={{scale:0.95}}
          onClick={spin}
          disabled={spinning}
        >
          {spinning ? '두근두근...' : '🎲 돌림판 돌리기!'}
        </motion.button>
      )}

      {/* 선택 완료 */}
      <AnimatePresence>
        {done && selected && (
          <motion.div
            className="w-full max-w-sm"
            initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{type:'spring',stiffness:200}}
          >
            <div className={`${theme.spinBg} border-2 ${theme.border} rounded-2xl p-4 mb-4 text-center`}>
              <div className="text-sm text-gray-500 mb-1">{selected}단계 선택됨!</div>
              <div className={`text-lg font-bold ${theme.text}`}>{STAGE_INFO[selected].name}</div>
              <div className="text-xs text-gray-400">{STAGE_INFO[selected].grade}</div>
            </div>
            <motion.button
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg ${theme.accent} shadow-md mb-3`}
              whileTap={{scale:0.95}}
              onClick={()=>router.push(`/game/${selected}`)}
            >🚀 게임 시작!</motion.button>
            <button
              className="w-full py-3 rounded-2xl text-gray-500 font-medium text-sm bg-white border border-gray-200"
              onClick={()=>{setDone(false);setSelected(null)}}
            >다시 돌리기</button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
// Force dynamic rendering (useSearchParams 사용)
