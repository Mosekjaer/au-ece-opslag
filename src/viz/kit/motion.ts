import type { Transition } from 'motion/react'

/* Forfattede bevægelser. Navnene beskriver hvad bevægelsen betyder,
   ikke hvordan den ser ud. */

export const t = {
  /** Noget lander på sin plads: let overshoot, så det mærkes. */
  place: { type: 'spring', stiffness: 420, damping: 26, mass: 0.9 } as Transition,
  /** Rolig ankomst uden overshoot, til tekst og tabelrækker. */
  settle: { type: 'spring', stiffness: 260, damping: 32, mass: 1 } as Transition,
  /** Et objekt rejser fra A til B: tøver, accelererer, bremser. */
  travel: { type: 'tween', duration: 0.85, ease: [0.65, 0, 0.35, 1] } as Transition,
  /** Afsæt med tilløb (anticipation) — til afsendelse af en anmodning. */
  launch: { type: 'tween', duration: 0.9, ease: 'anticipate' } as Transition,
  /** Toning af farve/opacitet. */
  fade: { type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] } as Transition,
  /** Langsom toning til noget der trækker sig tilbage. */
  recede: { type: 'tween', duration: 0.6, ease: [0.22, 1, 0.36, 1] } as Transition,
}

/** Forskudt start for elementer i en gruppe. */
export const stagger = (i: number, base = 0, gap = 0.07): Transition => ({ ...t.settle, delay: base + i * gap })
