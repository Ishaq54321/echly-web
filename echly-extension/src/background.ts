import { ECHLY_DEBUG, warn } from "../../lib/utils/logger"
import { echlyLog } from "../../lib/debug/echlyLogger"

const API_BASE =
typeof process !== "undefined" && process.env?.NODE_ENV === "development"
? "http://localhost:3000"
: "https://echly-web.vercel.app"

const LOGIN_URL = "https://echly-web.vercel.app/login"

let extensionAccessToken: string | null = null
let originTabId: number | null = null

let activeSessionId: string | null = null

type StructuredFeedback = {
id: string
title: string
actionSteps: string[]
type?: string
}

let globalUIState = {
visible: false,
expanded: false,
isRecording: false,
sessionId: null as string | null,
sessionTitle: null as string | null,
sessionModeActive: false,
sessionPaused: false,
sessionLoading: false,
pointers: [] as StructuredFeedback[],
captureMode: "voice" as "voice" | "text",
user: null as {
uid: string
name?: string | null
email?: string | null
photoURL?: string | null
} | null,
}

const SESSION_IDLE_TIMEOUT = 30 * 60 * 1000
let idleTimer: ReturnType<typeof setTimeout> | null = null

function resetIdleTimer() {
if (!globalUIState.sessionModeActive) return

if (idleTimer) clearTimeout(idleTimer)

idleTimer = setTimeout(() => {
endSession()
}, SESSION_IDLE_TIMEOUT)
}

function endSession() {
activeSessionId = null

globalUIState.sessionId = null
globalUIState.sessionTitle = null
globalUIState.sessionModeActive = false
globalUIState.sessionPaused = false
globalUIState.sessionLoading = false
globalUIState.pointers = []

chrome.storage.local.set({
activeSessionId: null,
sessionModeActive: false,
sessionPaused: false,
})

broadcastState()
}

async function restoreToken() {
const data = await chrome.storage.local.get("echly_extension_token")

if (typeof data?.echly_extension_token === "string") {
extensionAccessToken = data.echly_extension_token
}
}

async function persistToken(token: string) {
await chrome.storage.local.set({
echly_extension_token: token,
})
}

function clearAuthState() {
extensionAccessToken = null

chrome.storage.local.remove("echly_extension_token")

globalUIState.user = null
globalUIState.visible = false
globalUIState.expanded = false

broadcastState()
}

function broadcastState() {
const payload = {
type: "ECHLY_GLOBAL_STATE",
state: globalUIState,
}

chrome.tabs.query({}, tabs => {
  for (const tab of tabs) {
    if (!tab.id) continue
    chrome.tabs.sendMessage(tab.id, payload).catch(() => {})
  }
})
}

function openTray() {
globalUIState.visible = true
globalUIState.expanded = true
broadcastState()
}

function collapseTray() {
globalUIState.expanded = false
broadcastState()
}

async function openLogin(tab?: chrome.tabs.Tab) {
const loginUrl =
LOGIN_URL +
"?extension=true" +
(tab?.url ? "&returnUrl=" + encodeURIComponent(tab.url) : "")

chrome.tabs.create({ url: loginUrl })
}

async function getValidToken(): Promise<string> {
if (extensionAccessToken) return extensionAccessToken

throw new Error("NOT_AUTHENTICATED")
}

chrome.action.onClicked.addListener(async tab => {
originTabId = tab?.id ?? null

if (extensionAccessToken) {
openTray()
return
}

await openLogin(tab)
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

if (request.type === "ECHLY_EXTENSION_LOGIN_SUCCESS") {

  const { idToken, uid, name, email } = request

  if (!idToken || !uid) return false

  extensionAccessToken = idToken

  persistToken(idToken)

  globalUIState.user = {
    uid,
    name: name ?? null,
    email: email ?? null,
    photoURL: null,
  }

  if (originTabId) {
    chrome.tabs.update(originTabId, { active: true }).catch(() => {})
  }

  openTray()

  return false
}

if (request.type === "ECHLY_DASHBOARD_LOGOUT") {
clearAuthState()
return false
}

if (request.type === "ECHLY_GET_GLOBAL_STATE") {
sendResponse({ state: globalUIState })
return true
}

if (request.type === "ECHLY_EXPAND_WIDGET") {
globalUIState.expanded = true
broadcastState()
return false
}

if (request.type === "ECHLY_COLLAPSE_WIDGET") {
collapseTray()
return false
}

if (request.type === "ECHLY_SET_ACTIVE_SESSION") {

  const sessionId = request.sessionId ?? null

  activeSessionId = sessionId

  globalUIState.sessionId = sessionId
  globalUIState.sessionModeActive = true
  globalUIState.sessionPaused = false
  globalUIState.sessionLoading = false

  if (sessionId) {
    globalUIState.expanded = true
    resetIdleTimer()
  }

  chrome.storage.local.set({
    activeSessionId: sessionId,
    sessionModeActive: true,
    sessionPaused: false,
  })

  broadcastState()

  sendResponse({ success: true })

  return true
}

if (request.type === "ECHLY_SESSION_MODE_START") {

  globalUIState.sessionModeActive = true
  globalUIState.sessionPaused = false

  resetIdleTimer()

  broadcastState()

  sendResponse({ ok: true })

  return false
}

if (request.type === "ECHLY_SESSION_MODE_END") {

  endSession()

  sendResponse({ success: true })

  return true
}

if (request.type === "START_RECORDING") {

  if (!activeSessionId) {
    sendResponse({ ok: false })
    return false
  }

  globalUIState.sessionId = activeSessionId
  globalUIState.isRecording = true

  resetIdleTimer()

  broadcastState()

  sendResponse({ ok: true })

  return false
}

if (request.type === "STOP_RECORDING") {

  globalUIState.isRecording = false

  broadcastState()

  sendResponse({ ok: true })

  return false
}

if (request.type === "ECHLY_GET_TOKEN") {

  ;(async () => {
    try {
      const token = await getValidToken()

      sendResponse({ token })

    } catch {
      sendResponse({ error: "NOT_AUTHENTICATED" })
    }
  })()

  return true
}

if (request.type === "CAPTURE_TAB") {

  ;(async () => {

    try {

      const dataUrl = await new Promise<string>((resolve, reject) => {

        chrome.tabs.captureVisibleTab(sender.tab!.windowId, { format: "png" }, result => {

          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
            return
          }

          resolve(result)
        })
      })

      sendResponse({
        success: true,
        screenshot: dataUrl,
      })

    } catch {

      sendResponse({ success: false })
    }

  })()

  return true
}

if (request.type === "echly-api") {

  const { url, method, headers, body } = request

;(async () => {

  try {

    const token = await getValidToken()

    const res = await fetch(url, {
      method: method || "GET",
      headers: {
        ...(headers || {}),
        Authorization: `Bearer ${token}`,
      },
      body: body ?? undefined,
    })

    if (res.status === 401 || res.status === 403) {
      clearAuthState()
    }

    const text = await res.text()

    const out: Record<string, string> = {}

    res.headers.forEach((v, k) => {
      out[k] = v
    })

    sendResponse({
      ok: res.ok,
      status: res.status,
      headers: out,
      body: text,
    })

  } catch (err) {

    sendResponse({
      ok: false,
      status: 0,
      headers: {},
      body: String(err),
    })

  }

})()

  return true
}

return false
})

;(async () => {
await restoreToken()
})()
