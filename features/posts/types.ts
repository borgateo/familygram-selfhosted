export type PostData = {
  id: string
  type: 'photo' | 'video'
  mediaUrl: string
  thumbUrl: string
  caption: string | null
  filter: string | null
  likesCount: number
  commentsCount: number
  liked: boolean
  createdAt: string
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
    familyRole: string | null
  }
}

export type FeedPage = {
  posts: PostData[]
  nextCursor: string | null
}
