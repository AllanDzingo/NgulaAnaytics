import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getHomePathForRole } from '@/contexts/AuthContext';

import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Login } from '@/pages/Login';
import { ExecutiveDashboard } from '@/pages/executive/Dashboard';
import { ProductionDashboard } from '@/pages/production/Dashboard';
import { ProductionTargets } from '@/pages/production/Targets';
import { EngineeringDashboard } from '@/pages/engineering/Dashboard';
import { EquipmentList } from '@/pages/engineering/EquipmentList';
import { EquipmentDetail } from '@/pages/engineering/EquipmentDetail';
import { MaintenanceDashboard } from '@/pages/maintenance/Dashboard';
import { SheqDashboard } from '@/pages/sheq/Dashboard';
import { Incidents } from '@/pages/sheq/Incidents';
import { NewShiftReport } from '@/pages/shifts/NewShiftReport';
import { ShiftReportDetail } from '@/pages/shifts/ShiftReportDetail';
import { HandoverDashboard } from '@/pages/handover/HandoverDashboard';
import { ActionList } from '@/pages/actions/ActionList';
import { ActionDetail } from '@/pages/actions/ActionDetail';

function ProtectedRoute({ children, requiredRole = 'All' }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-app)] text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-2 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--brand)]" />
          Loading…
        </span>
      </div>
    );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole(requiredRole)) return <Navigate to="/" replace />;

  return <>{children}</>;
}

// The root "/" path shows the Executive overview only to executives. Every
// other role is redirected to their own department dashboard so login lands
// each user on their most relevant KPIs.
function HomeRoute() {
  const { user } = useAuth();
  if (user && user.role !== 'Executive') {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }
  return <ExecutiveDashboard />;
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<HomeRoute />} />

                <Route path="/production" element={<ProductionDashboard />} />
                <Route path="/production/targets" element={<ProductionTargets />} />
                <Route path="/engineering" element={<EngineeringDashboard />} />
                <Route path="/engineering/equipment" element={<EquipmentList />} />
                <Route path="/engineering/equipment/:id" element={<EquipmentDetail />} />
                <Route path="/maintenance" element={<MaintenanceDashboard />} />
                <Route path="/sheq" element={<SheqDashboard />} />
                <Route path="/sheq/incidents" element={<Incidents />} />
                <Route path="/shifts/new" element={<NewShiftReport />} />
                <Route path="/shifts/:id" element={<ShiftReportDetail />} />
                <Route path="/handover" element={<HandoverDashboard />} />
                <Route path="/actions" element={<ActionList />} />
                <Route path="/actions/:id" element={<ActionDetail />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}