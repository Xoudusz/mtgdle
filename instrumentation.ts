export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureGuessesCollection } = await import('./lib/pb-setup')
    await ensureGuessesCollection()
  }
}
