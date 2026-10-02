'use client'

// ─── Icons ────────────────────────────────────────────────────────────────────
export const UrlRouter = {
    call: "/call",
    agency: "/agency",
    dashboard: "/dashboard",
    activity: "/activity",
}

// type for using UrlRouter keys
export type UrlRouterName = keyof typeof UrlRouter