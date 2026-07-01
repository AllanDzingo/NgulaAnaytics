using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;

namespace NgulAnalytics.Api.Services;

public class DashboardService
{
    private readonly NgulAnalyticsDbContext _context;

    public DashboardService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<ExecutiveSummaryDto> GetExecutiveSummaryAsync()
    {
        var productionKpis = await new ProductionService(_context).GetKpisAsync();
        var engineeringKpis = await new EngineeringService(_context).GetKpisAsync();
        var totalIncidents = await new SheqService(_context).GetTotalIncidentsAsync();
        
        var openActions = await _context.Actions.CountAsync(a => a.Status == "Open" || a.Status == "InProgress");
        var overdueActions = await _context.Actions.CountAsync(a => 
            a.Status != "Closed" && a.DueDate < DateTime.UtcNow);

        var recentAlerts = await _context.Alerts
            .Where(a => !a.IsRead)
            .OrderByDescending(a => a.CreatedAt)
            .Take(5)
            .Select(a => new AlertDto
            {
                Id = a.Id,
                Type = a.Type,
                Severity = a.Severity.ToString(),
                Title = a.Title,
                Message = a.Message,
                IsRead = a.IsRead,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return new ExecutiveSummaryDto
        {
            TotalTonsCrushed = productionKpis.TonsCrushed,
            TotalTonsMilled = productionKpis.TonsMilled,
            AverageRecovery = productionKpis.RecoveryRate,
            TotalIncidents = totalIncidents,
            OpenActions = openActions,
            OverdueActions = overdueActions,
            EquipmentAvailability = engineeringKpis.Availability,
            RecentAlerts = recentAlerts
        };
    }
}