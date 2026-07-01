using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NgulAnalytics.Api.Services;

public class ActionService
{
    private readonly NgulAnalyticsDbContext _context;

    public ActionService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ActionItemDto>> GetActionsAsync(
        string? status, string? priority, Guid? assignedTo, string? source, int page, int pageSize)
    {
        var query = _context.Actions
            .Include(a => a.AssignedTo)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        if (!string.IsNullOrEmpty(priority))
            query = query.Where(a => a.Priority == priority);

        if (assignedTo.HasValue)
            query = query.Where(a => a.AssignedToId == assignedTo.Value);

        if (!string.IsNullOrEmpty(source))
            query = query.Where(a => a.Source == source);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new ActionItemDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Source = a.Source,
                SourceId = a.SourceId,
                Priority = a.Priority,
                Status = a.Status,
                AssignedToId = a.AssignedToId,
                CreatedById = a.CreatedById,
                EquipmentId = a.EquipmentId,
                DueDate = a.DueDate,
                CreatedAt = a.CreatedAt,
                ClosedAt = a.ClosedAt,
                AssignedTo = a.AssignedTo != null ? new UserDto
                {
                    Id = a.AssignedTo.Id,
                    Email = a.AssignedTo.Email,
                    FullName = a.AssignedTo.FullName,
                    Role = a.AssignedTo.Role,
                    IsActive = a.AssignedTo.IsActive
                } : null
            })
            .ToListAsync();

        return new PagedResult<ActionItemDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ActionItemDetailDto?> GetActionByIdAsync(int id)
    {
        var a = await _context.Actions
            .Include(x => x.AssignedTo)
            .Include(x => x.Comments).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (a == null) return null;

        return new ActionItemDetailDto
        {
            Id = a.Id,
            Title = a.Title,
            Description = a.Description,
            Source = a.Source,
            SourceId = a.SourceId,
            Priority = a.Priority,
            Status = a.Status,
            AssignedToId = a.AssignedToId,
            CreatedById = a.CreatedById,
            EquipmentId = a.EquipmentId,
            DueDate = a.DueDate,
            CreatedAt = a.CreatedAt,
            ClosedAt = a.ClosedAt,
            AssignedTo = a.AssignedTo != null ? new UserDto
            {
                Id = a.AssignedTo.Id,
                Email = a.AssignedTo.Email,
                FullName = a.AssignedTo.FullName,
                Role = a.AssignedTo.Role,
                IsActive = a.AssignedTo.IsActive
            } : null,
            Comments = a.Comments.Select(c => new ActionCommentDto
            {
                Id = c.Id,
                ActionId = c.ActionId,
                UserId = c.UserId,
                Comment = c.Comment,
                CreatedAt = c.CreatedAt,
                User = c.User != null ? new UserDto
                {
                    Id = c.User.Id,
                    Email = c.User.Email,
                    FullName = c.User.FullName,
                    Role = c.User.Role,
                    IsActive = c.User.IsActive
                } : null
            }).ToList()
        };
    }

    public async Task<ActionItemDto> CreateActionAsync(CreateActionRequest request, Guid createdById)
    {
        var action = new Models.Action
        {
            Title = request.Title,
            Description = request.Description,
            Source = request.Source,
            SourceId = request.SourceId,
            Priority = request.Priority,
            Status = "Open",
            AssignedToId = request.AssignedToId,
            CreatedById = createdById,
            EquipmentId = request.EquipmentId,
            DueDate = request.DueDate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Actions.Add(action);
        await _context.SaveChangesAsync();

        // Load AssignedTo user if set
        if (action.AssignedToId.HasValue)
        {
            await _context.Entry(action).Reference(a => a.AssignedTo).LoadAsync();
        }

        return new ActionItemDto
        {
            Id = action.Id,
            Title = action.Title,
            Description = action.Description,
            Source = action.Source,
            SourceId = action.SourceId,
            Priority = action.Priority,
            Status = action.Status,
            AssignedToId = action.AssignedToId,
            CreatedById = action.CreatedById,
            EquipmentId = action.EquipmentId,
            DueDate = action.DueDate,
            CreatedAt = action.CreatedAt,
            ClosedAt = action.ClosedAt,
            AssignedTo = action.AssignedTo != null ? new UserDto
            {
                Id = action.AssignedTo.Id,
                Email = action.AssignedTo.Email,
                FullName = action.AssignedTo.FullName,
                Role = action.AssignedTo.Role,
                IsActive = action.AssignedTo.IsActive
            } : null
        };
    }

    public async Task<ActionItemDto?> UpdateActionAsync(int id, UpdateActionRequest request)
    {
        var action = await _context.Actions
            .Include(a => a.AssignedTo)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (action == null) return null;

        if (request.Status != null)
        {
            action.Status = request.Status;
            if (request.Status == "Closed")
                action.ClosedAt = DateTime.UtcNow;
        }

        if (request.AssignedToId.HasValue)
        {
            action.AssignedToId = request.AssignedToId.Value;
        }

        if (request.DueDate.HasValue)
        {
            action.DueDate = request.DueDate.Value;
        }

        await _context.SaveChangesAsync();

        if (action.AssignedToId.HasValue && (action.AssignedTo == null || action.AssignedTo.Id != action.AssignedToId.Value))
        {
            await _context.Entry(action).Reference(a => a.AssignedTo).LoadAsync();
        }

        return new ActionItemDto
        {
            Id = action.Id,
            Title = action.Title,
            Description = action.Description,
            Source = action.Source,
            SourceId = action.SourceId,
            Priority = action.Priority,
            Status = action.Status,
            AssignedToId = action.AssignedToId,
            CreatedById = action.CreatedById,
            EquipmentId = action.EquipmentId,
            DueDate = action.DueDate,
            CreatedAt = action.CreatedAt,
            ClosedAt = action.ClosedAt,
            AssignedTo = action.AssignedTo != null ? new UserDto
            {
                Id = action.AssignedTo.Id,
                Email = action.AssignedTo.Email,
                FullName = action.AssignedTo.FullName,
                Role = action.AssignedTo.Role,
                IsActive = action.AssignedTo.IsActive
            } : null
        };
    }

    public async Task<ActionCommentDto> AddCommentAsync(int actionId, Guid userId, string commentText)
    {
        var actionComment = new ActionComment
        {
            ActionId = actionId,
            UserId = userId,
            Comment = commentText,
            CreatedAt = DateTime.UtcNow
        };

        _context.ActionComments.Add(actionComment);
        await _context.SaveChangesAsync();

        await _context.Entry(actionComment).Reference(c => c.User).LoadAsync();

        return new ActionCommentDto
        {
            Id = actionComment.Id,
            ActionId = actionComment.ActionId,
            UserId = actionComment.UserId,
            Comment = actionComment.Comment,
            CreatedAt = actionComment.CreatedAt,
            User = actionComment.User != null ? new UserDto
            {
                Id = actionComment.User.Id,
                Email = actionComment.User.Email,
                FullName = actionComment.User.FullName,
                Role = actionComment.User.Role,
                IsActive = actionComment.User.IsActive
            } : null
        };
    }

    public async Task<ActionDashboardDto> GetDashboardStatsAsync()
    {
        var actions = await _context.Actions.ToListAsync();

        return new ActionDashboardDto
        {
            TotalOpen = actions.Count(a => a.Status == "Open" || a.Status == "InProgress"),
            Overdue = actions.Count(a => a.Status != "Closed" && a.DueDate < DateTime.UtcNow),
            ByPriority = actions.GroupBy(a => a.Priority).ToDictionary(g => g.Key, g => g.Count()),
            BySource = actions.GroupBy(a => a.Source).ToDictionary(g => g.Key, g => g.Count())
        };
    }

    // Auto-generation rules
    public async Task AutoGenerateFromObservationAsync(EquipmentObservation observation)
    {
        if (observation.NoiseLevel > 85)
        {
            await CreateActionAsync(new CreateActionRequest
            {
                Title = $"Investigate elevated noise on {observation.Equipment.Name}",
                Description = $"Noise level recorded at {observation.NoiseLevel} dB during shift inspection.",
                Source = "Observation",
                SourceId = observation.Id,
                Priority = "High",
                EquipmentId = observation.EquipmentId,
                DueDate = DateTime.UtcNow.AddDays(3)
            }, observation.ShiftReport.SupervisorId);
        }

        if (observation.GeneralCondition is "Poor" or "Critical")
        {
            await CreateActionAsync(new CreateActionRequest
            {
                Title = $"Inspect {observation.Equipment.Name} — condition rated {observation.GeneralCondition}",
                Description = $"Equipment condition rated as {observation.GeneralCondition} during inspection.",
                Source = "Observation",
                SourceId = observation.Id,
                Priority = observation.GeneralCondition == "Critical" ? "Critical" : "High",
                EquipmentId = observation.EquipmentId,
                DueDate = DateTime.UtcNow.AddDays(1)
            }, observation.ShiftReport.SupervisorId);
        }
    }

    public async Task AutoGenerateFromDowntimeAsync(DowntimeEntry downtime)
    {
        if (downtime.DurationHours > 4)
        {
            await CreateActionAsync(new CreateActionRequest
            {
                Title = $"Review extended downtime on {downtime.Equipment.Name}",
                Description = $"Equipment was down for {downtime.DurationHours} hours. Reason: {downtime.Reason}",
                Source = "Downtime",
                SourceId = downtime.Id,
                Priority = "High",
                EquipmentId = downtime.EquipmentId,
                DueDate = DateTime.UtcNow.AddDays(2)
            }, downtime.ShiftReport.SupervisorId);
        }
    }

    public async Task AutoGenerateFromUndergroundAsync(UndergroundReading reading)
    {
        if (reading.OxygenLevelStart < 19.5m || reading.OxygenLevelMidshift < 19.5m || reading.OxygenLevelFinish < 19.5m)
        {
            await CreateActionAsync(new CreateActionRequest
            {
                Title = "CRITICAL: Low oxygen detected in Underground",
                Description = $"Oxygen levels: Start {reading.OxygenLevelStart}%, Mid {reading.OxygenLevelMidshift}%, Finish {reading.OxygenLevelFinish}%",
                Source = "Incident",
                SourceId = reading.Id,
                Priority = "Critical",
                DueDate = DateTime.UtcNow.AddHours(4)
            }, reading.ShiftReport.SupervisorId);
        }
    }
}