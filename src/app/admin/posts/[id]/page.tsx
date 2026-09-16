"use client";

import { useParams } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";

export default function AdminEditPostPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  if (!Number.isFinite(id)) {
    return (
      <div className="rounded-2xl border border-[#f0e4d3] bg-white p-6 text-sm font-semibold text-red-pop">
        Invalid post id.
      </div>
    );
  }
  return <PostEditor postId={id} />;
}
