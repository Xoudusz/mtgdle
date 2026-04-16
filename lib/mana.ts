export function parseMana(cost: string | null): string[] {
  if (!cost) return []
  return [...cost.matchAll(/\{([^}]+)\}/g)].map(m => m[1])
}
