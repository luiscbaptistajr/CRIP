'use client'

export default function UpdateRow({
  label, value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100
                    last:border-b-0">
      <div className="flex items-center gap-8">
        <span className="text-sm text-gray-400 w-40 shrink-0">{label}</span>
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