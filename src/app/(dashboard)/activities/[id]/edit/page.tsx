"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/trpc"

// ─── Types ────────────────────────────────────────────────────────────────────

type ActivityType = "call" | "email" | "note" | "meeting" | "task"

interface FormData {
  type:        ActivityType
  title:       string
  note:        string
  duration:    string
  outcome:     string
  completedAt: string
  dueAt:       string
}

// ─── Field components ─────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
  hint,
}: {
  label:    string
  required?: boolean
  children: React.ReactNode
  hint?:    string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-gray-900
                 focus:border-transparent placeholder:text-gray-300"
      {...props}
    />
  )
}

function Select({
  value,
  onChange,
  children,
}: {
  value:    string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-gray-900
                 focus:border-transparent bg-white"
    >
      {children}
    </select>
  )
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      value={value as string}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-gray-900
                 focus:border-transparent placeholder:text-gray-300 resize-none"
    />
  )
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<ActivityType, { label: string; icon: string; color: string }> = {
  call:    { label: "Call",    icon: "📞", color: "bg-blue-50   text-blue-700"  },
  email:   { label: "Email",   icon: "✉️",  color: "bg-purple-50 text-purple-700"},
  note:    { label: "Note",    icon: "📝", color: "bg-yellow-50 text-yellow-700"},
  meeting: { label: "Meeting", icon: "🤝", color: "bg-green-50  text-green-700" },
  task:    { label: "Task",    icon: "✅", color: "bg-orange-50 text-orange-700"},
}

// ─── Main edit form ───────────────────────────────────────────────────────────

export default function EditActivityPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [errors,  setErrors]  = useState<Partial<FormData>>({})
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState<FormData>({
    type:        "call",
    title:       "",
    note:        "",
    duration:    "",
    outcome:     "",
    completedAt: "",
    dueAt:       "",
  })

  // ── Fetch existing activity ────────────────────────────────────────────────
  const { data: activity, isLoading } = api.activities.getById.useQuery({
    id: params.id,
  })

  // ── Populate form when data loads ─────────────────────────────────────────
  useEffect(() => {
    if (!activity) return
    setForm({
      type:        (activity.type as ActivityType) ?? "call",
      title:       activity.title       ?? "",
      note:        activity.note        ?? "",
      duration:    activity.duration    ? String(activity.duration) : "",
      outcome:     activity.outcome     ?? "",
      completedAt: activity.completedAt
        ? new Date(activity.completedAt).toISOString().slice(0, 16)
        : "",
      dueAt: activity.dueAt
        ? new Date(activity.dueAt).toISOString().slice(0, 16)
        : "",
    })
  }, [activity])

  // ── Update mutation ────────────────────────────────────────────────────────
  const update = api.activities.update.useMutation({
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => router.back(), 1500)
    },
  })

  // ── Field change handler ───────────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  function validate(): boolean {
    const newErrors: Partial<FormData> = {}
    if (!form.title.trim()) newErrors.title = "Title is required"
    if (form.duration && isNaN(Number(form.duration))) {
      newErrors.duration = "Duration must be a number"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    update.mutate({
      id:          params.id,
      type:        form.type,
      title:       form.title.trim(),
      note:        form.note        || undefined,
      duration:    form.duration    ? Number(form.duration) : undefined,
      outcome:     form.outcome     || undefined,
      completedAt: form.completedAt || undefined,
      dueAt:       form.dueAt       || undefined,
    })
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent
                          rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading activity...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-gray-500">Activity not found.</p>
          <button onClick={() => router.back()}
            className="text-sm text-gray-900 underline">
            Go back
          </button>
        </div>
      </div>
    )
  }

  const typeConfig = TYPE_CONFIG[form.type]

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900
                       transition-colors mb-4"
          >
            ← Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeConfig.icon}</span>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Edit Activity</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Update the details of this {typeConfig.label.toLowerCase()} log
              </p>
            </div>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl
                          flex items-center gap-3">
            <span className="text-green-500 text-lg">✓</span>
            <p className="text-sm text-green-700 font-medium">
              Activity updated successfully — redirecting...
            </p>
          </div>
        )}

        {/* Error banner */}
        {update.isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm text-red-700">
              {update.error?.message ?? "Failed to update activity. Please try again."}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">

            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Activity details
            </h2>

            {/* Type */}
            <Field label="Activity type" required>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(TYPE_CONFIG) as ActivityType[]).map(type => {
                  const cfg = TYPE_CONFIG[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, type }))}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border
                                  text-xs font-medium transition-all ${
                        form.type === type
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <span className="text-lg">{cfg.icon}</span>
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </Field>

            {/* Title */}
            <Field label="Title" required hint="e.g. Follow-up call with John">
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Activity title"
              />
              {errors.title && (
                <p className="text-xs text-red-500 mt-1">{errors.title}</p>
              )}
            </Field>

            {/* Notes */}
            <Field label="Notes" hint="What was discussed or what needs to happen">
              <Textarea
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Add notes about this activity..."
                rows={4}
              />
            </Field>

          </div>

          {/* Call / meeting specific fields */}
          {(form.type === "call" || form.type === "meeting") && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {form.type === "call" ? "Call" : "Meeting"} details
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Duration (minutes)" hint="How long did it last?">
                  <Input
                    name="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    min="0"
                  />
                  {errors.duration && (
                    <p className="text-xs text-red-500 mt-1">{errors.duration}</p>
                  )}
                </Field>

                <Field label="Outcome" hint="How did it go?">
                  <Select name="outcome" value={form.outcome} onChange={handleChange}>
                    <option value="">Select outcome</option>
                    <option value="positive">😊 Positive</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="negative">😞 Negative</option>
                    <option value="no_answer">📵 No answer</option>
                    <option value="left_voicemail">📬 Left voicemail</option>
                  </Select>
                </Field>
              </div>
            </div>
          )}

          {/* Scheduling */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Scheduling
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Completed at" hint="When was this done?">
                <Input
                  name="completedAt"
                  type="datetime-local"
                  value={form.completedAt}
                  onChange={handleChange}
                />
              </Field>

              {form.type === "task" && (
                <Field label="Due date" hint="When is this due?">
                  <Input
                    name="dueAt"
                    type="datetime-local"
                    value={form.dueAt}
                    onChange={handleChange}
                  />
                </Field>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900
                         transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={update.isPending || success}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white
                         text-sm font-medium rounded-xl hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {update.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent
                                  rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>✓ Save changes</>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
