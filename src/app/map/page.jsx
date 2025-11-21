// src/app/map/page.jsx
import MapSection from "@/components/map/MapSection";

export const metadata = {
  title: "Dubai & Abu Dhabi Property Map | DubaiHaus",
  description:
    "Explore off-plan and ready properties across Dubai and Abu Dhabi on an interactive map. Filter by location and discover projects visually.",
  openGraph: {
    title: "Dubai & Abu Dhabi Property Map | DubaiHaus",
    description:
      "Browse properties on a visual map across Dubai and Abu Dhabi with DubaiHaus.",
    type: "website",
  },
};

export default function MapPage() {
  return (
    <main
      className="
        min-h-screen
        bg-[radial-gradient(circle_at_top,_var(--color-brand-sky)_0,_#F5F7FB_55%,_white_100%)]
      "
    >
      {/* Hero / intro */}
      <section className="relative w-full py-16 md:py-20 px-4 border-b border-sky-100/60">
        {/* soft blobs like contact page */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full bg-[var(--color-brand-sky)] blur-3xl opacity-30" />
        <div className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-[var(--color-brand-dark)] blur-3xl opacity-20" />

        <div className="relative z-10 mx-auto max-w-6xl flex flex-col gap-10 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
              Interactive map
            </p>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                See Dubai &amp; Abu Dhabi{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-sky)] to-[var(--color-brand-dark)]">
                  property hotspots
                </span>{" "}
                on the map
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
                Use the map to explore where new communities, waterfront projects
                and investment areas are located. Zoom in to discover individual
                projects and open full details for each property.
              </p>
            </div>

            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
                <span>Visual overview of projects across Dubai &amp; Abu Dhabi</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
                <span>
                  Click any marker to see a quick preview and jump to full project
                  details
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--color-brand-sky)]" />
                <span>
                  Ideal for understanding which areas are most active for new
                  launches
                </span>
              </li>
            </ul>
          </div>

          {/* Small info card on the right */}
          <aside className="flex-1 lg:max-w-sm mt-6 lg:mt-0">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.16)] backdrop-blur">
              <h2 className="text-sm font-semibold text-slate-900 mb-2">
                How to use the map
              </h2>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5">
                <li>Zoom in on areas you&apos;re interested in.</li>
                <li>Tap on any marker to see the project preview.</li>
                <li>Click &quot;View details&quot; to open full information.</li>
              </ol>

              <div className="mt-4 grid grid-cols-2 gap-3 text-center text-[11px] text-slate-600 border-t border-slate-200 pt-4">
                <div>
                  <p className="text-lg font-bold text-slate-900">Dubai</p>
                  <p>Downtown, Marina, Palm, JVC, Business Bay &amp; more</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">Abu Dhabi</p>
                  <p>Saadiyat, Yas, Al Reem &amp; emerging islands</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Map section */}
      <div className="py-10 md:py-14 px-4">
        <MapSection
          title="Interactive project map"
          className="mt-2"
          maxWidthClass="max-w-6xl"
          height={520}
        />
      </div>
    </main>
  );
}
