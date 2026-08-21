import Link from "next/link"
import Navbar from "./components/Navbar"
import DomainsFlowingMenu from "./components/DomainsFlowingMenu"
import ScrollReveal from "./components/ScrollReveal"

/* ═══ DATA ═══ */
const LIVE_FEED = [
  { label: "🔥 Just Now", msg: "Aryan shipped a GSoC proposal in 48 hours", sub: "Open Source / IIT Bombay" },
  { label: "⚡ Breaking", msg: "Mehak merged her first PR to Kubernetes", sub: "Open Source / NIT Trichy" },
  { label: "🚀 Now Live", msg: "3 teams formed for ETH India Hackathon", sub: "Web Dev / Cross-Campus" },
  { label: "🏆 New Record", msg: "Rohit hit Specialist on Codeforces in 3 weeks", sub: "CP / DTU Delhi" },
  { label: "📡 Milestone", msg: "We crossed 2,000 members at 3 AM on a Tuesday", sub: "Community / All Domains" },
  { label: "🛡️ CTF Win", msg: "Team REvamp placed #4 at PicoCTF '25", sub: "Cyber Security / Squad" },
  { label: "🤖 Shipped", msg: "An AI agent that auto-grades assignments went live", sub: "AI/ML / Weekend Build" },
  { label: "🎯 Launch", msg: "5 freshers deployed their first full-stack app", sub: "College Starter / Cohort 3" },
]

const TESTIMONIALS = [
  { q: "I built more in my first 2 weeks at REvamp than in 2 years of college lectures combined. It's not even close.", name: "Siddharth K.", role: "SDE Intern @ Google" },
  { q: "600 people. One Discord room. 3 AM. Everyone coding. If you've never felt that energy, you won't understand.", name: "Ananya P.", role: "GSoC '25 Contributor" },
  { q: "I stopped chasing certificates and started shipping. REvamp didn't teach me to code. It taught me to build.", name: "Rohan J.", role: "Founding Engineer, Stealth" },
]


const STATS = [
  { num: "2,000+", label: "Students" },
  { num: "619", label: "In One Room" },
  { num: "6", label: "Domains" },
  { num: "4+", label: "Events Shipped" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-body">
      <Navbar />

      {/* ═══════════════════════════════════════ */}
      {/* HERO                                   */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 brutalist-grid opacity-60" />

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Headline */}
          <div className="lg:col-span-7">
            <p className="font-label text-xs tracking-[0.3em] text-[#0085FF] uppercase mb-6 animate-fade-in-up">Your campus won&apos;t teach you this.</p>

            <h1 className="font-headline font-bold text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-tight mb-8">
              Stop watching<br />
              <span className="text-[#0085FF]">tutorials.</span><br />
              Start shipping<br />
              with <span className="relative inline-block">2,000+<span className="absolute -bottom-2 left-0 w-full h-1 bg-[#FFD700]" /></span> others.
            </h1>

            <p className="text-lg md:text-xl text-white/40 max-w-lg leading-relaxed mb-12">
              India&apos;s most intense student-run tech collective. 6 domains. Open source to cyber security. We don&apos;t hand-hold — we throw you in the ring.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/domains" className="bg-[#0085FF] text-white px-8 py-4 font-headline font-extrabold text-sm tracking-wide shadow-neumorph hover:shadow-neumorph-inset transition-all rounded-2xl">
                Pick Your Domain →
              </Link>
              <Link href="/about" className="text-white px-8 py-4 font-headline font-extrabold text-sm tracking-wide neumorph-panel hover:shadow-neumorph-inset transition-all">
                How It Works
              </Link>
            </div>
          </div>

          {/* Right: Live Feed */}
          <div className="lg:col-span-5 relative h-[480px] overflow-hidden neumorph-panel">
            <div className="absolute top-0 left-0 right-0 z-20 bg-[var(--neumorph-bg)] px-5 py-3 shadow-md flex items-center gap-2">
              <span className="w-2 h-2 bg-[#0085FF] animate-pulse" />
              <span className="font-label text-[10px] tracking-[0.2em] text-white/40 uppercase">Happening Right Now</span>
            </div>
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />
            <div className="pt-12 px-5 space-y-4 animate-scroll-up">
              {[...LIVE_FEED, ...LIVE_FEED].map((item, i) => (
                <div key={i} className="p-4 neumorph-inset transition-all">
                  <p className="text-[11px] font-label tracking-wide text-[#0085FF] mb-1">{item.label}</p>
                  <p className="font-headline font-bold text-sm text-white/90">{item.msg}</p>
                  <p className="text-[10px] text-white/25 mt-1 font-label tracking-wider">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* STATS BAR                              */}
      {/* ═══════════════════════════════════════ */}
      <section className="py-8 bg-black">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className={`py-10 px-8 text-center ${i > 0 ? "border-l border-white/10" : ""}`}>
              <div className="font-headline font-extrabold text-3xl md:text-4xl text-[#0085FF] mb-1 drop-shadow-lg">{s.num}</div>
              <div className="font-label text-[10px] tracking-[0.2em] text-white/40 uppercase">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* SCROLL REVEAL — WHY REVAMP            */}
      {/* ═══════════════════════════════════════ */}
      <section className="py-36 px-8 border-b border-white/10 bg-black">
        <div className="max-w-[1000px] mx-auto">
          <p className="font-label text-xs tracking-[0.3em] text-[#0085FF] uppercase mb-14">Why REvamp</p>

          <ScrollReveal
            scrollContainerRef={undefined}
            baseOpacity={0.04}
            enableBlur={true}
            baseRotation={4}
            blurStrength={10}
            textClassName="font-headline text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.15] tracking-tight text-white"
            wordAnimationEnd="bottom center"
          >
            You know how to code. You&apos;ve watched the tutorials. Done the grind. But ask yourself — when did you last ship something real? Something with users, with commits, with a link you&apos;d actually show someone? If that question makes you uncomfortable, you&apos;re in the right place. Over 2,000 students stopped learning in isolation and started building in public, together. 619 showed up to one call at 3 AM. Not because they had to. Because this is what obsession feels like when you find the right room.
          </ScrollReveal>

          <div className="mt-14">
            <Link href="/about" className="inline-flex items-center gap-2 font-headline font-bold text-[#0085FF] text-sm hover:underline">
              Read our story <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* DOMAINS                                */}
      {/* ═══════════════════════════════════════ */}
      <section className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-8 pt-32 pb-12 flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <div className="w-10 h-1 bg-[#0085FF] mb-6" />
            <h2 className="font-headline font-extrabold text-4xl md:text-6xl tracking-tight mb-4">6 domains. 0 hand-holding.</h2>
            <p className="text-white/40 text-lg max-w-lg">Pick the one that scares you slightly. That&apos;s usually the right one.</p>
          </div>
          <Link href="/domains" className="mt-6 md:mt-0 inline-flex items-center gap-2 font-headline font-bold text-[#0085FF] text-sm hover:underline shrink-0">
            Explore all domains <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="h-[540px]">
          <DomainsFlowingMenu />
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* UPCOMING EVENTS — Quick preview        */}
      {/* ═══════════════════════════════════════ */}
      <section className="py-32 px-8 border-b border-white/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <div className="w-10 h-1 bg-[#FFD700] mb-6" />
              <h2 className="font-headline font-extrabold text-4xl md:text-6xl tracking-tight mb-4">Upcoming Events</h2>
              <p className="text-white/40 text-lg max-w-lg">Live sessions, workshops, and bootcamps. Free to start.</p>
            </div>
            <Link href="/events" className="mt-6 md:mt-0 inline-flex items-center gap-2 font-headline font-bold text-[#0085FF] text-sm hover:underline">
              View all events <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { slug: "opensource", title: "Open Source 101", date: "24 JUNE", count: "428+", accent: "#0085FF" },
              { slug: "launchpad", title: "College Starter Pack", date: "27 JUNE", count: "345+", accent: "#FFD700" },
              { slug: "webdev", title: "Full-Stack in 7 Days", date: "28 JUNE", count: "312+", accent: "#8FDAFF" },
            ].map((e, i) => (
              <Link key={i} href={`/cohort/${e.slug}`} className="group block p-8 neumorph-panel hover:scale-[1.02] transition-transform">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-label text-xs tracking-wider text-white/30">{e.date}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500" />
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Open</span>
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl mb-3 group-hover:text-[#0085FF] transition-colors">{e.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-white/30">group</span>
                  <span className="text-sm text-white/40">{e.count} registered</span>
                </div>
                <p className="mt-4 font-label text-xs tracking-widest uppercase" style={{ color: e.accent }}>View Details →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* TESTIMONIALS                           */}
      {/* ═══════════════════════════════════════ */}
      <section className="py-20 border-b border-white/10 overflow-hidden">
        <div className="flex animate-marquee gap-6">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div key={i} className="min-w-[400px] max-w-[400px] p-8 neumorph-panel flex-shrink-0">
              <p className="text-lg text-white/70 leading-relaxed mb-6">&ldquo;{t.q}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[#0085FF]" />
                <div>
                  <p className="font-headline font-bold text-sm">{t.name}</p>
                  <p className="font-label text-xs text-white/30">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* FINAL CTA                              */}
      {/* ═══════════════════════════════════════ */}
      <section className="relative py-40 px-8 bg-black overflow-hidden border-t border-white/10">
        <div className="absolute inset-0 brutalist-grid opacity-20" />
        <div className="relative z-10 max-w-[900px] mx-auto text-center">
          <h2 className="font-headline font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[0.95] mb-8">
            Your resume is empty. Your GitHub is greener. <span className="bg-[#0085FF] text-white px-2">Which one matters?</span>
          </h2>
          <p className="text-white/80 text-lg mb-12 max-w-md mx-auto">Next batch starts soon. We don&apos;t do waitlists. You&apos;re either in or you&apos;re catching up.</p>
          <Link href="/events" className="inline-block bg-[#0085FF] text-white px-12 py-5 font-headline font-extrabold text-lg tracking-wide neumorph-panel hover:shadow-neumorph-inset transition-all">
            I&apos;m In →
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* FOOTER                                 */}
      {/* ═══════════════════════════════════════ */}
      <footer className="border-t border-white/10 bg-black">
        <div className="max-w-[1400px] mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <img
              src="https://ik.imagekit.io/cotszrkgk/Screenshot_2025-06-25_at_9.10.56_PM-removebg-preview.png?updatedAt=1756648034230"
              alt="REvamp"
              className="h-20 w-auto mb-6"
            />
            <p className="text-sm text-white/30 leading-relaxed max-w-sm mb-12">
              Not a course. Not a club. A pressure cooker full of builders who refuse to wait until placement season to start caring.
            </p>
            <p className="text-xs text-white/20 tracking-wider uppercase">© 2026 REVAMP. All rights reserved.</p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="font-label text-xs tracking-[0.15em] text-[#0085FF] uppercase mb-4">Navigate</p>
              <Link className="block text-sm text-white/40 hover:text-white transition-colors" href="/about">About</Link>
              <Link className="block text-sm text-white/40 hover:text-white transition-colors" href="/domains">Domains</Link>
              <Link className="block text-sm text-white/40 hover:text-white transition-colors" href="/events">Events</Link>
              <Link className="block text-sm text-white/40 hover:text-white transition-colors" href="/community">Community</Link>
            </div>
            <div className="space-y-3">
              <p className="font-label text-xs tracking-[0.15em] text-[#0085FF] uppercase mb-4">Connect</p>
              <a className="block text-sm text-white/40 hover:text-white transition-colors" href="https://discord.gg/68J8FHAMfh" target="_blank" rel="noopener noreferrer">Discord</a>
              <a className="block text-sm text-white/40 hover:text-white transition-colors" href="https://instagram.com/letsrevamp.here" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a className="block text-sm text-white/40 hover:text-white transition-colors" href="https://chat.whatsapp.com/revamp" target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a className="block text-sm text-white/40 hover:text-white transition-colors" href="https://www.linkedin.com/company/letsrevamp" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
            <div className="space-y-3">
              <p className="font-label text-xs tracking-[0.15em] text-[#0085FF] uppercase mb-4">Legal</p>
              <a className="block text-sm text-white/40 hover:text-white transition-colors" href="#">Terms</a>
              <a className="block text-sm text-white/40 hover:text-white transition-colors" href="#">Privacy</a>
              <a className="block text-sm text-white/40 hover:text-white transition-colors" href="mailto:letsrevamp.here@gmail.com">Email</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ FLOATING DOCK ═══ */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 neumorph-panel rounded-full px-5 py-2.5">
        <a className="text-white/60 p-2 hover:text-indigo-400 hover:scale-110 transition-all" href="https://discord.gg/68J8FHAMfh" target="_blank" rel="noopener noreferrer" title="Discord">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
        </a>
        <a className="bg-[#0085FF] text-white rounded-full p-2 hover:scale-110 transition-all" href="https://chat.whatsapp.com/revamp" target="_blank" rel="noopener noreferrer" title="WhatsApp">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        </a>
        <a className="text-white/60 p-2 hover:text-pink-400 hover:scale-110 transition-all" href="https://instagram.com/letsrevamp.here" target="_blank" rel="noopener noreferrer" title="Instagram">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
      </div>
    </div>
  )
}
