export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

export interface Section {
  id: number;
  name: string;
  type: 'Surface' | 'Underground';
  description: string;
}

export interface Equipment {
  id: number;
  name: string;
  categoryId: number;
  sectionId: number;
  manufacturer: string;
  model: string;
  serviceIntervalHours: number;
  currentOperatingHours: number;
  commissionDate: string;
  status: 'Operational' | 'Down' | 'Under Maintenance';
}

export interface ShiftReport {
  id: number;
  date: string;
  shift: 'DAY' | 'AFT' | 'NGT';
  supervisorId: string;
  sectionId: number;
  status: 'Draft' | 'Submitted' | 'Approved';
  submittedAt: string;
  approvedAt?: string;
}

export interface ProductionEntry {
  id: number;
  shiftReportId: number;
  tonsCrushed: number;
  tonsMilled: number;
  feedGrade: number;
  recoveryPercentage: number;
  concentrateProduced: number;
  comments?: string;
}

export interface DowntimeEntry {
  id: number;
  shiftReportId: number;
  equipmentId: number;
  startTime: string;
  endTime: string;
  durationHours: number;
  reason: string;
  rootCause: string;
  correctiveAction: string;
}

export interface EquipmentObservation {
  id: number;
  shiftReportId: number;
  equipmentId: number;
  noiseLevel: number;
  vibrationObservation: string;
  temperatureObservation: string;
  generalCondition: 'Good' | 'Fair' | 'Poor' | 'Critical';
}

export interface SheqObservation {
  id: number;
  shiftReportId: number;
  incidents: number;
  nearMisses: number;
  safetyObservations?: string;
  environmentalObservations?: string;
  airQualityScore: number;
  dustLevel: number;
  heatIndex: number;
}

export interface UndergroundReading {
  id: number;
  shiftReportId: number;
  truckloadsExcavated: number;
  oxygenLevelStart: number;
  oxygenLevelMidshift: number;
  oxygenLevelFinish: number;
  dustLevel: number;
  visibility: 'Good' | 'Moderate' | 'Poor' | 'Hazardous';
  incidents: number;
  incidentDescriptions?: string;
}

export interface ShiftHandover {
  id: number;
  shiftReportId: number;
  majorEvents: string;
  equipmentIssues: string;
  safetyConcerns: string;
  productionConcerns: string;
  outstandingActions: string;
  generalNotes: string;
}

export interface ActionItem {
  id: number;
  title: string;
  description: string;
  source: 'Downtime' | 'Observation' | 'Incident' | 'Handover' | 'Manual';
  sourceId: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'InProgress' | 'Closed' | 'Overdue';
  assignedToId: string;
  createdById: string;
  equipmentId?: number;
  dueDate: string;
  createdAt: string;
  closedAt?: string;
  assignedTo?: User;
  equipment?: Equipment;
}

export interface ActionComment {
  id: number;
  actionId: number;
  userId: string;
  comment: string;
  createdAt: string;
  user?: User;
}

export interface Alert {
  id: number;
  type: string;
  severity: 'Warning' | 'Critical' | 'Info';
  title: string;
  message: string;
  equipmentId?: number;
  isRead: boolean;
  createdAt: string;
}

export interface ProductionTarget {
  id: number;
  sectionId: number;
  year: number;
  month: number;
  targetTonsCrushed: number;
  targetTonsMilled: number;
  targetRecovery: number;
  targetGrade: number;
  targetTruckloads: number;
}

export interface DashboardKpi {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  status?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface HandoverSummary {
  previousShift: ShiftReport;
  handover: ShiftHandover;
  activeActions: ActionItem[];
  downEquipment: Equipment[];
  unresolvedIncidents: number;
  productionStatus: DashboardKpi[];
}

export interface MaintenanceKpi {
  totalEquipment: number;
  overdueServices: number;
  upcomingServices: number;
  onSchedule: number;
  serviceComplianceRate: number;
  averageHoursUntilService: number;
}