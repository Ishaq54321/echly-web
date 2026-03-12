"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, FileText, ChevronDown } from "lucide-react"

const MOCK_ACTION_STEPS = [
  "Review current hierarchy and contrast",
  "Prioritize key sections and CTAs",
]

type TicketStatus = "Open" | "Resolved"

type TicketItem = { id: string; title: string; status: TicketStatus; preview?: string; actionSteps?: string[] }

const MOCK_TICKETS: TicketItem[] = [
  { id: "1", title: "Improve visual hierarchy of landing page", status: "Open", preview: "Clarify section order and emphasis.", actionSteps: MOCK_ACTION_STEPS },
  { id: "2", title: "Enhance onboarding section to feel more engaging", status: "Open", preview: "Make first-time experience clearer and more inviting.", actionSteps: MOCK_ACTION_STEPS },
  { id: "3", title: "Refine overall UI spacing consistency", status: "Resolved", preview: "Align padding and gaps across components.", actionSteps: ["Apply spacing scale", "Update card and list components"] },
]

function UITicketPreview({ ticketId }: { ticketId: string }) {
  const wrapper = "absolute inset-2 rounded border border-gray-200 bg-white overflow-hidden flex flex-col";
  if (ticketId === "1") {
    return (
      <div className={wrapper}>
        <div className="flex-1 p-3 flex flex-col items-center justify-center gap-2 min-h-0">
          <div className="h-2.5 w-[75%] max-w-[120px] bg-gray-200 rounded shrink-0" />
          <div className="h-1.5 w-full max-w-[90%] bg-gray-100 rounded shrink-0" />
          <div className="rounded-md border-2 border-[#9FE870] bg-[#E9ECEB] px-3 py-1.5 shadow-[0_0_0_2px_rgba(159,232,112,0.25)]">
            <span className="text-[9px] font-semibold text-[#111111]">Get started</span>
          </div>
        </div>
      </div>
    )
  }
  if (ticketId === "2") {
    return (
      <div className={wrapper}>
        <div className="flex-1 p-2 flex gap-1.5 items-stretch min-h-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-1 rounded border border-gray-200 bg-gray-50/80 flex flex-col gap-1 p-1.5">
              <div className="h-1.5 w-8 bg-gray-200 rounded shrink-0" />
              <div className="h-1 w-full bg-gray-100 rounded shrink-0" />
              <div className="flex-1 min-h-0 rounded bg-gray-100/80" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (ticketId === "3") {
    return (
      <div className={wrapper}>
        <div className="flex-1 p-3 flex flex-col gap-2.5 justify-center min-h-0">
          <div className="h-2 w-14 bg-gray-200 rounded shrink-0" />
          <div className="h-5 rounded border border-gray-200 bg-gray-50/80" />
          <div className="h-5 rounded border border-gray-200 bg-gray-50/80" />
        </div>
      </div>
    )
  }
  return (
    <div className={`${wrapper} items-center justify-center`}>
      <div className="h-2 w-12 bg-gray-100 rounded" />
    </div>
  )
}

function TicketGroup({
  label,
  count,
  expanded,
  onToggle,
  tickets,
  selectedId,
  onSelect,
}: {
  label: string
  count: number
  expanded: boolean
  onToggle: () => void
  tickets: TicketItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const isOpen = label === "Open"
  const groupStyles = isOpen
    ? "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100/80"
    : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100/80"
  return (
    <div className="mb-2 last:mb-0">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between text-left py-2 px-2 rounded-lg border transition-colors ${groupStyles}`}
      >
        <span className="text-[11px] font-semibold">
          {label} ({count})
        </span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#111111]"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </button>
      {expanded && (
        <div className="space-y-1 pt-0.5">
          {tickets.map((ticket) => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => onSelect(ticket.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors ${
                selectedId === ticket.id
                  ? "bg-[#E9ECEB] border border-[#9FE870]/40 text-[#111111]"
                  : "hover:bg-[#E9ECEB] text-[#4A4A4A] border border-transparent"
              }`}
            >
              <div className="text-[12px] font-medium truncate">{ticket.title}</div>
              <div className="text-[10px] text-[#111111] mt-0.5">{ticket.status}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DemoFeedbackDashboard() {
  const [selectedId, setSelectedId] = React.useState<string | null>(MOCK_TICKETS[0]?.id ?? null)
  const selected = MOCK_TICKETS.find((t) => t.id === selectedId)
  const openTickets = MOCK_TICKETS.filter((t) => t.status === "Open")
  const resolvedTickets = MOCK_TICKETS.filter((t) => t.status === "Resolved")
  const [openExpanded, setOpenExpanded] = useState(true)
  const [resolvedExpanded, setResolvedExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-full" />
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="w-3 h-3 bg-[#6B6F75] rounded-full" />
        </div>
        <div className="ml-4 text-xs text-[#111111] select-none">Echly · Feedback</div>
      </div>

      <div className="flex h-[440px]">
        {/* Left sidebar - ticket list with collapsible groups */}
        <div className="w-[260px] border-r border-gray-200 bg-gray-50/60 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-[13px] font-semibold text-[#111111] flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#466EFF]" />
              Tickets
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <TicketGroup
              label="Open"
              count={openTickets.length}
              expanded={openExpanded}
              onToggle={() => setOpenExpanded((e) => !e)}
              tickets={openTickets}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <TicketGroup
              label="Resolved"
              count={resolvedTickets.length}
              expanded={resolvedExpanded}
              onToggle={() => setResolvedExpanded((e) => !e)}
              tickets={resolvedTickets}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </div>

        {/* Right - ticket details */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {selected ? (
            <>
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="text-[15px] font-semibold text-[#111111]">{selected.title}</h3>
                <span className="inline-block mt-1.5 text-[11px] font-medium text-[#466EFF] bg-[#466EFF]/10 px-2 py-0.5 rounded-full">
                  {selected.status}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-[#111111] mb-2">
                    <FileText className="h-3.5 w-3.5" />
                    Action Steps
                  </div>
                  <ul className="space-y-1.5">
                    {(selected.actionSteps ?? MOCK_ACTION_STEPS).map((step, i) => (
                      <li key={i} className="text-[12px] text-[#4A4A4A] flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F1F3F2] text-[10px] font-semibold text-[#111111] border border-[#E3E6E5]">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                  <div className="h-[160px] rounded-lg bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-2 flex items-center justify-center relative overflow-hidden">
                    <UITicketPreview ticketId={selected.id} />
                    <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#9FE870] text-[#111111] text-[9px] font-semibold flex items-center justify-center shadow-sm">
                      1
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#111111] text-sm">
              Select a ticket
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
