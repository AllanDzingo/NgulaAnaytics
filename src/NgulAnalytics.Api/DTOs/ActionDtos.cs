using System;
using System.Collections.Generic;

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

public class CreateActionDto : CreateActionRequest { }

public class UpdateActionRequest
{
    public string? Status { get; set; }
    public Guid? AssignedToId { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateActionDto : UpdateActionRequest { }

public class ActionItemDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public int SourceId { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? AssignedToId { get; set; }
    public Guid CreatedById { get; set; }
    public int? EquipmentId { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public UserDto? AssignedTo { get; set; }
}

public class ActionItemDetailDto : ActionItemDto
{
    public List<ActionCommentDto> Comments { get; set; } = new();
}

public class CreateActionCommentDto
{
    public string Comment { get; set; } = string.Empty;
}

public class ActionCommentDto
{
    public int Id { get; set; }
    public int ActionId { get; set; }
    public Guid UserId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public UserDto? User { get; set; }
}

public class ActionDashboardDto
{
    public int TotalOpen { get; set; }
    public int Overdue { get; set; }
    public Dictionary<string, int> ByPriority { get; set; } = new();
    public Dictionary<string, int> BySource { get; set; } = new();
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}