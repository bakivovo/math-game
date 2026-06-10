'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GROUP_STAGES, STAGE_INFO, type Group, type Stage } from '@/lib/questions'
import { playRouletteTick, playRouletteDone } from '@/lib/sound'

const GROUP_THEME = {
  basic:    { bg:'bg-sky-50',    text:'text-emerald-700', accent:'bg-emerald-500', accentLight:'bg-emerald-100', label:'초급', sub:'지구 발사 준비', icon:'🌍', border:'border-emerald-300', cardBg:'bg-white', cardBorder:'border-emerald-200', cardActive:'bg-emerald-50 border-emerald-400', tagBg:'bg-emerald-100 text-emerald-700' },
  mid:      { bg:'bg-violet-50', text:'text-violet-700',  accent:'bg-violet-500',  accentLight:'bg-violet-100',  label:'중급', sub:'우주 비행 중',   icon:'🌌', border:'border-violet-300', cardBg:'bg-white', cardBorder:'border-violet-200', cardActive:'bg-violet-50 border-violet-400', tagBg:'bg-violet-100 text-violet-700' },
  advanced: { bg:'bg-orange-50', text:'text-orange-700',  accent:'bg-orange-500',  accentLight:'bg-orange-100',  label:'고급', sub:'행성 도착',      icon:'🪐', border:'border-orange-300', cardBg:'bg-white', cardBorder:'border-orange-200', cardActive:'bg-orange-50 border-orange-400', tagBg:'bg-orange-100 text-orange-700' },
}

const STAGE_ICONS: Record<number,string> = {
  1:'🌱',2:'➕',3:'🔢',4:'📐',5:'🏗️',6:'✖️',7:'➗',8:'🍕',9:'🔀',10:'📊',11:'🔣',12:'⚖️',
}

export default function SelectPage() {
  const router = useRouter()
  const params = useSearchParams()
  const group = (params.get('group') ?? 'basic') as Group
  const theme = GROUP_THEME[group]
  const stages = GROUP_STAGES[group]
  const [selected, setSelected] = useState<Stage|null>(null)
  const [spinning, setSpinning] = useState(false)

  const handleRandom = () => {
    if (spinning) return
    setSpinning(true)
    setSelected(null)
    const finalStage = stages[Math.floor(Math.random()*stages.length)]
    let count = 0
    const total = 14 + Math.floor(Math.random()*6)
    const interval = setInterval(() => {
      playRouletteTick()
      setSelected(stages[count%stages.length])
      count++
      if (count >= total) {
        clearInterval(interval)
        setSelected(finalStage)
        setSpinning(false)
        playRouletteDone()
      }
    }, count < total*0.6 ? 80 : 180)
  }

  return (
    <main className={`min-h-screen ${theme.bg} flex flex-col px-4 py-6`}>
      <motion.button className="self-start text-sm text-gray-400 mb-5 flex items-center gap-1"
        onClick={()=>router.push('/')} whileTap={{scale:0.9}}>← 뒤로</motion.button>

      <div className="flex items-center gap-3 mb-2">
        <motion.div className="text-4xl"
          animate={{y:[0,-8,0]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}}>
          {theme.icon}
        </motion.div>
        <div>
          <div className={`text-lg font-bold ${theme.text}`}>{theme.label}</div>
          <div className="text-sm text-gray-400">{theme.sub}</div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-5">단계를 직접 선택하거나 랜덤으로 골라요!</p>

      {/* 단계 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {stages.map((stage,idx)=>{
          const info = STAGE_INFO[stage]
          const isSel = selected===stage
          return (
            <motion.button key={stage}
              className={`rounded-2xl border-2 p-5 text-left transition-all shadow-sm
                ${isSel ? theme.cardActive : `${theme.cardBg} ${theme.cardBorder}`}`}
              initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
              transition={{delay:idx*0.08,type:'spring',stiffness:200}}
              whileTap={{scale:0.95}}
              onClick={()=>!spinning&&setSelected(stage)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{STAGE_ICONS[stage]}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isSel?`${theme.accent} text-white`:theme.tagBg}`}>
                  {stage}단계
                </span>
              </div>
              <div className={`text-sm font-bold ${isSel?theme.text:'text-gray-700'} leading-tight mb-1`}>{info.name}</div>
              <div className="text-xs text-gray-400">{info.grade}</div>
            </motion.button>
          )
        })}
      </div>

      {/* 랜덤 버튼 */}
      <motion.button
        className={`w-full py-3.5 rounded-2xl border-2 ${theme.border} ${theme.accentLight} ${theme.text} font-medium mb-4 flex items-center justify-center gap-2`}
        whileTap={{scale:0.95}} onClick={handleRandom} disabled={spinning}
      >
        {spinning ? <><span className="animate-spin">🎲</span> 고르는 중...</> : <><span>🎲</span> 랜덤으로 골라줘!</>}
      </motion.button>

      {/* 선택 확인 + 시작 */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}}
            transition={{type:'spring',stiffness:250}}>
            <div className={`${theme.accentLight} border ${theme.border} rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between`}>
              <div>
                <span className={`text-xs ${theme.text}`}>{selected}단계 선택됨</span>
                <div className={`text-sm font-bold ${theme.text}`}>{STAGE_INFO[selected].name}</div>
              </div>
              <span className="text-2xl">{STAGE_ICONS[selected]}</span>
            </div>
            <motion.button
              className={`w-full py-4 rounded-2xl text-white font-bold text-xl ${theme.accent} shadow-md`}
              whileTap={{scale:0.95}} onClick={()=>router.push(`/game/${selected}`)}
            >🚀 게임 시작!</motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {!selected && <p className="text-center text-xs text-gray-300 mt-2">단계를 선택하면 시작 버튼이 나타나요</p>}
    </main>
  )
}
