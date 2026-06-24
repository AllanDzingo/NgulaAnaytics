namespace NgulAnalytics.Api.Models;

public class Equipment
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public EquipmentCategory Category { get; set; } = null!;
    public int SectionId { get; set; }
    public Section Section { get; set; } = null!;
    public string Manufacturer { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int ServiceIntervalHours { get; set; }
    public decimal CurrentOperatingHours { get; set; }
    public DateTime CommissionDate { get; set; }
    public string Status { get; set; } = "Operational"; // Operational, Down, Maintenance, Retired

    public ICollection<DowntimeEntry> DowntimeEntries { get; set; } = new List<DowntimeEntry>();
    public ICollection<EquipmentObservation> Observations { get; set; } = new List<EquipmentObservation>();
    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
    public ICollection<Action> Actions { get; set; } = new List<Action>();
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}