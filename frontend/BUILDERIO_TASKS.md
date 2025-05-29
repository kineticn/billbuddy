# BillBuddy – UI/UX Design & Builder.io AI Prompts (v4)

## Purpose
A single source of truth for Builder.io and WindSurf-AI covering the entire front-end experience, new demo/ticketing features, and design-token sync. Use this in tandem with the WindSurf Task Prompts v4.

---

## 1. Approach & Builder.io Setup
- **Builder.io Plan:** Upgrade to Pro immediately; reassess Enterprise at Month‑5 checkpoint.
- **GitHub Workflow:** Connect Builder.io to the `frontend/` directory of the monorepo. Each publish ⇒ auto‑PR. WindSurf‑AI rule: merge only when CI passes golden tests & tour anchors.
- **SDK Targets:** `@builder.io/flutter` widgets (mobile) and `@builder.io/react` stubs (web) – WindSurf stitches the data layer.

---

## 2. Design Tokens (Theme System)
| Token             | Light     | Dark     |
|-------------------|-----------|----------|
| --color-primary   | #2152A3   | #4A90E2  |
| --color-accent    | #21B573   | #6DD5A6  |
| --color-bg        | #F6FAFD   | #0F111A  |
| --color-surface   | #FFFFFF   | #1C1F2B  |
| --color-error     | #E74C3C   | #CF3D2E  |
| --font-heading    | "Inter", 700 | "Inter", 700 |
| --font-body       | "Inter", 400 | "Inter", 400 |

Sync rule: WindSurf‑AI must update Flutter ThemeData & Builder.io global styles whenever tokens change.

---

## 3. Screen & Component Inventory
### 3.1 Onboarding Wizard (6 Steps)
- Welcome → WelcomeScreen
- Basic Profile → ProfileInfoScreen
- Consent & Agreements with "🔍 View Demo" CTA → ConsentScreen
- Scan Bill (OCR) → ScanBillScreen
- Connect Bank (Plaid) → ConnectBankScreen
- Confirmation → SuccessScreen

### 3.2 Demo Dashboard
- Route: `/demo-dashboard`
- Read‑only DashboardHome, BillsCardGrid, InsightsPanel populated from seed DemoUser JSON.
- Guided tour auto‑launch via Intro.js (mobile: Flutter WebView overlay).

### 3.3 Main User Dashboard
- Re‑uses components from Demo; live GraphQL binding.

### 3.4 Ticketing / Support
- HelpModal: floating “?” on every screen → opens ticket form (SupportFormWidget).
- TicketListAdmin: Admin dashboard panel with filters, status chips, inline reply.

### 3.5 Admin Dashboard Additions
- New sidebar item Tickets.
- Live WebSocket badge for open‑ticket count.
- (Bill Detail, Payment, etc. follow v3 but include ticket button & theme tokens.)

---

## 4. Guided‑Tour Spec
File: `/assets/tour_steps.json`
```
[
  {"element": "#bill-summary-card", "title": "Your Bills", "content": "All upcoming bills at a glance."},
  {"element": "#add-bill-btn", "title": "Add a Bill", "content": "Snap or enter details in seconds."},
  {"element": "#insights-panel", "title": "Insights", "content": "See trends & savings suggestions."}
]
```
WindSurf‑AI injects this JSON into Intro.js/Shepherd at runtime; allow CMS editing via Builder.io model TourSteps.

---

## 5. Builder.io AI Prompt
Paste into Builder.io → Generate with AI:

```
You are Builder‑Gen‑AI for a fintech bill‑pay super‑app called **BillBuddy**. Generate responsive visual layouts & components that respect:
1. **Theme Tokens** — use project CSS variables (& dark‑mode).
2. **Component Library** — create Button, TextField, Card, WizardStep, NavBar, Sidebar, Modal; export to Flutter & React.
3. **Screens** — Onboarding (6‑step), Demo Dashboard (+tour), Main Dashboard, Bill Detail, Support Modal, Admin Tickets.
4. **Tour Anchors** — IDs #bill-summary-card, #add-bill-btn, #insights-panel.
5. **Accessibility** — aria‑labels, 4.5+ contrast.
6. **Export Settings** — push to `ui/builder/` in branch `builder-ai/<timestamp>` via PR.
```

---

## 6. Data Bind & State Hooks
- BillBuddyDataProvider (WindSurf‑AI) wraps Builder components with GraphQL queries; uses mock JSON in demo mode.
- Ticket form posts to /api/tickets; success triggers toast.

---

## 7. Front‑end CI/Git Rules
- PR from Builder.io must pass Flutter golden‑diff & Percy visual tests.
- Fail CI if required tour anchor IDs missing.

---

## Changelog
- v4 (2025‑05‑29) Adds Builder.io Pro workflow, Demo Dashboard, Ticketing, Guided Tour, Design‑token sync.
- v3 Base brief (see commit abcd123)
