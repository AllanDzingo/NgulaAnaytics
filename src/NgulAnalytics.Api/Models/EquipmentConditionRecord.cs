namespace NgulAnalytics.Api.Models;

/// <summary>
/// A single equipment condition-monitoring reading ingested from the client's
/// PGM Concentrator Engineering CM dataset. Each row is one equipment item on
/// one shift.
/// </summary>
public class EquipmentConditionRecord
{
    public int Id { get; set; }

    public DateTime Timestamp { get; set; }
    public DateTime Date { get; set; }
    public string Shift { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;

    public string EquipmentId { get; set; } = string.Empty;   // e.g. CR-101
    public string EquipmentName { get; set; } = string.Empty;
    public string EquipmentType { get; set; } = string.Empty;

    public decimal RunningHours { get; set; }
    public decimal LoadPercent { get; set; }
    public decimal MotorCurrentA { get; set; }
    public decimal PowerKw { get; set; }

    public decimal DeVibrationMmS { get; set; }
    public decimal NdeVibrationMmS { get; set; }
    public decimal DeBearingTempC { get; set; }
    public decimal NdeBearingTempC { get; set; }
    public decimal? GearboxOilTempC { get; set; }
    public string? OilIso4406Code { get; set; }
    public decimal? LubePressureBar { get; set; }
    public decimal? HydraulicPressureBar { get; set; }
    public decimal? BearingUltrasoundDb { get; set; }
    public decimal? WearLinerRemaining { get; set; }

    public DateTime? LastPmDate { get; set; }
    public DateTime? NextPmDate { get; set; }
    public int? DaysToPm { get; set; }

    public string ConditionStatus { get; set; } = string.Empty;  // Normal / Watch / Alert / Critical
    public int AlarmCount { get; set; }
    public int? EstimatedRulDays { get; set; }
    public string? MaintenanceRecommendation { get; set; }
}
