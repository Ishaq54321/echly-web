/**
 * Demo extension controller: simulates extension state and actions
 * so the activation demo mirrors real product behavior.
 */

import type React from "react"

export type DemoFeedbackMode = "voice" | "write"

export type DemoTicket = { id: string; title: string; status: "open" | "resolved" }

export type DemoExtensionState = {
  /** null = no mode selected yet (for onboarding). */
  mode: DemoFeedbackMode | null
  sessionActive: boolean
  selection: { x: number; y: number } | null
  feedback: string | null
  processing: boolean
  tickets: DemoTicket[]
}

export const DEFAULT_DEMO_EXTENSION_STATE: DemoExtensionState = {
  mode: null,
  sessionActive: false,
  selection: null,
  feedback: null,
  processing: false,
  tickets: [],
}

export const DEMO_TICKETS: DemoTicket[] = [
  { id: "1", title: "Improve visual hierarchy of landing page", status: "open" },
  { id: "2", title: "Enhance onboarding section to feel more engaging", status: "open" },
  { id: "3", title: "Refine overall UI spacing consistency", status: "resolved" },
]

export type DemoExtensionController = {
  selectMode: (mode: DemoFeedbackMode) => void
  startSession: () => void
  endSession: () => void
  captureSelection: (x: number, y: number) => void
  clearSelection: () => void
  submitVoice: () => void
  submitWrite: (text: string) => void
  processFeedback: () => void
  generateTickets: () => void
  reset: () => void
}

export function createDemoExtensionController(
  setState: React.Dispatch<React.SetStateAction<DemoExtensionState>>
): DemoExtensionController {
  function update(partial: Partial<DemoExtensionState>) {
    setState((prev) => ({ ...prev, ...partial }))
  }

  return {
    selectMode(mode: DemoFeedbackMode) {
      update({ mode })
    },

    startSession() {
      update({ sessionActive: true, selection: null, feedback: null, processing: false, tickets: [] })
    },

    endSession() {
      update({
        sessionActive: false,
        selection: null,
        feedback: null,
        processing: false,
        tickets: [],
      })
    },

    captureSelection(x: number, y: number) {
      update({ selection: { x, y } })
    },

    clearSelection() {
      update({ selection: null })
    },

    submitVoice() {
      update({ feedback: "(voice)" })
    },

    submitWrite(text: string) {
      update({ feedback: text || "(write)" })
    },

    processFeedback() {
      update({ feedback: null, processing: true })
    },

    generateTickets() {
      update({ processing: false, tickets: DEMO_TICKETS.map((t) => ({ ...t })) })
    },

    reset() {
      setState({ ...DEFAULT_DEMO_EXTENSION_STATE })
    },
  }
}
