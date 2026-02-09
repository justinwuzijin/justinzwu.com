'use client'

import dynamic from 'next/dynamic'

const RandomVideoPopup = dynamic(
  () => import('@/components/RandomVideoPopup').then(mod => ({ default: mod.RandomVideoPopup })),
  { ssr: false }
)

export function LazyRandomVideoPopup() {
  return <RandomVideoPopup />
}
