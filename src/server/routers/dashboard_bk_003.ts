"use client"

import { useRouter } from "next/navigation"
import { api }       from "@/lib/trpc"

// ─── Colour tokens (matches FRP-BC teal brand) ────────────────────────────────
const TEAL       = "#396A72"
const TEAL_DARK  = "#2c5359"
const TEAL_LIGHT = "#F2F9F9"

// ─── Pipeline stage config ────────────────────────────────────────────────────
const STAGE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  prospect:    { label: "Prospect",    color: "#6B7280", bg: "#F3F4F6" },
  qualified:   { label: "Qualified",   color: "#2563EB", bg: "#EFF6FF" },
  proposal:    { label: "Proposal",    color: "#7C3AED", bg: "#F5F3FF" },
  negotiation: { label: "Negotiation", color: "#D97706", bg: "#FFFBEB" },
  won:         { label: "Won",         color: "#059669", bg: "#ECFDF5" },
  lost:        { label: "Lost",        color: "#DC2626", bg: "#FEF2F2" },
}

// ─── Activity type config ─────────────────────────────────────────────────────
const ACTIVITY_CONFIG: Record<string, { icon: JSX.Element; bg: string; color: string }> = {
  call: {
    bg: "#EFF6FF", color: "#2563EB",
    icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.66A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  },
  email: {
    bg: "#F5F3FF", color: "#7C3AED",
    icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  meeting: {
    bg: "#ECFDF5", color: "#059669",
    icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  note: {
    bg: "#FFFBEB", color: "#D97706",
    icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  task: {
    bg: "#FEF2F2", color: "#DC2626",
    icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
  status_changed: {
    bg: TEAL_LIGHT, color: TEAL,
    icon: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-CA", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

function formatRelative(d: string | Date | null | undefined) {
  if (!d) return "—"
  const ms   = Date.now() - new Date(d).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30)  return `${days}d ago`
  return new Date(d).toLocaleDateString("en-CA", { month: "short", day: "numeric" })
}

function initials(first: string | null, last: string | null) {
  return [(first ?? "")[0], (last ?? "")[0]].filter(Boolean).join("").toUpperCase() || "?"
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, subUp, icon, onClick,
}: {
  label:   string
  value:   number | string
  sub?:    string
  subUp?:  boolean
  icon:    JSX.Element
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-5 text-left
                 hover:border-[#396A72] hover:shadow-sm transition-all group w-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#F2F9F9] text-[#396A72] flex items-center
                        justify-center group-hover:bg-[#396A72] group-hover:text-white
                        transition-colors flex-shrink-0">
          {icon}
        </div>
        {sub && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            subUp
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}>
            {sub}
          </span>
        )}
      </div>
      <p className="text-3xl font-extrabold text-gray-900 mb-0.5 tabular-nums">
        {value}
      </p>
      <p className="text-sm text-gray-500">{label}</p>
    </button>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({
  title, action, onAction,
}: {
  title:    string
  action?:  string
  onAction?: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="text-sm text-[#396A72] font-semibold hover:underline"
        >
          {action}
        </button>
      )}
    </div>
  )
}

// ─── Skeleton loader ───────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />
}

// ─── Main dashboard page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()

  const { data: stats,    isLoading: statsLoading }    = api.stats.getStats.useQuery()
  const { data: activity, isLoading: activityLoading } = api.stats.getRecentActivity.useQuery({ limit: 8 })
  const { data: recentContacts }                       = api.stats.getRecentContacts.useQuery({ limit: 5 })
  const { data: recentDeals }                          = api.stats.getRecentDeals.useQuery({ limit: 5 })
  const { data: pipeline }                             = api.stats.getPipelineSummary.useQuery()

  // Pipeline totals
  const pipelineTotal  = pipeline?.reduce((s, r) => s + r.total, 0) ?? 0
  const pipelineMax    = Math.max(...(pipeline?.map(r => r.total) ?? [1]), 1)

  const greetingHour   = new Date().getHours()
  const greeting       = greetingHour < 12 ? "Good morning" : greetingHour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="min-h-screen bg-[#F5F7F7]">

      {/* ── Top header ────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-8 py-7">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-0.5">{greeting}</p>
            <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          </div>
          <button
            onClick={() => router.push("/agencies/new")}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#396A72] hover:bg-[#2c5359]
                       text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5"  y1="12" x2="19" y2="12"/>
            </svg>
            Add Agency
          </button>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">

        {/* ── Stat cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
                <Skeleton className="w-10 h-10 rounded-xl mb-4" />
                <Skeleton className="w-16 h-8 mb-1.5" />
                <Skeleton className="w-24 h-4" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                label="Total Agencies"
                value={stats?.totalAgencies ?? 0}
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                }
                onClick={() => router.push("/agencies")}
              />
              <StatCard
                label="Total Contacts"
                value={stats?.totalContacts ?? 0}
                sub={stats?.newContacts ? `+${stats.newContacts} this month` : undefined}
                subUp={true}
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                }
                onClick={() => router.push("/data")}
              />
              <StatCard
                label="Active Deals"
                value={stats?.totalDeals ?? 0}
                sub={stats?.newDeals ? `+${stats.newDeals} this month` : undefined}
                subUp={true}
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                }
                onClick={() => router.push("/data")}
              />
              <StatCard
                label="Team Members"
                value={stats?.totalUsers ?? 0}
                icon={
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M20 21a8 8 0 10-16 0"/>
                  </svg>
                }
                onClick={() => router.push("/data")}
              />
            </>
          )}
        </div>

        {/* ── Main body grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

          {/* Left column */}
          <div className="space-y-6">

            {/* Pipeline summary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <SectionHeader
                title="Pipeline"
                action="View all deals →"
                onAction={() => router.push("/data")}
              />

              {!pipeline || pipeline.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  No deals in pipeline yet.
                  <button
                    onClick={() => router.push("/data")}
                    className="block mx-auto mt-2 text-[#396A72] font-semibold hover:underline"
                  >
                    Add your first deal →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {pipeline
                    .filter(r => r.stage !== "lost")
                    .sort((a, b) => {
                      const order = ["prospect","qualified","proposal","negotiation","won"]
                      return order.indexOf(a.stage) - order.indexOf(b.stage)
                    })
                    .map(row => {
                      const cfg = STAGE_CONFIG[row.stage] ?? STAGE_CONFIG.prospect
                      const pct = pipelineMax > 0 ? (row.total / pipelineMax) * 100 : 0
                      return (
                        <div key={row.stage} className="flex items-center gap-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full w-28
                                       flex-shrink-0 text-center"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width:      `${pct}%`,
                                background: cfg.color,
                                opacity:    0.7,
                              }}
                            />
                          </div>
                          <div className="text-right flex-shrink-0 w-24">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency(row.total)}
                            </span>
                            <span className="text-xs text-gray-400 ml-1.5">
                              {row.count} deal{row.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      )
                    })}

                  {/* Total */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total pipeline value</span>
                    <span className="text-base font-extrabold text-gray-900">
                      {formatCurrency(pipelineTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Recent contacts */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <SectionHeader
                title="Recent Contacts"
                action="View all →"
                onAction={() => router.push("/data")}
              />

              {!recentContacts || recentContacts.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  No contacts yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {recentContacts.map((c, i) => {
                    const COLORS = [
                      "bg-[#E1F5EE] text-[#396A72]",
                      "bg-blue-50 text-blue-600",
                      "bg-purple-50 text-purple-600",
                      "bg-orange-50 text-orange-700",
                      "bg-pink-50 text-pink-600",
                    ]
                    return (
                      <div key={c.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                         font-bold text-sm flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                          {initials(c.firstName, c.lastName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {c.email ?? c.company ?? "—"}
                          </p>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{
                            background: c.status === "active" ? "#ECFDF5" : "#F3F4F6",
                            color:      c.status === "active" ? "#059669" : "#6B7280",
                          }}
                        >
                          {c.status ?? "lead"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right column — activity feed */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit">
            <SectionHeader
              title="Recent Activity"
              action="View all →"
              onAction={() => router.push("/agencies")}
            />

            {activityLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !activity || activity.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F2F9F9] text-[#396A72] flex
                                items-center justify-center mx-auto mb-3">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">No activity yet</p>
                <p className="text-xs text-gray-400 max-w-[200px] mx-auto">
                  Log a call, email, or meeting to track agency interactions.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {activity.map((act, i) => {
                  const cfg = ACTIVITY_CONFIG[act.type] ?? ACTIVITY_CONFIG.note
                  return (
                    <div
                      key={act.id ?? i}
                      className="flex items-start gap-3 py-3 border-b border-gray-50
                                 last:border-b-0 cursor-pointer hover:bg-[#F9FAFB]
                                 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center flex-shrink-0 mt-0.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: cfg.bg, color: cfg.color }}
                        >
                          {cfg.icon}
                        </div>
                        {i < (activity.length - 1) && (
                          <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[12px]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pb-1">
                        <p className="text-sm font-medium text-gray-900 leading-tight">
                          {act.title}
                        </p>
                        {act.description && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {act.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-300 mt-1">
                          {formatRelative(act.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* ── Recent deals ─────────────────────────────────────────────────── */}
        {recentDeals && recentDeals.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <SectionHeader
              title="Recent Deals"
              action="View all →"
              onAction={() => router.push("/data")}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Deal", "Amount", "Stage", "Probability", "Close Date"].map(h => (
                      <th key={h}
                        className="text-left text-xs font-semibold text-gray-400
                                   uppercase tracking-wider pb-3 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentDeals.map(d => {
                    const cfg = STAGE_CONFIG[d.stage ?? "prospect"] ?? STAGE_CONFIG.prospect
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="py-3.5 pr-4 font-medium text-gray-900">{d.name}</td>
                        <td className="py-3.5 pr-4 font-semibold text-gray-900">
                          {d.amount
                            ? formatCurrency(Number(d.amount))
                            : "—"}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width:      `${d.probability ?? 0}%`,
                                  background: TEAL,
                                  opacity:    0.7,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-400 tabular-nums">
                              {d.probability ?? 0}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 text-gray-400 text-xs">
                          {d.closeDate
                            ? new Date(d.closeDate).toLocaleDateString("en-CA", {
                                month: "short", day: "numeric", year: "numeric",
                              })
                            : "—"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
