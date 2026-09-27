import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const SUPPORTED_LOCALES = ['en', 'it', 'pt-BR']

export default async function HomePage() {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value
  const locale = SUPPORTED_LOCALES.includes(cookieLocale ?? '') ? cookieLocale : 'en'
  redirect(`/${locale}`)
}
