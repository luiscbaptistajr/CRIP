'use client'

import { Icons } from "../Icons";
import { ReactNode } from "react";

type PageType = "call" | "agencies" | "dashboard" | "activities"

const PAGE_CONFIG: Record<PageType, { title: string; bg: string; color: string; icon?: ReactNode; }> = {
  call: {
    title:    "Renewal Call",
    bg:       "#E1F5EE",
    color:    "#396A72",
    icon:     Icons.call,
  },
  agencies: {
    title:    "Agencies",
    bg:       "#EEF2FF",
    color:    "#3730A3",
    icon:     Icons.agency
  },
  dashboard: {
    title:    "Dashboard",
    bg:       "#FEF9C3",
    color:    "#854D0E",
    icon:     Icons.dashboard,
  },
  activities: {
    title:    "Activities",
    bg:       "#FEE2E2",
    color:    "#991B1B",
    icon:     Icons.activity,
  },
}

// ─── Pagination component ─────────────────────────────────────────────────────
export default function PageHeader({ page }: { page: PageType }) {
  const cfg = PAGE_CONFIG[page]

  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: cfg.bg, color: cfg.color }}
      >
        {cfg.icon}
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900">
        {cfg.title}
      </h1>
    </div>
  )
}