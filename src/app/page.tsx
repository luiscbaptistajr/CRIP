"use client"

import * as React from "react"

import { useState } from "react"
import { api } from "@/lib/trpc"
import { CalendarIcon, Pencil, Plus } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
  FieldSet,
  FieldLegend,
} from "../components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../components/ui/input-group"
import {
  Input,
} from "../components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,  
} from "../components/ui/popover"
import { Footer } from "react-day-picker"
// import { api } from "./lib/trpc"

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = "agencies" | "dashboard" | "activities" | "notification" | "settings"

function Header() {
  return(
      <div>
        <h1>Family Resource Program</h1>
        <GoToLinks />
      </div>
  )
}

function GoToLinks() {
  const [activePage, setActivePage] = useState<Page>("agencies")

  return(
    <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
          {PAGES.map(menu => (
            <button
              key={menu.id}
              onClick={() => setActivePage(menu.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activePage === menu.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{menu.icon}</span>
              {menu.label}
            </button>
          ))}
        </div>

        {/* Table panels */}
        {/* {activePage === "dashboard"  && <ContactsTable />} */}
        {activePage === "agencies" && <AgenciesTable />}
        {activePage === "activities" && <RenewalCall />}
        {/* {activePage === "users" && <UsersTable />} */}

        
      </div>
  )
}

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

function formatDate(date:Date | undefined) {
  if (!date) {
    return ""
  }  

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

function DatePickerInput() {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    new Date("2025-06-01")
  )
  const [month, setMonth] = React.useState<Date | undefined>(date)
  const [value, setValue] = React.useState(formatDate(date))  

  return (
    <Field className="mx-auto w-48">
      <FieldLabel htmlFor="date-required">Call Date</FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="date-required"
          value={value}
          placeholder="mm/dd/yyyy"
          onChange={(e) => {
            const date = new Date(e.target.value)
            setValue(e.target.value)
            if (isValidDate(date)) {
              setDate(date)
              setMonth(date)
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={<InputGroupButton id="date-picker" variant="ghost" size="icon-xs" aria-label="Select date"><CalendarIcon /><span className="sr-only">Select date</span></InputGroupButton>} />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={date}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date) => {
                  setDate(date)
                  setValue(formatDate(date))
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
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

// ─── Agencies table ──────────────────────────────────────────────────────────

function AgenciesTable() {
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

// ─── Renewal Call Form ──────────────────────────────────────────────────────────

function RenewalCall() {
  const agencies = [
    { label: "Select Agency", value: "def" },
    { label: "Agency A", value: "aa" },
    { label: "Agency B", value: "bb" },
    { label: "Agency C", value: "cc" },
  ]

  const programs = [
    { label: "Drop-in Programs", value: "drop-in-programs" },
    { label: "Parenting Programs", value: "parenting-programs" },
    { label: "Pre and Postnatal Supports", value: "pre-and-postnatal-supports" },
    { label: "Food Security Initiatives", value: "food-security-initiatives" },
    { label: "Resource Lending", value: "resource-lending" },
    { label: "Outreach", value: "outreach" },
  ]

  const kfunders = [
    { label: "Key Funder A", value: "aa" },
    { label: "Key Funder B", value: "bb" },
    { label: "Key Funder C", value: "cc" },    
  ]


  // const { data, isLoading } = api.dashboard.getCompanies.useQuery({
  //   page, limit: 10, search: search || undefined,
  // })
  return(
    <div>
      {/* Page Header */}
      <div className="mb-8">
        {/* <p className="text-sm text-gray-500 mt-1">Log Activity &gt; Renewal Call</p> */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<a href="#">Home</a>} />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost"><BreadcrumbEllipsis /><span className="sr-only">Toggle menu</span></Button>} />
                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Documentation</DropdownMenuItem>
                    <DropdownMenuItem>Themes</DropdownMenuItem>
                    <DropdownMenuItem>GitHub</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink render={<a href="#">Components</a>} />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-semibold text-gray-900">Renewal Call</h1>
      </div>
      <form className="w-full max-w-sm" action="">
        {/* CALL DETAILS */}
        <FieldSet>
          <FieldLegend>Call Details</FieldLegend>
          <FieldDescription>Who you're speaking</FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="form-country">Agency</FieldLabel>
                <Select items={agencies} defaultValue="def">
                  <SelectTrigger id="form-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {agencies.map((agency) => (
                        <SelectItem key={agency.value} value={agency.value}>
                          {agency.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="form-spokeW">Spoke with</FieldLabel>
                <Input id="form-spokeW" placeholder="Spoke with..." />
              </Field>
              {/* Format Date */}
              {/* <DatePickerInput /> */}
            </div>
          </FieldGroup>
        </FieldSet>

        {/* VERIFY ORGANIZATIONS */}
        <FieldSet>
          <FieldLegend>Verify Organization Details</FieldLegend>
          <FieldDescription>Confirm they're current, or update them here. Changes save to the org record, not just this call.</FieldDescription>
          <FieldGroup>

          </FieldGroup>
        </FieldSet>

        {/* PROGRAMS */}
        <FieldSet>
          <FieldLegend>Programs</FieldLegend>
          <FieldDescription>Understanding programs, services, and funding</FieldDescription>
          <FieldGroup>
            <div>
              <FieldLabel htmlFor="form-country">Programs/Services Offered</FieldLabel>
              <Field orientation="horizontal">
                <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
                <FieldContent>
                  <FieldTitle>Drop-in Programs</FieldTitle>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
                <FieldContent>
                  <FieldTitle>Parenting Programs</FieldTitle>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
                <FieldContent>
                  <FieldTitle>Pre and Postnatal Supports</FieldTitle>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
                <FieldContent>
                  <FieldTitle>Resource Lendings</FieldTitle>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <Checkbox id="toggle-checkbox-2" name="toggle-checkbox-2" />
                <FieldContent>
                  <FieldTitle>Outreach</FieldTitle>
                </FieldContent>
              </Field>
            </div>
            <div>
              <FieldLabel htmlFor="form-country">Key Funders</FieldLabel>
              <Button variant="outline"><Plus data-icon="inline-start" /> Add Note</Button>
            </div>
          </FieldGroup>
        </FieldSet>

        {/* FAMILY TRENDS */}
        <FieldSet>
          <FieldLegend>Family Trends </FieldLegend>
          <FieldDescription>Understanding shifts in the needs and circumstances of the families this organization serves</FieldDescription>
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4">  
              <Field>
                <FieldLabel htmlFor="form-country">What are you noticing about the families you're serving now?d</FieldLabel>
                <Textarea placeholder="Type your message here." />
              </Field>
              {/* <Field>
                <FieldLabel htmlFor="form-country">Key Funders</FieldLabel>
                <Select items={kfunders} defaultValue="aa">
                  <SelectTrigger id="form-country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {kfunders.map((kfunder) => (
                        <SelectItem key={kfunder.value} value={kfunder.value}>
                          {kfunder.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field> */}
            </div>
          </FieldGroup>
        </FieldSet>

        {/* IMPACT */}
        <FieldSet>
          <FieldLegend>Impact</FieldLegend>
          <FieldDescription>Quantitative metrics and reach dat</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-country">Approximate total visits (annual)</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input id="form-spokeW" placeholder="No. of Total visits" />
                <Button variant="outline"><Pencil data-icon="inline-start" /> Add Note</Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="form-country">Approximate number of unique families or participants</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input id="form-spokeW" placeholder="No. of Unique families" />
                <Button variant="outline"><Pencil data-icon="inline-start" /> Add Note</Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="form-country">Number of staff and/or volunteers supporting the FRP</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input id="form-spokeW" placeholder="No. of Staffs" />
                <Button variant="outline"><Pencil data-icon="inline-start" /> Add Note</Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="form-country">Approximate weekly staff hours dedicated to FRP programming</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input id="form-spokeW" placeholder="No. of hours" />
                <Button variant="outline"><Pencil data-icon="inline-start" /> Add Note</Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="form-country">Number of relevant partners or early years partnership-based programs</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input id="form-spokeW" placeholder="No. of Partners" />
                <Button variant="outline"><Pencil data-icon="inline-start" /> Add Note</Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="form-country">Number of referrals made or received by your FRP (not through other programs)</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input id="form-spokeW" placeholder="No. of Referrals" />
                <Button variant="outline"><Pencil data-icon="inline-start" /> Add Note</Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor="form-country">Any additional metrics currently tracked</FieldLabel>
              <div className="grid grid-cols-2 gap-4">
                <Input id="form-spokeW" placeholder="Any Additional Metrics" />
                <Button variant="outline"><Pencil data-icon="inline-start" /> Add Note</Button>
              </div>
            </Field>
            
          </FieldGroup>
        </FieldSet>

        {/* EVALUATION PRACTICE */}
        <FieldSet>
          <FieldLegend>Evaluation Practice</FieldLegend>
          <FieldDescription>Understanding how the organization measures impact</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-country">Currently collecting feedback or impact data? Tell us more</FieldLabel>
              <Textarea placeholder="Type your message here." />
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* Member Experience and Needs */}
        <FieldSet>
          <FieldLegend>Member Experience and Needs</FieldLegend>
          <FieldDescription>Capturing successes, challenges, and growth opportunities</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-country">Top 2-3 successes</FieldLabel>
              <Textarea placeholder="Type your message here." />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-country">Top 2-3 current challenges or opportunities for growth</FieldLabel>
              <Textarea placeholder="Type your message here." />
            </Field>
          </FieldGroup>
        </FieldSet>

        {/* FRP-BC Services Matrix */}
        {/* <FieldSet>
          <FieldLegend>FRP-BC Services Matrix</FieldLegend>
          <FieldDescription>Track which resources and supports are being used and valued</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-country">FRP-BC resources or supports that you’re currently using, or have used, that you've found valuable?</FieldLabel>
              <Input id="form-spokeW" placeholder="Valuable resources" />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-country">Supports or resources they'd like to see, but aren't currently offered</FieldLabel>
              <Input id="form-spokeW" placeholder="Valuable resources" />
            </Field>
          </FieldGroup>
        </FieldSet> */}

        {/* <FieldSet>
          <FieldLegend>Offers & Wrap-up</FieldLegend>
          <FieldDescription>Opportunities shared, permissions, and follow-ups</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-country">Top 2-3 successes</FieldLabel>
              <Input id="form-spokeW" placeholder="Enter answer" />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-country">Top 2-3 current challenges or opportunities for growth</FieldLabel>
              <Input id="form-spokeW" placeholder="Enter answer" />
            </Field>
          </FieldGroup>
          <FieldGroup>
            <FieldLabel htmlFor="form-country">Relevant opportunities shareds</FieldLabel>
            <Textarea placeholder="Type your message here." />
          </FieldGroup>
        </FieldSet> */}

        <FieldSet>
          <FieldLegend>Offers & Wrap-ups</FieldLegend>
          <FieldDescription>Communication preferences and data permissions</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="form-country">Relevant opportunities shareds</FieldLabel>
              <Textarea placeholder="Type your message here." />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-country">Subscription / mailing list permission</FieldLabel>
              <Button variant="outline">Yes</Button>
              <Button variant="outline">No</Button>
              <Button variant="outline">Ask Again Later</Button>
            </Field>
            <Field>
              <FieldLabel htmlFor="form-country">Confirm follow-up action</FieldLabel>
              <Input id="form-spokeW" placeholder="Follow-up actions" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </form>
    </div>
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

const PAGES: { id: Page; label: string; icon: string }[] = [
  { id: "agencies", label: "Agencies", icon: "🏢" }, // Companies
  { id: "dashboard", label: "Dashboard", icon: "👤" },
  { id: "activities", label: "Log Activity", icon: "💼" },
  { id: "notification", label: "Notification", icon: "👥" },
  { id: "settings", label: "Settings", icon: "👥" },
]

export default function DataPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Footer />
    </div>
  )
}
