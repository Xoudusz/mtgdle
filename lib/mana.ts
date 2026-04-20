export function parseMana(cost: string | null): string[] {
  if (!cost) return []
  return Array.from(cost.matchAll(/\{([^}]+)}/g), m => m[1])
}
