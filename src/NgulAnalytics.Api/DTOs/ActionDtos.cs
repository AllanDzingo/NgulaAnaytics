namespace NgulAnalytics.Api.DTOs;

public class CreateActionRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = "Manual";
    public int SourceId { get; set; }
    public string Priority { get; set; } = "Medium";
    public Guid? AssignedToId { get; set; }
    public int? EquipmentId { get; set; }
    public DateTime DueDate { get; set; }
}

public class UpdateActionRequest
{
    public string? Status { get; set; }
    public Guid? AssignedToId { get; set; }
    public DateTime? DueDate { get; set; }
}

public class ActionCommentDto
{
    public string Comment { get; set; } = string.Empty;
}

public class ActionDashboardDto
{
    public int TotalOpen { get; set; }
    public int Overdue { get; set; }
    public Dictionary<string, int> ByPriority { get; set; } = new();
    public Dictionary<string, int> BySource { get; set; } = new();
}