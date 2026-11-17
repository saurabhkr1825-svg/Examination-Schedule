import { spawn } from "child_process";
import http from "http";
import fs from "fs";
import path from "path";

interface Breakpoint {
  width: number;
  height: number;
  name: string;
}

const BREAKPOINTS: Breakpoint[] = [
  { width: 320, height: 568, name: "320px (iPhone SE 1st gen / small mobile)" },
  { width: 360, height: 800, name: "360px (Galaxy S8/S9 / standard Android)" },
  { width: 375, height: 667, name: "375px (iPhone 6/7/8/SE 2nd gen)" },
  { width: 390, height: 844, name: "390px (iPhone 12/13/14 Pro)" },
  { width: 412, height: 915, name: "412px (Pixel 7 / Galaxy S21)" },
  { width: 430, height: 932, name: "430px (iPhone 14/15/16 Pro Max)" },
  { width: 768, height: 1024, name: "768px (iPad Mini / Tablet portrait)" },
  { width: 1024, height: 768, name: "1024px (iPad Pro / Small Laptop)" },
  { width: 1440, height: 900, name: "1440px (Desktop / Large display)" },
];

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const PROFILE_DIR = path.join(__dirname, "..", ".edge-test-profile");

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson<T = unknown>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

async function run() {
  console.log("==================================================");
  console.log("   AUTOMATED RESPONSIVE BREAKPOINT TEST SUITE    ");
  console.log("==================================================\n");

  if (!fs.existsSync(PROFILE_DIR)) {
    fs.mkdirSync(PROFILE_DIR, { recursive: true });
  }

  const browser = spawn(EDGE_PATH, [
    "--headless=new",
    "--remote-debugging-port=9222",
    `--user-data-dir=${PROFILE_DIR}`,
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ]);

  let wsUrl: string | null = null;
  for (let i = 0; i < 20; i++) {
    await wait(300);
    try {
      const list = await fetchJson<Array<{ webSocketDebuggerUrl?: string }>>("http://127.0.0.1:9222/json/list");
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch {
      // wait and retry
    }
  }

  if (!wsUrl) {
    console.error("Failed to connect to headless Edge via CDP.");
    browser.kill();
    process.exit(1);
  }

  console.log("Connected to Headless Edge via CDP WebSocket.");

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  let msgId = 1;
  interface PendingPromise {
    resolve: (res: unknown) => void;
    reject: (err: unknown) => void;
  }
  const pending = new Map<number, PendingPromise>();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data as string);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)!;
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  function send<T = unknown>(method: string, params: Record<string, unknown> = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve: resolve as (res: unknown) => void, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send("Page.enable");
  await send("DOM.enable");
  await send("Runtime.enable");

  let totalTests = 0;
  let passedTests = 0;

  for (const bp of BREAKPOINTS) {
    console.log(`\nTesting Breakpoint: ${bp.name}`);
    await send("Emulation.setDeviceMetricsOverride", {
      width: bp.width,
      height: bp.height,
      deviceScaleFactor: 1,
      mobile: bp.width < 768,
      screenOrientation: { angle: 0, type: "portraitPrimary" },
    });

    // Navigate to /timetable and wait for load
    const navigatePromise = new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        ws.removeEventListener("message", handler);
        resolve();
      }, 3500);
      const handler = (event: Event) => {
        const msg = JSON.parse((event as MessageEvent).data as string);
        if (msg.method === "Page.loadEventFired") {
          clearTimeout(timer);
          ws.removeEventListener("message", handler);
          resolve();
        }
      };
      ws.addEventListener("message", handler);
    });

    const baseUrl = process.env.TEST_URL || "https://examination-schedule.vercel.app";
    await send("Page.navigate", { url: `${baseUrl}/timetable` });
    await navigatePromise;
    // Wait for hydration
    await wait(1200);

    // Evaluate layout metrics
    interface LayoutEvaluation {
      clientWidth: number;
      scrollWidth: number;
      hasHorizontalScroll: boolean;
      isHamburgerVisible: boolean;
      isDesktopNavVisible: boolean;
      badgeCount: number;
      anyBadgeOverflows: boolean;
      timingBadgesFound: number;
    }

    const evalRes = await send<{ result: { value: LayoutEvaluation } }>("Runtime.evaluate", {
      expression: `(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientWidth = doc.clientWidth;
        const hasHorizontalScroll = scrollWidth > clientWidth;

        // Check header branding
        const branding = document.querySelector('header a');
        const headerRect = branding ? branding.getBoundingClientRect() : null;

        // Check hamburger vs desktop nav
        const hamburger = document.querySelector('button[aria-label*="navigation menu"]');
        const isHamburgerVisible = hamburger ? (window.getComputedStyle(hamburger).display !== 'none') : false;
        const desktopNav = document.querySelector('header nav');
        const isDesktopNavVisible = desktopNav ? (window.getComputedStyle(desktopNav).display !== 'none') : false;

        // Check weekday badges
        const weekdayBadges = Array.from(document.querySelectorAll('span[aria-label*="Weekday:"]'));
        const badgeCheck = weekdayBadges.map(b => {
          const rect = b.getBoundingClientRect();
          const text = b.innerText.trim();
          return {
            text,
            width: rect.width,
            height: rect.height,
            overflows: b.scrollWidth > b.clientWidth,
          };
        });

        // Check timing badges
        const timingBadges = Array.from(document.querySelectorAll('.font-mono')).filter(el => 
          el.innerText.includes('9:30 AM') || el.innerText.includes('3:00 PM')
        );

        return {
          clientWidth,
          scrollWidth,
          hasHorizontalScroll,
          isHamburgerVisible,
          isDesktopNavVisible,
          badgeCount: weekdayBadges.length,
          anyBadgeOverflows: badgeCheck.some(b => b.overflows),
          timingBadgesFound: timingBadges.length,
        };
      })()`,
      returnByValue: true,
    });

    if (!evalRes.result || !evalRes.result.value) {
      console.error("CDP Evaluate failed:", JSON.stringify(evalRes));
      continue;
    }
    const res = evalRes.result.value;

    // Check 1: No Horizontal Overflow
    totalTests++;
    if (!res.hasHorizontalScroll) {
      console.log(`  PASS: No horizontal scroll (ClientWidth: ${res.clientWidth}px, ScrollWidth: ${res.scrollWidth}px)`);
      passedTests++;
    } else {
      console.error(`  FAIL: Horizontal scroll detected! (ClientWidth: ${res.clientWidth}px, ScrollWidth: ${res.scrollWidth}px)`);
    }

    // Check 2: Correct navigation pattern (Mobile Hamburger < 768px, Desktop Nav >= 768px)
    totalTests++;
    if (bp.width < 768) {
      if (res.isHamburgerVisible && !res.isDesktopNavVisible) {
        console.log(`  PASS: Mobile hamburger menu active & desktop navigation hidden.`);
        passedTests++;
      } else {
        console.error(`  FAIL: Expected hamburger visible and desktop nav hidden at ${bp.width}px.`);
      }
    } else {
      if (res.isDesktopNavVisible && !res.isHamburgerVisible) {
        console.log(`  PASS: Desktop navigation active & hamburger menu hidden.`);
        passedTests++;
      } else {
        console.error(`  FAIL: Expected desktop nav visible and hamburger hidden at ${bp.width}px.`);
      }
    }

    // Check 3: Weekday badge sizing and zero overflow
    totalTests++;
    if (res.badgeCount === 9 && !res.anyBadgeOverflows) {
      console.log(`  PASS: All 9 weekday badges properly sized with zero text overflow.`);
      passedTests++;
    } else {
      console.error(`  FAIL: Weekday badges failed checks (Found ${res.badgeCount}, anyOverflow: ${res.anyBadgeOverflows})`);
    }

    // Check 4: Mobile Hamburger interaction (tap to open, verify links, tap to close)
    if (bp.width < 768) {
      totalTests++;
      interface ToggleEvaluation {
        ok: boolean;
        isButtonExpanded: boolean;
        isClosedAfterClick: boolean;
        menuItems: string[];
      }

      const toggleRes = await send<{ result: { value: ToggleEvaluation } }>("Runtime.evaluate", {
        expression: `(async () => {
          const btn = document.querySelector('button[aria-label*="navigation menu"]');
          if (!btn) return { ok: false, reason: "button not found" };
          btn.click();
          await new Promise(r => setTimeout(r, 200));
          
          const isButtonExpanded = btn.getAttribute('aria-expanded') === 'true';
          const menuItems = Array.from(document.querySelectorAll('header a')).map(a => a.innerText.trim());
          
          // Click again to close
          btn.click();
          await new Promise(r => setTimeout(r, 200));
          const isClosedAfterClick = btn.getAttribute('aria-expanded') === 'false';

          return { 
            ok: true, 
            isButtonExpanded, 
            isClosedAfterClick, 
            menuItems 
          };
        })()`,
        awaitPromise: true,
        returnByValue: true,
      });

      const toggle = toggleRes.result.value;
      if (toggle.ok && toggle.isButtonExpanded && toggle.isClosedAfterClick && toggle.menuItems.includes("Timetable")) {
        console.log(`  PASS: Mobile hamburger opens and closes cleanly. Nav links verified: ${toggle.menuItems.slice(1, 5).join(", ")}`);
        passedTests++;
      } else {
        console.error(`  FAIL: Mobile menu toggle failed: ${JSON.stringify(toggle)}`);
      }
    }
  }

  // Also test Homepage at 360px
  console.log("\nTesting Homepage (/) layout at 360px:");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 360,
    height: 800,
    deviceScaleFactor: 1,
    mobile: true,
  });
  const baseUrl = process.env.TEST_URL || "https://examination-schedule.vercel.app";
  await send("Page.navigate", { url: `${baseUrl}/` });
  await wait(800);

  interface HomeEvaluation {
    clientWidth: number;
    scrollWidth: number;
    hasHorizontalScroll: boolean;
  }

  const homeEval = await send<{ result: { value: HomeEvaluation } }>("Runtime.evaluate", {
    expression: `(() => {
      const doc = document.documentElement;
      const scrollWidth = doc.scrollWidth;
      const clientWidth = doc.clientWidth;
      return {
        clientWidth,
        scrollWidth,
        hasHorizontalScroll: scrollWidth > clientWidth,
      };
    })()`,
    returnByValue: true,
  });

  totalTests++;
  if (!homeEval.result.value.hasHorizontalScroll) {
    console.log(`  PASS: Homepage has NO horizontal overflow at 360px.`);
    passedTests++;
  } else {
    console.error(`  FAIL: Homepage has horizontal overflow at 360px!`);
  }

  // Close browser
  ws.close();
  browser.kill();

  try {
    fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  } catch {}

  console.log("\n==================================================");
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} Passed (${totalTests - passedTests} Failed)`);
  console.log("==================================================");

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Error executing test script:", err);
  process.exit(1);
});
