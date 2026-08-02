"use client"

import { useState } from "react"
import { api } from "../lib/trpc"
// import { api } from "./lib/trpc"

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "agencies" | "contacts" | "deals" | "users"

// ─── Pagination component ─────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page:       number
  totalPages: number
  onPage:     (p: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          ← Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`px-3 py-1.5 text-sm border rounded-md transition-colors ${
                p === page
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        })}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-md disabled:opacity-40 hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value:       string
  onChange:    (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
      />
    </div>
  )
}

// ─── Form - call to action button ───────────────────────────────────────────────────────────────

function AddLogsBtn() {
  return(
    <a href="#">Add Logs Button Here</a>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

// function Badge({ value }: { value: string }) {
//   const colors: Record<string, string> = {
//     active:      "bg-green-50 text-green-700",
//     prospect:    "bg-blue-50 text-blue-700",
//     lead:        "bg-yellow-50 text-yellow-700",
//     churned:     "bg-red-50 text-red-700",
//     won:         "bg-green-50 text-green-700",
//     lost:        "bg-red-50 text-red-700",
//     proposal:    "bg-purple-50 text-purple-700",
//     negotiation: "bg-orange-50 text-orange-700",
//     qualified:   "bg-blue-50 text-blue-700",
//     admin:       "bg-gray-900 text-white",
//     manager:     "bg-gray-700 text-white",
//     rep:         "bg-gray-100 text-gray-700",
//   }

//   return (
//     <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors[value] ?? "bg-gray-100 text-gray-600"}`}>
//       {value}
//     </span>
//   )
// }

// ─── Companies table ──────────────────────────────────────────────────────────

function CompaniesTable() {
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState("")

  const { data, isLoading } = api.dashboard.getCompanies.useQuery({
    page, limit: 10, search: search || undefined,
  })

  return (
    <div className="space-y-4">
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



function RenewalCall() {
  return(
    <div>Form Here</div>
  )
}

// ─── Contacts table ───────────────────────────────────────────────────────────

// function ContactsTable() {
//   const [page,   setPage]   = useState(1)
//   const [search, setSearch] = useState("")

//   const { data, isLoading } = api.dashboard.getContacts.useQuery({
//     page, limit: 10, search: search || undefined,
//   })

//   return (
//     <div className="space-y-4">
//       <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search contacts..." />
//       <div className="border border-gray-100 rounded-xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 border-b border-gray-100">
//             <tr>
//               {["Name", "Email", "Phone", "Job Title", "Status", "Score", "Created"].map(h => (
//                 <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, i) => (
//                 <tr key={i}>
//                   {Array.from({ length: 7 }).map((_, j) => (
//                     <td key={j} className="px-4 py-3">
//                       <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             ) : data?.data.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
//                   No contacts found
//                 </td>
//               </tr>
//             ) : data?.data.map(c => (
//               <tr key={c.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-4 py-3 font-medium text-gray-900">
//                   {[c.firstName, c.lastName].filter(Boolean).join(" ") || "—"}
//                 </td>
//                 <td className="px-4 py-3 text-gray-500">{c.email ?? "—"}</td>
//                 <td className="px-4 py-3 text-gray-500">{c.phone ?? "—"}</td>
//                 <td className="px-4 py-3 text-gray-500">{c.jobTitle ?? "—"}</td>
//                 <td className="px-4 py-3"><Badge value={c.status ?? "lead"} /></td>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-gray-900 rounded-full"
//                         style={{ width: `${c.score ?? 0}%` }}
//                       />
//                     </div>
//                     <span className="text-xs text-gray-400">{c.score ?? 0}</span>
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 text-gray-400 text-xs">
//                   {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
//       </div>
//       {data && <p className="text-xs text-gray-400">{data.total} contacts total</p>}
//     </div>
//   )
// }

// ─── Deals table ──────────────────────────────────────────────────────────────

// function DealsTable() {
//   const [page,   setPage]   = useState(1)
//   const [search, setSearch] = useState("")

//   const { data, isLoading } = api.dashboard.getDeals.useQuery({
//     page, limit: 10, search: search || undefined,
//   })

//   return (
//     <div className="space-y-4">
//       <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search deals..." />
//       <div className="border border-gray-100 rounded-xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 border-b border-gray-100">
//             <tr>
//               {["Name", "Amount", "Currency", "Stage", "Probability", "Close Date", "Created"].map(h => (
//                 <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, i) => (
//                 <tr key={i}>
//                   {Array.from({ length: 7 }).map((_, j) => (
//                     <td key={j} className="px-4 py-3">
//                       <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             ) : data?.data.length === 0 ? (
//               <tr>
//                 <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
//                   No deals found
//                 </td>
//               </tr>
//             ) : data?.data.map(d => (
//               <tr key={d.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
//                 <td className="px-4 py-3 text-gray-900 font-medium">
//                   {d.amount
//                     ? Number(d.amount).toLocaleString("en-US", { minimumFractionDigits: 0 })
//                     : "—"}
//                 </td>
//                 <td className="px-4 py-3 text-gray-500">{d.currency ?? "USD"}</td>
//                 <td className="px-4 py-3"><Badge value={d.stage ?? "prospect"} /></td>
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-2">
//                     <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                       <div
//                         className="h-full bg-gray-900 rounded-full"
//                         style={{ width: `${d.probability ?? 0}%` }}
//                       />
//                     </div>
//                     <span className="text-xs text-gray-400">{d.probability ?? 0}%</span>
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 text-gray-500 text-xs">
//                   {d.closeDate ? new Date(d.closeDate).toLocaleDateString() : "—"}
//                 </td>
//                 <td className="px-4 py-3 text-gray-400 text-xs">
//                   {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
//       </div>
//       {data && <p className="text-xs text-gray-400">{data.total} deals total</p>}
//     </div>
//   )
// }

// ─── Users table ──────────────────────────────────────────────────────────────

// function UsersTable() {
//   const [page,   setPage]   = useState(1)
//   const [search, setSearch] = useState("")

//   const { data, isLoading } = api.dashboard.getUsers.useQuery({
//     page, limit: 10, search: search || undefined,
//   })

//   return (
//     <div className="space-y-4">
//       <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search users..." />
//       <div className="border border-gray-100 rounded-xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 border-b border-gray-100">
//             <tr>
//               {["Name", "Email", "Role", "Status", "Created"].map(h => (
//                 <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   {h}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {isLoading ? (
//               Array.from({ length: 5 }).map((_, i) => (
//                 <tr key={i}>
//                   {Array.from({ length: 5 }).map((_, j) => (
//                     <td key={j} className="px-4 py-3">
//                       <div className="h-4 bg-gray-100 rounded animate-pulse w-24" />
//                     </td>
//                   ))}
//                 </tr>
//               ))
//             ) : data?.data.length === 0 ? (
//               <tr>
//                 <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
//                   No users found
//                 </td>
//               </tr>
//             ) : data?.data.map(u => (
//               <tr key={u.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="px-4 py-3">
//                   <div className="flex items-center gap-3">
//                     <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center
//                                     text-white text-xs font-medium flex-shrink-0">
//                       {(u.name ?? u.email ?? "?")[0].toUpperCase()}
//                     </div>
//                     <span className="font-medium text-gray-900">{u.name ?? "—"}</span>
//                   </div>
//                 </td>
//                 <td className="px-4 py-3 text-gray-500">{u.email}</td>
//                 <td className="px-4 py-3"><Badge value={u.role ?? "rep"} /></td>
//                 <td className="px-4 py-3">
//                   <span className={`inline-flex items-center gap-1.5 text-xs ${u.isActive ? "text-green-600" : "text-gray-400"}`}>
//                     <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-gray-300"}`} />
//                     {u.isActive ? "Active" : "Inactive"}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 text-gray-400 text-xs">
//                   {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <Pagination page={page} totalPages={data?.totalPages ?? 1} onPage={setPage} />
//       </div>
//       {data && <p className="text-xs text-gray-400">{data.total} users total</p>}
//     </div>
//   )
// }

// ─── Main page ────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "agencies", label: "Agencies", icon: "🏢" }, // Companies
  { id: "contacts",  label: "Contacts", icon: "👤" },
  { id: "deals",     label: "Deals",    icon: "💼" },
  { id: "users",     label: "Users",    icon: "👥" },
]

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<Tab>("companies")

  return (
    <div className="min-h-screen bg-white">
      <div>
        <h1>Family Resource Program</h1>
        <div>
          <a href="">Dashboard</a>
          <a href="">Agencies</a>
        </div>
        <div>
          <p>
            <a href=""><AddLogsBtn /></a>
            <a href="">Notification Bell Placeholder</a>
            <a href="">Setting Placeholder</a>
          </p>
        </div>
        

      </div>
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Agencies</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and browse all agencies.
          </p>
        </div>

        

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        

        {/* Table panels */}
        {activeTab === "agencies" && <CompaniesTable />}
        {/* {activeTab === "contacts"  && <ContactsTable />}
        {activeTab === "deals"     && <DealsTable />}
        {activeTab === "users"     && <UsersTable />} */}

        <RenewalCall />
      </div>
    </div>
  )
}
