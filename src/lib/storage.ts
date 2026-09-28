/* localStorage kan kaste (privat vindue, blokeret site data).
   Alt går gennem disse to funktioner, og siden virker uden. */

export function load(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function save(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    /* ignoreres bevidst */
  }
}
