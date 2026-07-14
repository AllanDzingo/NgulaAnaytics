using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.Models;
using NgulAnalytics.Api.DTOs;

namespace NgulAnalytics.Api.Services;

public class MaintenanceService
{
    private readonly NgulAnalyticsDbContext _context;

    public MaintenanceService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<List<Equipment>> GetOverdueEquipmentAsync()
    {
        var equipment = await _context.Equipment
            .Include(e => e.MaintenanceRecords)
            .ToListAsync();

        return equipment.Where(e =>
        {
            var lastService = e.MaintenanceRecords.OrderByDescending(m => m.PerformedAt).FirstOrDefault();
            var hoursSinceService = lastService != null
                ? e.CurrentOperatingHours - lastService.HoursAtService
                : e.CurrentOperatingHours;
            return hoursSinceService >= e.ServiceIntervalHours;
        }).ToList();
    }

    public async Task<List<Equipment>> GetUpcomingServicesAsync(int hoursThreshold = 50)
    {
        var equipment = await _context.Equipment
            .Include(e => e.MaintenanceRecords)
            .ToListAsync();

        return equipment.Where(e =>
        {
            var lastService = e.MaintenanceRecords.OrderByDescending(m => m.PerformedAt).FirstOrDefault();
            var hoursSinceService = lastService != null
                ? e.CurrentOperatingHours - lastService.HoursAtService
                : e.CurrentOperatingHours;
            var hoursUntilDue = e.ServiceIntervalHours - hoursSinceService;
            return hoursUntilDue > 0 && hoursUntilDue <= hoursThreshold;
        }).ToList();
    }

    public async Task<MaintenanceKpiDto> GetKpis()
    {
        var equipment = await _context.Equipment
            .Include(e => e.MaintenanceRecords)
            .ToListAsync();

        decimal HoursUntilService(Equipment e)
        {
            var lastService = e.MaintenanceRecords.OrderByDescending(m => m.PerformedAt).FirstOrDefault();
            var hoursSinceService = lastService != null
                ? e.CurrentOperatingHours - lastService.HoursAtService
                : e.CurrentOperatingHours;
            return e.ServiceIntervalHours - hoursSinceService;
        }

        var withHours = equipment.Select(e => new { Equipment = e, HoursUntil = HoursUntilService(e) }).ToList();

        var overdue = withHours.Count(x => x.HoursUntil < 0);
        var upcoming = withHours.Count(x => x.HoursUntil >= 0 && x.HoursUntil <= 50);
        var onSchedule = withHours.Count(x => x.HoursUntil > 50);
        var total = equipment.Count;

        var complianceRate = total > 0
            ? Math.Round((decimal)(total - overdue) / total * 100, 1)
            : 0m;

        var averageHours = withHours.Count > 0
            ? Math.Round(withHours.Average(x => x.HoursUntil), 1)
            : 0m;

        return new MaintenanceKpiDto
        {
            OverdueCount = overdue,
            UpcomingCount = upcoming,
            TotalEquipment = total,
            OverdueServices = overdue,
            UpcomingServices = upcoming,
            OnSchedule = onSchedule,
            ServiceComplianceRate = complianceRate,
            AverageHoursUntilService = averageHours
        };
    }

}