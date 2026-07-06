namespace NgulAnalytics.Api.Models;

public class ActionComment
{
    public int Id { get; set; }
    public int ActionId { get; set; }
    public Models.Action Action { get; set; } = null!;
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
