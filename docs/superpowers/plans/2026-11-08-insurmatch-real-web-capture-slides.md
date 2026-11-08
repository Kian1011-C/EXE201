# InsurMatch Real Web Screen Capture & Presentation Deck Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capture authentic, high-resolution application screenshots directly from the live InsurMatch CRM web application under the user's licensed agent identity (`Nguyen Phuong Khai`), remove all AI template placeholder text ("James Smith", "Maria Williams", etc.) from Canva presentation `DAHZYC0RsD8`, insert the real web captures cleanly into Slide 6 and Slide 7, and synchronize the web presentation deck at `/presentation`.

**Architecture:** 
1. Update RBAC scoping in `src/utils/rbac.js` so `Nguyen Phuong Khai` (`khainpse183590@fpt.edu.vn`, NPN `#123123`) has full ownership access across Contacts, Deals, Tasks, Tickets, and Commission, preventing any "Access Restricted" banners.
2. Automate browser screen capture via Playwright (`test-automation/capture_real_web_screens.cjs`) with HiDPI 2x scale, capturing individual CRM modules and full 16:9 presentation slides directly from the running web app.
3. Use Canva MCP API (`start-editing-transaction`, `perform-editing-operations`, `commit-editing-transaction`) to delete all 90 residual dummy placeholder elements from Canva slides 6 and 7, and replace them with high-fidelity web screen captures.
4. Keep the in-app interactive 16:9 presentation (`/presentation`, `/pitch-deck`) updated and verified.

**Tech Stack:** React 19, Tailwind CSS, Playwright, Canva REST/MCP API, Vite, Express/Spring Boot backend mock integration.

**Spec:** User instruction to capture real screens from the web application (`thebestrateins-exe201.vercel.app` / `localhost:5173`) and replace Canva template placeholders with real product screenshots across Dashboard, Contacts, Deals/Kanban, Tasks, Commission, and Subscription.

---

## Global Constraints

- **No Dummy Data / AI Placeholders:** Absolutely no generic template text ("James Smith", "Maria Williams", "Appointments", etc.) on Canva slides or in the application.
- **Real Application Interface Only:** Crop captures to show only the CRM application interface; no OS taskbar, no browser chrome, no Canva editor chrome.
- **Maintain UI Proportions:** Preserve 16:9 aspect ratio and native typography/card hierarchy.
- **Senior Dev / Lazy Dev Rules:** Follow `AGENTS.md` (no unrequested abstractions, fix root cause, single runnable check, boring over clever).
- **Target Canva Presentation:** Design ID `DAHZYC0RsD8` (`https://www.canva.com/design/DAHZYC0RsD8/DnHoXNd2Oc0BqJYG1bWRSw/edit`).

---

## Review Focus

1. **Authentication & RBAC:** Does `Nguyen Phuong Khai` see fully populated deals, contacts, and tasks without any "Access Restricted" alert?
2. **Canva Foreground Cleansing:** Are all 66 dummy text elements on Slide 6 and all 24 dummy text elements on Slide 7 deleted so they don't cover the real screenshots?
3. **Screenshot Fidelity:** Are the screenshots sharp, legible at presentation distance, and showing real InsurMatch features (Smart Lifecycle Radar, 10-stage Kanban, VietQR PayOS subscription)?
4. **Slide Layout:** Does Slide 6 showcase the Agent Dashboard + Smart Radar as the hero, and does Slide 7 showcase the 4-module Core Workspace grid?
5. **Web Deck Synchronization:** Does `/presentation` and `/pitch-deck` match the Canva slides 1-to-1?

---

## Tasks

### Task 1: Enable Full RBAC Scoping for Demo/Presentation Agent (`Nguyen Phuong Khai`)

**Files:**
- Modify: `src/utils/rbac.js:60-95`
- Test: Playwright script checking contact & deal visibility under `Nguyen Phuong Khai`

- [ ] Inspect `src/utils/rbac.js` `isOwnerMatch` and `getAgentIdentity`.
- [ ] Add explicit match for `Nguyen Phuong Khai` / `khainpse183590@fpt.edu.vn` so that all contacts, deals, tasks, and documents in the seed data are visible under this session without permission blocks.
- [ ] Verify in browser that navigating to `/dashboard/agent/contacts/20` and `/dashboard/agent/deals` renders full data with zero "Access Restricted" cards.

---

### Task 2: Capture High-Resolution Real Application Screens via Playwright

**Files:**
- Create: `test-automation/capture_real_web_screens.cjs`
- Output: `scratch/screenshots/real_web/`
  - `01_agent_dashboard_radar.png` (Agent Dashboard with Smart Lifecycle Radar)
  - `02_contacts_detail_family.png` (Contact Detail with Dependents & DOB)
  - `03_deals_kanban_10stages.png` (10-stage Kanban Pipeline)
  - `04_tasks_queue_priority.png` (Agent Priority Tasks Queue)
  - `05_commission_ledger_settled.png` (Commission Split & Settlements)
  - `06_subscription_vietqr_payos.png` (VietQR PayOS Subscription & Resource Quota)
  - `slide_06_dashboard_experience.png` (Full 16:9 Presentation Slide 6)
  - `slide_07_core_workspace_grid.png` (Full 16:9 Presentation Slide 7)

- [ ] Write `test-automation/capture_real_web_screens.cjs` using `channel: 'chrome'`, `viewport: { width: 1920, height: 1080 }`, and `deviceScaleFactor: 2`.
- [ ] Authenticate as `Nguyen Phuong Khai` (`khainpse183590@fpt.edu.vn`).
- [ ] Capture the 6 individual CRM modules and the 2 slide composites.
- [ ] Verify all captured PNG files are saved, non-empty, and visually crisp.

---

### Task 3: Clean Residual AI Placeholders & Inject Real Web Captures into Canva Deck (`DAHZYC0RsD8`)

**Files:**
- Target Design: `DAHZYC0RsD8`
- Canva Pages:
  - Page 6 (`PB3RmMCJ5D6BNXKX`): Slide 6 - Real Product Experience: Agent Dashboard & Smart Radar
  - Page 7 (`PByLsYKQC3JvY8yb`): Slide 7 - Real Product Experience: Core Workspace Grid

- [ ] Upload the captured high-res images to Canva using `create-upload-url` and binary stream upload.
- [ ] Start Canva editing transaction on `DAHZYC0RsD8`.
- [ ] Delete all 66 leftover dummy placeholder elements on Page 6 using `delete_element`.
- [ ] Set or insert the real Dashboard screenshot as the clean hero element on Page 6.
- [ ] Delete all 24 leftover dummy placeholder elements on Page 7 using `delete_element`.
- [ ] Set or insert the real Core Workspace 4-grid screenshot on Page 7.
- [ ] Commit Canva transaction with `commit-editing-transaction`.
- [ ] Verify with `get-design-content` and `get-design-pages` that no placeholder text remains.

---

### Task 4: Synchronize In-App 16:9 Web Presentation Deck

**Files:**
- Modify: `src/pages/presentation/WorkflowPresentationPage.jsx`
- Test: Local Vite server at `http://localhost:5173/presentation`

- [ ] Review `WorkflowPresentationPage.jsx` slides:
  - Slide 1: Main Business Workflow (6 steps + outcomes)
  - Slide 2: Real Product Experience - Dashboard & Smart Lifecycle Radar
  - Slide 3: Real Product Experience - Core Workspace Grid (Contacts, Kanban, Tasks, Commission, Subscription)
- [ ] Verify keyboard navigation (ArrowLeft, ArrowRight, Fullscreen 'F'), GSAP transitions, and crisp rendering.
- [ ] Run `npm run build` to verify production bundle integrity.

---

### Task 5: Final Verification & Presentation Walkthrough

**Files:**
- Update: `C:\Users\Admin\.gemini\antigravity\brain\6ab20c52-dce6-4951-bd15-826bb2d141b6\walkthrough.md`

- [ ] Verify Canva deck live at `https://www.canva.com/design/DAHZYC0RsD8/DnHoXNd2Oc0BqJYG1bWRSw/edit`.
- [ ] Verify local web presentation at `http://localhost:5173/presentation`.
- [ ] Document the before-and-after improvements and screenshot gallery in `walkthrough.md`.
