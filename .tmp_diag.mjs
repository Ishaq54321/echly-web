// Headless-Chrome CDP diagnostic: measure right-edge overflow + screenshot.
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import zlib from "node:zlib";

// Minimal PNG decoder (truecolor/truecolor+alpha, 8-bit, no interlace) — enough
// to read pixel colors out of a CDP screenshot.
function decodePng(buf) {
  let p = 8; // skip signature
  let width, height, colorType, bitDepth;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p); p += 4;
    const type = buf.toString("ascii", p, p + 4); p += 4;
    const data = buf.subarray(p, p + len); p += len; p += 4; // skip CRC
    if (type === "IHDR") {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const channels = colorType === 6 ? 4 : 3;
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let rp = 0;
  const prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const cur = out.subarray(y * stride, y * stride + stride);
    for (let i = 0; i < stride; i++) {
      const x = raw[rp++];
      const a = i >= channels ? cur[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      let v;
      switch (filter) {
        case 0: v = x; break;
        case 1: v = x + a; break;
        case 2: v = x + b; break;
        case 3: v = x + ((a + b) >> 1); break;
        case 4: {
          const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
          v = x + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); break;
        }
        default: v = x;
      }
      cur[i] = v & 0xff;
    }
    cur.copy(prev);
  }
  return { width, height, channels, data: out };
}

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9222;
const URL = "http://localhost:3000/";

const proc = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--window-size=1440,900",
  "--no-first-run",
  "--no-default-browser-check",
  "--user-data-dir=" + process.cwd() + "\\.tmp_chrome_profile",
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPageWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json`);
      const list = await r.json();
      const page = list.find((t) => t.type === "page" && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome CDP page target did not come up");
}

function cdp(ws) {
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  return (method, params = {}, sessionId) =>
    new Promise((resolve) => {
      const mid = ++id;
      pending.set(mid, resolve);
      ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
}

async function main() {
  const wsUrl = await getPageWsUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));
  const s = cdp(ws); // connected directly to the page target

  await s("Page.enable");
  await s("Runtime.enable");
  await s("Page.navigate", { url: URL });
  await sleep(4000); // let hero + demo render

  const expr = `(() => {
    const de = document.documentElement;
    const vw = window.innerWidth;
    const docW = de.scrollWidth;
    const offenders = [];
    document.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.right > vw + 0.5) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && el.className.toString) ? el.className.toString().slice(0,60) : '',
          right: Math.round(r.right),
          width: Math.round(r.width),
        });
      }
    });
    const mr = document.querySelector('.marketing-root');
    const mrRect = mr ? mr.getBoundingClientRect() : null;
    const cs = mr ? getComputedStyle(mr) : null;
    return JSON.stringify({
      innerWidth: vw,
      docScrollWidth: docW,
      hasHScroll: docW > vw,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      htmlBg: getComputedStyle(document.documentElement).backgroundColor,
      marketingRootRight: mrRect ? Math.round(mrRect.right) : null,
      marketingRootWidth: mrRect ? Math.round(mrRect.width) : null,
      offenders: offenders.slice(0, 10),
    }, null, 2);
  })()`;

  const evalResp = await s("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  console.log("=== DIAG ===");
  if (evalResp.result && evalResp.result.result) {
    console.log(evalResp.result.result.value);
  } else {
    console.log("RAW:", JSON.stringify(evalResp, null, 2));
  }

  const shot = await s("Page.captureScreenshot", { format: "png" });
  const png = Buffer.from(shot.result.data, "base64");
  writeFileSync(".tmp_hero.png", png);
  console.log("screenshot -> .tmp_hero.png");

  // Inspect actual rendered pixels along the right edge at the hero band.
  const { width, height, channels, data } = decodePng(png);
  const px = (x, y) => {
    const i = (y * width + x) * channels;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const y = Math.min(160, height - 1);
  console.log(`=== RIGHT-EDGE PIXELS (image ${width}x${height}, y=${y}) ===`);
  for (const dx of [0, 1, 2, 3, 5, 10, 20, 40]) {
    const x = width - 1 - dx;
    const [r, g, b] = px(x, y);
    const offWhite = r > 245 && g > 243 && b > 240; // ~#FAF9F7 / #FAFAFA
    console.log(`x=${x} (edge-${dx})  rgb(${r},${g},${b})${offWhite ? "  <-- OFF-WHITE STRIP" : ""}`);
  }

  ws.close();
  proc.kill();
  process.exit(0);
}

main().catch((e) => { console.error(e); proc.kill(); process.exit(1); });
