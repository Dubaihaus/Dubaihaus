'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-white via-[#f0f4ff] to-[#dce9ff] overflow-hidden" aria-live="polite" aria-busy="true">
      {/* Decorative animated background rings */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <div className="relative w-80 h-80">
          <div className="absolute inset-0 rounded-full border-[3px] border-blue-400 animate-pulse blur-sm"></div>
          <div className="absolute inset-4 rounded-full border-[3px] border-blue-500/60 animate-[spin_8s_linear_infinite]"></div>
          <div className="absolute inset-8 rounded-full border-[3px] border-blue-700/40 animate-[spin_10s_linear_infinite_reverse]"></div>
        </div>
      </div>

      {/* Logo or brand name */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-wide text-[#1f7ccf] drop-shadow-sm">
          Dubai <span className="text-gray-800">Haus</span>
        </h1>

        {/* Animated tagline */}
        <p className="mt-2 text-sm md:text-base text-gray-600 tracking-widest animate-pulse">
          Loading…
        </p>

        {/* Floating spinner orb */}
        <div className="relative mt-10">
          <div className="h-16 w-16 rounded-full border-[3px] border-t-transparent border-[#1f7ccf] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 rounded-full bg-[#1f7ccf] animate-ping"></div>
          </div>
        </div>
      </div>

      {/* Animated bottom line shimmer */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#1f7ccf] to-transparent animate-[shimmer_2.5s_linear_infinite]" />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
