"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
// import { Field, FieldLabel } from "../components/ui/field"
import { Footer } from "react-day-picker"
import Image from 'next/image'
import imageURL from "../public/frpbc_logo.png"

import RenewalCall from "@/components/containers/RenewalCall"
import Dashboard from "@/components/containers/Dashboard"
import AgenciesTable from "@/components/containers/AgenciesTable"
import PageHeader from "@/components/features/PageHeader"

import { Icons } from "@/components/features/Icons"


// ─── Types ────────────────────────────────────────────────────────────────────

// type Page = "agencies" | "dashboard" | "activities" | "notification" | "settings"
type Page = "agencies" | "dashboard"
type LogType = "event" | "note" | "frpweek" | "call"

// ─── Types ────────────────────────────────────────────────────────────────────


const PAGES: { id: Page; label: string; }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "agencies", label: "Agencies" }, // Companies
]

const ACTIVITIES: { id: LogType; label: string; } [] = [
  { id: "event", label: "Event" },
  { id: "note", label: "Note" },
  { id: "frpweek", label: "FRP Week" },
  { id: "call", label: "Renewal Call" },
]

// ─── Notification data ────────────────────────────────────────────────────────
const NOTIFICATIONS = [
  {
    title: "Renewal due soon",
    body:  "3 agencies have renewals due in the next 30 days.",
  },
  {
    title: "New note added",
    body:  "A teammate logged a note on Saanich Neighbourhood House.",
  },
  {
    title: "Event RSVP",
    body:  "2 new registrants for the Spring Leadership Summit.",
  },
]

function Popover({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200
                    rounded-xl shadow-lg z-50 overflow-hidden">
      {children}
    </div>
  )
}

export default function App({
  // onOpenLogNote,
  // onOpenLogEvent,
}: {
  onOpenLogNote?:  () => void
  onOpenLogEvent?: (type: "event" | "frpweek") => void
}) {
  const [activePage, setActivePage] = useState<Page>("agencies")

  // ── Popover open states ────────────────────────────────────────────────────
  const [logOpen,      setLogOpen]      = useState(false)
  const [bellOpen,     setBellOpen]     = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // ── Refs for click-outside detection ──────────────────────────────────────
  const logRef      = useRef<HTMLDivElement>(null)
  const bellRef     = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  console.log({activePage});
 
  // ── Close all popovers when clicking outside ───────────────────────────────
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (logRef.current      && !logRef.current.contains(e.target as Node))
        setLogOpen(false)
      if (bellRef.current     && !bellRef.current.contains(e.target as Node))
        setBellOpen(false)
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node))
        setSettingsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  // ── Close all except one ───────────────────────────────────────────────────
  function closeAllExcept(keep: "log" | "bell" | "settings") {
    if (keep !== "log")      setLogOpen(false)
    if (keep !== "bell")     setBellOpen(false)
    if (keep !== "settings") setSettingsOpen(false)
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function handleLogout() {
    setSettingsOpen(false)
    sessionStorage.clear()
    localStorage.clear()
    // router.push("/login")
  }

  // ── Reset data ─────────────────────────────────────────────────────────────
  function handleResetData() {
    const confirmed = window.confirm(
      "Reset all prototype data back to the original mock data? " +
      "This clears any agencies, staff, or activities you have added or edited."
    )
    if (!confirmed) return
    localStorage.removeItem("crip-storage")
    setSettingsOpen(false)
    // goToAgencies()
  }



  return(
    <div className="bg-white mx-full px-6">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 py-5 h-30 flex items-center
                       justify-between flex-shrink-0 sticky top-0 z-40">
      {/* <header className="flex flex-col gap-2 p-8 sm:flex-row sm:items-center sm:gap-6 sm:py-4"> */}
        <div className="flex items-center gap-6">
          <h1><Image src={imageURL} alt="Family Resource Program" /></h1>
        </div>
        <div className="flex gap-1 p-1 rounded-xl w-fit">
          <nav className="flex items-center gap-1">
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
                {/* <span>{menu.icon}</span> */}
                {menu.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* LOG ACTIVITY BUTTON */}
          <div className="relative" ref={logRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeAllExcept("log")
                setLogOpen(prev => !prev)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#396A72] hover:bg-[#2c5359]
                        text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {Icons.plus}
              Log Activity
            </button>
            <Popover open={logOpen}>
              <div className="p-1">
                {ACTIVITIES.map(logType => (
                  <button
                    key={logType.id}
                    onClick={() => setActivePage(logType.id)}
                    // className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    //   activePage === logType.id
                    //     ? "bg-white text-gray-900 shadow-sm"
                    //     : "text-gray-500 hover:text-gray-700"
                    // }`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all`}
                  >
                    {/* <span>{logType.icon}</span> */}
                    {logType.label}
                  </button>
                ))}
              </div>
            </Popover>
          </div>

          {/* ICON BUTTONS */}

          {/* ── Bell / notifications ────────────────────────────────────── */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeAllExcept("bell")
                setBellOpen(prev => !prev)
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl
                        text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {Icons.bell}
              {/* unread dot */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500
                              rounded-full border-2 border-white" />
            </button>
            <Popover open={bellOpen}>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">Notifications</p>
              </div>
              <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                {NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.body}</p>
                  </div>
                ))}
              </div>
            </Popover>
          </div>

          {/* ── Settings ────────────────────────────────────────────────── */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeAllExcept("settings")
                setSettingsOpen(prev => !prev)
              }}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500
                        hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {Icons.settings}
            </button>
            <Popover open={settingsOpen}>
              <div className="p-1">
                <button
                  onClick={handleResetData}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700
                            hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {Icons.trash}
                  Reset prototype data
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600
                            hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  {Icons.logout}
                  Log out
                </button>
              </div>
            </Popover>
          </div>
          
        </div>
      </header>

      {/* Page Header */}
      <div className="pb-8 pt-8">
        {/* Page title */}
        <PageHeader page={activePage} />  
      </div>

      {/* CONTENT */}
      <main className="mx-auto px-6 py-10">
        {activePage === "dashboard" && <Dashboard />}
        {activePage === "agencies" && <AgenciesTable />}
        {activePage === "call" && <RenewalCall />}
      </main>

      <Footer />
    </div>
  )
}