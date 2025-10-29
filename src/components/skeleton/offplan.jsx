export default function OffPlanGridSkeleton({ cards = 8 }) {
  return (
    <section className="px-4 md:px-16 py-10">
      <div className="skeleton skel-title w-64 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/60 overflow-hidden bg-white/80">
            <div className="skeleton skel-img" />
            <div className="p-4 space-y-2">
              <div className="skeleton skel-line w-3/4" />
              <div className="skeleton skel-line w-1/2" />
              <div className="skeleton skel-line w-2/3" />
              <div className="skeleton skel-btn w-full mt-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
