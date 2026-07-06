# Backend → Frontend Implementation Matrix

**Generated:** 2026-07-01  
**Scope:** All backend controllers (`src/NgulAnalytics.Api/Controllers/`) mapped against frontend implementation (`src/ngula-frontend/src/`)

---

## 1. AuthController

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/auth/login` | POST | `LoginRequest` → `LoginResponse` | None | `authApi.login()` | `Login.tsx` | ✅ Done |
| `/api/auth/me` | GET | `UserDto` | [Authorize] | ❌ Missing | `AuthContext.tsx` (partial) | ⚠️ No `authApi.me()` call; `AuthContext` gets user from login response only |

**Notes:**

- Backend returns flat fields (`token`, `email`, `fullName`, `role`) matching `LoginResponse` — ✅ correct
- No dedicated `GET /api/auth/me` call in frontend; `AuthContext` only reads from login response
- `authApi.refresh()` was removed from client.ts — backend has no matching endpoint ✅ **FIXED**

---

## 2. ShiftReportController

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/shiftreport` | GET | `ShiftReport[]` (with Supervisor, Section includes) | [Authorize] | `shiftReportApi.getAll({ sectionId?, date? })` | None (used by) | ⚠️ `NewShiftReport.tsx` doesn't list reports; only creates |
| `/api/shiftreport/{id}` | GET | `ShiftReport` (full includes: Production, Downtime, EquipmentObs, SHEQ, Underground, Handover, Actions) | [Authorize] | `shiftReportApi.getById()` | `ShiftReportDetail.tsx` | ✅ Done |
| `/api/shiftreport` | POST | `CreateShiftReportDto` | Supervisor | `shiftReportApi.create()` | `NewShiftReport.tsx` | ✅ Done |

**Notes:**

- Backend `GET /api/shiftreport` supports `sectionId?` and `date?` query params only
- Frontend `shiftReportApi.getAll()` matches backend params ✅
- `shiftReportApi.update()` was removed from client.ts — backend has no matching endpoint ✅ **FIXED**
- Backend status workflow: `Submitted` → frontend expects `Draft | Submitted | Approved` — `Approved` button exists in UI (`ShiftReportDetail.tsx`) but no API call

---

## 3. ActionsController

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/actions` | GET | `PagedResult<ActionItemDto>` | [Authorize] | `actionsApi.getAll({ status?, priority?, assignedTo? })` | `ActionList.tsx` | ✅ Done |
| `/api/actions/{id}` | GET | `ActionItemDetailDto` (includes Comments) | [Authorize] | `actionsApi.getById()` | `ActionDetail.tsx` | ✅ Done |
| `/api/actions` | POST | `CreateActionDto` | Executive,Engineering,Production,SHEQ,Supervisor | `actionsApi.create()` | `ActionList.tsx` (button) | ✅ Done |
| `/api/actions/{id}` | PATCH | `UpdateActionDto` | [Authorize] | `actionsApi.update()` | `ActionDetail.tsx` | ✅ Done |
| `/api/actions/{id}/comments` | POST | `CreateActionCommentDto` → `ActionCommentDto` | [Authorize] | `actionsApi.addComment()` | `ActionDetail.tsx` | ✅ Done |
| `/api/actions/dashboard` | GET | `ActionDashboardDto` | [Authorize] | `actionsApi.getDashboard()` | `ActionList.tsx` (stats) | ✅ Done |

**Notes:**

- Backend supports pagination (`page`, `pageSize`) and filtering (`status`, `priority`, `assignedTo`, `source`)
- Frontend `actionsApi.getAll()` uses `assignedTo` param — matches backend ✅ **ALREADY CORRECT**
- Frontend `actionsApi.getAll()` does **not** pass `page`/`pageSize` — ⚠️ Missing pagination support
- Frontend `actionsApi.getAll()` also passes `source` param which backend supports ✅

---

## 4. HandoverController

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/handover/current/{sectionId}` | GET | `HandoverSummaryDto` | Supervisor,Executive,Production,Engineering,SHEQ | `handoverApi.getCurrent(sectionId)` | `HandoverDashboard.tsx` | ✅ Done |
| `/api/handover/history/{sectionId}?days=7` | GET | `List<HandoverSummaryDto>` | Supervisor,Executive,Production,Engineering,SHEQ | `handoverApi.getHistory(sectionId)` | `HandoverDashboard.tsx` | ⚠️ `days` param not passed from frontend |

**Notes:**

- Frontend `handoverApi.getHistory()` does not accept/pass the optional `days` param — backend defaults to 7 ✅

---

## 5. DashboardController (KpiControllers.cs)

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/dashboard/executive` | GET | `ExecutiveSummaryDto` | [Authorize] | `dashboardApi.getExecutiveSummary()` | `executive/Dashboard.tsx` | ✅ Done |
| `/api/dashboard/production?sectionId=` | GET | `ProductionKpiDto` | [Authorize] | `dashboardApi.getProductionKpis(sectionId?)` | `production/Dashboard.tsx` | ✅ Done |
| `/api/dashboard/engineering` | GET | `EngineeringKpiDto` | [Authorize] | `dashboardApi.getEngineeringKpis()` | `engineering/Dashboard.tsx` | ✅ Done |
| `/api/dashboard/sheq` | GET | `SheqKpiDto` | [Authorize] | `dashboardApi.getSheqKpis()` | `sheq/Dashboard.tsx` | ✅ Done |

**Notes:**

- All 4 dashboard endpoints are consumed ✅
- Some dashboards also use hardcoded mock/chart data (trends, shift data) — these are UI concerns, not API gaps

---

## 6. ProductionController (KpiControllers.cs)

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/production/kpis?sectionId=` | GET | `ProductionKpiDto` | [Authorize] | ❌ Missing | None | ⚠️ Backend exposes dedicated controller but frontend calls `/api/dashboard/production` instead |

**Notes:**

- `/api/production/kpis` and `/api/dashboard/production` both return `ProductionKpiDto` — possible duplication; frontend uses the dashboard route ✅

---

## 7. EngineeringController (KpiControllers.cs)

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/engineering/kpis?equipmentId=` | GET | `EngineeringKpiDto` | [Authorize] | ❌ Missing | None | ⚠️ Not called by frontend; frontend uses `/api/dashboard/engineering` instead |

**Notes:**

- `/api/engineering/kpis` supports optional `equipmentId` param which dashboard route does not
- Same DTO as dashboard — possible duplication

---

## 8. MaintenanceController (KpiControllers.cs)

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/maintenance/kpis` | GET | `MaintenanceKpiDto` (OverdueCount, UpcomingCount) | [Authorize] | `maintenanceApi.getKpis()` | `maintenance/Dashboard.tsx` | ✅ Done |

**Notes:**

- Frontend `maintenanceApi.getKpis()` exists in `client.ts` ✅
- However, `maintenance/Dashboard.tsx` uses `equipmentApi.getAll()` for its data instead of `maintenanceApi.getKpis()` — ❌ **NOT CONSUMED**
- Backend DTO `MaintenanceKpiDto` has only `OverdueCount` and `UpcomingCount`; frontend type `MaintenanceKpi` has 6 fields — ❌ **TYPE MISMATCH**

---

## 9. SheqController (KpiControllers.cs)

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/sheq/kpis` | GET | `SheqKpiDto` | [Authorize] | ❌ Missing | None | ⚠️ Not called by frontend; frontend uses `/api/dashboard/sheq` instead |

**Notes:**

- `/api/sheq/kpis` returns same `SheqKpiDto` as `/api/dashboard/sheq` — possible duplication

---

## 10. EquipmentController

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/equipment` | GET | `Equipment[]` (with Category, Section) | [Authorize] | `equipmentApi.getAll()` | `EquipmentList.tsx`, `maintenance/Dashboard.tsx`, `engineering/Dashboard.tsx` | ✅ Done |
| `/api/equipment/{id}` | GET | `{ equipment, healthScore, recentObservations, recentDowntime }` | [Authorize] | `equipmentApi.getById()` | `EquipmentDetail.tsx` | ✅ Done |
| `/api/equipment/{id}/health` | GET | `{ equipmentId, healthScore }` | [Authorize] | `equipmentApi.getHealthScores()` | ❌ Never consumed | ⚠️ Defined in client.ts but no page calls it |
| `/api/equipment` | POST | `Equipment` | Engineering | ❌ Missing | ❌ "Add Equipment" button has no onClick | ❌ **MISSING** |
| `/api/equipment/{id}` | PUT | `Equipment` | Engineering | ❌ Missing | ❌ No update form exists | ❌ **MISSING** |

---

## 11. AlertsController

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/alerts` | GET | `List<AlertDto>` | [Authorize] | `alertsApi.getAll({ unreadOnly? })` | ❌ Never consumed | ⚠️ API client defined but no page displays alerts |
| `/api/alerts/count` | GET | `{ unreadCount }` | [Authorize] | ❌ Missing | ❌ Never consumed | ⚠️ Endpoint exists but no frontend call |
| `/api/alerts/{id}/mark-read` | PATCH | — | [Authorize] | `alertsApi.markRead(id)` | ❌ Never consumed | ⚠️ API client defined but never called |
| `/api/alerts/mark-all-read` | PATCH | — | [Authorize] | ❌ Missing | ❌ Never consumed | ⚠️ Endpoint exists but no frontend call |

**Notes:**

- `AlertsController.cs` created — delegates to existing `AlertService` ✅ **BUILT**
- Frontend `alertsApi` methods match backend routes ✅
- No page currently consumes `alertsApi` — alert UI still needed

---

## 12. ProductionTargetsController

| Backend Route | HTTP | Backend DTO | Auth Policy | Frontend API Method | Frontend Page | Status |
|---|---|---|---|---|---|---|
| `/api/productiontargets` | GET | `ProductionTarget[]` (with Section include) | [Authorize] | `targetsApi.getAll({ sectionId?, year? })` | `production/Targets.tsx` | ✅ Done |
| `/api/productiontargets` | POST | `ProductionTarget` | Executive,Production,Supervisor | `targetsApi.create()` | `production/Targets.tsx` | ✅ Done |
| `/api/productiontargets/{id}` | PUT | `ProductionTarget` | Executive,Production,Supervisor | `targetsApi.update()` | `production/Targets.tsx` | ✅ Done |
| `/api/productiontargets/{id}` | GET | `ProductionTarget` (with Section) | [Authorize] | ❌ Missing | None | ⚠️ Not called by frontend |

**Notes:**

- `ProductionTargetsController.cs` created — uses existing `ProductionTarget` model and DbSet ✅ **BUILT**
- Frontend `targetsApi` methods match backend routes ✅
- Backend returns `ProductionTarget` model directly (no separate DTO) — matches frontend `Target` interface ✅

---

## Summary: Complete Gap Matrix

### 🔴 Critical Gaps (Broken Routes / Missing Pages)

| Gap | Impact |
|-----|--------|
| ~~No `AlertsController.cs` in backend~~ | ✅ **FIXED** — controller built |
| ~~No `ProductionTargetsController.cs` in backend~~ | ✅ **FIXED** — controller built |
| ~~`authApi.refresh()` had no backend endpoint~~ | ✅ **FIXED** — removed from client.ts |
| ~~`shiftReportApi.update()` had no backend endpoint~~ | ✅ **FIXED** — removed from client.ts |

### 🟡 API Integration Issues (Params / Type Mismatches)

| Issue | Detail |
|-------|--------|
| ~~`actionsApi.getAll()` sent `assignedToId`~~ | ✅ **ALREADY CORRECT** — client.ts uses `assignedTo` |
| `actionsApi.getAll()` doesn't pass `page`/`pageSize` | Backend pagination not leveraged |
| `MaintenanceKpiDto` (backend) vs `MaintenanceKpi` (frontend types) | 2 fields vs 6 fields — complete mismatch |
| `maintenance/Dashboard.tsx` uses `equipmentApi.getAll()` | Should use `maintenanceApi.getKpis()` |
| `alertsApi` defined but never consumed in any page | No alert UI exists |
| `equipmentApi.getHealthScores()` defined but never consumed | No UI for health scores |

### 🟢 Implemented Correctly

| Feature | Status |
|---------|--------|
| Auth login flow | ✅ Complete |
| Shift report CRUD (create + detail) | ✅ Complete |
| Actions CRUD + comments + dashboard stats | ✅ Complete |
| Handover current + history | ✅ Complete |
| Executive dashboard KPIs | ✅ Complete |
| Production dashboard KPIs | ✅ Complete |
| Engineering dashboard KPIs | ✅ Complete |
| SHEQ dashboard KPIs | ✅ Complete |
| Equipment list + detail + health score route | ✅ Complete |
| Production targets CRUD (UI only, backend missing) | ⚠️ Frontend ✅, Backend ❌ |

---

## Appendix: DTO Type Mapping

| Backend DTO | Frontend Type | Match? |
|---|---|---|
| `LoginResponse` (flat: token, email, fullName, role) | `LoginResponse` (same) | ✅ Exact |
| `UserDto` | `User` (id, email, fullName, role, isActive) | ✅ Match |
| `ShiftReport` (with includes) | `ShiftReport` (minimal) | ⚠️ Frontend type is partial |
| `ProductionEntry` | `ProductionEntry` | ✅ Match |
| `DowntimeEntry` | `DowntimeEntry` | ✅ Match |
| `EquipmentObservation` | `EquipmentObservation` | ✅ Match |
| `SheqObservation` | `SheqObservation` | ✅ Match |
| `UndergroundReading` | `UndergroundReading` | ✅ Match |
| `ShiftHandover` | `ShiftHandover` | ✅ Match |
| `ActionItemDto` | `ActionItem` (source is string enum in TS) | ⚠️ Frontend has extra `equipment` field |
| `ActionItemDetailDto` | `ActionItem` + comments separate | ⚠️ Frontend lacks `ActionItemDetail` type mit comments |
| `ActionCommentDto` | `ActionComment` | ✅ Match |
| `ActionDashboardDto` | ❌ No frontend type | ❌ Missing |
| `PagedResult<T>` | ❌ No frontend type | ❌ Missing |
| `ExecutiveSummaryDto` | `ExecutiveSummary` (local in page) | ⚠️ Duplicate, not in types/index.ts |
| `ProductionKpiDto` | `ProductionKpi` (local in page) | ⚠️ Duplicate, not in types/index.ts |
| `EngineeringKpiDto` | ❌ No frontend type (local) | ⚠️ Duplicate |
| `SheqKpiDto` | ❌ No frontend type (local) | ⚠️ Duplicate |
| `MaintenanceKpiDto` (2 fields) | `MaintenanceKpi` (6 fields) | ❌ **MISMATCH** |
| `HandoverSummaryDto` (with ActionSummary, EquipmentStatus) | `HandoverSummary` (different structure) | ❌ **MISMATCH** |
| `AlertDto` | `Alert` | ✅ Match |
| `ProductionTarget` (backend model) | `ProductionTarget` | ❌ No backend controller to serve it |
| `Equipment` | `Equipment` | ✅ Match |
