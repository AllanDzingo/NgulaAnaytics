using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NgulAnalytics.Api.Services;

public class AlertService
{
    private readonly NgulAnalyticsDbContext _context;

    public AlertService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<Alert> CreateAlertAsync(string type, string severity, string title, string message, int? equipmentId = null)
    {
        if (!Enum.TryParse<AlertSeverity>(severity, true, out var alertSeverity))
        {
            alertSeverity = AlertSeverity.Info;
        }

        var alert = new Alert
        {
            Type = type,
            Severity = alertSeverity,
            Title = title,
            Message = message,
            EquipmentId = equipmentId,
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();
        return alert;
    }

    public async Task<List<AlertDto>> GetAlertsAsync(bool unreadOnly = false)
    {
        var query = _context.Alerts.AsQueryable();
        if (unreadOnly)
        {
            query = query.Where(a => !a.IsRead);
        }

        var alerts = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        return alerts.Select(a => new AlertDto
        {
            Id = a.Id,
            Type = a.Type,
            Severity = a.Severity.ToString(),
            Title = a.Title,
            Message = a.Message,
            IsRead = a.IsRead,
            CreatedAt = a.CreatedAt
        }).ToList();
    }

    public async Task<int> GetUnreadCountAsync()
    {
        return await _context.Alerts.CountAsync(a => !a.IsRead);
    }

    public async Task<bool> MarkAsReadAsync(int id)
    {
        var alert = await _context.Alerts.FindAsync(id);
        if (alert == null) return false;

        alert.IsRead = true;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task MarkAllAsReadAsync()
    {
        var unreadAlerts = await _context.Alerts.Where(a => !a.IsRead).ToListAsync();
        foreach (var alert in unreadAlerts)
        {
            alert.IsRead = true;
        }
        await _context.SaveChangesAsync();
    }

    public async Task GenerateAlertsFromEquipmentAsync()
    {
        var maintenanceService = new MaintenanceService(_context);
        var engineeringService = new EngineeringService(_context);

        // Service due alerts
        var upcomingServices = await maintenanceService.GetUpcomingServicesAsync(50);
        foreach (var equipment in upcomingServices)
        {
            var lastService = equipment.MaintenanceRecords.OrderByDescending(m => m.PerformedAt).FirstOrDefault();
            var hoursSinceService = lastService != null
                ? equipment.CurrentOperatingHours - lastService.HoursAtService
                : equipment.CurrentOperatingHours;
            var hoursUntilDue = equipment.ServiceIntervalHours - hoursSinceService;

            await CreateAlertAsync(
                "ServiceDue",
                "Warning",
                $"Service Due: {equipment.Name}",
                $"Service due in {hoursUntilDue:F0} operating hours",
                equipment.Id);
        }

        // Overdue service alerts
        var overdueEquipment = await maintenanceService.GetOverdueEquipmentAsync();
        foreach (var equipment in overdueEquipment)
        {
            await CreateAlertAsync(
                "ServiceOverdue",
                "Critical",
                $"Service Overdue: {equipment.Name}",
                $"Equipment service is overdue. Please schedule maintenance immediately.",
                equipment.Id);
        }

        // Health score alerts
        var allEquipment = await _context.Equipment.ToListAsync();
        foreach (var equipment in allEquipment)
        {
            var healthScore = await engineeringService.GetEquipmentHealthScore(equipment.Id);
            if (healthScore < 40)
            {
                await CreateAlertAsync(
                    "Health",
                    "Critical",
                    $"Critical Health: {equipment.Name}",
                    $"Equipment health score is {healthScore:F0}%. Immediate attention required.",
                    equipment.Id);
            }
        }
    }
}