namespace NgulAnalytics.Api.Models;

public class ShiftReport
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public string Shift { get; set; } = string.Empty; // DAY, AFT, NGT
    public Guid SupervisorId { get; set; }
    public User Supervisor { get; set; } = null!;
    public int SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public string Status { get; set; } = "Draft"; // Draft, Submitted, Approved, Rejected
    public DateTime SubmittedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }

    public ICollection<ProductionEntry> ProductionEntries { get; set; } = new List<ProductionEntry>();
    public ICollection<DowntimeEntry> DowntimeEntries { get; set; } = new List<DowntimeEntry>();
    public ICollection<EquipmentObservation> EquipmentObservations { get; set; } = new List<EquipmentObservation>();
    public ICollection<SheqObservation> SheqObservations { get; set; } = new List<SheqObservation>();
    public ICollection<UndergroundReading> UndergroundReadings { get; set; } = new List<UndergroundReading>();
    public ShiftHandover? ShiftHandover { get; set; }
    public ICollection<Action> Actions { get; set; } = new List<Action>();
    
    // Efficiency/Resource metrics
    public decimal FuelUsageLiters { get; set; }
    public decimal EnergyKwh { get; set; }
    public decimal WaterKl { get; set; }
}