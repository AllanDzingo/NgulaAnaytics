namespace NgulAnalytics.Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ShiftReport> ShiftReports { get; set; } = new List<ShiftReport>();
    public ICollection<Action> AssignedActions { get; set; } = new List<Action>();
    public ICollection<Action> CreatedActions { get; set; } = new List<Action>();
    public ICollection<MaintenanceRecord> MaintenanceRecords { get; set; } = new List<MaintenanceRecord>();
}