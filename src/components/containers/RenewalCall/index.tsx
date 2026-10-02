
"use client"

// import { Field, FieldLabel }      from "@/components/ui/field"
import { useState }               from "react"
// import { useForm }                from "react-hook-form"
// import { zodResolver }            from "@hookform/resolvers/zod"
// import { agencies, renewalCall }  from "@/server/db/schema"
import { z }                      from "zod"
import { api }                    from "@/lib/trpc"
// import { activitiesRouter } from "@/server/routers/activities"
// import { renewalCall } from "@/server/db"
// import { useRouter } from "next/navigation"
// import SectionCard from "@/components/features/SectionCard"
// import TextInput from "@/components/features/TextInput"
// import UpdateRow from "@/components/features/UpdateRow"

type FormValues = z.infer<typeof api.activities.update>

// ─── FRP-BC Services Matrix config ───────────────────────────────────────────
const MATRIX_ROWS = [
  "Network calls / peer connection",
  "Facilitation / professional development training",
  "Advocacy & policy support",
  "Member resource library / templates",
  "One-on-one coaching / consultation",
  "Regional in-person gatherings",
]

const MATRIX_COLS = [
  { key: "not_aware",       label: "Not aware"          },
  { key: "aware_not_used",  label: "Aware, not used"    },
  { key: "used_limited",    label: "Used — limited value"},
  { key: "used_valuable",   label: "Used — valuable"    },
  { key: "used_highly",     label: "Used — highly valuable" },
]


// ─── Nav sections ─────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "call-details",           label: "Call Details"              },
  { id: "verify-agency",          label: "Verify Agency Details"     },
  { id: "family-trends",          label: "Family Trends"             },
  { id: "key-funders",            label: "Key Funders"               },
  { id: "impact",                 label: "Impact"                    },
  { id: "evaluation-practice",    label: "Evaluation Practice"       },
  { id: "member-experience",      label: "Member Experience and Needs"},
  { id: "frpbc-services-matrix",  label: "FRP-BC Services Matrix"    },
  { id: "offers-wrap-up",         label: "Offers & Wrap-up"          },
]  

function SectionCard({
  id, title, sub, children,
}: {
  id:       string
  title:    string
  sub?:     string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="bg-white border border-gray-200 rounded-xl p-6 mb-5 scroll-mt-6"
    >
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {sub && <p className="text-sm text-gray-400 mt-0.5 mb-4">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Field({
  label, error, children,
}: {
  label:    string
  error?:   string
  children: React.ReactNode
}) {
  return (
    <div className="mb-4 last:mb-0">
      <label className="block text-sm text-gray-500 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function Textarea({
  placeholder, rows = 3, ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                text-gray-900 placeholder:text-gray-300 focus:outline-none
                focus:ring-2 focus:ring-[#396A72] focus:border-transparent resize-none"
    />
  )
}

function TextInput({
  placeholder, ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                 text-gray-900 placeholder:text-gray-300 focus:outline-none
                 focus:ring-2 focus:ring-[#396A72] focus:border-transparent"
    />
  )
}

function ImpactField({
  label, placeholder, register, name, note, onAddNote, noteValue, onNoteChange,
}: {
  label:        string
  placeholder:  string
  register:     any
  name:         string
  note:         string
  onAddNote:    () => void
  noteValue:    string
  onNoteChange: (v: string) => void
}) {
  return (
    <div className="mb-5 last:mb-0">
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <TextInput 
          // {...register(name)} 
          placeholder={placeholder} />
        {!note ? (
          <button
            type="button"
            onClick={onAddNote}
            className="text-[#396A72] text-sm font-semibold whitespace-nowrap
                       hover:underline flex-shrink-0"
          >
            + Add Note
          </button>
        ) : (
          <div className="flex-1">
            <TextInput
              value={noteValue}
              onChange={e => onNoteChange(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
        )}
      </div>
    </div>
  )
}

function UpdateRow({
  label, value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100
                    last:border-b-0">
      <div className="flex items-center gap-8">
        <span className="text-sm text-gray-400 w-40 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-500">{value || "—"}</span>
      </div>
      <button
        type="button"
        className="text-[#396A72] text-sm font-semibold hover:underline ml-4"
      >
        Update
      </button>
    </div>
  )
}


// ─── Renewal Call Form ──────────────────────────────────────────────────────────
export default function RenewalCall() {

  // const router = useRouter();
  // activatePage()

  const [activeSection,    setActiveSection]    = useState("call-details")
  // const [funderInput,      setFunderInput]      = useState("")
  // const [funders,          setFunders]          = useState<string[]>([])
  
  // ── Agency list for dropdown ───────────────────────────────────────────────
  const [notes,            setNotes]            = useState<Record<string, boolean>>({})
  const [noteValues,       setNoteValues]       = useState<Record<string, string>>({})
  const [matrixValues,     setMatrixValues]     = useState<Record<string, string>>({})
  // const [subscriptionPerm, setSubscriptionPerm] = useState<"yes" | "no" | "ask_again_later" | null>(null)
  // const [isSaving,         setIsSaving]         = useState(false)
  // const [saved,            setSaved]            = useState(false)

  // ── Form ───────────────────────────────────────────────────────────────────
  // const { register, handleSubmit, setValue, formState: { errors } } =
  //   useForm<FormValues>({ resolver: zodResolver(api.useQueries.arguments) })


  const { data: agenciesData } = api.dashboard.getAgencies.useQuery({
    page: 1, limit: 100,
  })

  const agencies = agenciesData?.data ?? []

   // ── Selected agency details ────────────────────────────────────────────────
  const [selectedAgencyId, setSelectedAgencyId] = useState("")
  const selectedAgency = agencies.find(a => a.id === selectedAgencyId)

  // console.log({selectedAgencyId});
  // ── Scroll-spy for sidebar ─────────────────────────────────────────────────
  function scrollTo(id: string) {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // ── Matrix radio ───────────────────────────────────────────────────────────
  function setMatrix(row: string, col: string) {
    setMatrixValues(prev => ({ ...prev, [row]: col }))
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  // async function onSubmit(values: FormValues) {
  //   setIsSaving(true)
  //   // Simulate save — replace with real tRPC mutation
  //   await new Promise(r => setTimeout(r, 800))
  //   console.log("Renewal call saved:", { ...values, keyFunders: funders, servicesMatrix: matrixValues })
  //   setIsSaving(false)
  //   setSaved(true)
  //   setTimeout(() => setSaved(false), 2000)
  // }

  // // ── Funder tag input ───────────────────────────────────────────────────────
  // function handleFunderKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
  //   if (e.key === "Enter" && funderInput.trim()) {
  //     e.preventDefault()
  //     const updated = [...funders, funderInput.trim()]
  //     setFunders(updated)
  //     setValue("keyFunders", updated)
  //     setFunderInput("")
  //   }
  // }
  
  // function removeFunder(i: number) {
  //   const updated = funders.filter((_, idx) => idx !== i)
  //   setFunders(updated)
  //   setValue("keyFunders", updated)
  // }

  // function activatePage(){
  //   router.push("/renewal-call")
  // }

  // const { data, isLoading } = api.dashboard.getCompanies.useQuery({
  //   page, limit: 10, search: search || undefined,
  // })
  
  return(
    <div className="flex gap-6 min-h-screen">

      {/* ── Left sidebar nav ─────────────────────────────────────────── */}
      <aside className="w-52 shrink-0 sticky top-6 self-start">
        <nav className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {NAV_SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                          border-b border-gray-100 last:border-b-0 ${
                activeSection === s.id
                  ? "bg-[#F2F9F9] text-[#396A72] font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>
      
      {/* onSubmit={handleSubmit(onSubmit)} */}
      <form className="flex-1 min-w-0">
        {/* ── 1. Call Details ────────────────────────────────────────── */}
        <SectionCard
          id="call-details"
          title="Call Details"
          sub="Who you're speaking with."
        >
          <div className="grid grid-cols-3 gap-4">
            <Field 
              label="Agency" 
              // error={errors.agencyId?.message}
              >
              <select
                // {...register("agencyId")}
                id="agency"
                value={selectedAgencyId}
                onChange={e => {
                  setSelectedAgencyId(e.target.value)
                  // setValue("agencyId", e.target.value)
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                           text-gray-900 focus:outline-none focus:ring-2
                           focus:ring-[#396A72] bg-white"
              >
                <option value="">Select Agency First</option>
                {agencies.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Spoke with">
              <TextInput
                // {...register("spokeWith")}
                id="spokeWith"
                placeholder="e.g. John Doe"
              />
            </Field>
            <Field label="Date">
              <TextInput
                // {...register("date")}
                id="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── 2. Verify Agency Details ───────────────────────────────── */}
        <SectionCard
          id="verify-agency"
          title="Verify Agency Details"
          sub="Confirming what's already on file for this agency."
        >
          <UpdateRow label="Agency Type"        value={(selectedAgency)?.industry        ?? ""} />
          <UpdateRow label="Location"           value={(selectedAgency)?.city            ?? ""} />
          <UpdateRow label="Region"             value={(selectedAgency)?.region          ?? ""} />
          <UpdateRow label="Communities Served" value={(selectedAgency)?.city            ?? ""} />
          <UpdateRow label="Agency Size"        value={(selectedAgency)?.size            ?? ""} />
          <UpdateRow label="Programs Offered"   value={(selectedAgency)?.notes           ?? ""} />
        </SectionCard>

        {/* ── 3. Family Trends ───────────────────────────────────────── */}
        <SectionCard
          id="family-trends"
          title="Family Trends"
          sub="Understanding shifts in the needs and circumstances of the families this agency serves."
        >
          <Field label="Family Trends">
            <Textarea
              // {...register("familyTrends")}
              id="familyTrends"
              placeholder="Shifts in needs or demographics..."
              rows={4}
            />
          </Field>
        </SectionCard>

        {/* ── 4. Key Funders ─────────────────────────────────────────── */}
      <SectionCard
          id="key-funders"
          title="Key Funders"
          sub="Capturing who funds this agency's programming."
        >
          <Field label="Key Funders">
            <div id="keyFunders" className="border border-gray-200 rounded-lg px-3 py-2 min-h-[42px]
                            flex flex-wrap gap-2 items-center focus-within:ring-2
                            focus-within:ring-[#396A72]">
              {/* {funders.map((f, i) => ( */}
                <span
                  // key={i}
                  className="inline-flex items-center gap-1 bg-[#E1F5EE] text-[#396A72]
                             text-xs font-semibold px-2.5 py-1 rounded-full"
                >
                  {/* {f} */}
                  <button
                    type="button"
                    // onClick={() => removeFunder(i)}
                    className="hover:text-red-500 ml-0.5 font-bold"
                  >
                    ×
                  </button>
                </span>
              {/* ))} */}
              <input
                type="text"
                // value={funderInput}
                // onChange={e => setFunderInput(e.target.value)}
                // onKeyDown={handleFunderKeyDown}
                // placeholder={funders.length === 0 ? "Type a name, press Enter — add as many as needed." : ""}
                className="flex-1 min-w-[180px] text-sm outline-none placeholder:text-gray-300
                           bg-transparent"
              />
            </div>
          </Field>
        </SectionCard>

        {/* ── 5. Impact ──────────────────────────────────────────────── */}
        <SectionCard
          id="impact"
          title="Impact"
          sub="Metrics and reach data."
        >
          {[
            { name: "totalVisits",         label: "Approximate total visits (annual)",                                    placeholder: "e.g. 1,000" },
            { name: "uniqueFamilies",      label: "Approximate number of unique families or participants",                placeholder: "e.g. 340"   },
            { name: "staffVolunteers",     label: "Number of staff and/or volunteers supporting the FRP",                placeholder: "e.g. 15"    },
            { name: "weeklyStaffHours",    label: "Approximate weekly staff hours dedicated to FRP programming",         placeholder: "e.g. 40"    },
            { name: "relevantPartners",    label: "Number of relevant partners or early years partnership-based programs", placeholder: "e.g. 11"  },
            { name: "referralsMade",       label: "Number of referrals made or received by your FRP (not through other programs)", placeholder: "e.g. 42" },
            { name: "foodSecurityMetrics", label: "Food security initiative metrics",                                    placeholder: "e.g. 120"   },
          ].map(f => (
            <ImpactField
              key={f.name}
              label={f.label}
              placeholder={f.placeholder}
              // register={register}
              name={f.name}
              note={notes[f.name] ? noteValues[f.name] ?? "" : ""}
              onAddNote={() => setNotes(prev => ({ ...prev, [f.name]: true }))}
              noteValue={noteValues[f.name] ?? ""}
              onNoteChange={v => setNoteValues(prev => ({ ...prev, [f.name]: v }))}
            />
          ))}
          <Field label="Additional Metrics">
            <Textarea
              // {...register("additionalMetrics")}
              id="additionalMetrics"
              placeholder="e.g. Volunteer hours: 240"
              rows={2}
            />
          </Field>
        </SectionCard>

        {/* ── 6. Evaluation Practice ─────────────────────────────────── */}
        <SectionCard
          id="evaluation-practice"
          title="Evaluation Practice"
          sub="Understanding how the agency measures impact."
        >
          <Field label="Evaluation Practice">
            <Textarea
              id="evaluationPractice"
              // {...register("evaluationPractice")}
              placeholder="How they collect it, how often..."
              rows={3}
            />
          </Field>
        </SectionCard>

        {/* ── 7. Member Experience and Needs ─────────────────────────── */}
        <SectionCard
          id="member-experience"
          title="Member Experience and Needs"
          sub="Capturing successes, challenges, and growth opportunities."
        >
          <Field label="Top 2-3 successes">
            {/* <FieldLabel htmlFor="topSuccesses">Top 2-3 successes</FieldLabel> */}
            <Textarea
              // {...register("topSuccesses")}
              placeholder="What's gone well this year..."
              rows={3}
              id="topSuccesses"
            />
          </Field>
          <Field label="Top 2-3 current challenges or opportunities for growth">
            {/* <FieldLabel htmlFor="topChallenges">Top 2-3 current challenges or opportunities for growth</FieldLabel> */}
            <Textarea
              id="topChallenges"
              // {...register("topChallenges")}
              placeholder="What's hard, or where they want to grow..."
              rows={3}
            />
          </Field>
        </SectionCard>

        {/* ── 8. FRP-BC Services Matrix ──────────────────────────────── */}
        <SectionCard
          id="frpbc-services-matrix"
          title="FRP-BC Services Matrix"
          sub="Track which resources and supports are being used and valued."
        >
          {/* <p className="text-sm text-gray-500 mb-4">FRP-BC resources or supports that you're currently using, or have used, that you've found valuable?</p> */}
          {/* <FieldLabel>FRP-BC resources or supports that you are currently using, or have used, that you've found valuable?</FieldLabel> */}
          <Field label="FRP-BC resources or supports that you are currently using, or have used, that you've found valuable?">
            <br />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 w-64">
                      Resource
                    </th>
                    {MATRIX_COLS.map(col => (
                      <th
                        key={col.key}
                        className="text-center text-xs text-gray-400 font-medium pb-3 px-2"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MATRIX_ROWS.map(row => (
                    <tr key={row} className="hover:bg-gray-50">
                      <td className="py-3 pr-4 text-sm text-gray-700">{row}</td>
                      {MATRIX_COLS.map(col => (
                        <td key={col.key} className="py-3 px-2 text-center">
                          <input
                            type="radio"
                            name={`matrix-${row}`}
                            checked={matrixValues[row] === col.key}
                            onChange={() => setMatrix(row, col.key)}
                            className="w-4 h-4 accent-[#396A72] cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5">
              <Field label="Supports or resources they would like to see, but aren't currently offered:">
                <Textarea
                  id="topSuccesses"
                  placeholder="Gaps they'd like filled..."
                  rows={3}
                />
              </Field>
            </div>
          </Field>
        </SectionCard>

        {/* ── 9. Offers & Wrap-up ────────────────────────────────────── */}
        <SectionCard
          id="offers-wrap-up"
          title="Offers & Wrap-up"
          sub="Opportunity shares, permissions, and follow-ups."
        >
          {/* Subscription toggle */}
          <Field label="Subscription / mailing list permission">
            <div id="subscriptionPermission" className="flex gap-2">
              {(["yes", "no", "ask_again_later"] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    // setSubscriptionPerm(opt)
                    // setValue("subscriptionPermission", opt)
                  }}
                  // className={`px-4 py-2 border rounded-xl text-sm font-medium
                  //             transition-all ${
                  //   subscriptionPerm === opt
                  //     ? "bg-[#3b656b] border-[#396A72] text-white"
                  //     : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  // }`}
                >
                  {opt === "yes"            ? "Yes"
                   : opt === "no"           ? "No"
                   : "Ask Again Later"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Relevant opportunities shared">
            <Textarea
              id="opportunitiesShared"
              // {...register("opportunitiesShared")}
              placeholder="Grants, events, opportunities mentioned..."
              rows={3}
            />
          </Field>

          <Field label="Confirm follow-up action">
            <Textarea
              id="followUpAction"
              placeholder="e.g. Send training dates by month-end..."
              rows={2}
            />
          </Field>
        </SectionCard>

        {/* ── Sticky footer ──────────────────────────────────────────── */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4
                        flex items-center justify-between -mx-0 mt-2 rounded-b-xl">
          <button
            type="button"
            // onClick={prefill}
            className="text-[#396A72] text-sm font-semibold hover:underline
                       flex items-center gap-1"
          >
            {/* ✦ Prefill sample data */}
          </button>
          {/* <div className="flex items-center gap-3">
            <button
              type="button"
              // onClick={() => reset()}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                         font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || saved}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-[#396A72] hover:bg-[#2c5359] text-white disabled:opacity-60"
              }`}
            >
              {saved    ? "✓ Saved!"
               : isSaving ? "Saving..."
               : "Save Changes"}
            </button>
          </div> */}
        </div>
      </form>

    </div>
  )
}