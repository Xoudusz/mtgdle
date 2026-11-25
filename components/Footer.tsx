import Link from 'next/link'
import { connection } from 'next/server'
import { impressumEnabled } from '@/lib/impressum'

export default async function Footer() {
  await connection()
  if (!impressumEnabled()) return null
  return (
    <footer className="w-full border-t border-[#3a3020] py-4 text-center text-xs text-[#8a8070]">
      <Link href="/impressum" className="hover:text-[#8b6914] transition-colors">
        Impressum
      </Link>
    </footer>
  )
}
