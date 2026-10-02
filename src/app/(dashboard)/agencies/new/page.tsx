"use client"

import { useState }    from "react"
import { useRouter }   from "next/navigation"
import { useForm }     from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z }           from "zod"
import { api }         from "@/lib/trpc"
import { Button }      from "@/components/ui/button"
import { Input }       from "@/components/ui/input"
import { Label }       from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

// ─── Constants ────────────────────────────────────────────────────────────────

const AGENCY_TYPES = [
  "Non-Profit Society",
  "Government",
  "Registered Charity",
  "Co-operative",
  "Social Enterprise",
  "Other",
]

const PROGRAMS = [
  "Parent & Child Drop-In",
  "Family Literacy",
  "Nobody's Perfect",
  "Triple P",
  "Nobody's Perfect Online",
  "Supported Child Development",
  "Child Care Resource & Referral",
  "Strong Start",
  "Youth Programs",
  "Food Security Programs",
]

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name:             z.string().min(1, "Agency name is required"),
  agencyType:       z.string().optional(),
  address:          z.string().optional(),
  region:           z.string().optional(),
  communitiesServed: z.string().optional(),
  size:             z.string().optional(),
  status:           z.enum(["Active", "Inactive"]).default("Active"),
  website:          z.string().optional(),
  email:            z.string().email("Invalid email").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof schema>

// ─── Staff row type ───────────────────────────────────────────────────────────

interface StaffRow {
  id:      string
  name:    string
  role:    string
  email:   string
  phone:   string
  primary: boolean
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Card({ title, sub, children }: {
  title:    string
  sub:      string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-7 max-w-3xl mx-auto mb-5">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-400 mt-1 mb-5">{sub}</p>
      {children}
    </div>
  )
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({ label, error, children }: {
  label:    string
  error?:   string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="font-medium text-gray-700">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Pill checkbox ─────────────────────────────────────────────────────────────

function PillCheck({ label, checked, onChange }: {
  label:    string
  checked:  boolean
  onChange: () => void
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl
                  text-sm transition-all ${
        checked
          ? "bg-[#E1F5EE] border-[#BCE4D4] text-[#396A72] font-semibold"
          : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
      }`}
    >
      <span className={`w-4 h-4 border rounded flex items-center justify-center flex-shrink-0 ${
        checked ? "bg-[#396A72] border-[#396A72]" : "border-gray-300"
      }`}>
        {checked && (
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-none stroke-white stroke-[3]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      {label}
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AddAgencyPage() {
  const router  = useRouter()

  const [programs, setPrograms] = useState<string[]>([])
  const [showNote, setShowNote] = useState(false)
  const [note,     setNote]     = useState("")
  const [staff,    setStaff]    = useState<StaffRow[]>([])
  const [status,   setStatus]   = useState<"Active" | "Inactive">("Active")

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<FormValues>({ resolver: zodResolver(schema) })

  const create = api.organizations.create.useMutation({
    onSuccess: (org) => router.push(`/agencies/${org.id}`),
  })

  function toggleProgram(p: string) {
    setPrograms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  function addStaff() {
    setStaff(prev => [...prev, {
      id: crypto.randomUUID(), name: "", role: "", email: "", phone: "", primary: false,
    }])
  }

  function removeStaff(id: string) {
    setStaff(prev => prev.filter(s => s.id !== id))
  }

  function updateStaff(id: string, field: keyof StaffRow, value: string | boolean) {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function setPrimary(id: string) {
    setStaff(prev => prev.map(s => ({ ...s, primary: s.id === id })))
  }

  function prefill() {
    setValue("name",              "Riverside Family Centre")
    setValue("agencyType",        "Non-Profit Society")
    setValue("address",           "Nelson, BC")
    setValue("region",            "Coast Fraser")
    setValue("communitiesServed", "Grand Forks, Nelson")
    setValue("size",              "25-50")
    setPrograms(["Family Literacy", "Nobody's Perfect", "Parent & Child Drop-In"])
    setStaff([{
      id: crypto.randomUUID(), name: "Sarah Johnson", role: "Executive Director",
      email: "sarah@riverside.bc.ca", phone: "250-555-0101", primary: true,
    }])
  }

  function onSubmit(values: FormValues) {
    create.mutate({
      ...values,
      status,
      programsOffered:   programs.join(", "),
      notes:             note || undefined,
      staff:             staff.filter(s => s.name.trim()),
    } as any)
  }

  return (
    <div className="min-h-screen bg-[#F5F7F7]">

      {/* Breadcrumb */}
      <div className="bg-white px-8 pt-5 pb-1 text-sm text-gray-400">
        <button onClick={() => router.push("/agencies")}
          className="hover:text-[#396A72] transition-colors">
          Agencies
        </button>
        <span className="mx-2">›</span>
        <span className="text-[#396A72] font-medium">Add Agency</span>
      </div>

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Add Agency</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-8">

          {/* Agency details card */}
          <Card
            title="Agency details"
            sub="Name, type, location, and the communities served."
          >
            <Field label="Name" error={errors.name?.message}>
              <Input {...register("name")} placeholder="e.g. Riverside Family Centre" />
            </Field>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Field label="Type">
                <Select onValueChange={v => setValue("agencyType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
                  <SelectContent>
                    {AGENCY_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Location">
                <Input {...register("address")} placeholder="e.g. Nelson, BC" />
              </Field>

              <Field label="Region">
                <Input {...register("region")} placeholder="e.g. Coast Fraser" />
              </Field>

              <Field label="Member Status">
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  {(["Active", "Inactive"] as const).map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={`flex-1 py-2.5 text-sm font-medium transition-all border-r
                                  last:border-r-0 border-gray-200 ${
                        status === s
                          ? "bg-[#396A72] text-white font-semibold"
                          : "bg-white text-gray-700"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Communities Served" error={undefined}>
                <Input {...register("communitiesServed")} placeholder="e.g. Grand Forks"
                  className="col-span-2" />
              </Field>

              <Field label="Agency Size">
                <Input {...register("size")} placeholder="e.g. 25-50" type="text" />
              </Field>
            </div>
          </Card>

          {/* Programs card */}
          <Card title="Programs offered" sub="Programs and services this agency provides.">
            <div className="flex flex-wrap gap-2.5">
              {PROGRAMS.map(p => (
                <PillCheck
                  key={p}
                  label={p}
                  checked={programs.includes(p)}
                  onChange={() => toggleProgram(p)}
                />
              ))}
            </div>

            {!showNote ? (
              <button
                type="button"
                onClick={() => setShowNote(true)}
                className="mt-4 text-[#396A72] text-sm font-semibold hover:underline"
              >
                + Add Note
              </button>
            ) : (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="font-medium">Note</Label>
                  <button
                    type="button"
                    onClick={() => { setShowNote(false); setNote("") }}
                    className="text-red-500 text-sm font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Anything worth noting about the programs offered..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm
                             resize-none h-20 focus:outline-none focus:ring-2
                             focus:ring-[#396A72] focus:border-transparent"
                />
              </div>
            )}
          </Card>

          {/* Staff card */}
          <Card title="Staff Members" sub="Contacts at this agency. Mark one as primary.">
            {staff.length > 0 && (
              <div className="space-y-4 mb-4">
                {staff.map((s, i) => (
                  <div key={s.id}
                    className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Full name">
                        <Input
                          value={s.name}
                          onChange={e => updateStaff(s.id, "name", e.target.value)}
                          placeholder="Full name"
                        />
                      </Field>
                      <Field label="Role">
                        <Input
                          value={s.role}
                          onChange={e => updateStaff(s.id, "role", e.target.value)}
                          placeholder="Role"
                        />
                      </Field>
                      <Field label="Email">
                        <Input
                          type="email"
                          value={s.email}
                          onChange={e => updateStaff(s.id, "email", e.target.value)}
                          placeholder="Email"
                        />
                      </Field>
                      <Field label="Phone">
                        <Input
                          value={s.phone}
                          onChange={e => updateStaff(s.id, "phone", e.target.value)}
                          placeholder="Phone"
                        />
                      </Field>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="radio"
                          name="primary-staff"
                          checked={s.primary}
                          onChange={() => setPrimary(s.id)}
                          className="accent-[#396A72]"
                        />
                        Primary contact
                      </label>
                      <button
                        type="button"
                        onClick={() => removeStaff(s.id)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center
                                   justify-center text-gray-400 hover:bg-red-50 hover:text-red-500
                                   hover:border-red-200 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={addStaff}
              className="text-[#396A72] text-sm font-semibold hover:underline
                         flex items-center gap-1"
            >
              + Add Staff member
            </button>
          </Card>

          {/* Footer */}
          <div className="max-w-3xl mx-auto flex items-center justify-between pt-1 pb-16">
            <button
              type="button"
              onClick={prefill}
              className="text-[#396A72] text-sm font-semibold hover:underline
                         flex items-center gap-1"
            >
              ✦ Prefill sample data
            </button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/agencies")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={create.isPending}
                className="bg-[#396A72] hover:bg-[#2c5359] text-white"
              >
                {create.isPending ? "Saving..." : "Add Agency"}
              </Button>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}
