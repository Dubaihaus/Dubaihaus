"use client";

import { deleteCategory } from "@/app/(admin)/admin/blog/categories/actions";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteCategoryButton({ categoryId, postCount }) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (postCount > 0) {
            alert(`Cannot delete: ${postCount} post(s) are using this category.`);
            return;
        }

        if (!confirm("Are you sure you want to delete this category?")) {
            return;
        }

        setDeleting(true);
        try {
            await deleteCategory(categoryId);
            router.refresh();
        } catch (err) {
            alert(err.message);
            setDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-800 disabled:opacity-50"
            title={postCount > 0 ? `Used by ${postCount} post(s)` : "Delete category"}
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
