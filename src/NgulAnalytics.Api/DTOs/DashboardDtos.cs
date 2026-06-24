namespace NgulAnalytics.Api.DTOs;

public class ExecutiveSummaryDto
{
    public decimal TotalTonsCrushed { get; set; }
    public decimal TotalTonsMilled { get; set; }
    public decimal AverageRecovery { get; set; }
    public int TotalIncidents { get; set; }
    public int OpenActions { get; set; }
    public int OverdueActions { get; set; }
    public decimal EquipmentAvailability { get; set; }
    public List<AlertDto> RecentAlerts { get; set; } = new();
}

public class AlertDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Severity { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ProductionKpiDto
{
    public decimal TargetAchievement { get; set; }
    public decimal RecoveryRate { get; set; }
    public decimal Throughput { get; set; }
    public decimal TonsCrushed { get; set; }
    public decimal TonsMilled { get; set; }
    public decimal ConcentrateProduced { get; set; }
}

public class EngineeringKpiDto
{
    public decimal MTBF { get; set; }
    public decimal MTTR { get; set; }
    public decimal Availability { get; set; }
    public decimal Reliability { get; set; }
    public decimal ServiceCompliance { get; set; }
}

public class HandoverSummaryDto
{
    public int ShiftReportId { get; set; }
    public DateTime Date { get; set; }
    public string Shift { get; set; } = string.Empty;
    public string SupervisorName { get; set; } = string.Empty;
    public string MajorEvents { get; set; } = string.Empty;
    public string EquipmentIssues { get; set; } = string.Empty;
    public string SafetyConcerns { get; set; } = string.Empty;
    public string ProductionConcerns { get; set; } = string.Empty;
    public string OutstandingActions { get; set; } = string.Empty;
    public string GeneralNotes { get; set; } = string.Empty;
    public List<ActionSummaryDto> ActiveActions { get; set; } = new();
    public List<EquipmentStatusDto> EquipmentStatus { get; set; } = new();
}

public class ActionSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
}

public class EquipmentStatusDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}