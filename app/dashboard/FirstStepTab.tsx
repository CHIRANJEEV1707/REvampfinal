"use client"

import { useEffect, useState, useCallback } from "react"
import CountdownTimer from "@/components/CountdownTimer"
import {
  FIRST_STEP_START_ISO,
  FIRST_STEP_END_ISO,
  FIRST_STEP_META,
  FIRST_STEP_ABOUT,
  FIRST_STEP_PDF_URL,
  GUIDE_STEPS,
  OS_LABELS,
  IDE_PICKS,
  IDE_RUNNERS_UP,
  IDE_COMBOS,
  PREFLIGHT,
  CHEAT_SHEET,
  type OS,
} from "@/lib/first-step"

const ACCENT = "#0085FF"

/** Detects the visitor's OS so the guide opens on the right column. */
function detectOS(): OS {
  if (typeof navigator === "undefined") return "macos"
  const ua = navigator.userAgent.toLowerCase()
  if (ua.includes("win")) return "windows"
  if (ua.includes("linux") || ua.includes("android")) return "linux"
  return "macos"
}

function CommandBlock({ commands }: { commands: string[] }) {
  const [copied, setCopied] = useState(false)

  // Comment lines are context, not commands — don't copy them.
  const copyable = commands.filter((c) => !c.trim().startsWith("#")).join("\n")

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(copyable).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      },
      () => {/* clipboard blocked — nothing useful to show */}
    )
  }, [copyable])

  return (
    <div className="relative group/cmd border border-white/[0.06] bg-black">
      <button
        onClick={handleCopy}
        aria-label="Copy commands"
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 border border-white/[0.08] bg-[#0d0d0d] text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:border-white/20 transition-colors"
      >
        <span className="material-symbols-outlined text-[12px]">
          {copied ? "check" : "content_copy"}
        </span>
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto p-4 pr-20 text-[12px] leading-relaxed font-mono">
        {commands.map((c, i) => (
          <div key={i} className={c.trim().startsWith("#") ? "text-white/25" : "text-white/80"}>
            {c}
          </div>
        ))}
      </pre>
    </div>
  )
}

export default function FirstStepTab({ userName }: { userName: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [os, setOs] = useState<OS>("macos")
  const [openStep, setOpenStep] = useState<string | null>(GUIDE_STEPS[0]?.id ?? null)

  useEffect(() => { setOs(detectOS()) }, [])

  useEffect(() => {
    fetch("/api/user/first-step")
      .then((r) => r.json())
      .then((d) => { if (d.error) setError(d.error); else setData(d) })
      .catch(() => setError("Could not load your session details."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-16 px-8 text-white/20">
        <div className="w-5 h-5 border-2 border-[#0085FF] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading your session...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8">
        <div className="bg-[#0d0d0d] border border-dashed border-white/[0.06] p-16 text-center">
          <span className="material-symbols-outlined text-4xl text-white/10 block mb-3">bolt</span>
          <p className="text-white/30 text-sm mb-1">{error}</p>
          <p className="text-white/15 text-xs">Contact us if you believe this is an error.</p>
        </div>
      </div>
    )
  }

  const discordLink: string | null = data?.discordLink || null
  const firstName = userName?.split(" ")[0] || "there"

  return (
    <div className="animate-in fade-in duration-300 px-6 md:px-8 py-8 max-w-5xl mx-auto space-y-8">

      {/* ── HERO ── */}
      <div className="relative border border-white/[0.05] overflow-hidden bg-[#0d0d0d]">
        <div className="absolute inset-0 brutalist-grid opacity-20 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#0085FF]/[0.06] blur-3xl pointer-events-none" />
        <div className="relative px-6 py-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#0085FF] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            <span className="text-[9px] font-black text-[#0085FF] uppercase tracking-[0.2em]">
              {FIRST_STEP_META.name}
            </span>
          </div>
          <h2 className="font-headline font-black text-3xl leading-none mb-3">
            You&apos;re in, {firstName}<span className="text-[#0085FF]">.</span>
          </h2>
          <p className="text-white/40 text-sm max-w-xl leading-relaxed">{FIRST_STEP_ABOUT.intro}</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 pt-5 border-t border-white/[0.05]">
            {[
              { icon: "calendar_today", label: FIRST_STEP_META.startDateLabel },
              { icon: "schedule", label: FIRST_STEP_META.schedule },
              { icon: "videocam", label: FIRST_STEP_META.location },
            ].map((m) => (
              <div key={m.icon} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-white/25">{m.icon}</span>
                <span className="text-xs text-white/50">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── COUNTDOWN ── */}
      <CountdownTimer
        targetIso={FIRST_STEP_START_ISO}
        endIso={FIRST_STEP_END_ISO}
        label="Session starts in"
        subtitle={`${FIRST_STEP_META.startDateLabel} · ${FIRST_STEP_META.schedule}`}
        accent={ACCENT}
      />

      {/* ── COMMUNITY + DECK ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-white/[0.06] bg-[#0d0d0d] p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base text-[#5865F2]" style={{ fontVariationSettings: "'FILL' 1" }}>forum</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Community</span>
          </div>
          <p className="font-headline font-bold text-base mb-1">The REvamp Discord</p>
          <p className="text-white/30 text-xs leading-relaxed mb-4">
            Where we actually hang out and build. Get unstuck between sessions.
          </p>
          {discordLink ? (
            <a
              href={discordLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] text-white font-bold text-xs hover:opacity-90 transition-opacity"
            >
              Join the Discord
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/[0.08] text-white/25 text-xs">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Invite link coming shortly
            </div>
          )}
        </div>

        <div className="border border-white/[0.06] bg-[#0d0d0d] p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-base text-[#FFD700]" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Setup guide</span>
          </div>
          <p className="font-headline font-bold text-base mb-1">Set up like a developer</p>
          <p className="text-white/30 text-xs leading-relaxed mb-4">
            {FIRST_STEP_ABOUT.beforeYouShowUp}
          </p>
          {FIRST_STEP_PDF_URL ? (
            <a
              href={FIRST_STEP_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/15 text-white font-bold text-xs hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download the deck
            </a>
          ) : (
            <p className="text-white/20 text-[11px]">Full guide below — no download needed.</p>
          )}
        </div>
      </div>

      {/* ── SETUP GUIDE ── */}
      <div className="border border-white/[0.06] bg-[#0d0d0d]">
        <div className="px-6 py-5 border-b border-white/[0.05]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0085FF]">Before Sunday · ~15 min</span>
          <h3 className="font-headline font-black text-2xl mt-2">Set your laptop up like a developer.</h3>
          <p className="text-white/30 text-xs mt-1">
            Eight steps. Pick your OS, work down the list, copy the commands.
          </p>

          {/* OS selector */}
          <div className="inline-flex mt-5 border border-white/[0.08]">
            {(Object.keys(OS_LABELS) as OS[]).map((key) => (
              <button
                key={key}
                onClick={() => setOs(key)}
                className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-colors border-r last:border-r-0 border-white/[0.06] ${
                  os === key ? "bg-[#0085FF] text-white" : "text-white/25 hover:text-white/60 hover:bg-white/[0.03]"
                }`}
              >
                {OS_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {GUIDE_STEPS.map((step) => {
            const isOpen = openStep === step.id
            const variant = step.variants?.[os]
            const body = step.universal ?? variant

            return (
              <div key={step.id}>
                <button
                  onClick={() => setOpenStep(isOpen ? null : step.id)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-mono text-[11px] text-white/20 w-6 shrink-0">
                    {String(step.index).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">
                        {step.kicker}
                      </span>
                      {variant && (
                        <span className="text-[9px] px-1.5 py-0.5 border border-[#0085FF]/20 text-[#0085FF]/70 uppercase tracking-wider">
                          {variant.label}
                        </span>
                      )}
                    </div>
                    <p className="font-headline font-bold text-sm truncate">{step.title}</p>
                  </div>
                  <span
                    className={`material-symbols-outlined text-white/20 text-base transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    expand_more
                  </span>
                </button>

                {isOpen && body && (
                  <div className="px-6 pb-6 pl-16 space-y-3 animate-in fade-in duration-200">
                    <p className="text-white/40 text-xs leading-relaxed">{step.summary}</p>
                    <CommandBlock commands={body.commands} />
                    {body.note && (
                      <p className="text-white/25 text-[11px] leading-relaxed">{body.note}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── AI IDEs ── */}
      <div className="border border-white/[0.06] bg-[#0d0d0d]">
        <div className="px-6 py-5 border-b border-white/[0.05]">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0085FF]">Part two</span>
          <h3 className="font-headline font-black text-2xl mt-2">The AI that writes code with you.</h3>
          <p className="text-white/30 text-xs mt-1">Three editors do 90% of the job. Pick one — or use all three.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.05]">
          {IDE_PICKS.map((ide) => (
            <div key={ide.name} className="bg-[#0d0d0d] p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-black text-[#0085FF]">{ide.rank}</span>
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">{ide.kind}</span>
              </div>
              <p className="font-headline font-bold text-lg mb-2">{ide.name}</p>
              <p className="text-white/35 text-xs leading-relaxed mb-4">{ide.description}</p>
              <p className="text-[10px] text-white/25 font-mono">{ide.meta}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 border-t border-white/[0.05]">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-4">Pick a stack, don&apos;t overthink it</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {IDE_COMBOS.map((c) => (
              <div key={c.name} className="border border-white/[0.06] p-4">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#0085FF]">{c.kicker}</span>
                <p className="font-headline font-bold text-sm mt-1.5 mb-1">{c.name}</p>
                <p className="text-white/30 text-[11px] leading-relaxed mb-3">{c.description}</p>
                <p className="text-[11px] font-mono text-[#FFD700]">{c.price}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 border-t border-white/[0.05]">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-3">Also worth knowing</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {IDE_RUNNERS_UP.map((r) => (
              <div key={r.name}>
                <p className="font-bold text-xs mb-1">{r.name}</p>
                <p className="text-white/25 text-[11px] leading-relaxed mb-1">{r.note}</p>
                <p className="text-[10px] text-white/20 font-mono">{r.meta}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRE-FLIGHT ── */}
      <div className="border border-white/[0.06] bg-[#0d0d0d] p-6">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0085FF]">Pre-flight</span>
        <h3 className="font-headline font-black text-xl mt-2 mb-1">Ready for liftoff?</h3>
        <p className="text-white/30 text-xs mb-5">
          Run these before Sunday. If all eight print something sensible, you&apos;re set.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
          {PREFLIGHT.map((p) => (
            <div key={p.label} className="flex items-start gap-3 py-2 border-b border-white/[0.04]">
              <span className="material-symbols-outlined text-sm text-[#0085FF]/50 mt-0.5">check_box_outline_blank</span>
              <div className="min-w-0">
                <p className="text-xs text-white/70">{p.label}</p>
                <p className="text-[10px] text-white/25 font-mono truncate">{p.cmd}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WHAT YOU LEAVE WITH ── */}
      <div className="border border-white/[0.06] bg-[#0d0d0d] p-6">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#FFD700]">What you leave with</span>
        <div className="mt-4 space-y-2.5">
          {FIRST_STEP_ABOUT.outcomes.map((o, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="material-symbols-outlined text-sm text-[#FFD700]/60 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <p className="text-white/50 text-sm leading-relaxed">{o}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-white/[0.05]">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">About the ₹199</p>
          <p className="text-white/40 text-xs leading-relaxed">{FIRST_STEP_ABOUT.refundNote}</p>
        </div>
      </div>

      {/* ── CHEAT SHEET ── */}
      <div className="border border-white/[0.06] bg-[#0d0d0d] p-6">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Bookmark these</span>
        <h3 className="font-headline font-black text-xl mt-2 mb-5">When you get stuck.</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {CHEAT_SHEET.map((g) => (
            <div key={g.group}>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#0085FF] mb-2">{g.group}</p>
              <ul className="space-y-1.5">
                {g.links.map((l) => (
                  <li key={l} className="text-[11px] text-white/40 font-mono break-all">{l}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
