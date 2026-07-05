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
        var overdue = await GetOverdueEquipmentAsync();
        var upcoming = await GetUpcomingServicesAsync();
        return new MaintenanceKpiDto
        {
            OverdueCount = overdue.Count,
            UpcomingCount = upcoming.Count
        };
    }
}