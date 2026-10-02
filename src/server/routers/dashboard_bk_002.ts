"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/trpc"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Badge }    from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey    = "name" | "region" | "lastActive"
type SortDir    = "asc" | "desc"
type StatusFilter = "all" | "Active" | "Inactive"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusVariant(status: string) {
  return status === "Active"
    ? "bg-[#E7F3EB] text-[#2C6A47]"
    : "bg-[#E3E5E6] text-[#4B5563]"
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric", month: "short", day: "numeric",
  })
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ col, sort, dir }: { col: SortKey; sort: SortKey; dir: SortDir }) {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current fill-none stroke-2 ml-1">
      <polyline points="8 9 12 5 16 9"
        className={sort === col && dir === "asc" ? "stroke-[#396A72]" : "stroke-gray-400"} />
      <polyline points="16 15 12 19 8 15"
        className={sort === col && dir === "desc" ? "stroke-[#396A72]" : "stroke-gray-400"} />
    </svg>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
  return (
    <div className="py-16 text-center text-gray-500">
      <div className="w-12 h-12 rounded-full bg-[#F2F9F9] text-[#396A72] flex items-center
                      justify-center mx-auto mb-4">
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      </div>
      <p className="font-bold text-gray-800 text-base mb-1">No agencies found</p>
      <p className="text-sm text-gray-500">
        {search ? `No results for "${search}"` : "Add your first agency to get started."}
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgenciesPage() {
  const router = useRouter()

  const [search,  setSearch]  = useState("")
  const [status,  setStatus]  = useState<StatusFilter>("all")
  const [sort,    setSort]    = useState<SortKey>("name")
  const [dir,     setDir]     = useState<SortDir>("asc")
  const [page,    setPage]    = useState(1)
  const [perPage, setPerPage] = useState(10)

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const { data, isLoading } = api.organizations.list.useQuery({
    page,
    limit:  perPage,
    search: search  || undefined,
    status: status  !== "all" ? status : undefined,
    sortBy: sort,
    sortDir: dir,
  })

  // ── Sort toggle ────────────────────────────────────────────────────────────
  function toggleSort(col: SortKey) {
    if (sort === col) setDir(d => d === "asc" ? "desc" : "asc")
    else { setSort(col); setDir("asc") }
  }

  const agencies    = data?.data       ?? []
  const total       = data?.total      ?? 0
  const totalPages  = data?.totalPages ?? 1

  return (
    <div className="min-h-screen bg-[#F5F7F7]">

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-8 flex items-start
                      justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Agencies</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and browse all agencies.</p>
        </div>
        <Button
          onClick={() => router.push("/agencies/new")}
          variant="outline"
          className="border-[#396A72] text-[#396A72] hover:bg-[#F2F9F9] font-semibold"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 mr-1">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Agency
        </Button>
      </div>

      {/* Toolbar */}
      <div className="px-8 py-4 flex items-center justify-end gap-3">

        {/* Filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 rounded-xl">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
              {status !== "all" && (
                <span className="bg-[#396A72] text-white text-xs px-2 py-0.5 rounded-full">
                  1
                </span>
              )}
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-current stroke-2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400
                          px-3 pt-2 pb-1">Status</p>
            {(["all", "Active", "Inactive"] as StatusFilter[]).map(s => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={status === s}
                onCheckedChange={() => { setStatus(s); setPage(1) }}
              >
                {s === "all" ? "All statuses" : s}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl
                        px-3 py-2.5 bg-white min-w-[260px]">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2 text-gray-400 flex-shrink-0">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search..."
            className="flex-1 text-sm bg-transparent outline-none text-gray-900
                       placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="px-8 pb-8">
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white">
                {([
                  { key: "name",       label: "Agencies"    },
                  { key: "region",     label: "Region"      },
                  { key: null,         label: "Primary Contact" },
                  { key: null,         label: "Status"      },
                  { key: "lastActive", label: "Last Active" },
                ] as { key: SortKey | null; label: string }[]).map(col => (
                  <TableHead
                    key={col.label}
                    className={`text-xs font-semibold text-gray-500 ${col.key ? "cursor-pointer select-none" : ""}`}
                    onClick={() => col.key && toggleSort(col.key)}
                  >
                    <div className="flex items-center">
                      {col.label}
                      {col.key && <SortIcon col={col.key} sort={sort} dir={dir} />}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-28" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : agencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <EmptyState search={search} />
                  </TableCell>
                </TableRow>
              ) : agencies.map(agency => (
                <TableRow
                  key={agency.id}
                  className="cursor-pointer hover:bg-[#F3F9F9] transition-colors"
                  onClick={() => router.push(`/agencies/${agency.id}`)}
                >
                  <TableCell className="font-semibold text-gray-900">
                    {agency.name}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {(agency as any).region ?? "—"}
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {(agency as any).primaryContact ?? "—"}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-block px-3 py-0.5 rounded-full text-sm
                                     font-semibold ${statusVariant((agency as any).status ?? "Active")}`}>
                      {(agency as any).status ?? "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {formatDate((agency as any).lastActive ?? agency.updatedAt?.toString() ?? null)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {agencies.length > 0 && (
            <div className="flex items-center justify-end gap-4 px-5 py-3.5
                            border-t border-gray-100 bg-white flex-wrap text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <Select
                  value={String(perPage)}
                  onValueChange={v => { setPerPage(Number(v)); setPage(1) }}
                >
                  <SelectTrigger className="w-16 h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50].map(n => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span>
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-8 h-8 border border-gray-200 rounded-md flex items-center
                             justify-center disabled:opacity-40 hover:bg-gray-50"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-8 h-8 border border-gray-200 rounded-md flex items-center
                             justify-center disabled:opacity-40 hover:bg-gray-50"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
