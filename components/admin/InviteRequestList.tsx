'use client'
import { useTranslations } from 'next-intl'

export interface InviteRequest {
  id: string
  name: string
  email: string
  message: string | null
  status: string
  created_at: string
}

export function InviteRequestList({
  requests,
}: {
  requests: InviteRequest[]
}) {
  const t = useTranslations('admin')

  if (requests.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-8">
        {t('noInviteRequests')}
      </p>
    )
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function statusLabel(status: string) {
    if (status === 'approved') return t('statusApproved')
    if (status === 'rejected') return t('statusRejected')
    return t('statusPending')
  }

  function statusColor(status: string) {
    if (status === 'approved') return 'text-green-600 dark:text-green-400'
    if (status === 'rejected') return 'text-red-500'
    return 'text-yellow-600 dark:text-yellow-400'
  }

  return (
    <div className="space-y-3 mt-4">
      {requests.map(req => (
        <div
          key={req.id}
          className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm space-y-1"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{req.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{req.email}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-medium ${statusColor(req.status)}`}>
                {statusLabel(req.status)}
              </p>
              <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
            </div>
          </div>
          {req.message && (
            <p className="text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
              {req.message}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
