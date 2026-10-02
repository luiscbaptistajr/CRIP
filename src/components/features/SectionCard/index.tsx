"use client"

// ─── Reusable field components ────────────────────────────────────────────────
export default function SectionCard({
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