'use client'
import { useState } from 'react'
import { Lightbox } from '@/components/feed/Lightbox'

interface ProfileGridPost {
  id: string
  thumbUrl: string
  mediaUrl: string
  type: 'photo' | 'video'
  filter: string | null
}

export function ProfileGrid({
  posts,
  noPosts,
}: {
  posts: ProfileGridPost[]
  noPosts: string
}) {
  const [selected, setSelected] = useState<ProfileGridPost | null>(null)

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-3 text-center text-gray-500 dark:text-gray-400 text-sm">
        {noPosts}
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-3 mb-3">
        <div className="grid grid-cols-3 gap-1">
          {posts.map(post => (
            <button
              key={post.id}
              className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden"
              onClick={() => setSelected(post)}
            >
              <img
                src={post.thumbUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <Lightbox
          src={selected.mediaUrl}
          type={selected.type}
          filter={selected.filter}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
