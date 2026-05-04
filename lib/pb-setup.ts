import PocketBase from 'pocketbase'

const COLLECTION_NAME = 'guesses'

const GUESSES_SCHEMA = {
  name: COLLECTION_NAME,
  type: 'base',
  createRule: '',
  listRule: '',
  viewRule: '',
  updateRule: null,
  deleteRule: null,
  fields: [
    { name: 'mode', type: 'text', required: true },
    { name: 'date', type: 'text', required: true },
    { name: 'card_id', type: 'text', required: true },
    { name: 'guess_count', type: 'number', required: true },
    { name: 'solved', type: 'bool', required: false },
  ],
}

export async function ensureGuessesCollection() {
  const url = process.env.POCKETBASE_URL
  const email = process.env.PB_ADMIN_EMAIL
  const password = process.env.PB_ADMIN_PASSWORD

  if (!url || !email || !password) {
    console.log('[pb-setup] Missing PocketBase config, skipping collection setup')
    return
  }

  const pb = new PocketBase(url)

  try {
    await pb.collection('_superusers').authWithPassword(email, password)
  } catch (err) {
    console.error('[pb-setup] Admin auth failed:', err)
    return
  }

  try {
    await pb.collections.getOne(COLLECTION_NAME)
    console.log(`[pb-setup] "${COLLECTION_NAME}" collection already exists`)
  } catch {
    try {
      await pb.collections.create(GUESSES_SCHEMA)
      console.log(`[pb-setup] "${COLLECTION_NAME}" collection created successfully`)
    } catch (err) {
      console.error(`[pb-setup] Failed to create "${COLLECTION_NAME}" collection:`, err)
    }
  }
}
