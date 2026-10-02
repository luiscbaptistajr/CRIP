"use client"

import { useRouter } from "next/navigation"
import { api } from "@/lib/trpc"
import { Button } from "@/components/ui/button"
import { Badge }  from "@/components/ui/badge"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-[#E1F5EE] text-[#396A72]",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
]

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

function formatDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })
}

function statusClass(status: string) {
  return status === "Active"
    ? "bg-[#E7F3EB] text-[#2C6A47]"
    : "bg-[#E3E5E6] text-[#4B5563]"
}

// ─── Activity icon ─────────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, { bg: string; icon: JSX.Element }> = {
  call: {
    bg: "bg-blue-50 text-blue-600",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.66A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  },
  email: {
    bg: "bg-purple-50 text-purple-600",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  meeting: {
    bg: "bg-green-50 text-green-600",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  note: {
    bg: "bg-yellow-50 text-yellow-600",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  },
  task: {
    bg: "bg-orange-50 text-orange-600",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  },
}

// ─── Detail field ──────────────────────────────────────────────────────────────

function DetailField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgencyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const { data: agency, isLoading } = api.organizations.getById.useQuery({ id: params.id })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#396A72] border-t-transparent
                        rounded-full animate-spin" />
      </div>
    )
  }

  if (!agency) {
    return (
      <div className="min-h-screen bg-[#F5F7F7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-3">Agency not found.</p>
          <Button variant="outline" onClick={() => router.push("/agencies")}>
            ← Back to Agencies
          </Button>
        </div>
      </div>
    )
  }

  const staff      = (agency as any).staff      ?? []
  const activities = (agency as any).activities ?? []

  return (
    <div className="min-h-screen bg-[#F5F7F7]">

      {/* Breadcrumb */}
      <div className="px-8 pt-5 text-sm text-gray-400">
        <button onClick={() => router.push("/agencies")}
          className="hover:text-[#396A72] transition-colors">
          Agencies
        </button>
        <span className="mx-2">›</span>
        <span className="text-[#396A72] font-medium">{agency.name}</span>
      </div>

      {/* Header */}
      <div className="bg-[#F5F7F7] px-8 py-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-[#E1F5EE] flex items-center
                            justify-center text-[#396A72] font-bold text-lg flex-shrink-0">
              {agency.name[0]}
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">{agency.name}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold
                              ${statusClass((agency as any).status ?? "Active")}`}>
              {(agency as any).status ?? "Active"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/agencies/${params.id}/edit`)}
              className="rounded-xl"
            >
              Edit Agency
            </Button>
            <Button
              className="bg-[#396A72] hover:bg-[#2c5359] text-white rounded-xl"
              onClick={() => router.push(`/agencies/${params.id}/activity/new`)}
            >
              + Log Activity
            </Button>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="px-8 pb-10 grid grid-cols-[1fr_380px] gap-6 items-start
                      max-[980px]:grid-cols-1">

        {/* Left — activity feed */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-xl font-extrabold text-gray-900">Activity</h2>
          </div>
          <div className="p-6">
            {activities.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-[#F2F9F9] text-[#396A72]
                                flex items-center justify-center mx-auto mb-4">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <p className="font-bold text-gray-800 mb-1">No activity yet</p>
                <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">
                  Log a call, email, or meeting to start tracking interactions with this agency.
                </p>
                <Button
                  className="bg-[#396A72] hover:bg-[#2c5359] text-white"
                  onClick={() => router.push(`/agencies/${params.id}/activity/new`)}
                >
                  Log first activity
                </Button>
              </div>
            ) : (
              <div>
                {activities.map((act: any, i: number) => {
                  const cfg = ACTIVITY_ICONS[act.type] ?? ACTIVITY_ICONS.note
                  return (
                    <div
                      key={act.id ?? i}
                      className="flex items-start gap-4 py-4 px-3 rounded-lg cursor-pointer
                                 hover:bg-[#F2F9F9] transition-colors border-t border-gray-100
                                 first:border-t-0"
                      onClick={() => router.push(`/activities/${act.id}/edit`)}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center
                                       flex-shrink-0 ${cfg.bg}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{act.title}</p>
                        <p className="text-sm text-gray-400 mt-0.5 truncate">{act.note ?? ""}</p>
                      </div>
                      <p className="text-sm text-gray-400 flex-shrink-0">
                        {formatDate(act.completedAt ?? act.createdAt)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-5">

          {/* Agency details panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-gray-900">Details</h2>
              <button
                className="text-[#396A72] text-sm font-semibold hover:underline"
                onClick={() => router.push(`/agencies/${params.id}/edit`)}
              >
                Edit
              </button>
            </div>
            <DetailField label="Type"               value={(agency as any).agencyType} />
            <DetailField label="Location"           value={(agency as any).address} />
            <DetailField label="Region"             value={(agency as any).region} />
            <DetailField label="Communities Served" value={(agency as any).communitiesServed} />
            <DetailField label="Agency Size"        value={(agency as any).size} />
            <DetailField label="FRP Size"           value={(agency as any).frpSize} />
            <DetailField label="Programs Offered"   value={(agency as any).programsOffered} />
            <DetailField label="Website"            value={agency.website} />
            <DetailField label="Email"              value={agency.email} />
          </div>

          {/* Staff panel */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-extrabold text-gray-900">Staff Members</h2>
              <button
                className="text-[#396A72] text-sm font-semibold hover:underline"
                onClick={() => router.push(`/agencies/${params.id}/edit?tab=staff`)}
              >
                Edit
              </button>
            </div>

            {staff.length === 0 ? (
              <p className="text-sm text-gray-400">No staff members added yet.</p>
            ) : (
              staff.map((s: any, i: number) => (
                <div key={s.id ?? i}
                  className="flex items-start gap-3 py-3 border-t border-gray-100 first:border-t-0 first:pt-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                   font-bold text-sm flex-shrink-0
                                   ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(s.name ?? s.firstName ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">
                        {s.name ?? [s.firstName, s.lastName].filter(Boolean).join(" ")}
                      </span>
                      {(s.primary || s.isPrimary) && (
                        <span className="bg-[#F2F9F9] text-[#396A72] text-xs font-bold
                                         px-2 py-0.5 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">
                      {s.role ?? s.jobTitle ?? "Staff"}
                    </p>
                    {(s.email) && (
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-2">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                        {s.email}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
