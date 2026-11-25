// Austrian legal notice (Offenlegung nach § 25 MedienG). Toggle at runtime with
// IMPRESSUM_ENABLED=false (default: on). Read only after `await connection()` so the
// value comes from the container env, not from `next build`.
export const IMPRESSUM = {
  name: 'David Tinhofer',
  city: 'Wien',
  email: 'da@w23.at',
}

export function impressumEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.IMPRESSUM_ENABLED?.trim().toLowerCase() !== 'false'
}
