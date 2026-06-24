using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Models;

namespace NgulAnalytics.Api.Services;

public class ActionService
{
    private readonly NgulAnalyticsDbContext _context;

    public ActionService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<Models.Action> CreateActionAsync(CreateActionRequest request, Guid createdById)
    {
        var action = new Models.Action
        {
            Title = request.Title,
            Description = request.Description,
            Source = request.Source,
            SourceId = request.SourceId,
            Priority = request.Priority,
            AssignedToId = request.AssignedToId,
            CreatedById = createdById,
            EquipmentId = request.EquipmentId,
            DueDate = request.DueDate
        };

        _context.Actions.Add(action);
        await _context.SaveChangesAsync();
        return action;
    }

    public async Task<Models.Action?> UpdateActionAsync(int id, UpdateActionRequest request)
    {
        var action = await _context.Actions.FindAsync(id);
        if (action == null) return null;

        if (request.Status != null)
        {
            action.Status = request.Status;
            if (request.Status == "Closed")
                action.ClosedAt = DateTime.UtcNow;
        }

        if (request.AssignedToId.HasValue)
            action.AssignedToId = request.AssignedToId.Value;

        if (request.DueDate.HasValue)
            action.DueDate = request.DueDate.Value;

        await _context.SaveChangesAsync();
        return action;
    }

    public async Task<ActionComment> AddCommentAsync(int actionId, Guid userId, string comment)
    {
        var actionComment = new ActionComment
        {
            ActionId = actionId,
            UserId = userId,
            Comment = comment
        };

        _context.ActionComments.Add(actionComment);
        await _context.SaveChangesAsync();
        return actionComment;
    }

    public async Task<ActionDashboardDto> GetDashboardAsync()
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