'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Group } from '@/lib/questions'

const GROUPS: { id: Group; label: string; sub: string; range: string; icon: string; bg: string; border: string; text: string; textSub: string }[] = [
  { id:'basic',    label:'초급', sub:'지구에서 발사 준비!', range:'1~4단계', icon:'🌍', bg:'bg-sky-50',    border:'border-emerald-400', text:'text-emerald-700',  textSub:'text-emerald-500' },
  { id:'mid',      label:'중급', sub:'우주를 날아가는 중!', range:'5~8단계', icon:'🌌', bg:'bg-violet-50', border:'border-violet-400',  text:'text-violet-700',   textSub:'text-violet-500'  },
  { id:'advanced', label:'고급', sub:'행성에 도착했어요!',  range:'9~12단계',icon:'🪐', bg:'bg-orange-50', border:'border-orange-400',  text:'text-orange-700',   textSub:'text-orange-500'  },
]

const STARS = Array.from({length:12},(_,i)=>({
  x: Math.random()*100, y: Math.random()*100,
  size: Math.random()*3+1, delay: Math.random()*2,
}))

export default function HomePage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-sky-50 flex flex-col items-center px-4 py-8 relative overflow-hidden">
      {/* 별 배경 */}
      {STARS.map((s,i)=>(
        <motion.div key={i}
          className="absolute rounded-full bg-sky-300 opacity-60"
          style={{ left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size }}
          animate={{ opacity:[0.3,0.9,0.3], scale:[1,1.3,1] }}
          transition={{ duration:2+s.delay, repeat:Infinity, delay:s.delay }}
        />
      ))}

      {/* 로켓 */}
      <motion.div
        className="text-7xl mt-4 mb-2 select-none"
        animate={{ y:[0,-14,0] }}
        transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
      >🚀</motion.div>

      <motion.h1
        className="text-2xl font-bold text-sky-800 text-center mb-1"
        initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
      >우주 수학 탐험대</motion.h1>
      <motion.p
        className="text-sm text-sky-500 text-center mb-8"
        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
      >레벨을 선택하고 행성을 정복하세요! 🌟</motion.p>

      {/* 그룹 버튼 */}
      <div className="w-full max-w-sm flex flex-col gap-4">
        {GROUPS.map((g, idx) => (
          <motion.button
            key={g.id}
            className={`w-full ${g.bg} border-2 ${g.border} rounded-2xl p-5 flex items-center gap-4 shadow-sm active:scale-95`}
            initial={{ opacity:0, x:-30 }}
            animate={{ opacity:1, x:0 }}
            transition={{ delay:0.3+idx*0.15, type:'spring', stiffness:200 }}
            whileTap={{ scale:0.95 }}
            onClick={()=>router.push(`/select?group=${g.id}`)}
          >
            <span className="text-4xl">{g.icon}</span>
            <div className="flex-1 text-left">
              <div className={`text-lg font-bold ${g.text}`}>{g.label}</div>
              <div className={`text-sm ${g.textSub}`}>{g.sub}</div>
            </div>
            <div className={`text-xs font-medium ${g.textSub} bg-white rounded-full px-3 py-1 border ${g.border}`}>{g.range}</div>
          </motion.button>
        ))}
      </div>

      <motion.p
        className="text-xs text-sky-400 mt-6"
        animate={{ opacity:[0.5,1,0.5] }}
        transition={{ duration:2, repeat:Infinity }}
      >탭하면 랜덤 스테이지 선택!</motion.p>

      {/* 별똥별 */}
      <motion.div
        className="absolute text-lg pointer-events-none"
        style={{ top:'15%' }}
        animate={{ x:['−10vw','110vw'], y:[0,40], opacity:[1,0] }}
        transition={{ duration:4, repeat:Infinity, repeatDelay:6, ease:'linear' }}
      >⭐</motion.div>
    </main>
  )
}
