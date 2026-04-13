import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="new-ui-root relative overflow-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(139,92,246,0.18),transparent_20%),radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.16),transparent_18%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#020617]/80 to-transparent blur-3xl" />

      <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#020617]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 text-white">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-semibold text-white shadow-lg shadow-violet-500/20">
              MG
            </span>
            <span className="text-lg font-semibold tracking-tight">AI Media Guardian</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <Link to="/dashboard" className="transition hover:text-white">Dashboard</Link>
            <Link to="/upload" className="transition hover:text-white">Upload</Link>
            <Link to="/scan" className="transition hover:text-white">Scan</Link>
            <Link to="/history" className="transition hover:text-white">History</Link>
          </div>

          <Link
            to="/scan"
            className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            Start scan
          </Link>
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-16 sm:py-24">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              AI powered media protection
            </div>
            <h1 className="text-5xl font-black leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Protect your brand with <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">AI image usage defense</span>
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Detect unauthorized image usage, uncover deepfake abuse, and protect intellectual property across the open web with a fast, trusted AI workflow.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/upload"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition hover:shadow-white/20"
              >
                Upload media
              </Link>
              <Link
                to="/scan"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
              >
                Start scan
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
                <p className="text-3xl font-semibold text-white">24/7</p>
                <p className="mt-2 text-sm text-slate-400">Continuous monitoring</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
                <p className="text-3xl font-semibold text-white">98%</p>
                <p className="mt-2 text-sm text-slate-400">Accurate match detection</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20">
                <p className="text-3xl font-semibold text-white">Fast</p>
                <p className="mt-2 text-sm text-slate-400">Instant AI results</p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(139,92,246,0.25),transparent_20%)]" />
            <div className="relative flex min-h-[420px] flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-cyan-300/80">Media guard</p>
                    <h2 className="text-2xl font-semibold text-white">Secure every asset</h2>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-200">Live</span>
                </div>

                <div className="space-y-3">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-slate-300">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Scan progress</p>
                    <p className="mt-2 text-3xl font-semibold text-white">72%</p>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-4 text-slate-300">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Matches found</p>
                    <p className="mt-2 text-3xl font-semibold text-white">14</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 text-slate-300">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Insight</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Verified</p>
                    <p className="mt-3 text-xl font-semibold text-white">CryptoArt</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Threat score</p>
                    <p className="mt-3 text-xl font-semibold text-white">8.9</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">How it works</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Monitor images at scale</h2>
            <p className="mt-4 text-slate-300">Upload assets, run scans, and get fast visual matches across social channels, websites, and marketplaces.</p>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-violet-300">AI Intelligence</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Deepfake and abuse detection</h2>
            <p className="mt-4 text-slate-300">Leverage modern AI to detect manipulated content, unauthorized use, and copyright infringement in one place.</p>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.25em] text-sky-300">Why it matters</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Protect trust and reputation</h2>
            <p className="mt-4 text-slate-300">Keep your brand safe from unauthorized image reuse and reduce legal exposure with transparent media tracking.</p>
          </article>
        </section>

        <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/25 backdrop-blur-xl">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Get started</p>
              <h2 className="mt-4 text-3xl font-bold text-white">Launch your first media scan in seconds</h2>
              <p className="mt-4 max-w-2xl text-slate-300">The new UI brings a polished, modern landing experience while keeping all core product routes intact.</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/scan"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:-translate-y-0.5"
                >
                  Start scanning
                </Link>
                <Link
                  to="/upload"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  Upload sample
                </Link>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { value: "12k+", label: "Protected assets" },
                { value: "5.8x", label: "Faster detection" },
                { value: "99.7%", label: "AI confidence" },
                { value: "4.9/5", label: "Customer rating" },
              ].map((item) => (
                <div key={item.label} className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 text-slate-300">
                  <p className="text-3xl font-semibold text-white">{item.value}</p>
                  <p className="mt-3 text-sm uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
