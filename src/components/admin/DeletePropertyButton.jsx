"use client";

import { deleteProperty } from "@/app/(admin)/admin/properties/actions";
import { Trash } from "lucide-react";
import { useTransition } from "react";

export default function DeletePropertyButton({ id }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    startTransition(async () => {
      await deleteProperty(id);
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      <Trash className="h-4 w-4" />
    </button>
  );
}
