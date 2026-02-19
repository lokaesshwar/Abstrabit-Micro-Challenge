"use client"

import { supabase } from "@/lib/supabaseClient"
import { Bookmark } from "@/types/bookmark"

export default function BookmarkItem({ bookmark }: { bookmark: Bookmark }) {
  const deleteBookmark = async () => {
    await supabase.from("bookmarks").delete().eq("id", bookmark.id)
  }

  return (
    <div className="flex justify-between border p-3 mb-2">
      <a href={bookmark.url} target="_blank">
        {bookmark.title}
      </a>
      <button onClick={deleteBookmark}>❌</button>
    </div>
  )
}
