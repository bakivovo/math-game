'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { STAGE_INFO, type Stage, type Question } from '@/lib/questions'
import { renderMathDisplay, parseFraction } from '@/components/FractionDisplay'

interface WrongRecord {
  question: Question
  chosen: string
}

interface Props {
  stage: Stage
  correct: number
  total: number
  wrongRecords: WrongRecord[]
  onRetry: () => void
  onNext: () => void
}

const PASS_THRESHOLD = 15

const GROUP_RESULT = {
  basic: {
    passEmoji: '🚀💨', failEmoji: '🌍',
    passTitle: '발사 성공!', passMsg: '연료가 가득 찼어요. 우주로 출발!',
    nextLabel: '우주로 출발 →',
    bg: 'bg-emerald-50', accent: 'bg-emerald-500', accentLight: 'bg-emerald-100',
    border: 'border-emerald-300', text: 'text-emerald-700', badgeBg: 'bg-emerald-500',
    failBg: 'bg-amber-50', failAccent: 'bg-amber-500', failText: 'text-amber-700', failBorder: 'border-amber-300',
    wrongBg: 'bg-emerald-50', wrongBorder: 'border-emerald-200', wrongTag: 'bg-emerald-100 text-emerald-700',
  },
  mid: {
    passEmoji: '🛸🌟', failEmoji: '🌌',
    passTitle: '행성 근접!', passMsg: '목적지가 눈앞에 보여요. 고급으로 돌격!',
    nextLabel: '행성으로 돌격 →',
    bg: 'bg-violet-50', accent: 'bg-violet-500', accentLight: 'bg-violet-100',
    border: 'border-violet-300', text: 'text-violet-700', badgeBg: 'bg-violet-500',
    failBg: 'bg-amber-50', failAccent: 'bg-amber-500', failText: 'text-amber-700', failBorder: 'border-amber-300',
    wrongBg: 'bg-violet-50', wrongBorder: 'border-violet-200', wrongTag: 'bg-violet-100 text-violet-700',
  },
  advanced: {
    passEmoji: '🪐🌳🏠⭐', failEmoji: '🪐',
    passTitle: '행성 완성!', passMsg: '나만의 행성이 아름답게 꾸며졌어요!',
    nextLabel: '다음 행성 탐험 →',
    bg: 'bg-orange-50', accent: 'bg-orange-500', accentLight: 'bg-orange-100',
    border: 'border-orange-300', text: 'text-orange-700', badgeBg: 'bg-orange-500',
    failBg: 'bg-amber-50', failAccent: 'bg-amber-500', failText: 'text-amber-700', failBorder: 'border-amber-300',
    wrongBg: 'bg-orange-50', wrongBorder: 'border-orange-200', wrongTag: 'bg-orange-100 text-orange-700',
  },
}

const PLANET_DECOR = ['🌳','🏠','⭐','🌈','🌸','🌺']

export default function ResultScreen({ stage, correct, total, wrongRecords, onRetry, onNext }: Props) {
  const info = STAGE_INFO[stage]
  const theme = GROUP_RESULT[info.group]
  const passed = correct >= PASS_THRESHOLD
  const wrong = total - correct
  const stars = correct >= 18 ? 3 : correct >= 15 ? 2 : 1
  const [showWrong, setShowWrong] = useState(false)

  // confetti
  useEffect(() => {
    if (!passed) return
    const load = async () => {
      const { default: confetti } = await import('canvas-confetti')
      confetti({ particleCount:120, spread:80, origin:{y:0.5}, colors:['#60a5fa','#a78bfa','#34d399','#fbbf24','#f87171'] })
      setTimeout(() => confetti({ particleCount:80, spread:60, origin:{y:0.4}, angle:60 }), 400)
      setTimeout(() => confetti({ particleCount:80, spread:60, origin:{y:0.4}, angle:120 }), 600)
    }
    load()
  }, [passed])

  return (
    <main className={`min-h-screen ${passed ? theme.bg : theme.failBg} flex flex-col items-center px-4 py-8 pb-16`}>

      {/* 메인 이모지 */}
      <motion.div className="text-5xl mb-3 select-none"
        initial={passed ? {y:60,opacity:0} : {scale:0}}
        animate={passed ? {y:0,opacity:1} : {scale:1}}
        transition={passed ? {type:'spring',stiffness:200,damping:15,delay:0.2} : {type:'spring',delay:0.2}}
      >{passed ? theme.passEmoji : theme.failEmoji}</motion.div>

      {/* 고급 꾸미기 요소 */}
      {passed && info.group === 'advanced' && (
        <div className="flex gap-2 mb-2">
          {PLANET_DECOR.slice(0, Math.min(stars+2, 6)).map((d,i) => (
            <motion.span key={i} className="text-2xl"
              initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
              transition={{delay:0.5+i*0.15,type:'spring',stiffness:300}}
            >{d}</motion.span>
          ))}
        </div>
      )}

      {/* 배지 */}
      <motion.div className={`px-4 py-1.5 rounded-full text-sm font-medium text-white mb-3 ${passed ? theme.badgeBg : theme.failAccent}`}
        initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.4}}
      >{passed ? theme.passTitle : '조금만 더!'}</motion.div>

      {/* 별점 */}
      <div className="flex gap-1 mb-3">
        {[1,2,3].map(n => (
          <motion.span key={n} className="text-3xl"
            initial={{scale:0,opacity:0}}
            animate={n <= stars ? {scale:1,opacity:1} : {scale:1,opacity:0.2}}
            transition={{delay:0.5+n*0.15,type:'spring',stiffness:300}}
          >⭐</motion.span>
        ))}
      </div>

      {/* 점수 설명 */}
      <motion.p className={`text-sm text-center mb-1 ${passed ? theme.text : theme.failText}`}
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}
      >{total}문제 중 <strong>{correct}개</strong> 정답!</motion.p>
      <motion.p className="text-xs text-center text-gray-400 mb-5"
        initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}
      >{passed ? theme.passMsg : `${PASS_THRESHOLD}개 이상이면 다음 단계로 갈 수 있어요. ${PASS_THRESHOLD - correct}개만 더!`}</motion.p>

      {/* 통과 안내 */}
      {passed && (
        <motion.div className={`w-full max-w-sm ${theme.accentLight} border ${theme.border} rounded-xl px-4 py-2.5 flex justify-between items-center mb-5`}
          initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.9}}
        >
          <span className={`text-xs ${theme.text}`}>다음 단계 이동 기준</span>
          <span className={`text-sm font-bold ${theme.text}`}>{PASS_THRESHOLD}개 이상 ✓</span>
        </motion.div>
      )}

      {/* 스탯 */}
      <motion.div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-5"
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.0}}
      >
        <div className={`bg-white border ${passed ? theme.border : theme.failBorder} rounded-2xl p-4 text-center`}>
          <div className={`text-3xl font-bold ${passed ? theme.text : theme.failText}`}>{correct}</div>
          <div className="text-xs text-gray-400 mt-1">정답</div>
        </div>
        <div className={`bg-white border ${passed ? theme.border : theme.failBorder} rounded-2xl p-4 text-center`}>
          <div className={`text-3xl font-bold text-red-400`}>{wrong}</div>
          <div className="text-xs text-gray-400 mt-1">오답</div>
        </div>
      </motion.div>

      {/* 오답 복습 토글 */}
      {wrongRecords.length > 0 && (
        <motion.div className="w-full max-w-sm mb-5"
          initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.1}}
        >
          <button
            className={`w-full py-3 rounded-xl border-2 text-sm font-medium mb-3
              ${showWrong ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-red-200 text-red-500'}`}
            onClick={() => setShowWrong(v => !v)}
          >
            {showWrong ? '▲ 오답 복습 닫기' : `▼ 오답 복습 보기 (${wrongRecords.length}개)`}
          </button>

          <AnimatePresence>
            {showWrong && (
              <motion.div
                initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3">
                  {wrongRecords.map((rec, i) => (
                    <motion.div key={i}
                      className={`${theme.wrongBg} border ${theme.wrongBorder} rounded-2xl p-4`}
                      initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
                      transition={{delay:i*0.08}}
                    >
                      {/* 문제 유형 */}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${theme.wrongTag}`}>
                        {rec.question.type}
                      </span>

                      {/* 문제 */}
                      <div className="text-sm font-bold text-gray-700 mt-2 mb-3 text-center leading-relaxed">
                        {renderMathDisplay(rec.question.display)}
                      </div>

                      {/* 내 답 vs 정답 */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
                          <div className="text-xs text-red-400 mb-1">내 답</div>
                          <div className="text-base font-bold text-red-500 flex items-center justify-center">
                            {renderMathDisplay(rec.chosen)}
                          </div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center">
                          <div className="text-xs text-emerald-500 mb-1">정답</div>
                          <div className="text-base font-bold text-emerald-600 flex items-center justify-center">
                            {renderMathDisplay(rec.question.answer)}
                          </div>
                        </div>
                      </div>

                      {/* 힌트 */}
                      {rec.question.hint && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs text-yellow-700 text-center">
                          💡 {rec.question.hint}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 버튼 */}
      <motion.div className="w-full max-w-sm flex flex-col gap-3"
        initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1.2}}
      >
        {passed ? (
          <>
            <button className={`w-full py-4 rounded-2xl text-white font-bold text-lg ${theme.accent} shadow-md`} onClick={onNext}>
              {theme.nextLabel}
            </button>
            <button className={`w-full py-3 rounded-2xl font-medium text-sm bg-white border-2 ${theme.border} ${theme.text}`} onClick={onRetry}>
              다시 도전하기
            </button>
          </>
        ) : (
          <button className={`w-full py-4 rounded-2xl text-white font-bold text-lg ${theme.failAccent} shadow-md`} onClick={onRetry}>
            🔄 다시 도전하기!
          </button>
        )}
      </motion.div>
    </main>
  )
}
