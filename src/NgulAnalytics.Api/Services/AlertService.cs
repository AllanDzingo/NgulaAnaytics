using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.Models;

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
        var alert = new Alert
        {
            Type = type,
            Severity = severity,
            Title = title,
            Message = message,
            EquipmentId = equipmentId
        };

        _context.Alerts.Add(alert);
        await _context.SaveChangesAsync();
        return alert;
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