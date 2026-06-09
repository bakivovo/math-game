'use client'
import React from 'react'

/**
 * 분수 문자열을 파싱해서 세로 분수 형태로 렌더링
 * 지원 형태:
 *   "2/5"       → 세로 분수
 *   "1과2/3"    → 1 + 세로분수
 *   "1과0/4"    → 1 (분자가 0이면 정수만)
 *   "4/4"       → 1 (분자==분모이면 정수)
 *   일반 텍스트 → 그대로 출력
 */

interface FractionProps {
  value: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function SimpleFraction({ num, den, size }: { num: number; den: number; size: 'sm'|'md'|'lg' }) {
  const sizeMap = {
    sm: { numCls: 'text-sm', denCls: 'text-sm', lineCls: 'my-0.5' },
    md: { numCls: 'text-base', denCls: 'text-base', lineCls: 'my-0.5' },
    lg: { numCls: 'text-xl font-bold', denCls: 'text-xl font-bold', lineCls: 'my-1' },
  }
  const s = sizeMap[size]
  return (
    <span className="inline-flex flex-col items-center leading-none mx-0.5 align-middle">
      <span className={s.numCls}>{num}</span>
      <span className={`block border-t border-current w-full ${s.lineCls}`} />
      <span className={s.denCls}>{den}</span>
    </span>
  )
}

export function parseFraction(str: string): React.ReactNode {
  if (!str) return str

  // "1과0/4" 또는 "0과X/Y" → 정수 처리
  const mixedMatch = str.match(/^(\d+)과(\d+)\/(\d+)$/)
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1])
    const num = parseInt(mixedMatch[2])
    const den = parseInt(mixedMatch[3])
    if (num === 0) return <span>{whole}</span>
    return (
      <span className="inline-flex items-center gap-0.5">
        <span>{whole}</span>
        <SimpleFraction num={num} den={den} size="lg" />
      </span>
    )
  }

  // "4/4" → 1 (분자==분모)
  const fracMatch = str.match(/^(\d+)\/(\d+)$/)
  if (fracMatch) {
    const num = parseInt(fracMatch[1])
    const den = parseInt(fracMatch[2])
    if (num === den) return <span>1</span>
    if (num === 0) return <span>0</span>
    return <SimpleFraction num={num} den={den} size="lg" />
  }

  // "3…1" 형태 (나머지 나눗셈) → 그대로
  return <span>{str}</span>
}

/**
 * 문제 display 문자열 안의 분수를 세로 형태로 변환
 * ex) "1/3 + 1/4 = ?" → 세로분수 + 세로분수 = ?
 */
export function renderMathDisplay(display: string): React.ReactNode {
  // 분수 패턴: 숫자과숫자/숫자 또는 숫자/숫자
  const parts = display.split(/(\d+과\d+\/\d+|\d+\/\d+)/)
  return (
    <>
      {parts.map((part, i) => {
        const isFrac = /^(\d+과\d+\/\d+|\d+\/\d+)$/.test(part)
        if (isFrac) return <React.Fragment key={i}>{parseFraction(part)}</React.Fragment>
        // 줄바꿈 처리
        return part.split('\n').map((line, j) => (
          <React.Fragment key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line}
          </React.Fragment>
        ))
      })}
    </>
  )
}

export default function FractionDisplay({ value, size = 'md', className = '' }: FractionProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      {parseFraction(value)}
    </span>
  )
}
