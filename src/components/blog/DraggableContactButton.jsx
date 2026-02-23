"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function DraggableContactButton({ href = "/contact" }) {
  const router = useRouter();
  const btnRef = useRef(null);

  const pointerIdRef = useRef(null);
  const startRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const draggingRef = useRef(false);
  const movedRef = useRef(false);

  const [pos, setPos] = useState({ x: 0, y: 0 });

  // Clamp inside viewport
  const clamp = (x, y) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const rect = btnRef.current?.getBoundingClientRect();
    const bw = rect?.width ?? 56;
    const bh = rect?.height ?? 56;

    const nx = Math.max(8, Math.min(x, w - bw - 8));
    const ny = Math.max(8, Math.min(y, h - bh - 8));
    return { x: nx, y: ny };
  };

  // Default bottom-right on first mount
  useEffect(() => {
  const setDefault = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    const bw = rect?.width ?? 56;
    const bh = rect?.height ?? 56;

    const RIGHT_MARGIN = 16;       // same as right-4
    const BOTTOM_MARGIN = 16;      // same as bottom-4
    const GAP_ABOVE_WHATSAPP = 80; // space above WhatsApp button

    const x = window.innerWidth - bw - RIGHT_MARGIN;
    const y = window.innerHeight - bh - BOTTOM_MARGIN - GAP_ABOVE_WHATSAPP;

    setPos(clamp(x, y));
  };

  setTimeout(setDefault, 0);

  const onResize = () => setPos((p) => clamp(p.x, p.y));
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);
  const onPointerDown = (e) => {
    // Capture pointer so we keep receiving move events
    pointerIdRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);

    draggingRef.current = true;
    movedRef.current = false;

    startRef.current = { x: e.clientX, y: e.clientY };

    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    } else {
      offsetRef.current = { x: 0, y: 0 };
    }
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    // Only treat as drag after small threshold
    const DRAG_THRESHOLD = 6;
    if (!movedRef.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    movedRef.current = true;

    const next = clamp(e.clientX - offsetRef.current.x, e.clientY - offsetRef.current.y);
    setPos(next);
  };

  const onPointerUp = (e) => {
    if (pointerIdRef.current != null) {
      try {
        e.currentTarget.releasePointerCapture(pointerIdRef.current);
      } catch {}
    }

    draggingRef.current = false;
    pointerIdRef.current = null;
    // Do NOT navigate here. Navigation happens onClick if NOT dragged.
  };

  const onClick = (e) => {
    // If user dragged, prevent navigation
    if (movedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    router.push(href);
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
      style={{ left: pos.x, top: pos.y }}
      className="
        fixed z-[60]
        h-14 w-14 rounded-full
        shadow-lg border border-white/40
        flex items-center justify-center
        active:scale-95 transition
        select-none touch-none
      "
      aria-label="Contact"
      title="Contact"
    >
      <span
        className="h-full w-full rounded-full flex items-center justify-center"
        style={{
          background: "var(--color-brand-sky)",
          color: "white",
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </span>
    </button>
  );
}