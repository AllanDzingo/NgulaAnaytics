using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;

namespace NgulAnalytics.Api.Services;

public class EngineeringService
{
    private readonly NgulAnalyticsDbContext _context;

    public EngineeringService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<EngineeringKpiDto> GetKpisAsync(int? equipmentId = null)
    {
        var query = _context.DowntimeEntries
            .Include(de => de.Equipment)
            .AsQueryable();

        if (equipmentId.HasValue)
            query = query.Where(de => de.EquipmentId == equipmentId.Value);

        var downtimeEntries = await query.ToListAsync();
        var equipmentList = await _context.Equipment
            .Include(e => e.MaintenanceRecords)
            .Include(e => e.Observations)
            .ToListAsync();

        if (equipmentId.HasValue)
            equipmentList = equipmentList.Where(e => e.Id == equipmentId.Value).ToList();

        // MTBF = Total Operating Hours / Number of Failures
        var totalOperatingHours = equipmentList.Sum(e => e.CurrentOperatingHours);
        var failureCount = downtimeEntries.Count;
        var mtbf = failureCount > 0 ? totalOperatingHours / failureCount : totalOperatingHours;

        // MTTR = Total Repair Time / Number of Repairs
        var totalRepairTime = downtimeEntries.Sum(de => de.DurationHours);
        var mttr = failureCount > 0 ? totalRepairTime / failureCount : 0;

        // Availability = Operating Hours / Scheduled Hours * 100
        var scheduledHours = equipmentList.Count * 8760; // 8760 hours per year per equipment
        var availability = scheduledHours > 0 ? (totalOperatingHours / scheduledHours) * 100 : 100;

        // Reliability = e^(-t/MTBF) * 100 (simplified with t=1000 hours)
        var reliability = mtbf > 0 ? Math.Exp(-1000 / (double)mtbf) * 100 : 100;

        // Service Compliance
        var totalDue = equipmentList.Count;
        var onTimeServices = equipmentList.Count(e =>
            e.MaintenanceRecords.Any(mr => mr.PerformedAt > DateTime.UtcNow.AddMonths(-1)));
        var compliance = totalDue > 0 ? (onTimeServices / (decimal)totalDue) * 100 : 100;

        return new EngineeringKpiDto
        {
            MTBF = Math.Round(mtbf, 2),
            MTTR = Math.Round(mttr, 2),
            Availability = Math.Round(availability, 2),
            Reliability = Math.Round((decimal)reliability, 2),
            ServiceCompliance = Math.Round(compliance, 2)
        };
    }

    public async Task<decimal> GetEquipmentHealthScore(int equipmentId)
    {
        var equipment = await _context.Equipment
            .Include(e => e.Observations)
            .Include(e => e.DowntimeEntries)
            .Include(e => e.MaintenanceRecords)
            .FirstOrDefaultAsync(e => e.Id == equipmentId);

        if (equipment == null) return 0;

        // Condition score (30%)
        var conditionScore = equipment.Observations.Any()
            ? equipment.Observations.OrderByDescending(o => o.Id).First().GeneralCondition switch
            {
                "Excellent" => 100,
                "Good" => 80,
                "Fair" => 60,
                "Poor" => 30,
                "Critical" => 0,
                _ => 70
            }
            : 70;

        // Downtime frequency score (25%) - fewer failures = higher score
        var recentFailures = equipment.DowntimeEntries.Count(de => de.StartTime > DateTime.UtcNow.AddDays(-30));
        var downtimeScore = Math.Max(0, 100 - (recentFailures * 20));

        // Service history score (25%)
        var lastService = equipment.MaintenanceRecords.OrderByDescending(m => m.PerformedAt).FirstOrDefault();
        var serviceScore = lastService != null
            ? Math.Max(0, 100 - ((DateTime.UtcNow - lastService.PerformedAt).Days * 2))
            : 50;

        // Age score (20%)
        var ageDays = (DateTime.UtcNow - equipment.CommissionDate).Days;
        var ageScore = Math.Max(0, 100 - (ageDays / 365 * 5));

        // Weighted average
        var healthScore = (conditionScore * 0.30m) + (downtimeScore * 0.25m) + (serviceScore * 0.25m) + (ageScore * 0.20m);

        return Math.Round(healthScore, 2);
    }
}