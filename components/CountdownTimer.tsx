"use client"

import { useEffect, useState } from "react"

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

type Phase = "upcoming" | "live" | "ended"

function getTimeLeft(target: number): TimeLeft {
    const diff = Math.max(0, target - Date.now())
    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
    }
}

function TimeBox({ value, label, accent }: { value: number; label: string; accent: string }) {
    return (
        <div className="flex flex-col items-center">
            <div
                className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-black border"
                style={{ borderColor: `${accent}25` }}
            >
                <span className="font-headline font-black text-2xl sm:text-3xl tracking-tight text-white tabular-nums">
                    {String(value).padStart(2, "0")}
                </span>
            </div>
            <span className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                {label}
            </span>
        </div>
    )
}

interface CountdownTimerProps {
    /** ISO timestamp the countdown runs down to. */
    targetIso: string
    /** Optional ISO end time — between target and end the timer shows a LIVE state. */
    endIso?: string
    /** Small kicker above the clock. */
    label?: string
    /** Human-readable date line under the clock. */
    subtitle?: string
    accent?: string
}

export default function CountdownTimer({
    targetIso,
    endIso,
    label = "Starts in",
    subtitle,
    accent = "#0085FF",
}: CountdownTimerProps) {
    const target = new Date(targetIso).getTime()
    const end = endIso ? new Date(endIso).getTime() : null

    // Computed after mount only — Date.now() during SSR would cause a hydration mismatch.
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)
    const [phase, setPhase] = useState<Phase>("upcoming")

    useEffect(() => {
        const tick = () => {
            const now = Date.now()
            if (end && now >= end) { setPhase("ended"); setTimeLeft(getTimeLeft(target)); return }
            if (now >= target) { setPhase(end ? "live" : "ended"); setTimeLeft(getTimeLeft(target)); return }
            setPhase("upcoming")
            setTimeLeft(getTimeLeft(target))
        }
        tick()
        const timer = setInterval(tick, 1000)
        return () => clearInterval(timer)
    }, [target, end])

    if (phase === "live") {
        return (
            <div className="border border-red-500/20 bg-red-500/[0.04] p-8 text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400">Live now</span>
                </div>
                <p className="font-headline font-black text-2xl">The session is running.</p>
                {subtitle && <p className="text-white/30 text-xs mt-2">{subtitle}</p>}
            </div>
        )
    }

    if (phase === "ended") {
        return (
            <div className="border border-white/[0.06] bg-[#0d0d0d] p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-white/15 block mb-2">event_available</span>
                <p className="font-headline font-bold text-lg text-white/40">This session has wrapped.</p>
                {subtitle && <p className="text-white/20 text-xs mt-1">{subtitle}</p>}
            </div>
        )
    }

    return (
        <div className="border border-white/[0.06] bg-[#0d0d0d] p-8 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: accent }}>
                {label}
            </span>

            <div className="flex items-start gap-3 sm:gap-4">
                {timeLeft ? (
                    <>
                        <TimeBox value={timeLeft.days} label="Days" accent={accent} />
                        <span className="font-headline font-black text-2xl text-white/15 leading-[3.6rem] sm:leading-[4.4rem]">:</span>
                        <TimeBox value={timeLeft.hours} label="Hours" accent={accent} />
                        <span className="font-headline font-black text-2xl text-white/15 leading-[3.6rem] sm:leading-[4.4rem]">:</span>
                        <TimeBox value={timeLeft.minutes} label="Mins" accent={accent} />
                        <span className="font-headline font-black text-2xl text-white/15 leading-[3.6rem] sm:leading-[4.4rem]">:</span>
                        <TimeBox value={timeLeft.seconds} label="Secs" accent={accent} />
                    </>
                ) : (
                    // Placeholder of identical size so the layout doesn't jump on mount
                    <div className="h-[88px] sm:h-[104px]" aria-hidden />
                )}
            </div>

            {subtitle && (
                <p className="mt-6 text-xs text-white/30 text-center">{subtitle}</p>
            )}
        </div>
    )
}
