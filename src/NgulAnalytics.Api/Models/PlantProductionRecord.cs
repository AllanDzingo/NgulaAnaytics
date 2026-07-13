namespace NgulAnalytics.Api.Models;

/// <summary>
/// A single plant shift production record ingested from the client's
/// PGM Concentrator (400 tph) dataset. Each row represents one shift.
/// </summary>
public class PlantProductionRecord
{
    public int Id { get; set; }

    public DateTime Timestamp { get; set; }
    public DateTime Date { get; set; }
    public string Shift { get; set; } = string.Empty;   // Day / Afternoon / Night
    public string Crew { get; set; } = string.Empty;     // A / B / C

    public decimal OperatingHours { get; set; }
    public decimal PlantFeedTph { get; set; }
    public decimal RomFeedTonnes { get; set; }

    public decimal PrimaryCrusherTph { get; set; }
    public decimal SecondaryCrusherTph { get; set; }
    public decimal PrimaryMillTph { get; set; }
    public decimal SecondaryMillTph { get; set; }
    public decimal PrimaryRougherFeedTph { get; set; }
    public decimal SecondaryRougherFeedTph { get; set; }

    public decimal HeadGrade4E { get; set; }
    public decimal PrimaryRougherRecovery { get; set; }
    public decimal SecondaryRougherRecovery { get; set; }
    public decimal OverallPgmRecovery { get; set; }

    public decimal ConcentrateTonnes { get; set; }
    public decimal ConcentrateGrade4E { get; set; }
    public decimal TailingsGrade4E { get; set; }

    public decimal PrimaryMillP80Um { get; set; }
    public decimal SecondaryMillP80Um { get; set; }
    public decimal WaterAdditionM3H { get; set; }
    public decimal PlantPowerMw { get; set; }
    public decimal GrindingMediaKgT { get; set; }
    public decimal CollectorGT { get; set; }
    public decimal FrotherGT { get; set; }
    public decimal Ph { get; set; }

    public decimal Availability { get; set; }
    public decimal Utilisation { get; set; }
    public decimal DowntimeMinutes { get; set; }
    public string? DowntimeCategory { get; set; }
    public string? ProductionStatus { get; set; }  // Normal / Watch / Action
    public string? Comments { get; set; }
}
