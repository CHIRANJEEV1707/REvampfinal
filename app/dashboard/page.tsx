"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import FirstStepTab from "./FirstStepTab"
import { LAUNCHPAD_FLAGSHIP_SLUG, LAUNCHPAD_FIRST_STEP_SLUG } from "@/lib/launchpad"

type Tab = "home" | "learning" | "orders" | "referrals" | "domains" | "achievements" | "resources" | "connections" | "settings" | "launchpad" | "firstStep"

const BASE_TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "home",         label: "Home",         icon: "home" },
  { id: "learning",     label: "My Learning",  icon: "school" },
  { id: "connections",  label: "Connections",  icon: "people" },
  { id: "orders",       label: "Orders",       icon: "receipt_long" },
  { id: "referrals",    label: "Referrals",    icon: "group_add" },
  { id: "domains",      label: "Domains",      icon: "interests" },
  { id: "achievements", label: "Achievements", icon: "emoji_events" },
  { id: "resources",    label: "Resources",    icon: "library_books" },
  { id: "settings",     label: "Settings",     icon: "settings" },
]

const LAUNCHPAD_TAB: { id: Tab; label: string; icon: string } = { id: "launchpad", label: "Launchpad", icon: "rocket_launch" }
const FIRST_STEP_TAB: { id: Tab; label: string; icon: string } = { id: "firstStep", label: "First Step", icon: "bolt" }

const TAB_ALIASES: Record<string, Tab> = { overview: "home", workshops: "learning" }

// ── helpers ──────────────────────────────────────────
function Avatar({ name, size = "md", color = "#0085FF" }: { name: string; size?: "sm" | "md" | "lg"; color?: string }) {
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
  const sz = size === "sm" ? "w-7 h-7 text-[9px]" : size === "lg" ? "w-12 h-12 text-sm" : "w-9 h-9 text-[10px]"
  return (
    <div className={`${sz} flex items-center justify-center font-bold text-white shrink-0`} style={{ background: color }}>
      {initials}
    </div>
  )
}

function XPRing({ progress, level }: { progress: number; level: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const offset = circ - (progress / 100) * circ
  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="#0085FF" strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="butt" style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
        <span className="font-headline font-black text-xl leading-none">{level}</span>
        <span className="text-[8px] text-white/30 font-bold uppercase tracking-widest mt-0.5">LVL</span>
      </div>
    </div>
  )
}

// ── ticker ────────────────────────────────────────────
function AnnouncementTicker({ items }: { items: any[] }) {
  if (!items.length) return null
  const doubled = [...items, ...items]
  return (
    <div className="flex items-center h-9 border-b border-white/[0.04] bg-[#0085FF]/[0.04] overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-4 h-full border-r border-white/[0.04] bg-[#0085FF]/10">
        <span className="w-1.5 h-1.5 bg-[#0085FF] animate-pulse" />
        <span className="text-[10px] font-black text-[#0085FF] uppercase tracking-[0.15em]">Live</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          {doubled.map((a: any, i: number) => (
            <span key={i} className="inline-flex items-center gap-2 mx-8 text-[11px] text-white/40 font-medium">
              {a.badge && <span className="text-[9px] font-bold text-[#0085FF] uppercase">[{a.badge}]</span>}
              {a.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── status badge ─────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
    COMPLETED: "bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20",
    paid: "bg-green-500/10 text-green-400 border-green-500/20",
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
  }
  return (
    <span className={`text-[9px] font-black px-2 py-0.5 border uppercase tracking-wider ${map[status] || "bg-white/5 text-white/30 border-white/10"}`}>
      {status === "paid" ? "Confirmed" : status}
    </span>
  )
}

// ── homework submit panel ─────────────────────────────
function HomeworkSubmitPanel({ session, onSubmitted }: { session: any; onSubmitted: (result: any) => void }) {
  const [value, setValue] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const type = session.homeworkType as string // github_url | text | done

  const handleSubmit = async () => {
    if (type !== 'done' && !value.trim()) { setError("Please enter a value."); return }
    if (type === 'github_url' && !value.includes('github.com')) { setError("Must be a GitHub URL."); return }
    setSubmitting(true); setError("")
    const res = await fetch('/api/user/launchpad/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: session.id, type, content: type === 'done' ? null : value.trim() }),
    }).then(r => r.json())
    setSubmitting(false)
    if (res.error) { setError(res.error); return }
    onSubmitted(res)
  }

  if (type === 'done') {
    return (
      <button
        onClick={e => { e.stopPropagation(); handleSubmit() }}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-2.5 border border-green-500/30 text-green-400 text-[10px] font-black uppercase tracking-wider hover:bg-green-500/10 transition-colors disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-sm">check_circle</span>
        {submitting ? 'Marking...' : 'Mark Homework as Done'}
      </button>
    )
  }

  return (
    <div className="space-y-2" onClick={e => e.stopPropagation()}>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-[#060606] border border-white/[0.08] px-3 py-2 text-[11px] text-white placeholder:text-white/15 outline-none focus:border-white/20 transition-colors"
          placeholder={type === 'github_url' ? 'https://github.com/you/repo' : 'Your response...'}
          value={value}
          onChange={e => { setValue(e.target.value); setError("") }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-4 py-2 bg-[#0085FF] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#0070DD] transition-colors disabled:opacity-40 whitespace-nowrap"
        >
          {submitting ? '...' : 'Submit'}
        </button>
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  )
}

// ── main content ─────────────────────────────────────
function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawTab = searchParams.get("tab") || "home"
  const tabParam: Tab = (TAB_ALIASES[rawTab] || rawTab) as Tab

  const [data, setData] = useState<any>(null)
  const [allCohorts, setAllCohorts] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>(tabParam)
  const [copied, setCopied] = useState(false)
  const [followLoading, setFollowLoading] = useState<string | null>(null)
  const [resourceFilter, setResourceFilter] = useState<string>("ALL")

  const [expandedWorkshop, setExpandedWorkshop] = useState<string | null>(null)
  const [workshopPeers, setWorkshopPeers] = useState<Record<string, any[]>>({})
  const [workshopDiscussions, setWorkshopDiscussions] = useState<Record<string, any[]>>({})
  const [discussionInput, setDiscussionInput] = useState<Record<string, string>>({})
  const [postingDiscussion, setPostingDiscussion] = useState(false)
  const [connectingTo, setConnectingTo] = useState<string | null>(null)
  const [workshopSubTab, setWorkshopSubTab] = useState<"peers" | "discussion">("peers")
  const [connections, setConnections] = useState<any>({ accepted: [], pendingIncoming: [], pendingOutgoing: [] })
  const [connectionsLoading, setConnectionsLoading] = useState(false)
  const [connectionActionLoading, setConnectionActionLoading] = useState<string | null>(null)

  const [settingsForm, setSettingsForm] = useState<any>({})
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState("")
  const [skillInput, setSkillInput] = useState("")

  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawUpi, setWithdrawUpi] = useState("")
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false)
  const [withdrawMsg, setWithdrawMsg] = useState({ text: "", type: "" })

  // ── launchpad tab state ───────────────────────────────
  const [launchpadData, setLaunchpadData] = useState<any>(null)
  const [launchpadLoading, setLaunchpadLoading] = useState(false)
  const [launchpadWeek, setLaunchpadWeek] = useState(1)
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({})
  const [noteSaveTimer, setNoteSaveTimer] = useState<Record<string, any>>({})
  const [launchpadBadges, setLaunchpadBadges] = useState<any[]>([])
  const [trackDeclaring, setTrackDeclaring] = useState(false)

  const loadDashboardData = useCallback((silent = false) => {
    if (!silent) setLoading(true)
    return Promise.all([
      fetch("/api/user/dashboard").then(r => r.json()),
      fetch("/api/cohorts").then(r => r.json()).catch(() => []),
      fetch("/api/announcements").then(r => r.json()).catch(() => []),
      fetch("/api/leaderboard").then(r => r.json()).catch(() => []),
      fetch("/api/resources").then(r => r.json()).catch(() => []),
    ]).then(([dashData, cohortsData, annData, lbData, resData]) => {
      if (dashData.error) { router.push("/login"); return }
      setData(dashData)
      setAllCohorts(Array.isArray(cohortsData) ? cohortsData : [])
      setAnnouncements(Array.isArray(annData) ? annData : [])
      setLeaderboard(Array.isArray(lbData) ? lbData : [])
      setResources(Array.isArray(resData) ? resData : [])
      setSettingsForm({
        name: dashData.user.name || "",
        phone: dashData.user.phone || "",
        password: "",
        college: dashData.user.college || "",
        graduationYear: dashData.user.graduationYear || "",
        githubUrl: dashData.user.githubUrl || "",
        linkedinUrl: dashData.user.linkedinUrl || "",
        twitterUrl: dashData.user.twitterUrl || "",
        skills: Array.isArray(dashData.user.skills) ? dashData.user.skills : [],
      })
    }).catch(() => { if (!silent) router.push("/login") }).finally(() => { if (!silent) setLoading(false) })
  }, [router])

  useEffect(() => { loadDashboardData() }, [loadDashboardData])

  const fetchLaunchpadData = useCallback((silent = false) => {
    if (!silent) setLaunchpadLoading(true)
    return fetch("/api/user/launchpad")
      .then(r => r.json())
      .then(d => {
        if (!d.error) {
          setLaunchpadData(d)
          if (d.profile?.sessionNotes && typeof d.profile.sessionNotes === 'object') {
            setSessionNotes(d.profile.sessionNotes as Record<string, string>)
          }
          fetch('/api/user/launchpad/badges').then(r => r.json()).then(b => { if (Array.isArray(b)) setLaunchpadBadges(b) }).catch(() => {})
        }
      })
      .catch(() => {})
      .finally(() => { if (!silent) setLaunchpadLoading(false) })
  }, [])

  // Auto-refresh when user returns to this tab (e.g. after checkout in another tab)
  useEffect(() => {
    let lastVisible = Date.now()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() - lastVisible > 10_000) {
          loadDashboardData(true)
          // Also silently refresh launchpad data to pick up live session changes
          fetchLaunchpadData(true)
        }
      } else {
        lastVisible = Date.now()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [loadDashboardData, fetchLaunchpadData])

  useEffect(() => { setActiveTab(tabParam) }, [tabParam])

  const switchTab = useCallback((tab: Tab) => {
    setActiveTab(tab)
    router.push(`/dashboard?tab=${tab}`, { scroll: false })
  }, [router])

  const copyLink = () => {
    if (!data) return
    navigator.clipboard.writeText(`https://letsrevamp.in?ref=${data.user.referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    document.cookie = "user_token=; path=/; max-age=0"
    router.push("/")
  }

  const handleSubscribe = useCallback(async (cohortId: string) => {
    setFollowLoading(cohortId)
    // Optimistic add
    setData((prev: any) => prev ? {
      ...prev,
      subscriptions: [{ id: `tmp_${cohortId}`, cohort: { id: cohortId }, cohortId }, ...(prev.subscriptions || [])]
    } : prev)
    try {
      const res = await fetch("/api/user/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cohortId }) }).then(r => r.json())
      if (res.error) throw new Error(res.error)
    } catch (e) {
      // Revert on failure
      setData((prev: any) => prev ? {
        ...prev,
        subscriptions: (prev.subscriptions || []).filter((s: any) => s.id !== `tmp_${cohortId}`)
      } : prev)
      console.error('Subscribe failed:', e)
    } finally { setFollowLoading(null) }
  }, [])

  const handleUnsubscribe = useCallback(async (cohortId: string) => {
    setFollowLoading(cohortId)
    // Optimistic remove
    setData((prev: any) => prev ? {
      ...prev,
      subscriptions: (prev.subscriptions || []).filter((s: any) => s.cohortId !== cohortId && s.cohort?.id !== cohortId)
    } : prev)
    try {
      const res = await fetch("/api/user/subscriptions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cohortId }) }).then(r => r.json())
      if (res.error) throw new Error(res.error)
    } catch (e) {
      // Revert: re-add optimistic entry so UI doesn't silently lie
      setData((prev: any) => prev ? {
        ...prev,
        subscriptions: [{ id: `tmp_${cohortId}`, cohort: { id: cohortId }, cohortId }, ...(prev.subscriptions || [])]
      } : prev)
      console.error('Unsubscribe failed:', e)
    } finally { setFollowLoading(null) }
  }, [])

  const loadPeersAndDiscussions = useCallback(async (bundleId: string) => {
    if (expandedWorkshop === bundleId) { setExpandedWorkshop(null); return }
    setExpandedWorkshop(bundleId)
    setWorkshopSubTab("peers")
    const [peersRes, discRes] = await Promise.all([
      fetch(`/api/workshop/peers?bundleId=${bundleId}`).then(r => r.json()).catch(() => ({ peers: [] })),
      fetch(`/api/discussions?bundleId=${bundleId}`).then(r => r.json()).catch(() => []),
    ])
    setWorkshopPeers(prev => ({ ...prev, [bundleId]: peersRes.peers || [] }))
    setWorkshopDiscussions(prev => ({ ...prev, [bundleId]: Array.isArray(discRes) ? discRes : [] }))
  }, [expandedWorkshop])

  const handleConnect = useCallback(async (toUserId: string) => {
    setConnectingTo(toUserId)
    try {
      await fetch("/api/connections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toUserId }) })
      if (expandedWorkshop) {
        const peersRes = await fetch(`/api/workshop/peers?bundleId=${expandedWorkshop}`).then(r => r.json()).catch(() => ({ peers: [] }))
        setWorkshopPeers(prev => ({ ...prev, [expandedWorkshop!]: peersRes.peers || [] }))
      }
      // Refresh launchpad peers to update connection state
      setLaunchpadData((prev: any) => {
        if (!prev) return prev
        return {
          ...prev,
          peers: (prev.peers || []).map((p: any) =>
            p.id === toUserId ? { ...p, connectionState: 'pending_out' } : p
          ),
        }
      })
    } catch {}
    finally { setConnectingTo(null) }
  }, [expandedWorkshop])

  const handlePostDiscussion = useCallback(async (bundleId: string) => {
    const content = discussionInput[bundleId]?.trim()
    if (!content) return
    setPostingDiscussion(true)
    try {
      const res = await fetch("/api/discussions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bundleId, content }) }).then(r => r.json())
      if (res.id) {
        setWorkshopDiscussions(prev => ({ ...prev, [bundleId]: [res, ...(prev[bundleId] || [])] }))
        setDiscussionInput(prev => ({ ...prev, [bundleId]: "" }))
      }
    } catch {}
    finally { setPostingDiscussion(false) }
  }, [discussionInput])

  const handleReportPost = useCallback(async (postId: string, bundleId: string) => {
    await fetch("/api/discussions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) })
    setWorkshopDiscussions(prev => ({ ...prev, [bundleId]: (prev[bundleId] || []).filter((p: any) => p.id !== postId) }))
  }, [])

  const loadConnections = useCallback(async () => {
    setConnectionsLoading(true)
    const res = await fetch("/api/connections").then(r => r.json()).catch(() => ({ accepted: [], pendingIncoming: [], pendingOutgoing: [] }))
    setConnections(res)
    setConnectionsLoading(false)
  }, [])

  const handleConnectionAction = useCallback(async (connectionId: string, action: "ACCEPTED" | "DECLINED") => {
    setConnectionActionLoading(connectionId)
    try {
      await fetch("/api/connections", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId, action }) })
      loadConnections()
    } catch {}
    finally { setConnectionActionLoading(null) }
  }, [loadConnections])

  const handleAcceptConnection = useCallback(async (connectionId: string) => {
    if (!connectionId) return
    setConnectionActionLoading(connectionId)
    try {
      await fetch("/api/connections", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId, action: "ACCEPTED" }) })
      setLaunchpadData((prev: any) => {
        if (!prev) return prev
        return {
          ...prev,
          peers: (prev.peers || []).map((p: any) =>
            p.connectionId === connectionId ? { ...p, connectionState: 'connected' } : p
          ),
        }
      })
    } catch {}
    finally { setConnectionActionLoading(null) }
  }, [])

  useEffect(() => { if (activeTab === "connections") loadConnections() }, [activeTab, loadConnections])

  // Initial load when switching to launchpad tab
  useEffect(() => {
    if (activeTab === "launchpad" && !launchpadData && !launchpadLoading) {
      fetchLaunchpadData(false)
    }
  }, [activeTab, launchpadData, launchpadLoading, fetchLaunchpadData])

  // Poll every 30s while on launchpad tab to pick up live status changes from admin
  useEffect(() => {
    if (activeTab !== "launchpad" || !launchpadData) return
    const interval = setInterval(() => fetchLaunchpadData(true), 30_000)
    return () => clearInterval(interval)
  }, [activeTab, launchpadData, fetchLaunchpadData])

  const handleAddSkill = () => {
    const s = skillInput.trim()
    if (s && !settingsForm.skills.includes(s)) {
      setSettingsForm({ ...settingsForm, skills: [...settingsForm.skills, s] })
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setSettingsForm({ ...settingsForm, skills: settingsForm.skills.filter((s: string) => s !== skill) })
  }

  const handleSettingsSave = async () => {
    setSettingsSaving(true); setSettingsMsg("")
    try {
      const payload: any = { ...settingsForm }
      if (payload.graduationYear) payload.graduationYear = parseInt(payload.graduationYear)
      if (!payload.password) delete payload.password
      const res = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(r => r.json())
      if (res.error) setSettingsMsg(res.error)
      else {
        setSettingsMsg("Profile updated successfully!")
        const fresh = await fetch("/api/user/dashboard").then(r => r.json())
        if (!fresh.error) setData(fresh)
      }
    } catch { setSettingsMsg("Something went wrong.") }
    finally { setSettingsSaving(false) }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    setWithdrawSubmitting(true)
    setWithdrawMsg({ text: "", type: "" })
    try {
      const res = await fetch("/api/referral/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(withdrawAmount), upiId: withdrawUpi })
      }).then(r => r.json())

      if (res.error) setWithdrawMsg({ text: res.error, type: "error" })
      else {
        setWithdrawMsg({ text: "Request submitted! Check below for status.", type: "success" })
        setWithdrawAmount("")
        setWithdrawUpi("")
        setLoading(true)
        try {
          const res = await fetch("/api/user/dashboard", { cache: 'no-store' }).then(r => r.json())
          if (res.error) {
            router.push("/login")
          } else {
            setData(res)
          }
        } catch {
          router.push("/login")
        } finally {
          setLoading(false)
        }
      }
    } catch {
      setWithdrawMsg({ text: "Something went wrong.", type: "error" })
    } finally {
      setWithdrawSubmitting(false)
    }
  }

  // ── loading screen ─────────────────────────────────
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#060606]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#0085FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Loading</span>
        </div>
      </div>
    )
  }

  const { user, orders, enrollments, subscriptions, referredUsers, totalEarnings, achievements, redemptions, totalRedeemed, availableBalance } = data
  const isRealCode = Boolean(user.referralCode && !user.referralCode.startsWith("tmp_"))
  const pendingOrders = (orders || []).filter((o: any) => o.status === "pending").length
  const subscribedIds = (subscriptions || []).map((s: any) => s.cohort?.id || s.cohortId).filter(Boolean)
  const initials = user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
  const unlockedSlugs = new Set((achievements?.unlocked || []).map((a: any) => a.slug))
  const xpProgress = user.nextLevelXp > 0 ? Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100)) : 100
  const filteredResources = resourceFilter === "ALL" ? resources : resources.filter((r: any) => r.type === resourceFilter)

  // Where an enrolment's row should take you. Products with their own gated
  // dashboard go there; everything else falls back to My Learning.
  const enrolmentDestination = (en: any): { tab: Tab; label: string } => {
    if (en.bundle?.slug === LAUNCHPAD_FIRST_STEP_SLUG) return { tab: "firstStep", label: "Open session dashboard" }
    if (en.bundle?.slug === LAUNCHPAD_FLAGSHIP_SLUG)   return { tab: "launchpad", label: "Open Launchpad dashboard" }
    return { tab: "learning", label: "Open workshop dashboard" }
  }

  // Gate per product, not per cohort. Launchpad is a category with several
  // products; each unlocks only its own dashboard. Gating on cohortSlug would
  // hand every Launchpad buyer the 4-week programme regardless of what they bought.
  const hasLaunchpadAccess = (enrollments || []).some((e: any) =>
    e.bundle?.slug === LAUNCHPAD_FLAGSHIP_SLUG && e.status !== 'REVOKED'
  )
  const hasFirstStepAccess = (enrollments || []).some((e: any) =>
    e.bundle?.slug === LAUNCHPAD_FIRST_STEP_SLUG && e.status !== 'REVOKED'
  )
  const TABS = [
    BASE_TABS[0],
    BASE_TABS[1],
    ...(hasLaunchpadAccess ? [LAUNCHPAD_TAB] : []),
    ...(hasFirstStepAccess ? [FIRST_STEP_TAB] : []),
    ...BASE_TABS.slice(2),
  ]

  // ── shared input style ─────────────────────────────
  const inputCls = "w-full bg-[#0a0a0a] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-white/15 outline-none focus:border-[#0085FF]/60 transition-colors"

  return (
    <div className="min-h-screen bg-[#060606] text-white font-body flex">

      {/* ═══════════════════════════════════════ SIDEBAR ═══ */}
      <aside className="hidden md:flex flex-col w-56 bg-[#080808] border-r border-white/[0.05] fixed left-0 top-0 bottom-0 z-40">

        {/* Logo */}
        <div className="flex items-center justify-center py-5 px-4 border-b border-white/[0.05] shrink-0">
          <Link href="/">
            <img src="https://ik.imagekit.io/cotszrkgk/Screenshot_2025-06-25_at_9.10.56_PM-removebg-preview.png?updatedAt=1756648034230" alt="REvamp" className="h-20 w-auto" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-medium transition-all relative group ${
                  isActive
                    ? "text-[#0085FF] bg-[#0085FF]/[0.07]"
                    : "text-white/35 hover:text-white/80 hover:bg-white/[0.03]"
                }`}
              >
                {/* Active indicator bar */}
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#0085FF]" />}
                <span
                  className="material-symbols-outlined text-[18px] shrink-0"
                  style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" } : {}}
                >
                  {tab.icon}
                </span>
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.id === "orders" && pendingOrders > 0 && (
                  <span className="w-4 h-4 bg-[#0085FF] text-white text-[8px] font-black flex items-center justify-center shrink-0">
                    {pendingOrders}
                  </span>
                )}
                {tab.id === "achievements" && (achievements?.unlocked?.length || 0) > 0 && !isActive && (
                  <span className="text-[9px] text-white/15 font-mono">
                    {achievements.unlocked.length}/{achievements?.all?.length || 0}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User card */}
        <div className="shrink-0 px-3 pb-4 pt-3 border-t border-white/[0.05] space-y-3">
          <div className="flex items-center gap-2.5">
            <Avatar name={user.name} size="md" color="#0085FF" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate leading-none">{user.name.split(" ")[0]}</p>
              <p className="text-[10px] text-white/30 mt-0.5">Lv.{user.level} · {user.levelName}</p>
            </div>
            <button onClick={handleLogout} className="text-white/15 hover:text-red-400 transition-colors shrink-0" title="Log out">
              <span className="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
          {/* XP strip */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-white/20 font-bold uppercase tracking-wider">XP Progress</span>
              <span className="text-[9px] text-white/20 font-mono">{user.xp}/{user.nextLevelXp}</span>
            </div>
            <div className="h-1 bg-white/[0.06] overflow-hidden">
              <div className="h-full bg-[#0085FF] transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════ MAIN ═══ */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-5 md:px-8 bg-[#060606]/95 backdrop-blur-xl border-b border-white/[0.05] shrink-0">
          {/* Left: mobile logo + breadcrumb */}
          <div className="flex items-center gap-4">
            <Link href="/" className="md:hidden">
              <img src="https://ik.imagekit.io/cotszrkgk/Screenshot_2025-06-25_at_9.10.56_PM-removebg-preview.png?updatedAt=1756648034230" alt="REvamp" className="h-7 w-auto" />
            </Link>
            <div className="hidden md:flex items-center gap-2 text-[11px]">
              <span className="text-white/20">Dashboard</span>
              <span className="text-white/[0.08]">/</span>
              <span className="text-white/50 font-medium capitalize">{activeTab.replace("-", " ")}</span>
            </div>
          </div>
          {/* Right */}
          <div className="flex items-center gap-3">
            <Link href="/domains" className="hidden md:flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/70 transition-colors">
              <span className="material-symbols-outlined text-sm">explore</span>
              Browse
            </Link>
            {pendingOrders > 0 && (
              <button onClick={() => switchTab("orders")} className="relative p-1 text-white/30 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0085FF] text-[7px] font-black text-white flex items-center justify-center">{pendingOrders}</span>
              </button>
            )}
            <button onClick={() => switchTab("settings")} className="w-8 h-8 bg-[#0085FF] flex items-center justify-center text-white text-[10px] font-bold hover:bg-[#0070DD] transition-colors">
              {initials}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-8">

          {/* ─────────────────────────────── HOME TAB ─── */}
          {activeTab === "home" && (
            <div className="animate-in fade-in duration-300 min-h-screen" style={{ background: 'radial-gradient(ellipse 80% 40% at 60% -10%, rgba(0,133,255,0.08) 0%, transparent 70%), radial-gradient(ellipse 50% 30% at 100% 50%, rgba(139,92,246,0.05) 0%, transparent 60%), #060606' }}>

              <AnnouncementTicker items={announcements} />

              <div className="px-5 md:px-8 py-6 max-w-7xl mx-auto space-y-5">

                {/* ── HERO GLASS CARD ── */}
                <div className="relative overflow-hidden p-6 md:p-8" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)' }}>
                  {/* Glow blobs */}
                  <div className="absolute -top-12 -right-12 w-56 h-56 bg-[#0085FF]/[0.12] blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-[#8b5cf6]/[0.08] blur-2xl pointer-events-none" />

                  <div className="relative flex items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-[11px] text-white/40 font-semibold uppercase tracking-[0.2em]">Active · {new Date().toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                      </div>
                      <h1 className="font-headline font-black text-5xl md:text-7xl tracking-tight leading-none mb-3">
                        {user.name.split(" ")[0]}<span className="text-[#0085FF]">.</span>
                      </h1>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs font-bold text-white/50">{user.levelName}</span>
                        <span className="w-px h-3 bg-white/[0.12]" />
                        <span className="text-xs text-white/30">{user.xp} XP · {user.nextLevelXp - user.xp} to next level</span>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="relative h-1.5 flex-1 max-w-48 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                          <div className="h-full bg-[#0085FF] transition-all duration-1000 relative" style={{ width: `${xpProgress}%`, borderRadius: '4px' }}>
                            <div className="absolute inset-0 animate-shimmer" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: '#0085FF' }}>LVL {user.level}</span>
                      </div>
                    </div>
                    <XPRing progress={xpProgress} level={user.level} />
                  </div>
                </div>

                {/* ── STATS ROW ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Level",    value: user.level,                          sub: user.levelName,              icon: "star",         color: "#0085FF", tab: "achievements" as Tab },
                    { label: "Badges",   value: achievements?.unlocked?.length || 0,  sub: `of ${achievements?.all?.length || 0} total`, icon: "emoji_events", color: "#FFD700", tab: "achievements" as Tab },
                    { label: "Enrolled", value: (enrollments || []).length,           sub: "workshops",                 icon: "school",       color: "#8b5cf6", tab: "learning" as Tab },
                    { label: "Earned",   value: `₹${totalEarnings}`,                 sub: `${(referredUsers || []).length} referrals`, icon: "group_add",  color: "#4ade80", tab: "referrals" as Tab },
                  ].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => switchTab(s.tab)}
                      className="relative p-5 text-left transition-all duration-200 group overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.035)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${s.color}18 0%, transparent 60%)` }} />
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[9px] text-white/25 font-black uppercase tracking-[0.15em]">{s.label}</span>
                        <div className="w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-110 duration-200" style={{ background: `${s.color}18`, borderRadius: '8px' }}>
                          <span className="material-symbols-outlined text-sm" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                        </div>
                      </div>
                      <div className="font-headline font-black text-3xl leading-none mb-1">{s.value}</div>
                      <p className="text-white/25 text-[10px]">{s.sub}</p>
                    </button>
                  ))}
                </div>

                {/* ── BENTO MAIN GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

                  {/* Active workshops — spans 3 cols */}
                  <div className="lg:col-span-3 space-y-4">

                    {/* Enrollments card */}
                    <div className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                        <h2 className="font-headline font-bold text-sm text-white/60 uppercase tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#8b5cf6] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                          Enrolled
                        </h2>
                        <button onClick={() => switchTab("learning")} className="text-[#0085FF] text-[11px] font-bold hover:text-[#40a9ff] transition-colors">All →</button>
                      </div>
                      {(enrollments || []).length === 0 ? (
                        <div className="p-10 text-center">
                          <span className="material-symbols-outlined text-3xl text-white/10 block mb-2">school</span>
                          <p className="text-white/25 text-xs mb-3">No active workshops yet.</p>
                          <Link href="/domains" className="text-[#0085FF] text-xs font-bold hover:underline">Browse →</Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-white/[0.04]">
                          {(enrollments || []).slice(0, 4).map((en: any) => {
                            // Each enrolment has its own home. Without this the row is a
                            // dead end and buyers never find their event dashboard.
                            const dest = enrolmentDestination(en)
                            return (
                            <button
                              key={en.id}
                              onClick={() => switchTab(dest.tab)}
                              className="w-full text-left flex items-center gap-4 px-5 py-4 hover:bg-white/[0.025] transition-colors group cursor-pointer"
                            >
                              <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: `${en.bundle?.cohort?.accentHex || '#8b5cf6'}18`, borderRadius: '10px', border: `1px solid ${en.bundle?.cohort?.accentHex || '#8b5cf6'}30` }}>
                                <span className="material-symbols-outlined text-[18px]" style={{ color: en.bundle?.cohort?.accentHex || '#8b5cf6', fontVariationSettings: "'FILL' 1" }}>school</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{en.bundle?.name}</p>
                                <p className="text-white/30 text-[11px] truncate">{en.bundle?.cohort?.name || en.bundle?.cohortSlug} · {en.bundle?.duration}</p>
                                <p className="text-[#0085FF] text-[11px] font-bold mt-1 flex items-center gap-1">
                                  {dest.label}
                                  <span className="material-symbols-outlined text-[13px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                                </p>
                              </div>
                              <StatusBadge status={en.status} />
                            </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Followed domains — only if subscribed */}
                    {(subscriptions || []).length > 0 && (
                      <div className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                          <h2 className="font-headline font-bold text-sm text-white/60 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#0085FF] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>interests</span>
                            Following
                          </h2>
                          <button onClick={() => switchTab("domains")} className="text-[#0085FF] text-[11px] font-bold hover:text-[#40a9ff] transition-colors">Manage →</button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-2">
                          {(subscriptions || []).slice(0, 4).map((sub: any) => {
                            const cohort = sub.cohort
                            const cohortFull = allCohorts.find((c: any) => c.id === cohort?.id)
                            return (
                              <Link key={sub.id} href={`/cohort/${cohort?.slug}`}
                                className="flex items-center gap-2.5 p-3 hover:bg-white/[0.04] transition-colors group"
                                style={{ border: `1px solid ${cohort?.accentHex || "#0085FF"}22`, borderRadius: '10px', borderLeft: `3px solid ${cohort?.accentHex || "#0085FF"}` }}
                              >
                                <div className="min-w-0">
                                  <p className="text-xs font-bold truncate">{cohort?.name}</p>
                                  <p className="text-white/25 text-[9px]">{cohortFull?.bundles?.length || 0} workshops</p>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick actions + leaderboard — spans 2 cols */}
                  <div className="lg:col-span-2 space-y-4">

                    {/* Quick actions glass card */}
                    <div className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                      <div className="px-5 py-4 border-b border-white/[0.05]">
                        <h2 className="font-headline font-bold text-sm text-white/60 uppercase tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-white/30 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                          Quick Actions
                        </h2>
                      </div>
                      <div className="p-3 space-y-1.5">
                        {[
                          { href: "/domains", label: "Browse Workshops", sub: "Explore all domains", icon: "explore", color: "#0085FF", isLink: true },
                          ...(isRealCode ? [{ onClick: copyLink, label: copied ? "Copied" : "Share Referral Link", sub: "Earn ₹200 per referral", icon: copied ? "check_circle" : "share", color: "#FFD700", isLink: false }] : []),
                          { onClick: () => switchTab("resources"), label: "Free Resources", sub: "Cheatsheets, roadmaps, templates", icon: "library_books", color: "#8b5cf6", isLink: false },
                          { onClick: () => switchTab("achievements"), label: "Achievements", sub: `${achievements?.unlocked?.length || 0} of ${achievements?.all?.length || 0} unlocked`, icon: "emoji_events", color: "#FFD700", isLink: false },
                        ].map((action: any, i) => {
                          const inner = (
                            <div className="flex items-center gap-3 p-3 hover:bg-white/[0.04] transition-colors group w-full text-left" style={{ borderRadius: '10px' }}>
                              <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200" style={{ background: `${action.color}15`, borderRadius: '9px' }}>
                                <span className="material-symbols-outlined text-[18px]" style={{ color: action.color }}>{action.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[13px] leading-tight">{action.label}</p>
                                <p className="text-white/30 text-[10px]">{action.sub}</p>
                              </div>
                              <span className="material-symbols-outlined text-white/15 text-sm group-hover:text-white/35 group-hover:translate-x-0.5 transition-all">arrow_forward</span>
                            </div>
                          )
                          return action.isLink
                            ? <Link key={i} href={action.href}>{inner}</Link>
                            : <button key={i} onClick={action.onClick} className="w-full">{inner}</button>
                        })}
                      </div>
                    </div>

                    {/* Leaderboard glass card */}
                    <div className="overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,215,0,0.08)', borderRadius: '16px', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                        <h2 className="font-headline font-bold text-sm text-white/60 uppercase tracking-wider flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#FFD700] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
                          Top Referrers
                        </h2>
                      </div>
                      {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-white/20 text-xs">No referrals yet — be the first!</div>
                      ) : (
                        <div className="divide-y divide-white/[0.04]">
                          {leaderboard.slice(0, 5).map((l: any, i: number) => {
                            const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]
                            const isMe = l.name?.includes(user.name.split(" ")[0])
                            return (
                              <div key={i} className={`flex items-center gap-3 px-5 py-3 transition-colors ${isMe ? "bg-[#0085FF]/[0.06]" : "hover:bg-white/[0.02]"}`}>
                                <span className="w-6 text-[11px] font-black text-center shrink-0 font-mono" style={{ color: rankColors[i] || 'rgba(255,255,255,0.2)' }}>#{i + 1}</span>
                                <span className={`text-sm font-medium flex-1 truncate ${isMe ? "text-[#0085FF]" : ""}`}>{l.name}</span>
                                {isMe && <span className="text-[8px] text-[#0085FF] font-black uppercase tracking-wider shrink-0">You</span>}
                                <span className="text-white/25 text-[11px] font-mono shrink-0">{l.referrals}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ─────────────────────────── MY LEARNING TAB ─── */}
          {activeTab === "learning" && (
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-headline font-black text-4xl tracking-tight">My Learning</h1>
                <p className="text-white/30 text-sm mt-1">Click any workshop to see peers & join discussions.</p>
              </div>
              {(enrollments || []).length === 0 ? (
                <div className="text-center py-24 bg-[#0d0d0d] border border-dashed border-white/[0.06]">
                  <span className="material-symbols-outlined text-5xl text-white/10 mb-4 block">school</span>
                  <h2 className="font-headline font-bold text-xl text-white/40 mb-2">No enrollments yet</h2>
                  <p className="text-white/20 text-sm mb-6">Enroll in a workshop to start your journey.</p>
                  <Link href="/domains" className="inline-block bg-[#0085FF] text-white px-8 py-3 font-bold text-sm hover:bg-[#0070DD] transition-colors">Browse Workshops →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {(enrollments || []).map((en: any) => {
                    const isExpanded = expandedWorkshop === en.bundle?.id
                    const peers = workshopPeers[en.bundle?.id] || []
                    const discussions = workshopDiscussions[en.bundle?.id] || []
                    return (
                      <div key={en.id} className={`border transition-all ${isExpanded ? "border-[#0085FF]/25 bg-[#0085FF]/[0.02]" : "border-white/[0.06] bg-[#0d0d0d] hover:border-white/10"}`}>
                        {/* Split header: the title area toggles peers/discussion, while
                            products with their own dashboard get a direct launch button.
                            Kept as siblings — a button inside a button is invalid HTML. */}
                        <div className="flex items-center gap-4 p-5">
                          <button
                            onClick={() => loadPeersAndDiscussions(en.bundle?.id)}
                            className="flex items-center gap-4 flex-1 min-w-0 text-left"
                          >
                            <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: `${en.bundle?.cohort?.accentHex || '#8b5cf6'}18`, border: `1px solid ${en.bundle?.cohort?.accentHex || '#8b5cf6'}25` }}>
                              <span className="material-symbols-outlined text-[18px]" style={{ color: en.bundle?.cohort?.accentHex || '#8b5cf6', fontVariationSettings: "'FILL' 1" }}>school</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[9px] text-white/25 font-bold uppercase tracking-wider">{en.bundle?.cohort?.name}</span>
                              </div>
                              <h3 className="font-headline font-bold text-base truncate">{en.bundle?.name}</h3>
                              <p className="text-white/25 text-[10px] mt-0.5">{[en.bundle?.duration, `Enrolled ${new Date(en.enrolledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`].filter(Boolean).join(" · ")}</p>
                            </div>
                          </button>
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge status={en.status} />
                            {enrolmentDestination(en).tab !== "learning" && (
                              <button
                                onClick={() => switchTab(enrolmentDestination(en).tab)}
                                className="flex items-center gap-1.5 bg-[#0085FF] text-white px-4 py-2 text-[11px] font-bold hover:bg-[#0070DD] transition-colors whitespace-nowrap"
                              >
                                Launch dashboard
                                <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                              </button>
                            )}
                            <button
                              onClick={() => loadPeersAndDiscussions(en.bundle?.id)}
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                              className="flex items-center"
                            >
                              <span className={`material-symbols-outlined text-white/20 text-base transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>expand_more</span>
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="border-t border-white/[0.05] p-5 animate-in fade-in duration-200">
                            <div className="flex gap-2 mb-5">
                              {(["peers", "discussion"] as const).map(sub => (
                                <button key={sub} onClick={() => setWorkshopSubTab(sub)} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all capitalize ${workshopSubTab === sub ? "bg-[#0085FF] text-white" : "bg-white/[0.04] text-white/35 hover:text-white/60"}`}>
                                  <span className="material-symbols-outlined text-sm">{sub === "peers" ? "people" : "forum"}</span>
                                  {sub} ({sub === "peers" ? peers.length : discussions.length})
                                </button>
                              ))}
                            </div>

                            {workshopSubTab === "peers" && (
                              <div>
                                {peers.length === 0 ? (
                                  <p className="text-white/20 text-sm text-center py-8">No other peers enrolled yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {peers.map((peer: any) => (
                                      <div key={peer.id} className="bg-black/30 border border-white/[0.05] p-3.5 flex items-center gap-3">
                                        <Avatar name={peer.name || "?"} size="md" color="#0085FF" />
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-sm truncate">{peer.name}</p>
                                          <p className="text-white/20 text-[10px]">{peer.college || "Student"} · Lv.{peer.level || 1}</p>
                                          {peer.githubUrl && <a href={peer.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[#0085FF] text-[10px] hover:underline">GitHub →</a>}
                                        </div>
                                        {peer.connectionStatus === "ACCEPTED" ? (
                                          <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 font-black">Connected</span>
                                        ) : peer.connectionStatus === "PENDING" ? (
                                          <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 font-black">Pending</span>
                                        ) : (
                                          <button onClick={() => handleConnect(peer.id)} disabled={connectingTo === peer.id} className="bg-[#0085FF] text-white text-[10px] font-bold px-3 py-1.5 hover:bg-[#0070DD] transition-colors disabled:opacity-50">
                                            {connectingTo === peer.id ? "..." : "Connect"}
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {workshopSubTab === "discussion" && (
                              <div>
                                <div className="flex gap-2 mb-4">
                                  <input
                                    type="text"
                                    value={discussionInput[en.bundle?.id] || ""}
                                    onChange={e => setDiscussionInput(prev => ({ ...prev, [en.bundle?.id]: e.target.value }))}
                                    onKeyDown={e => e.key === "Enter" && handlePostDiscussion(en.bundle?.id)}
                                    placeholder="Share something with your peers..."
                                    className="flex-1 bg-black/40 border border-white/[0.08] px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#0085FF]/60 transition-colors"
                                  />
                                  <button onClick={() => handlePostDiscussion(en.bundle?.id)} disabled={postingDiscussion || !discussionInput[en.bundle?.id]?.trim()} className="bg-[#0085FF] text-white px-4 py-2.5 font-bold text-sm hover:bg-[#0070DD] transition-colors disabled:opacity-30">Post</button>
                                </div>
                                {discussions.length === 0 ? (
                                  <p className="text-white/20 text-sm text-center py-8">No posts yet. Start the conversation!</p>
                                ) : (
                                  <div className="space-y-2.5">
                                    {discussions.map((post: any) => (
                                      <div key={post.id} className="bg-black/30 border border-white/[0.05] p-4">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                          <div className="flex items-center gap-2">
                                            <Avatar name={post.user?.name || "?"} size="sm" color="#0085FF" />
                                            <div>
                                              <span className="font-bold text-xs">{post.user?.name}</span>
                                              <span className="text-white/15 text-[10px] ml-2">{post.user?.college || ""}</span>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-white/15 text-[10px]">{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                                            <button onClick={() => handleReportPost(post.id, en.bundle?.id)} className="text-white/10 hover:text-red-400 transition-colors">
                                              <span className="material-symbols-outlined text-xs">flag</span>
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-white/60 text-sm leading-relaxed">{post.content}</p>
                                        {post.replies && post.replies.length > 0 && (
                                          <div className="mt-3 pl-4 border-l border-white/[0.05] space-y-2">
                                            {post.replies.map((reply: any) => (
                                              <div key={reply.id} className="flex items-start gap-2">
                                                <div className="w-5 h-5 bg-white/10 flex items-center justify-center text-white text-[7px] font-bold shrink-0 mt-0.5">{reply.user?.name?.[0]?.toUpperCase()}</div>
                                                <div>
                                                  <span className="font-bold text-[10px]">{reply.user?.name}</span>
                                                  <p className="text-white/40 text-xs">{reply.content}</p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────── CONNECTIONS TAB ─── */}
          {activeTab === "connections" && (
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="font-headline font-black text-4xl tracking-tight">Connections</h1>
                  <p className="text-white/30 text-sm mt-1">Your builder network.</p>
                </div>
                {(connections.accepted?.length || 0) > 0 && (
                  <div className="text-right">
                    <div className="font-headline font-black text-3xl text-[#0085FF]">{connections.accepted.length}</div>
                    <p className="text-white/25 text-[9px] uppercase tracking-widest">Connected</p>
                  </div>
                )}
              </div>

              {connectionsLoading ? (
                <div className="flex justify-center py-24">
                  <div className="w-6 h-6 border-2 border-[#0085FF] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Pending incoming */}
                  {connections.pendingIncoming?.length > 0 && (
                    <section>
                      <h2 className="font-headline font-bold text-xs text-yellow-400/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        {connections.pendingIncoming.length} request{connections.pendingIncoming.length !== 1 ? 's' : ''} waiting
                      </h2>
                      <div className="space-y-2">
                        {connections.pendingIncoming.map((conn: any) => (
                          <div key={conn.id} className="bg-[#0d0d0d] border border-yellow-500/[0.12] p-4 flex items-center gap-4 group hover:border-yellow-500/25 transition-all">
                            <Avatar name={conn.peer?.name || "?"} size="md" color="#ca8a04" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{conn.peer?.name}</p>
                              <p className="text-white/25 text-[10px]">{conn.peer?.college || "Student"} · <span className="text-[#0085FF]/60">Lv.{conn.peer?.level || 1}</span></p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  setConnectionActionLoading(conn.id)
                                  await fetch("/api/connections", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId: conn.id, action: "ACCEPTED" }) })
                                  setConnections((prev: any) => ({
                                    ...prev,
                                    pendingIncoming: prev.pendingIncoming.filter((c: any) => c.id !== conn.id),
                                    accepted: [...(prev.accepted || []), { ...conn, peer: conn.peer }],
                                  }))
                                  setConnectionActionLoading(null)
                                }}
                                disabled={connectionActionLoading === conn.id}
                                className="bg-[#0085FF] text-white text-[11px] font-bold px-4 py-1.5 hover:bg-[#0070DD] transition-colors disabled:opacity-50"
                              >
                                {connectionActionLoading === conn.id ? "..." : "Accept"}
                              </button>
                              <button
                                onClick={async () => {
                                  setConnectionActionLoading(conn.id)
                                  await fetch("/api/connections", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId: conn.id, action: "DECLINED" }) })
                                  setConnections((prev: any) => ({
                                    ...prev,
                                    pendingIncoming: prev.pendingIncoming.filter((c: any) => c.id !== conn.id),
                                  }))
                                  setConnectionActionLoading(null)
                                }}
                                disabled={connectionActionLoading === conn.id}
                                className="bg-white/[0.04] text-white/30 text-[11px] font-bold px-3 py-1.5 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Pending outgoing */}
                  {connections.pendingOutgoing?.length > 0 && (
                    <section>
                      <h2 className="font-headline font-bold text-xs text-white/25 uppercase tracking-widest mb-3">Sent ({connections.pendingOutgoing.length})</h2>
                      <div className="flex flex-wrap gap-2">
                        {connections.pendingOutgoing.map((conn: any) => (
                          <div key={conn.id} className="flex items-center gap-2 bg-[#0d0d0d] border border-white/[0.05] px-3 py-2 opacity-60">
                            <Avatar name={conn.peer?.name || "?"} size="sm" color="#555" />
                            <span className="text-xs font-bold">{conn.peer?.name?.split(" ")[0]}</span>
                            <span className="text-[9px] text-yellow-500/50 font-black uppercase ml-1">·  pending</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Your network */}
                  <section>
                    <h2 className="font-headline font-bold text-xs text-white/40 uppercase tracking-widest mb-4">
                      Your Network {(connections.accepted?.length || 0) > 0 && `· ${connections.accepted.length}`}
                    </h2>
                    {(!connections.accepted || connections.accepted.length === 0) ? (
                      <div className="text-center py-16 bg-[#0d0d0d] border border-dashed border-white/[0.06] space-y-4">
                        <span className="material-symbols-outlined text-5xl text-white/10 block">group_add</span>
                        <div>
                          <h3 className="font-headline font-bold text-lg text-white/40">No connections yet</h3>
                          <p className="text-white/20 text-sm mt-1">Go to your Launchpad tab to connect with cohort mates.</p>
                        </div>
                        {hasLaunchpadAccess && (
                          <button onClick={() => switchTab("launchpad")} className="bg-[#0085FF] text-white px-8 py-2.5 font-bold text-sm hover:bg-[#0070DD] transition-colors">
                            Open Launchpad →
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {connections.accepted.map((conn: any) => (
                          <div key={conn.id} className="bg-[#0d0d0d] border border-white/[0.06] p-4 hover:border-[#0085FF]/20 transition-all group">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar name={conn.peer?.name || "?"} size="md" color="#0085FF" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{conn.peer?.name}</p>
                                <p className="text-white/25 text-[10px] truncate">{conn.peer?.college || "Student"}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-[10px] font-black text-[#0085FF]">Lv.{conn.peer?.level || 1}</div>
                                <div className="text-[9px] text-white/20">{conn.peer?.xp || 0} XP</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-white/[0.04]">
                              {conn.peer?.githubUrl && (
                                <a href={conn.peer.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-white/[0.04] text-white/35 px-2.5 py-1 hover:text-white hover:bg-white/[0.08] transition-all font-mono">
                                  <span className="material-symbols-outlined text-xs">code</span>GitHub
                                </a>
                              )}
                              {conn.peer?.linkedinUrl && (
                                <a href={conn.peer.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] bg-white/[0.04] text-white/35 px-2.5 py-1 hover:text-[#0085FF] hover:bg-[#0085FF]/10 transition-all">
                                  <span className="material-symbols-outlined text-xs">work</span>LinkedIn
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          )}

          {/* ──────────────────────────── ORDERS TAB ─── */}
          {activeTab === "orders" && (
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-6 animate-in fade-in duration-300">
              <h1 className="font-headline font-black text-4xl tracking-tight">Orders</h1>
              {(orders || []).length === 0 ? (
                <div className="text-center py-24 bg-[#0d0d0d] border border-dashed border-white/[0.06]">
                  <span className="material-symbols-outlined text-5xl text-white/10 mb-3 block">receipt_long</span>
                  <h2 className="font-headline font-bold text-xl text-white/40 mb-2">No orders yet</h2>
                  <p className="text-white/20 text-sm mb-6">Your purchase history will appear here.</p>
                  <Link href="/domains" className="inline-block bg-[#0085FF] text-white px-8 py-3 font-bold text-sm hover:bg-[#0070DD] transition-colors">Browse Workshops →</Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {(orders || []).map((order: any) => (
                    <div key={order.id} className="bg-[#0d0d0d] border border-white/[0.06] p-5 hover:border-white/10 transition-all group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-[13px]" style={{ color: order.bundle?.cohort?.accentHex || 'rgba(255,255,255,0.2)', fontVariationSettings: "'FILL' 1" }}>interests</span>
                            <span className="text-[9px] text-white/25 uppercase tracking-wider">{order.bundle?.cohort?.name}</span>
                          </div>
                          <h3 className="font-headline font-bold text-base">{order.bundle?.name || order.productName || "Workshop"}</h3>
                          <p className="text-white/25 text-[10px] mt-0.5">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-headline font-black text-2xl">₹{order.amount}</span>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ───────────────────────── REFERRALS TAB ─── */}
          {activeTab === "referrals" && (
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h1 className="font-headline font-black text-4xl tracking-tight">Referrals</h1>
                {isRealCode && <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]/60 border border-[#FFD700]/20 px-3 py-1">{user.referralCode}</span>}
              </div>

              {isRealCode ? (
                <div className="relative border border-[#FFD700]/15 overflow-hidden bg-[#0d0d0d]">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FFD700]/40" />
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#FFD700]/[0.03] blur-3xl pointer-events-none" />
                  <div className="relative p-6 space-y-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#FFD700] text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
                      <span className="text-[10px] font-black text-[#FFD700]/70 uppercase tracking-[0.15em]">Your Referral Link</span>
                    </div>

                    {/* Link copy row */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 bg-black/50 border border-white/[0.06] px-4 py-2.5 font-mono text-[#0085FF] text-sm truncate select-all cursor-text">
                        https://letsrevamp.in?ref={user.referralCode}
                      </div>
                      <button onClick={copyLink} className="bg-[#FFD700] text-black px-6 py-2.5 font-black text-sm hover:bg-[#e6c300] transition-colors shrink-0">
                        {copied ? "Copied! ✓" : "Copy Link"}
                      </button>
                    </div>

                    {/* Share buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Hey! Join me on Revamp — the no-BS coding program for real builders. Use my referral link and get a discount: https://letsrevamp.in?ref=${user.referralCode}`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] px-4 py-2 text-[11px] font-bold hover:bg-[#25D366]/15 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">chat</span>
                        Share on WhatsApp
                      </a>
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: 'Join Revamp', url: `https://letsrevamp.in?ref=${user.referralCode}` }).catch(() => {})
                          } else copyLink()
                        }}
                        className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] text-white/50 px-4 py-2 text-[11px] font-bold hover:bg-white/[0.07] transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">ios_share</span>
                        Share
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-black/30 border border-white/[0.05] p-5 text-center">
                        <div className="font-headline font-black text-2xl text-[#FFD700]">₹{totalEarnings}</div>
                        <p className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">Total Earned</p>
                      </div>
                      <div className="bg-black/30 border border-white/[0.05] p-5 text-center">
                        <div className="font-headline font-black text-2xl">{(referredUsers || []).length}</div>
                        <p className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">Referrals</p>
                      </div>
                      <div className="bg-black/30 border border-white/[0.05] p-5 text-center border-l border-l-[#FFD700]/20">
                        <div className="font-headline font-black text-2xl text-green-400">₹{availableBalance || 0}</div>
                        <p className="text-white/30 text-[10px] mt-1 uppercase tracking-wider">Available</p>
                      </div>
                    </div>

                    {/* How it works */}
                    <div className="bg-black/20 border border-white/[0.04] p-4 space-y-2">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">How it works</p>
                      {[
                        { n: "01", text: "Share your link with friends" },
                        { n: "02", text: "They sign up & enrol in any program" },
                        { n: "03", text: "You earn ₹100–₹200 per paid enrolment" },
                        { n: "04", text: "Withdraw to UPI anytime (min ₹100)" },
                      ].map(s => (
                        <div key={s.n} className="flex items-center gap-3">
                          <span className="text-[9px] font-black text-[#FFD700]/40 font-mono w-5">{s.n}</span>
                          <span className="text-[11px] text-white/40">{s.text}</span>
                        </div>
                      ))}
                    </div>

                    {availableBalance > 0 && (
                      <form onSubmit={handleWithdraw} className="bg-white/[0.02] border border-[#FFD700]/20 p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-[#FFD700]">Withdraw Earnings</h3>
                          <span className="text-[10px] text-white/30">Min ₹100 · Paid within 48h</span>
                        </div>
                        <div className="flex gap-2">
                          <input required type="number" min="100" max={availableBalance} placeholder="Amount (₹)" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-1/3 bg-black/50 border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFD700]/50" />
                          <input required type="text" placeholder="UPI ID (e.g. name@okaxis)" value={withdrawUpi} onChange={(e) => setWithdrawUpi(e.target.value)} className="flex-1 bg-black/50 border border-white/[0.06] px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#FFD700]/50" />
                          <button type="submit" disabled={withdrawSubmitting} className="bg-[#FFD700] text-black px-6 font-bold text-sm hover:bg-[#e6c300] transition-colors disabled:opacity-50 shrink-0">
                            {withdrawSubmitting ? "..." : "Request"}
                          </button>
                        </div>
                        {withdrawMsg.text && (
                          <p className={`text-[11px] font-medium ${withdrawMsg.type === "error" ? "text-red-400" : "text-green-400"}`}>{withdrawMsg.text}</p>
                        )}
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#0d0d0d] border border-dashed border-white/[0.06] p-10 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-white/10 block">lock</span>
                  <p className="font-bold text-white/30">Referral link locked</p>
                  <p className="text-white/20 text-sm">Your referral code activates once your enrolment payment is confirmed.</p>
                </div>
              )}

              {(referredUsers || []).length > 0 && (
                <section>
                  <h2 className="font-headline font-bold text-xs text-white/40 uppercase tracking-widest mb-3">People You Referred ({(referredUsers || []).length})</h2>
                  <div className="space-y-2">
                    {(referredUsers || []).map((u: any) => (
                      <div key={u.id} className="flex justify-between items-center bg-[#0d0d0d] border border-white/[0.06] p-4 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FFD700]/10 flex items-center justify-center text-[10px] font-black text-[#FFD700]">
                            {(u.name || "?").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{u.name || "Anonymous"}</p>
                            <p className="text-white/25 text-xs">{u.email}</p>
                          </div>
                        </div>
                        <p className="text-white/20 text-xs font-mono">{new Date(u.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {(() => {
                const withdrawals = (redemptions || []).filter((r: any) => !r.upiId?.startsWith('WORKSHOP_PURCHASE:'))
                const purchaseDeductions = (redemptions || []).filter((r: any) => r.upiId?.startsWith('WORKSHOP_PURCHASE:'))
                return (
                  <>
                    {withdrawals.length > 0 && (
                      <section>
                        <h2 className="font-headline font-bold text-xs text-white/40 uppercase tracking-widest mb-3">Withdrawal History</h2>
                        <div className="space-y-2">
                          {withdrawals.map((r: any) => (
                            <div key={r.id} className="flex justify-between items-center bg-[#0d0d0d] border border-white/[0.06] p-4">
                              <div>
                                <p className="font-bold text-sm">₹{r.amount}</p>
                                <p className="text-white/25 text-[10px] font-mono uppercase truncate max-w-[180px]">{r.upiId}</p>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <span className={`text-[9px] font-black px-2 py-0.5 border uppercase tracking-wider ${
                                  r.status === 'PAID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  r.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  r.status === 'INITIATED' ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20' :
                                  'bg-[#0085FF]/10 text-[#0085FF] border-[#0085FF]/20'
                                }`}>{r.status}</span>
                                <p className="text-white/20 text-[9px] font-mono">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                    {purchaseDeductions.length > 0 && (
                      <section>
                        <h2 className="font-headline font-bold text-xs text-white/40 uppercase tracking-widest mb-3">Applied to Purchases</h2>
                        <div className="space-y-2">
                          {purchaseDeductions.map((r: any) => (
                            <div key={r.id} className="flex justify-between items-center bg-[#0d0d0d] border border-white/[0.06] p-4">
                              <div>
                                <p className="font-bold text-sm">−₹{r.amount}</p>
                                <p className="text-white/25 text-[10px]">Balance used for workshop purchase</p>
                              </div>
                              <p className="text-white/20 text-[9px] font-mono">{new Date(r.createdAt).toLocaleDateString("en-IN")}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* ─────────────────────────── DOMAINS TAB ─── */}
          {activeTab === "domains" && (() => {
            const followedCohorts = allCohorts.filter((c: any) => subscribedIds.includes(c.id))
            const discoverCohorts = allCohorts.filter((c: any) => !subscribedIds.includes(c.id))
            return (
            <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-10 animate-in fade-in duration-300">
              <div>
                <h1 className="font-headline font-black text-4xl tracking-tight">Domains</h1>
                <p className="text-white/30 text-sm mt-1">Follow domains to get notified when new workshops drop.</p>
              </div>

              {/* ── Following section ── */}
              {followedCohorts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-green-400">bookmark</span>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/40">Following</p>
                    <span className="text-[10px] font-bold text-green-400/70 bg-green-500/10 border border-green-500/15 px-2 py-0.5">{followedCohorts.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {followedCohorts.map((cohort: any) => {
                      const isLoading = followLoading === cohort.id
                      const accent = cohort.accentHex || "#0085FF"
                      return (
                        <div key={cohort.id} className="relative group overflow-hidden"
                          style={{ background: `rgba(13,13,13,0.95)`, border: `1px solid ${accent}40` }}>
                          <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h3 className="font-headline font-black text-lg leading-tight">{cohort.name}</h3>
                              <span className="shrink-0 text-[8px] font-black uppercase tracking-wider px-2 py-1 mt-0.5" style={{ background: `${accent}20`, color: accent }}>Following</span>
                            </div>
                            <p className="text-white/35 text-xs line-clamp-2 mb-4">{cohort.description}</p>
                            <div className="flex items-center gap-3">
                              <Link href={`/cohort/${cohort.slug}`}
                                className="text-xs font-bold px-3 py-1.5 transition-all hover:opacity-80"
                                style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
                                View workshops →
                              </Link>
                              <button
                                onClick={() => handleUnsubscribe(cohort.id)}
                                disabled={isLoading}
                                className="text-[10px] font-bold text-white/20 hover:text-red-400 transition-colors disabled:opacity-40 flex items-center gap-1"
                              >
                                {isLoading
                                  ? <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                  : "Unfollow"}
                              </button>
                            </div>
                          </div>
                          <div className="px-5 pb-3 text-[10px] text-white/20">{(cohort.bundles || []).length} workshops</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── Discover section ── */}
              {discoverCohorts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-white/30">explore</span>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/40">
                      {followedCohorts.length > 0 ? "Discover More" : "All Domains"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {discoverCohorts.map((cohort: any) => {
                      const isLoading = followLoading === cohort.id
                      const accent = cohort.accentHex || "#0085FF"
                      return (
                        <div key={cohort.id}
                          className="relative bg-[#0d0d0d] border border-white/[0.06] hover:border-white/[0.12] p-5 flex flex-col group transition-all duration-300 overflow-hidden">
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at top left, ${accent}0a, transparent 65%)` }} />
                          <h3 className="font-headline font-black text-base mb-1">{cohort.name}</h3>
                          <p className="text-white/30 text-xs line-clamp-2 mb-5 flex-1">{cohort.description}</p>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] text-white/20">{(cohort.bundles || []).length} workshops</span>
                            <div className="flex items-center gap-3">
                              <Link href={`/cohort/${cohort.slug}`} className="text-[11px] text-white/30 hover:text-white/60 font-bold transition-colors">Visit →</Link>
                              <button
                                onClick={() => handleSubscribe(cohort.id)}
                                disabled={isLoading}
                                className="px-3 py-1.5 text-[11px] font-black text-white uppercase tracking-wide transition-all hover:opacity-90 disabled:opacity-40"
                                style={{ background: accent }}
                              >
                                {isLoading
                                  ? <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  : "Follow"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {allCohorts.length === 0 && (
                <div className="text-center py-20 text-white/20 text-sm">No domains yet.</div>
              )}
            </div>
            )
          })()}

          {/* ──────────────────── ACHIEVEMENTS TAB ─── */}
          {activeTab === "achievements" && (
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-headline font-black text-4xl tracking-tight">Achievements</h1>
                <p className="text-white/30 text-sm mt-1">Earn badges and XP by engaging with the platform.</p>
              </div>

              {/* XP card */}
              <div className="relative bg-[#0d0d0d] border border-[#0085FF]/15 p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0085FF] to-transparent" />
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#0085FF]/[0.06] blur-3xl pointer-events-none" />
                <div className="relative flex items-center gap-5">
                  <XPRing progress={xpProgress} level={user.level} />
                  <div className="flex-1">
                    <h2 className="font-headline font-bold text-2xl">{user.levelName}</h2>
                    <p className="text-white/35 text-sm mb-3">{user.xp} / {user.nextLevelXp} XP to next level</p>
                    <div className="h-1.5 bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-[#0085FF] transition-all duration-1000 relative overflow-hidden" style={{ width: `${xpProgress}%` }}>
                        <div className="absolute inset-0 animate-shimmer" />
                      </div>
                    </div>
                    <p className="text-white/20 text-[10px] mt-1.5">{user.nextLevelXp - user.xp} XP until Level {user.level + 1}</p>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(achievements?.all || []).map((ach: any) => {
                  const isUnlocked = unlockedSlugs.has(ach.slug)
                  const unlockData = (achievements?.unlocked || []).find((a: any) => a.slug === ach.slug)
                  return (
                    <div
                      key={ach.id}
                      className={`p-5 transition-all relative overflow-hidden ${
                        isUnlocked ? "bg-[#0d0d0d] border border-white/10" : "bg-[#0d0d0d]/60 border border-dashed border-white/[0.05]"
                      }`}
                    >
                      {isUnlocked && <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />}
                      <div className="flex items-start justify-between mb-3">
                        <span className={`material-symbols-outlined text-2xl ${isUnlocked ? "text-[#FFD700]" : "text-white/15"}`} style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 border uppercase tracking-wider ${isUnlocked ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/[0.04] text-white/20 border-white/[0.06]"}`}>
                          {isUnlocked ? "Unlocked" : `${ach.xpReward} XP`}
                        </span>
                      </div>
                      <h3 className={`font-headline font-bold text-sm ${isUnlocked ? "" : "text-white/25"}`}>{ach.name}</h3>
                      <p className={`text-xs mt-1 leading-relaxed ${isUnlocked ? "text-white/40" : "text-white/15"}`}>{ach.description}</p>
                      {isUnlocked && unlockData?.unlockedAt && (
                        <p className="text-green-400/40 text-[9px] mt-2 font-mono">Earned {new Date(unlockData.unlockedAt).toLocaleDateString("en-IN")}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ──────────────────────── RESOURCES TAB ─── */}
          {activeTab === "resources" && (
            <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="font-headline font-black text-4xl tracking-tight">Resources</h1>
                <p className="text-white/30 text-sm mt-1">Free cheatsheets, roadmaps, and templates to level up.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["ALL", "CHEATSHEET", "ROADMAP", "TEMPLATE", "RECORDING", "LINK"].map(type => (
                  <button
                    key={type}
                    onClick={() => setResourceFilter(type)}
                    className={`px-4 py-1.5 text-[11px] font-bold transition-all uppercase tracking-wider ${resourceFilter === type ? "bg-[#0085FF] text-white" : "bg-white/[0.04] text-white/35 hover:text-white/60 hover:bg-white/[0.07]"}`}
                  >
                    {type === "ALL" ? "All" : type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              {filteredResources.length === 0 ? (
                <div className="text-center py-20 text-white/20">
                  <span className="material-symbols-outlined text-5xl mb-3 block">library_books</span>
                  <p className="text-sm">No resources available yet. Check back soon!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredResources.map((res: any) => {
                    const typeIcons: Record<string, string> = { CHEATSHEET: "description", ROADMAP: "map", TEMPLATE: "draft", RECORDING: "play_circle", LINK: "link" }
                    const typeColors: Record<string, string> = { CHEATSHEET: "#0085FF", ROADMAP: "#4ade80", TEMPLATE: "#FFD700", RECORDING: "#8b5cf6", LINK: "#06b6d4" }
                    const color = typeColors[res.type] || "#555"
                    return (
                      <a
                        key={res.id}
                        href={res.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0d0d0d] border border-white/[0.06] p-5 hover:border-white/10 transition-all group flex flex-col"
                        style={{ borderTop: `2px solid ${color}25` }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
                            <span className="material-symbols-outlined text-lg" style={{ color }}>{typeIcons[res.type] || "description"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm group-hover:text-[#0085FF] transition-colors line-clamp-1">{res.title}</h3>
                            <p className="text-white/25 text-xs mt-0.5 line-clamp-1">{res.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.04]">
                          <span className="text-[9px] text-white/20 uppercase tracking-wider font-bold">{res.type}</span>
                          <span className="text-[9px] text-white/20">{res.downloadCount || 0} downloads</span>
                        </div>
                        {res.isPremium && (
                          <div className="mt-2 text-[10px] text-[#FFD700]/50 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">lock</span> Premium
                          </div>
                        )}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────── SETTINGS TAB ─── */}
          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto px-6 md:px-8 py-8 space-y-5 animate-in fade-in duration-300">
              <h1 className="font-headline font-black text-4xl tracking-tight">Settings</h1>

              {/* Profile card */}
              <div className="bg-[#0d0d0d] border border-white/[0.06] p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#0085FF] flex items-center justify-center text-white text-lg font-black">{initials}</div>
                  <div>
                    <p className="font-bold text-base">{user.name}</p>
                    <p className="text-white/30 text-xs">{user.email}</p>
                    <p className="text-white/15 text-[10px] mt-0.5">Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              {settingsMsg && (
                <div className={`p-3 text-xs border ${settingsMsg.includes("success") ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                  {settingsMsg}
                </div>
              )}

              <div className="bg-[#0d0d0d] border border-white/[0.06] p-6 space-y-5">
                <p className="text-[9px] text-white/25 font-black uppercase tracking-[0.15em]">Basic Info</p>
                {[
                  { key: "name", label: "Full Name", type: "text" },
                  { key: "phone", label: "Phone", type: "tel" },
                  { key: "college", label: "College", type: "text", placeholder: "e.g. IIT Delhi" },
                  { key: "graduationYear", label: "Graduation Year", type: "number", placeholder: "2027" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[9px] text-white/25 font-black uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      value={settingsForm[f.key] || ""}
                      onChange={e => setSettingsForm({ ...settingsForm, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-[#0d0d0d] border border-white/[0.06] p-6 space-y-4">
                <p className="text-[9px] text-white/25 font-black uppercase tracking-[0.15em]">Skills</p>
                {(settingsForm.skills || []).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(settingsForm.skills || []).map((skill: string) => (
                      <span key={skill} className="flex items-center gap-1.5 bg-[#0085FF]/10 text-[#0085FF] text-xs font-bold px-3 py-1 border border-[#0085FF]/20">
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="text-[#0085FF]/40 hover:text-red-400 transition-colors leading-none">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                    placeholder="Add skill (e.g. React)"
                    className={inputCls + " flex-1"}
                  />
                  <button onClick={handleAddSkill} className="bg-white/[0.05] text-white/50 px-4 py-2.5 text-sm hover:bg-white/[0.1] transition-colors font-bold">Add</button>
                </div>
              </div>

              <div className="bg-[#0d0d0d] border border-white/[0.06] p-6 space-y-4">
                <p className="text-[9px] text-white/25 font-black uppercase tracking-[0.15em]">Social Links</p>
                {[
                  { key: "githubUrl", label: "GitHub URL", placeholder: "https://github.com/username" },
                  { key: "linkedinUrl", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/username" },
                  { key: "twitterUrl", label: "Twitter / X URL", placeholder: "https://x.com/username" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-[9px] text-white/25 font-black uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input
                      type="url"
                      value={settingsForm[f.key] || ""}
                      onChange={e => setSettingsForm({ ...settingsForm, [f.key]: e.target.value })}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-[#0d0d0d] border border-white/[0.06] p-6">
                <label className="block text-[9px] text-white/25 font-black uppercase tracking-wider mb-1.5">
                  New Password <span className="text-white/15 normal-case font-normal">(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  value={settingsForm.password || ""}
                  onChange={e => setSettingsForm({ ...settingsForm, password: e.target.value })}
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>

              <button
                onClick={handleSettingsSave}
                disabled={settingsSaving}
                className="w-full bg-[#0085FF] text-white py-3.5 font-black text-sm uppercase tracking-widest hover:bg-[#0070DD] transition-colors disabled:opacity-50"
              >
                {settingsSaving ? "Saving..." : "Save Changes"}
              </button>

              <div className="bg-[#0d0d0d] border border-white/[0.06] p-5 space-y-2.5">
                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.15em] mb-3">Account Info</p>
                {[
                  { label: "Email", value: user.email },
                  { label: "Referral Code", value: user.referralCode, mono: true },
                  { label: "User ID", value: user.id.slice(0, 12) + "…", mono: true, dim: true },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-xs">
                    <span className="text-white/20">{item.label}</span>
                    <span className={`${item.mono ? "font-mono text-[11px]" : ""} ${item.dim ? "text-white/20" : "text-white/50"}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleLogout} className="w-full border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/[0.04] py-3 text-sm font-bold transition-all uppercase tracking-wider">
                Log Out
              </button>
            </div>
          )}

          {/* ──────────────────────── LAUNCHPAD TAB ─── */}
          {activeTab === "firstStep" && <FirstStepTab userName={user.name} />}

          {activeTab === "launchpad" && (
            <div className="animate-in fade-in duration-300 px-6 md:px-8 py-8 max-w-5xl mx-auto space-y-8">

              {launchpadLoading && (
                <div className="flex items-center gap-3 py-16 text-white/20">
                  <div className="w-5 h-5 border-2 border-[#0085FF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading your Launchpad...</span>
                </div>
              )}

              {!launchpadLoading && !launchpadData && (
                <div className="bg-[#0d0d0d] border border-dashed border-white/[0.06] p-16 text-center">
                  <span className="material-symbols-outlined text-4xl text-white/10 block mb-3">rocket_launch</span>
                  <p className="text-white/30 text-sm mb-1">Launchpad data unavailable.</p>
                  <p className="text-white/15 text-xs">Contact your program coordinator if you believe this is an error.</p>
                </div>
              )}

              {!launchpadLoading && launchpadData && (() => {
                const { profile, sessions, bundle, peers, totalAttended, totalSessions } = launchpadData
                const attendancePct = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0
                const goals: string[] = Array.isArray(profile?.goals) ? profile.goals : []
                const isAdvanced = profile?.experienceLevel === "advanced"

                // Find live session — must be flagged live AND within time window (15min before → 3h after sessionDate)
                const now = Date.now()
                const liveSession = sessions?.find((s: any) => {
                  if (!s.isLive) return false
                  if (!s.sessionDate) return true // no date set — trust admin flag
                  const start = new Date(s.sessionDate).getTime()
                  return now >= start - 15 * 60 * 1000 && now <= start + 3 * 60 * 60 * 1000
                })

                // Find today's session
                const todayMidnight = new Date(now)
                todayMidnight.setHours(0, 0, 0, 0)
                const todaySession = sessions?.find((s: any) => {
                  if (!s.sessionDate) return false
                  const d = new Date(s.sessionDate)
                  d.setHours(0, 0, 0, 0)
                  return d.getTime() === todayMidnight.getTime()
                })

                // Streak: consecutive attended sessions counting back from the most recent past session
                const pastSessions = (sessions || [])
                  .filter((s: any) => s.sessionDate && new Date(s.sessionDate) < new Date())
                  .sort((a: any, b: any) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                let streak = 0
                for (const s of pastSessions) {
                  if (s.attended) streak++
                  else break
                }

                // Next upcoming session (not today, not past)
                const nextSession = (sessions || [])
                  .filter((s: any) => {
                    if (!s.sessionDate) return false
                    const sd = new Date(s.sessionDate); sd.setHours(0,0,0,0)
                    return sd > todayMidnight
                  })
                  .sort((a: any, b: any) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())[0]

                // Mission today: single sentence directive
                const lastMissed = pastSessions.find((s: any) => !s.attended && s.recordingUrl)
                const missionText = liveSession
                  ? `${liveSession.title} is LIVE NOW.`
                  : todaySession
                  ? `${todaySession.title} is today${todaySession.sessionDate ? ' at ' + new Date(todaySession.sessionDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}.`
                  : lastMissed
                  ? `You missed W${lastMissed.week}D${lastMissed.day} · ${lastMissed.title}. The recording is ready.`
                  : nextSession
                  ? `Next session in ${Math.ceil((new Date(nextSession.sessionDate).getTime() - Date.now()) / 86400000)} day${Math.ceil((new Date(nextSession.sessionDate).getTime() - Date.now()) / 86400000) === 1 ? '' : 's'}: ${nextSession.title}.`
                  : "You're all caught up. Keep checking for upcoming sessions."

                const sessionsByWeek = [1,2,3,4].map(w => ({
                  week: w,
                  label: ["Orientation","Foundations","Deep Dive","Hackathon"][w-1],
                  sessions: (sessions || []).filter((s: any) => s.week === w).sort((a: any, b: any) => a.day - b.day)
                }))

                const getSessionStatus = (s: any) => {
                  if (s.attended) return "attended"
                  if (s.isLive) return "live"
                  if (!s.sessionDate) return "tbd"
                  const sd = new Date(s.sessionDate); sd.setHours(0,0,0,0)
                  const td = new Date(); td.setHours(0,0,0,0)
                  if (sd.getTime() === td.getTime()) return "today"
                  if (sd < td) return "missed"
                  return "upcoming"
                }

                const statusChip = (status: string) => {
                  const map: Record<string, string> = {
                    attended: "bg-green-500/10 text-green-400 border-green-500/20",
                    live:     "bg-red-500/10 text-red-400 border-red-500/20",
                    today:    "bg-[#0085FF]/10 text-[#0085FF] border-[#0085FF]/20",
                    missed:   "bg-white/[0.04] text-white/20 border-white/[0.06]",
                    upcoming: "bg-white/[0.04] text-white/30 border-white/[0.06]",
                    tbd:      "bg-white/[0.04] text-white/15 border-white/[0.04]",
                  }
                  const labels: Record<string, string> = { attended: "Attended", live: "LIVE NOW", today: "Today", missed: "Missed", upcoming: "Upcoming", tbd: "TBD" }
                  return <span className={`text-[8px] font-black px-2 py-0.5 border uppercase tracking-wider ${map[status] || ""}`}>{labels[status] || status}</span>
                }

                // Track declaration: show if W3D5 is attended and track not yet declared
                const w3d5 = sessions?.find((s: any) => s.week === 3 && s.day === 5)
                const needsTrackDeclaration = w3d5?.attended && !profile?.trackDeclared

                const TRACKS = [
                  { id: 'web',      label: 'Web Dev',       icon: 'web',           color: '#3b82f6', desc: 'Build products people use. Frontend, backend, fullstack.' },
                  { id: 'ai',       label: 'AI / ML',       icon: 'psychology',    color: '#a855f7', desc: 'Build systems that learn. Python, models, data, agents.' },
                  { id: 'security', label: 'Cybersecurity', icon: 'security',      color: '#ef4444', desc: 'Break things to make them safer. CTFs, ethical hacking.' },
                  { id: 'oss',      label: 'Open Source',   icon: 'code_blocks',   color: '#22c55e', desc: 'Build in public. Contribute to real projects, earn credibility.' },
                ]

                if (needsTrackDeclaration) {
                  return (
                    <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[60vh] gap-8 py-12">
                      <div className="text-center">
                        <span className="text-[9px] font-black text-[#0085FF] uppercase tracking-[0.25em] block mb-3">Week 3 Complete</span>
                        <h2 className="font-headline font-black text-3xl mb-2">Which domain are you pursuing?</h2>
                        <p className="text-white/30 text-sm max-w-sm mx-auto">You've experienced all 4 domains. This choice shapes your next steps, your hackathon track, and how we support you going forward.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                        {TRACKS.map(t => (
                          <button
                            key={t.id}
                            disabled={trackDeclaring}
                            onClick={async () => {
                              setTrackDeclaring(true)
                              await fetch('/api/user/launchpad/track', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ track: t.id }),
                              })
                              setLaunchpadData((prev: any) => prev ? {
                                ...prev,
                                profile: { ...(prev.profile || {}), trackDeclared: t.id }
                              } : prev)
                              setTrackDeclaring(false)
                            }}
                            className="flex items-start gap-4 p-5 border border-white/[0.08] bg-[#0d0d0d] hover:border-white/20 hover:bg-[#111] transition-all text-left group disabled:opacity-40"
                          >
                            <span className="material-symbols-outlined text-2xl mt-0.5 shrink-0 transition-colors" style={{ color: t.color, fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                            <div>
                              <p className="font-bold text-sm mb-1">{t.label}</p>
                              <p className="text-[11px] text-white/35 leading-relaxed">{t.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-white/15">You can change this later from Settings.</p>
                    </div>
                  )
                }

                return (
                  <>
                    {/* Hero */}
                    <div className="relative border border-white/[0.05] overflow-hidden bg-[#0d0d0d]">
                      <div className="absolute inset-0 brutalist-grid opacity-20 pointer-events-none" />
                      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#0085FF]/[0.06] blur-3xl pointer-events-none" />
                      <div className="relative px-6 py-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="material-symbols-outlined text-[#0085FF] text-base" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                              <span className="text-[9px] font-black text-[#0085FF] uppercase tracking-[0.2em]">Launchpad 2026</span>
                            </div>
                            <h2 className="font-headline font-black text-3xl leading-none mb-2">
                              {user.name.split(" ")[0]}<span className="text-[#0085FF]">.</span>
                            </h2>
                            {profile?.motivation && (
                              <p className="text-white/30 text-xs italic max-w-md leading-relaxed">"{profile.motivation}"</p>
                            )}
                          </div>
                          <div className="shrink-0 text-right flex flex-col items-end gap-2">
                            <span className={`text-[9px] font-black px-3 py-1.5 border uppercase tracking-widest ${isAdvanced ? 'border-[#0085FF]/40 bg-[#0085FF]/10 text-[#0085FF]' : 'border-white/10 bg-white/[0.04] text-white/40'}`}>
                              {isAdvanced ? "Advanced Track" : "Beginner Track"}
                            </span>
                            {profile?.trackDeclared && (() => {
                              const trackMeta: Record<string, {label: string, color: string}> = {
                                web: { label: 'Web Dev', color: '#3b82f6' },
                                ai: { label: 'AI / ML', color: '#a855f7' },
                                security: { label: 'Cybersecurity', color: '#ef4444' },
                                oss: { label: 'Open Source', color: '#22c55e' },
                              }
                              const tm = trackMeta[profile.trackDeclared]
                              return tm ? (
                                <span className="text-[9px] font-black px-3 py-1.5 border uppercase tracking-widest" style={{ borderColor: `${tm.color}40`, color: tm.color, background: `${tm.color}10` }}>
                                  {tm.label}
                                </span>
                              ) : null
                            })()}
                            {streak > 0 && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20">
                                <span className="text-base leading-none">🔥</span>
                                <span className="text-[11px] font-black text-orange-400">{streak}</span>
                                <span className="text-[9px] text-orange-400/60 font-bold uppercase">streak</span>
                              </div>
                            )}
                            {bundle?.startDate && (
                              <p className="text-[10px] text-white/20">
                                Started {new Date(bundle.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mission today card */}
                        <div className={`mt-4 flex items-center gap-3 px-3 py-2.5 border ${liveSession ? 'border-red-500/30 bg-red-500/[0.04]' : todaySession ? 'border-[#0085FF]/20 bg-[#0085FF]/[0.03]' : 'border-white/[0.05] bg-white/[0.02]'}`}>
                          <span className={`material-symbols-outlined text-base shrink-0 ${liveSession ? 'text-red-400' : todaySession ? 'text-[#0085FF]' : 'text-white/20'}`}>
                            {liveSession ? 'videocam' : todaySession ? 'today' : 'arrow_forward'}
                          </span>
                          <p className="text-[11px] text-white/50 flex-1">{missionText}</p>
                          {liveSession?.joinLink && (
                            <a href={liveSession.joinLink} target="_blank" rel="noopener noreferrer"
                              className="text-[9px] font-black text-red-400 border border-red-500/30 px-3 py-1.5 hover:bg-red-500/10 transition-colors uppercase tracking-wider shrink-0">
                              Join
                            </a>
                          )}
                          {!liveSession && lastMissed?.recordingUrl && (
                            <a href={lastMissed.recordingUrl} target="_blank" rel="noopener noreferrer"
                              className="text-[9px] font-black text-white/30 border border-white/[0.08] px-3 py-1.5 hover:text-white/60 transition-colors uppercase tracking-wider shrink-0">
                              Watch
                            </a>
                          )}
                        </div>

                        {/* Session heatmap */}
                        <div className="mt-5 pt-5 border-t border-white/[0.05]">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-wider">Attendance</span>
                            <span className="text-[9px] font-mono text-white/30">{totalAttended}/{totalSessions} · {attendancePct}%</span>
                          </div>
                          {/* 4×5 heatmap grid */}
                          <div className="grid grid-cols-5 gap-1.5 mb-3">
                            {[1,2,3,4].flatMap(w =>
                              [1,2,3,4,5].map(d => {
                                const s = sessions?.find((x: any) => x.week === w && x.day === d)
                                if (!s) return (
                                  <div key={`${w}-${d}`} className="h-6 bg-white/[0.03] border border-dashed border-white/[0.04]" title={`W${w}D${d}`} />
                                )
                                const st = getSessionStatus(s)
                                const cellColor = st === 'attended' ? 'bg-[#0085FF] border-[#0085FF]/60'
                                  : st === 'live' ? 'bg-red-500 border-red-500 animate-pulse'
                                  : st === 'today' ? 'bg-[#0085FF]/40 border-[#0085FF]/50'
                                  : st === 'missed' ? 'bg-red-900/40 border-red-900/30'
                                  : 'bg-white/[0.04] border-white/[0.06]'
                                return (
                                  <div
                                    key={s.id}
                                    className={`h-6 border ${cellColor} cursor-pointer transition-all hover:opacity-80`}
                                    title={`W${w}D${d} · ${s.title}`}
                                    onClick={() => { setLaunchpadWeek(w); setExpandedSessionId(s.id) }}
                                  />
                                )
                              })
                            )}
                          </div>
                          {/* week labels */}
                          <div className="grid grid-cols-4 gap-1.5 mb-3">
                            {['Orientation','Foundations','Deep Dive','Hackathon'].map((l, i) => (
                              <p key={l} className="text-[8px] text-white/15 font-bold uppercase tracking-wider text-center col-span-1">{`W${i+1}`}</p>
                            ))}
                          </div>
                          {/* cert thresholds */}
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-[#0085FF]" />
                              <span className="text-[8px] text-white/20">Attended</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 bg-red-900/50 border border-red-900/30" />
                              <span className="text-[8px] text-white/20">Missed</span>
                            </div>
                            <span className={`ml-auto text-[9px] font-bold ${attendancePct >= 80 ? 'text-green-400' : attendancePct >= 50 ? 'text-yellow-400' : 'text-white/20'}`}>
                              {attendancePct >= 80 ? 'Completion cert earned' : attendancePct >= 50 ? 'Participation cert · need 80% for Completion' : `${80 - attendancePct}% more for Participation cert`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIVE NOW banner */}
                    {liveSession && (
                      <div className="border border-red-500/30 bg-red-500/[0.04] p-4 flex items-center gap-4">
                        <span className="w-2 h-2 bg-red-500 animate-ping shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-black text-red-400 uppercase tracking-wide">Session is LIVE NOW</p>
                          <p className="text-white/50 text-xs mt-0.5">W{liveSession.week}D{liveSession.day} · {liveSession.title}</p>
                        </div>
                        {liveSession.joinLink && (
                          <a href={liveSession.joinLink} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-red-500 text-white px-5 py-2.5 font-black text-xs uppercase tracking-widest hover:bg-red-400 transition-colors">
                            JOIN NOW
                          </a>
                        )}
                      </div>
                    )}

                    {/* Today's session */}
                    {todaySession && !liveSession && (
                      <div className="border border-[#0085FF]/30 bg-[#0085FF]/[0.04] p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-[9px] font-black text-[#0085FF] uppercase tracking-[0.15em] mb-1">Today's Session · W{todaySession.week}D{todaySession.day}</p>
                            <p className="font-bold text-base">{todaySession.title}</p>
                            {Array.isArray(todaySession.topics) && todaySession.topics.length > 0 && (
                              <ul className="mt-3 space-y-1">
                                {todaySession.topics.slice(0, 3).map((t: string, i: number) => (
                                  <li key={i} className="text-white/40 text-xs flex items-start gap-2">
                                    <span className="text-[#0085FF]/40 mt-0.5 shrink-0">—</span>{t}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {todaySession.homework && (
                              <div className="mt-3 pt-3 border-t border-white/[0.05]">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-wider mb-1">Homework</p>
                                <p className="text-white/40 text-xs italic">{todaySession.homework}</p>
                              </div>
                            )}
                          </div>
                          {todaySession.joinLink && (
                            <a href={todaySession.joinLink} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-[#0085FF] text-white px-5 py-2.5 font-black text-xs uppercase tracking-widest hover:bg-[#0070DD] transition-colors">
                              Join Session
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Skills acquired */}
                    {(() => {
                      const SKILL_MAP: Record<string, string[]> = {
                        '2-1': ['Terminal', 'Git', 'GitHub'],
                        '2-2': ['Python'],
                        '2-3': ['HTML', 'CSS'],
                        '2-4': ['JavaScript', 'APIs'],
                        '2-5': ['Mini Project'],
                        '3-1': ['React (intro)', 'Node.js (intro)'],
                        '3-2': ['AI/ML', 'Prompt Engineering'],
                        '3-3': ['CTF Basics', 'SQL Injection'],
                        '3-4': ['Open Source', 'Git PRs'],
                        '3-5': ['LinkedIn', 'Developer Branding'],
                      }
                      const unlockedSkills = (sessions || [])
                        .filter((s: any) => s.attended)
                        .flatMap((s: any) => SKILL_MAP[`${s.week}-${s.day}`] || [])
                      if (unlockedSkills.length === 0) return null
                      return (
                        <section>
                          <h3 className="font-headline font-bold text-xs text-white/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-sm text-green-400">bolt</span>
                            Skills Acquired
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {unlockedSkills.map((skill: string) => (
                              <span key={skill} className="text-[10px] font-bold border border-green-500/20 bg-green-500/[0.06] text-green-400/80 px-3 py-1.5 uppercase tracking-wider">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </section>
                      )
                    })()}

                    {/* Goals */}
                    {goals.length > 0 && (
                      <section>
                        <h3 className="font-headline font-bold text-xs text-white/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-sm text-[#0085FF]">flag</span>
                          Your Goals
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {goals.map((g: string) => (
                            <span key={g} className="text-[10px] font-bold border border-[#0085FF]/30 bg-[#0085FF]/[0.06] text-[#0085FF]/80 px-3 py-1.5 uppercase tracking-wider">
                              {g.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* 4-Week Curriculum */}
                    <section>
                      <h3 className="font-headline font-bold text-xs text-white/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-sm text-[#0085FF]">calendar_month</span>
                        Program Curriculum
                      </h3>

                      {/* Week selector */}
                      <div className="flex gap-0 mb-5 border border-white/[0.06] w-fit">
                        {[1,2,3,4].map(w => (
                          <button
                            key={w}
                            onClick={() => setLaunchpadWeek(w)}
                            className={`px-4 py-2.5 text-xs font-black uppercase tracking-widest transition-colors border-r last:border-r-0 border-white/[0.06] ${launchpadWeek === w ? 'bg-[#0085FF] text-white' : 'text-white/25 hover:text-white/60 hover:bg-white/[0.03]'}`}
                          >
                            W{w}
                          </button>
                        ))}
                      </div>

                      {/* Session cards for selected week */}
                      {(() => {
                        const wk = sessionsByWeek.find(w => w.week === launchpadWeek)
                        if (!wk) return <p className="text-white/20 text-xs">No sessions created for this week yet.</p>
                        return (
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-[10px] font-black text-[#0085FF] uppercase tracking-[0.2em]">Week {launchpadWeek}</span>
                              <span className="text-white/20 text-[10px]">— {wk.label}</span>
                            </div>
                            <div className="space-y-1.5">
                              {wk.sessions.length === 0 && <p className="text-white/20 text-xs italic">Sessions coming soon.</p>}
                              {wk.sessions.map((s: any) => {
                                const status = getSessionStatus(s)
                                const isExpanded = expandedSessionId === s.id
                                const resources: any[] = Array.isArray(s.resourceLinks) ? s.resourceLinks : []
                                const noteVal = sessionNotes[s.id] ?? ''

                                const borderClass = status === 'attended' ? 'border-green-500/20 bg-green-500/[0.02]'
                                  : status === 'live' ? 'border-red-500/40 bg-red-500/[0.03]'
                                  : status === 'today' ? 'border-[#0085FF]/40 bg-[#0085FF]/[0.03]'
                                  : status === 'missed' ? 'border-white/[0.04] bg-[#0a0a0a]'
                                  : status === 'tbd' ? 'border-dashed border-white/[0.04] bg-[#0d0d0d]'
                                  : 'border-white/[0.06] bg-[#0d0d0d]'

                                const leftBarClass = status === 'attended' ? 'bg-green-500'
                                  : status === 'live' ? 'bg-red-500'
                                  : status === 'today' ? 'bg-[#0085FF]'
                                  : status === 'missed' ? 'bg-white/10'
                                  : 'bg-transparent'

                                return (
                                  <div key={s.id} className={`border transition-all relative overflow-hidden ${borderClass}`}>
                                    {/* left status bar */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${leftBarClass}`} />

                                    {/* header row — click to expand */}
                                    <div
                                      className="flex items-center gap-3 px-4 py-3.5 pl-5 cursor-pointer select-none"
                                      onClick={() => setExpandedSessionId(isExpanded ? null : s.id)}
                                    >
                                      <div className="shrink-0 w-6 text-center">
                                        {status === 'attended' ? (
                                          <span className="material-symbols-outlined text-green-400 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        ) : status === 'live' ? (
                                          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping block mx-auto mt-1" />
                                        ) : (
                                          <span className="text-[10px] font-black text-white/20 block">D{s.day}</span>
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <p className={`font-bold text-sm leading-tight ${status === 'missed' ? 'text-white/30' : ''}`}>{s.title}</p>
                                          {statusChip(status)}
                                        </div>
                                        {s.sessionDate && (
                                          <p className="text-[10px] text-white/20 mt-0.5">
                                            {new Date(s.sessionDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                          </p>
                                        )}
                                      </div>

                                      {/* action buttons — stop propagation so clicks don't toggle expand */}
                                      <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                                        {s.joinLink && (status === 'today' || status === 'live') && (
                                          <a href={s.joinLink} target="_blank" rel="noopener noreferrer"
                                            className={`text-[9px] font-black px-3 py-1.5 uppercase tracking-wider transition-colors whitespace-nowrap ${status === 'live' ? 'bg-red-500 text-white hover:bg-red-400' : 'border border-[#0085FF]/40 text-[#0085FF] hover:bg-[#0085FF]/10'}`}>
                                            {status === 'live' ? 'Join Now' : 'Join'}
                                          </a>
                                        )}
                                      </div>
                                      <span className="material-symbols-outlined text-[14px] text-white/15 shrink-0">
                                        {isExpanded ? 'expand_less' : 'expand_more'}
                                      </span>
                                    </div>

                                    {/* expanded panel */}
                                    {isExpanded && (
                                      <div className="border-t border-white/[0.05] px-5 py-4 space-y-4">
                                        {/* topics */}
                                        {Array.isArray(s.topics) && s.topics.length > 0 && (
                                          <div>
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.15em] mb-2">What We Cover</p>
                                            <ul className="space-y-1.5">
                                              {s.topics.map((t: string, i: number) => (
                                                <li key={i} className="text-[11px] text-white/40 flex items-start gap-2">
                                                  <span className="text-[#0085FF]/30 mt-px shrink-0">—</span>{t}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        {/* homework */}
                                        {s.homework && (
                                          <div className="space-y-2">
                                            <div className="bg-[#0085FF]/[0.04] border border-[#0085FF]/10 px-3 py-3">
                                              <p className="text-[8px] font-black text-[#0085FF]/60 uppercase tracking-[0.15em] mb-1.5">Homework</p>
                                              <p className="text-[11px] text-white/50 leading-relaxed">{s.homework}</p>
                                            </div>
                                            {/* submission UI */}
                                            {s.homeworkType && s.homeworkType !== 'none' && (() => {
                                              const sub = s.homework_submission
                                              const statusColor = sub?.status === 'verified' ? 'text-green-400' : sub?.status === 'seen' ? 'text-[#0085FF]' : 'text-yellow-400'
                                              const statusLabel = sub?.status === 'verified' ? 'Verified ✓' : sub?.status === 'seen' ? 'Seen by mentor' : 'Submitted · pending review'
                                              if (sub) {
                                                return (
                                                  <div className="flex items-center gap-3 px-3 py-2.5 border border-white/[0.06] bg-[#0d0d0d]">
                                                    <span className="material-symbols-outlined text-base text-green-400" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                                                    <div className="flex-1 min-w-0">
                                                      {sub.content && <p className="text-[10px] text-white/40 truncate">{sub.content}</p>}
                                                      <p className={`text-[9px] font-bold ${statusColor}`}>{statusLabel}</p>
                                                    </div>
                                                    <button
                                                      className="text-[9px] text-white/20 hover:text-white/40 transition-colors"
                                                      onClick={e => {
                                                        e.stopPropagation()
                                                        setLaunchpadData((prev: any) => prev ? {
                                                          ...prev,
                                                          sessions: prev.sessions.map((x: any) => x.id === s.id ? { ...x, homework_submission: null } : x)
                                                        } : prev)
                                                      }}
                                                    >Edit</button>
                                                  </div>
                                                )
                                              }
                                              return (
                                                <HomeworkSubmitPanel
                                                  session={s}
                                                  onSubmitted={(result: any) => {
                                                    setLaunchpadData((prev: any) => prev ? {
                                                      ...prev,
                                                      sessions: prev.sessions.map((x: any) => x.id === s.id ? { ...x, homework_submission: result } : x)
                                                    } : prev)
                                                  }}
                                                />
                                              )
                                            })()}
                                          </div>
                                        )}

                                        {/* resources */}
                                        {resources.length > 0 && (
                                          <div>
                                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.15em] mb-2">Resources</p>
                                            <div className="flex flex-wrap gap-2">
                                              {resources.map((r: any, i: number) => (
                                                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                                                  className="text-[10px] font-bold border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 px-3 py-1.5 transition-colors flex items-center gap-1.5">
                                                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                                  {r.label}
                                                </a>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {/* recording */}
                                        {s.recordingUrl && (
                                          <a href={s.recordingUrl} target="_blank" rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-[10px] font-black border border-white/[0.08] text-white/40 hover:text-white hover:border-white/20 px-4 py-2 transition-colors uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-[14px]">play_circle</span>
                                            Watch Recording
                                          </a>
                                        )}

                                        {/* personal notes */}
                                        <div>
                                          <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.15em] mb-2">My Notes</p>
                                          <textarea
                                            className="w-full bg-[#060606] border border-white/[0.06] px-3 py-2.5 text-[11px] text-white/50 placeholder:text-white/15 outline-none focus:border-white/[0.15] transition-colors resize-none font-body"
                                            rows={3}
                                            placeholder="Write your notes for this session..."
                                            value={noteVal}
                                            onClick={e => e.stopPropagation()}
                                            onChange={e => {
                                              const val = e.target.value
                                              setSessionNotes(prev => ({ ...prev, [s.id]: val }))
                                              setNoteSaveTimer(prev => {
                                                if (prev[s.id]) clearTimeout(prev[s.id])
                                                return {
                                                  ...prev,
                                                  [s.id]: setTimeout(() => {
                                                    fetch('/api/user/launchpad/notes', {
                                                      method: 'PATCH',
                                                      headers: { 'Content-Type': 'application/json' },
                                                      body: JSON.stringify({ sessionId: s.id, note: val }),
                                                    })
                                                  }, 1000)
                                                }
                                              })
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })()}
                    </section>

                    {/* REcoins info */}
                    <section>
                      <h3 className="font-headline font-bold text-xs text-white/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-sm text-[#FFD700]">paid</span>
                        REcoins — Week 4 Hackathon
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { label: "1st Place", coins: "■1,000", color: "#FFD700" },
                          { label: "2nd Place", coins: "■600", color: "#C0C0C0" },
                          { label: "3rd Place", coins: "■300", color: "#CD7F32" },
                          { label: "Best Domain ×4", coins: "■200", color: "#8b5cf6" },
                          { label: "Participation", coins: "■100", color: "#4ade80" },
                        ].map(r => (
                          <div key={r.label} className="bg-[#0d0d0d] border border-white/[0.06] p-3 text-center">
                            <p className="font-headline font-black text-lg leading-none" style={{ color: r.color }}>{r.coins}</p>
                            <p className="text-[9px] text-white/25 mt-1 uppercase tracking-wider">{r.label}</p>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-white/20 mt-3">REcoins are redeemable as direct discounts on any future REvamp cohort. Valid 12 months from issue.</p>
                    </section>

                    {/* Profile checklist */}
                    {/* Badge wall */}
                    {launchpadBadges.length > 0 && (
                      <section>
                        <h3 className="font-headline font-bold text-xs text-white/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-sm text-[#FFD700]">military_tech</span>
                          Badges
                          <span className="text-white/20 font-normal normal-case tracking-normal text-[10px]">
                            {launchpadBadges.filter(b => b.earned).length}/{launchpadBadges.length} earned
                          </span>
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {launchpadBadges.map((b: any) => (
                            <div
                              key={b.id}
                              title={b.desc}
                              className={`flex flex-col items-center gap-1.5 p-3 border text-center transition-all ${b.earned ? 'border-[#FFD700]/30 bg-[#FFD700]/[0.04]' : 'border-white/[0.04] bg-[#0d0d0d] opacity-35'}`}
                            >
                              <span
                                className={`material-symbols-outlined text-xl ${b.earned ? 'text-[#FFD700]' : 'text-white/20'}`}
                                style={b.earned ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                {b.icon}
                              </span>
                              <p className={`text-[9px] font-black uppercase tracking-wider leading-tight ${b.earned ? 'text-white/70' : 'text-white/20'}`}>{b.label}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <h3 className="font-headline font-bold text-xs text-white/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-sm text-white/30">checklist</span>
                        Profile Checklist
                      </h3>
                      <div className="space-y-2">
                        {[
                          { label: "GitHub account", done: !!user.githubUrl, cta: "Add in Settings →", link: false },
                          { label: "LinkedIn profile", done: !!user.linkedinUrl, cta: "Add in Settings →", link: false },
                        ].map(item => (
                          <div key={item.label} className={`flex items-center gap-3 p-3 border ${item.done ? 'border-green-500/20 bg-green-500/[0.03]' : 'border-white/[0.06] bg-[#0d0d0d]'}`}>
                            <span className={`material-symbols-outlined text-base ${item.done ? 'text-green-400' : 'text-white/15'}`} style={{ fontVariationSettings: item.done ? "'FILL' 1" : "" }}>
                              {item.done ? 'check_circle' : 'radio_button_unchecked'}
                            </span>
                            <span className={`text-sm flex-1 ${item.done ? 'text-white/50 line-through' : ''}`}>{item.label}</span>
                            {!item.done && <button onClick={() => switchTab("settings")} className="text-[10px] font-bold text-[#0085FF] hover:underline">{item.cta}</button>}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Cohort peers */}
                    {peers && peers.length > 0 && (
                      <section>
                        <h3 className="font-headline font-bold text-xs text-white/40 uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-sm text-white/30">group</span>
                          Your Cohort — {peers.length + 1} students
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {peers.map((p: any) => {
                            const cs = p.connectionState || 'none'
                            return (
                              <div key={p.id} className="bg-[#0d0d0d] border border-white/[0.05] p-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-[#0085FF]/20 flex items-center justify-center shrink-0">
                                    <span className="text-[9px] font-black text-[#0085FF]">{p.name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0,2)}</span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate">{p.name?.split(" ")[0]}</p>
                                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-[#0085FF]/60 hover:text-[#0085FF] transition-colors">GitHub ↗</a>}
                                  </div>
                                </div>
                                {cs === 'connected' ? (
                                  <span className="text-[9px] font-bold text-green-400/70 uppercase tracking-wider">Connected ✓</span>
                                ) : cs === 'pending_out' ? (
                                  <span className="text-[9px] font-bold text-white/25 uppercase tracking-wider">Request sent</span>
                                ) : cs === 'pending_in' ? (
                                  <button onClick={() => handleAcceptConnection(p.connectionId)} className="text-[9px] font-bold text-yellow-400/80 uppercase tracking-wider hover:text-yellow-400 transition-colors text-left">Accept →</button>
                                ) : (
                                  <button onClick={() => handleConnect(p.id)} disabled={connectingTo === p.id} className="text-[9px] font-bold text-[#0085FF]/60 hover:text-[#0085FF] uppercase tracking-wider transition-colors text-left disabled:opacity-40">
                                    {connectingTo === p.id ? '...' : '+ Connect'}
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    )}
                  </>
                )
              })()}

            </div>
          )}

        </main>
      </div>

      {/* ═══════════════════════════ MOBILE BOTTOM NAV ═══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#080808]/98 backdrop-blur-xl border-t border-white/[0.05] flex justify-around py-2 px-1 z-50">
        {TABS.slice(0, 5).map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 transition-all relative ${isActive ? "text-[#0085FF]" : "text-white/20 hover:text-white/40"}`}
            >
              {tab.id === "orders" && pendingOrders > 0 && (
                <span className="absolute top-0 right-1 w-3 h-3 bg-[#0085FF] text-[7px] font-black text-white flex items-center justify-center">{pendingOrders}</span>
              )}
              <span
                className="material-symbols-outlined text-[20px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" } : {}}
              >
                {tab.icon}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider">{tab.label.split(" ").pop()}</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}

export default function UserDashboard() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#060606]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#0085FF] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/20 text-xs font-bold uppercase tracking-widest">Loading</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
