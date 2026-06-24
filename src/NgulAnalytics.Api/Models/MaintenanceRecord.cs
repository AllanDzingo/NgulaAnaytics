namespace NgulAnalytics.Api.Models;

public class MaintenanceRecord
{
    public int Id { get; set; }
    public int EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
    public string Type { get; set; } = string.Empty; // Scheduled, Unscheduled, Emergency
    public string Description { get; set; } = string.Empty;
    public DateTime PerformedAt { get; set; }
    public decimal HoursAtService { get; set; }
    public Guid? PerformedById { get; set; }
    public User? PerformedBy { get; set; }
}
