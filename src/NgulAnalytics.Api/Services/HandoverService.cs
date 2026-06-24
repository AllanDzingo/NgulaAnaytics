using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;

namespace NgulAnalytics.Api.Services;

public class HandoverService
{
    private readonly NgulAnalyticsDbContext _context;

    public HandoverService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<HandoverSummaryDto?> GetCurrentHandoverAsync(int sectionId)
    {
        var latestReport = await _context.ShiftReports
            .Include(sr => sr.Supervisor)
            .Include(sr => sr.ShiftHandover)
            .Where(sr => sr.SectionId == sectionId && sr.Status == "Submitted")
            .OrderByDescending(sr => sr.Date)
            .ThenByDescending(sr => sr.Id)
            .FirstOrDefaultAsync();

        if (latestReport?.ShiftHandover == null)
            return null;

        var activeActions = await _context.Actions
            .Where(a => a.Status == "Open" || a.Status == "InProgress")
            .OrderBy(a => a.DueDate)
            .Take(10)
            .Select(a => new ActionSummaryDto
            {
                Id = a.Id,
                Title = a.Title,
                Priority = a.Priority,
                Status = a.Status,
                DueDate = a.DueDate
            })
            .ToListAsync();

        var equipmentStatus = await _context.Equipment
            .Where(e => e.SectionId == sectionId)
            .Select(e => new EquipmentStatusDto
            {
                Id = e.Id,
                Name = e.Name,
                Status = e.Status
            })
            .ToListAsync();

        return new HandoverSummaryDto
        {
            ShiftReportId = latestReport.Id,
            Date = latestReport.Date,
            Shift = latestReport.Shift,
            SupervisorName = latestReport.Supervisor.FullName,
            MajorEvents = latestReport.ShiftHandover.MajorEvents,
            EquipmentIssues = latestReport.ShiftHandover.EquipmentIssues,
            SafetyConcerns = latestReport.ShiftHandover.SafetyConcerns,
            ProductionConcerns = latestReport.ShiftHandover.ProductionConcerns,
            OutstandingActions = latestReport.ShiftHandover.OutstandingActions,
            GeneralNotes = latestReport.ShiftHandover.GeneralNotes,
            ActiveActions = activeActions,
            EquipmentStatus = equipmentStatus
        };
    }

    public async Task<List<HandoverSummaryDto>> GetHandoverHistoryAsync(int sectionId, int days = 7)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-days);

        var reports = await _context.ShiftReports
            .Include(sr => sr.Supervisor)
            .Include(sr => sr.ShiftHandover)
            .Where(sr => sr.SectionId == sectionId && sr.Date >= cutoffDate && sr.Status == "Submitted")
            .OrderByDescending(sr => sr.Date)
            .ToListAsync();

        return reports
            .Where(sr => sr.ShiftHandover != null)
            .Select(sr => new HandoverSummaryDto
            {
                ShiftReportId = sr.Id,
                Date = sr.Date,
                Shift = sr.Shift,
                SupervisorName = sr.Supervisor.FullName,
                MajorEvents = sr.ShiftHandover!.MajorEvents,
                EquipmentIssues = sr.ShiftHandover.EquipmentIssues,
                SafetyConcerns = sr.ShiftHandover.SafetyConcerns,
                ProductionConcerns = sr.ShiftHandover.ProductionConcerns,
                OutstandingActions = sr.ShiftHandover.OutstandingActions,
                GeneralNotes = sr.ShiftHandover.GeneralNotes
            })
            .ToList();
    }
}