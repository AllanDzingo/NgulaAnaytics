namespace NgulAnalytics.Api.Models;

public class TrackedAction
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ActionSource Source { get; set; }
    public int? SourceId { get; set; } // Reference to source entity
    public ActionPriority Priority { get; set; } = ActionPriority.Medium;
    public ActionStatus Status { get; set; } = ActionStatus.Open;
    public Guid? AssignedToId { get; set; }
    public User? AssignedTo { get; set; }
    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;
    public int? EquipmentId { get; set; }
    public Equipment? Equipment { get; set; }
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAt { get; set; }

    public ICollection<ActionComment> Comments { get; set; } = new List<ActionComment>();
}

public class ActionComment
{
    public int Id { get; set; }
    public int ActionId { get; set; }
    public TrackedAction Action { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ActionSource
{
    Downtime,
    Observation,
    Incident,
    Handover,
    Manual
}

public enum ActionPriority
{
    Low,
    Medium,
    High,
    Critical
}

public enum ActionStatus
{
    Open,
    InProgress,
    Closed,
    Overdue
}
