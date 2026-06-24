namespace NgulAnalytics.Api.Models;

public class Action
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty; // Downtime, Observation, Incident, Handover, Manual
    public int SourceId { get; set; }
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Critical
    public string Status { get; set; } = "Open"; // Open, InProgress, Closed, Overdue
    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public int? EquipmentId { get; set; }
    public Equipment? Equipment { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    public ICollection<ActionComment> Comments { get; set; } = new List<ActionComment>();
}