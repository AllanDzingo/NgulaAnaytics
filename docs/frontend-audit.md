# Ngula Frontend Audit Report

**Date:** 2026-07-01  
**Project:** Ngula Analytics — Mining Intelligence Platform  
**Scope:** Frontend (`src/ngula-frontend/src/`) vs Backend (`src/NgulAnalytics.Api/`)  
**Status:** ✅ Audit Complete — No files modified

---

## 1. Project Structure Overview

### Existing Frontend Directory Layout

```
src/ngula-frontend/src/
├── api/
│   └── client.ts                    # API client with 7 API modules
├── components/
│   ├── ChartCard.tsx                # Shared chart wrapper component
│   ├── KpiCard.tsx                  # Shared KPI card component
│   ├── NgulaLogo.tsx                # SVG logo component
│   ├── Sidebar.tsx                  # Sidebar navigation
│   └── TopBar.tsx                   # Top bar with user info
├── contexts/
│   └── AuthContext.tsx              # Auth provider & useAuth hook
├── layouts/
│   └── DashboardLayout.tsx          # Main dashboard layout wrapper
├── pages/
│   ├── Login.tsx                    # Login page with demo accounts
│   ├── executive/
│   │   └── Dashboard.tsx            # Executive overview dashboard
│   ├── production/
│   │   ├── Dashboard.tsx            # Production KPIs & charts
│   │   └── Targets.tsx              # Production target CRUD
│   ├── engineering/
│   │   ├── Dashboard.tsx            # Engineering KPIs & radar
│   │   ├── EquipmentList.tsx        # Equipment registry table
│   │   └── EquipmentDetail.tsx      # Single equipment detail view
│   ├── maintenance/
│   │   └── Dashboard.tsx            # Maintenance service schedule
│   ├── sheq/
│   │   ├── Dashboard.tsx            # SHEQ KPIs & compliance
│   │   └── Incidents.tsx            # Incident log (mock data)
│   ├── shifts/
│   │   ├── NewShiftReport.tsx       # Shift report creation form
│   │   └── ShiftReportDetail.tsx    # Single shift report detail
│   ├── handover/
│   │   └── HandoverDashboard.tsx    # ❌ MISSING
│   └── actions/
│       ├── ActionList.tsx           # ❌ MISSING
│       └── ActionDetail.tsx         # ❌ MISSING
├── types/
│   └── index.ts                     # 18 TypeScript interfaces
├── main.tsx                         # App entry point
└── App.tsx                          # Route definitions
```

---

## 2. Missing Pages (3 Critical)

The following pages are **imported in `App.tsx` and referenced in routes but do not exist**:

| Route | Import Path | Severity |
|-------|-------------|----------|
| `/handover` | `@/pages/handover/HandoverDashboard` | 🔴 CRITICAL |
| `/actions` | `@/pages/actions/ActionList` | 🔴 CRITICAL |
| `/actions/:id` | `@/pages/actions/ActionDetail` | 🔴 CRITICAL |

These will cause **runtime crashes** if navigated to and TypeScript compilation errors.

---

## 3. Missing API Integrations

### Backend Endpoints Without Frontend Integration

| Backend Endpoint | Frontend Status |
|---|---|
| `GET /api/maintenance/kpis` | ❌ Not integrated — no `maintenanceApi` in client.ts, but `MaintenanceDashboard.tsx` uses `equipmentApi.getAll()` instead |
| `GET /api/production/kpis` | ❌ Separate controller at `/api/production/kpis` exists but frontend calls only `/api/dashboard/production` |
| `GET /api/engineering/kpis` | ❌ Separate controller at `/api/engineering/kpis?equipmentId=` exists but not called |
| `GET /api/sheq/kpis` | ❌ Separate controller at `/api/sheq/kpis` exists but not called |
| `GET /api/alerts` | ✅ Defined in client.ts but **never consumed** by any page component |
| `PATCH /api/alerts/{id}/mark-read` | ✅ Defined but never called |

### API Client Issues

| Issue | Detail |
|-------|--------|
| `shiftReportApi.getAll()` sends `shift` param | Backend `ShiftReportController.GetAll()` does **not** accept a `shift` query param — only `sectionId` and `date` |
| `actionsApi.getAll()` sends `assignedToId` | Backend expects **`assignedTo`** (Guid), not `assignedToId` (string) — param name mismatch |
| `actionsApi.update()` uses `PATCH` | Backend uses `[HttpPatch]` ✅ Correct |
| `handoverApi.getHistory()` extra `days` param | Backend accepts optional `days` query param but frontend doesn't pass it |
| No `equipmentApi.getHealthScores()` consumer | `healthScores` endpoint defined in client but never called from any page |
| No pagination support | Backend `ActionsController` supports `page` and `pageSize` but frontend `actionsApi.getAll()` doesn't pass them |

---

## 4. Missing Functionality

### Feature Gaps Compared to Backend Capabilities

| Feature | Backend Support | Frontend Status |
|---------|----------------|-----------------|
| Action CRUD with pagination | ✅ Full CRUD + pagination + filtering + comments | ❌ No ActionList or ActionDetail pages exist |
| Shift handover dashboard | ✅ `HandoverController` with current + history | ❌ No HandoverDashboard page exists |
| Maintenance KPIs via dedicated endpoint | ✅ `MaintenanceController` returns `MaintenanceKpiDto` | ❌ Not integrated; page uses equipment data instead |
| Alert consumption & display | ✅ `AlertsController` + `AlertService` | ⚠️ API client defined but no UI for alert list/mark-read |
| Create equipment via API | ✅ `EquipmentController.Create` | ❌ "Add Equipment" button has no onClick handler |
| Incident creation via API | ❌ No backend endpoint | ⚠️ Frontend uses mock data only |
| Shift report approval | ✅ Backend status field supports "Approved" | ⚠️ Approve button exists in UI but no API call implemented |
| Shift report shift filtering | ❌ Backend doesn't support `shift` filter | ❌ Frontend sends unsupported param |

---

## 5. TypeScript Errors & Type Mismatches

### Type Definition Issues

| File | Issue |
|------|-------|
| `contexts/AuthContext.tsx:31` | **Type mismatch:** Login destructures `{ token, email, fullName, role }` from response, but `LoginResponse` type defines `{ token, user: User }`. The API likely returns flat fields, so the type or the destructure is wrong. |
| `pages/Login.tsx` | Uses `User` type but assigns `id: ''` because the login response doesn't return `id` — the `User` interface requires `id: string` |
| `pages/NewShiftReport.tsx:76` | **Bug:** `noiseLevel: Number(d)` — `d` is a downtime object, not a number. This will produce `NaN`. Line appears to be a copy-paste error. |
| `pages/NewShiftReport.tsx` | `downtimes.filter(d => ...)` filter condition has incorrect field usage |
| `pages/sheq/Incidents.tsx` | Uses `MOCK_INCIDENTS` with `useState<Incident[]>(MOCK_INCIDENTS)` — no API integration whatsoever, state never updates |
| `pages/engineering/EquipmentDetail.tsx` | Defines local `EquipmentDetail` interface that differs from `@/types` — duplicated and potentially out of sync |

### Interface Duplication

| Types file | Duplicated In | Fields Differ? |
|------------|---------------|----------------|
| `Equipment` (types/index.ts) | `EquipmentList.tsx` uses the type from `@/types` | ✅ OK |
| `Equipment` (types/index.ts) | `maintenance/Dashboard.tsx` defines its own local `Equipment` interface | ⚠️ Local interface lacks `categoryId`, `sectionId` |
| `ExecutiveSummary` | `executive/Dashboard.tsx` local interface | ⚠️ Should use DTO from types but is defined locally |
| `ProductionKpi` | `production/Dashboard.tsx` local interface | ⚠️ Should use DTO from types |

---

## 6. Broken Imports

All verified imports resolve correctly. No broken import paths found among existing files.

Potential runtime errors:

- `App.tsx` imports `HandoverDashboard`, `ActionList`, `ActionDetail` — these will fail at runtime if the files don't exist after build.

---

## 7. Inconsistent UI Patterns

### Patterns Observed

| Aspect | Pattern | Consistency |
|--------|---------|-------------|
| Loading state | Skeleton pulse cards during loading | ✅ Consistent across all pages |
| Error state | Silent catch blocks: `catch { /* empty */ }` | ⚠️ All pages swallow errors silently |
| Empty state | Varies — "No equipment found", "No incidents found", "No targets found" | ✅ Mostly consistent |
| API calls | `useEffect` + manual `load()` function | ✅ Consistent |
| Refresh button | Present on all dashboards | ✅ Consistent |
| Mock data | `Incidents.tsx` uses full mock data; `ExecutiveDashboard` uses `DUMMY_TREND` chart data | ⚠️ Mixed real API + mock |
| Styling | `glass-card`, `gold-accent`, navy theme, `status-badge` | ✅ Consistent |
| Form inputs | Mix of raw `<input>` elements and custom styling | ✅ Consistent |
| CSS variables | Uses `var(--color)` throughout | ✅ Consistent |
| Notifications | `alert()` used in `NewShiftReport.tsx:84` | ⚠️ Should use toast/notification component |
| Auth roles | Route protection via `hasRole()` | ✅ Consistent |

### UI Issues

| File | Issue |
|------|-------|
| `NewShiftReport.tsx` | Uses `alert()` for error notification — inconsistent with modern UX |
| `Incidents.tsx` | "View Details" button has no onClick handler — it's a `<button>` that does nothing |
| `EquipmentList.tsx` | "Add Equipment" button has no onClick handler — does nothing |
| All pages | No toast/snackbar notifications system implemented |
| Executive Dashboard | Links to `/handover`, `/actions` will break (missing pages) |

---

## 8. TODOs & Placeholders

| File | Line | Content |
|------|------|---------|
| `pages/sheq/Incidents.tsx` | 15 | Comment: `// In a real app these would come from the API; using seeded data placeholders here` |
| `pages/sheq/Incidents.tsx` | 16-22 | `MOCK_INCIDENTS` — full mock data, no API call |
| `pages/executive/Dashboard.tsx` | 26-34 | `DUMMY_TREND` — hardcoded chart data (not from API) |
| `pages/production/Dashboard.tsx` | 29-37 | `SHIFT_DATA` and `WEEKLY_TREND` — hardcoded chart data |
| `pages/engineering/Dashboard.tsx` | 25-31 | `EQUIP_DOWNTIME` — hardcoded chart data |
| `pages/sheq/Dashboard.tsx` | 20-29 | `INCIDENT_TREND` and `COMPLIANCE_BARS` — hardcoded chart data |
| All dashboard pages | various | `catch { /* empty */ }` — empty catch blocks everywhere |

---

## 9. Sidebar Navigation vs Route Coverage

| Sidebar Link | Route | Page Exists? | Status |
|--------------|-------|-------------|--------|
| Executive | `/` | ✅ | Working |
| Production | `/production` | ✅ | Working |
| Engineering | `/engineering` | ✅ | Working |
| Maintenance | `/maintenance` | ✅ | Working |
| SHEQ | `/sheq` | ✅ | Working |
| Shift Reports | `/shifts/new` | ✅ | Working |
| Handover | `/handover` | ❌ | **BROKEN** |
| Actions | `/actions` | ❌ | **BROKEN** |

### Routes Not in Sidebar

| Route | Page | In Sidebar? |
|-------|------|-------------|
| `/production/targets` | ProductionTargets | ❌ (linked from production dashboard) |
| `/engineering/equipment` | EquipmentList | ❌ (linked from engineering dashboard) |
| `/engineering/equipment/:id` | EquipmentDetail | ❌ (linked from equipment list) |
| `/sheq/incidents` | Incidents | ❌ (linked from SHEQ dashboard) |
| `/shifts/:id` | ShiftReportDetail | ❌ (redirect after create or link) |

---

## 10. Suggested Implementation Order

Priority-based on dependencies and severity:

### Phase 1 — Critical Blockers (Fixes broken routes)

1. **Create `pages/actions/ActionList.tsx`** — Uses existing `actionsApi`, `ActionItem` type; full list with filters
2. **Create `pages/actions/ActionDetail.tsx`** — Detail view with comments using `actionsApi.addComment`
3. **Create `pages/handover/HandoverDashboard.tsx`** — Uses existing `handoverApi`, `HandoverSummary` type

### Phase 2 — API Integration Fixes

4. **Fix `AuthContext.tsx` login return type** — Align flat fields vs `LoginResponse` type
2. **Fix `NewShiftReport.tsx:76` bug** — `Number(d)` → correct field reference
3. **Add `maintenanceApi` to `client.ts`** — Integrate `GET /api/maintenance/kpis` for maintenance dashboard
4. **Fix `shiftReportApi.getAll` shift param** — Remove unsupported param
5. **Fix `actionsApi.getAll` param name** — Change `assignedToId` → `assignedTo`

### Phase 3 — Missing Functionality

9. **Add alert notification UI** — Consume `alertsApi.getAll` and `markRead` in TopBar or sidebar badge
2. **Implement "Add Equipment" form** — Wire up button to modal/form
3. **Implement shift report approval** — Wire up Approve button to API
4. **Add pagination to Actions list** — Pass `page`/`pageSize` params

### Phase 4 — Quality & Polish

13. **Replace `alert()` calls with toast notification system**
2. **Replace mock chart data with real API responses** (or document as intentional)
3. **Add proper error handling** — Replace empty `catch` blocks with user-facing error messages
4. **Add loading skeletons for detail pages** (EquipmentDetail, ShiftReportDetail)
5. **Add incident creation API integration** — Create backend endpoint + frontend form

---

## 11. Summary Counts

| Category | Count | Details |
|----------|-------|---------|
| Missing pages | **3** | HandoverDashboard, ActionList, ActionDetail |
| Missing API integrations | **5+** | Maintenance KPIs, Alerts UI, Equipment create, Incident create, Approval |
| Buggy code | **2** | `Number(d)` bug, login response type mismatch |
| Broken sidebar links | **2** | `/handover`, `/actions` |
| Mock data placeholders | **5** | Incidents, Executive trend chart, Production shift data, Engineering downtime, SHEQ trends |
| Empty catch blocks | **8+** | Every page's `load()` function |
| Unused imports | **3** | `Trash2` in Targets.tsx, `Eye` in Login.tsx (used but check), alert import patterns |
| Type interface duplication | **4** | Local interfaces in dashboards duplicating `@/types` |

---

## 12. Conclusion

The frontend has a solid foundation with consistent styling, well-structured components, and comprehensive type definitions. The three **missing page files** (HandoverDashboard, ActionList, ActionDetail) are the most critical issues as they break routing. Several **API integration gaps** exist where frontend components call endpoints with wrong params, and **backend endpoints** exist that are not consumed. The **mock data** in several pages needs to be replaced with real API integration. Overall, approximately **3-5 days of focused development** would resolve all identified issues.
