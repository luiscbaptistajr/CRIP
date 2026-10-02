'use client'

import { useState } from "react"
import { api } from "@/lib/trpc"

import SearchBar from "@/components/features/SearchBar"
import Pagination from "@/components/features/Pagination"

// ─── Agencies table ──────────────────────────────────────────────────────────
export default function AgenciesTable() {
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState("")

  const { data, isLoading } = api.dashboard.getAgencies.useQuery({
    page, limit: 10, search: search || undefined,
  })

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Agencies</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and browse all agencies.</p>
      </div>

      <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search companies..." />
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            {/* <tr>
              {["Agencies", "Domain", "Industry", "Size", "City", "Country", "Created"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr> */}

             <tr>
              {["Agencies", "Region", "Primary Contact", "Status", "Last Active"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  No companies found
                </td>
              </tr>
            ) : data?.data.map(c => (
              // {["Agencies", "Region", "Primary Contact", "Status", "Last Active"]
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                {/* <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.domain ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{c.industry ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.size ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.city ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.country ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                </td> */}

                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-500">{c.region ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{c.primaryContact ?? "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.status ?? "—"}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {c.updatedAt} {c.updateTitle}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
      </div>
      {data && (
        <p className="text-xs text-gray-400">{data.total} companies total</p>
      )}
    </div>
  )
}