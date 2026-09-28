import type { ComponentType } from 'react'

export interface VizStep {
  /** Hvad der sker i dette beat. Vises som billedtekst. */
  caption: string
  /** Hvor længe beatet står, før autoplay går videre (ms). Forfattet pr. beat. */
  hold: number
}

export interface VizDef {
  id: string
  title: string
  /** Trin 0 er udgangsbilledet; sidste trin er slutrammen, hvor alt kan læses. */
  steps: VizStep[]
  Component: ComponentType<{ step: number }>
}
