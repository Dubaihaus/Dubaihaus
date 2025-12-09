"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function SyncButton({ lastSynced }) {
    const [loading, setLoading] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState(lastSynced);

    const handleSync = async () => {
        if (!confirm("This will fetch all projects from Reelly API. Continue?")) return;

        setLoading(true);
        try {
            const res = await fetch("/api/admin/reelly-sync", { method: "POST" });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Sync failed");

            alert(`Sync successful! Updated/Created: ${data.count} projects.`);
            setLastSyncTime(new Date(data.lastSyncedAt));
        } catch (err) {
            alert("Error syncing: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-right">
            <div className="mb-2 text-xs text-gray-500">
                Last synced: {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : "Never"}
            </div>
            <button
                onClick={handleSync}
                disabled={loading}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                {loading ? "Syncing..." : "Sync Projects Now"}
            </button>
        </div>
    );
}
