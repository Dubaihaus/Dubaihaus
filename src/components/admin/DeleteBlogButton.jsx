"use client";

import { deleteBlog } from "@/app/(admin)/admin/blog/actions"; // adjust if your path is (admin)/admin/blog/actions
import { Trash } from "lucide-react";
import { useTransition } from "react";

export default function DeleteBlogButton({ id }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Delete this post?")) return;

    startTransition(async () => {
      await deleteBlog(id);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      <Trash className="h-4 w-4 inline" />
    </button>
  );
}
