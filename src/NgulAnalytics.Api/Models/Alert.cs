namespace NgulAnalytics.Api.Models;

public class Alert
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // ServiceDue, ServiceOverdue, HighDowntime, PoorHealth, HighNoise, SafetyIncident, LowOxygen, HighDust, PoorVisibility
    public AlertSeverity Severity { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int? EquipmentId { get; set; }
    public Equipment? Equipment { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum AlertSeverity
{
    Info,
    Warning,
    Critical
}
