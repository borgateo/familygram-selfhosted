// app/[locale]/(app)/post/new/page.tsx
import { getTranslations } from 'next-intl/server'
import { MediaUpload } from '@/components/post/MediaUpload'

export default async function NewPostPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('post')

  return (
    <div>
      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">{t('new')}</h1>
      </div>
      <MediaUpload locale={locale} />
    </div>
  )
}
