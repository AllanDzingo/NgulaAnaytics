using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;

namespace NgulAnalytics.Api.Services;

public class ProductionService
{
    private readonly NgulAnalyticsDbContext _context;

    public ProductionService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<ProductionKpiDto> GetKpisAsync(int? sectionId = null, DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.ProductionEntries
            .Include(pe => pe.ShiftReport)
            .AsQueryable();

        if (sectionId.HasValue)
            query = query.Where(pe => pe.ShiftReport.SectionId == sectionId.Value);

        if (startDate.HasValue)
            query = query.Where(pe => pe.ShiftReport.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(pe => pe.ShiftReport.Date <= endDate.Value);

        var entries = await query.ToListAsync();

        if (!entries.Any())
            return new ProductionKpiDto();

        var totalTonsCrushed = entries.Sum(e => e.TonsCrushed);
        var totalTonsMilled = entries.Sum(e => e.TonsMilled);
        var totalConcentrate = entries.Sum(e => e.ConcentrateProduced);
        var avgRecovery = entries.Average(e => e.RecoveryPercentage);

        // Calculate target achievement
        var targetQuery = _context.ProductionTargets.AsQueryable();
        if (sectionId.HasValue)
            targetQuery = targetQuery.Where(pt => pt.SectionId == sectionId.Value);

        var targets = await targetQuery.ToListAsync();
        var targetTons = targets.Sum(t => t.TargetTonsMilled);
        var achievement = targetTons > 0 ? (totalTonsMilled / targetTons) * 100 : 0;

        // Calculate throughput (tons per operating hour - simplified)
        var operatingHours = entries.Count * 8; // 8 hours per shift
        var throughput = operatingHours > 0 ? totalTonsMilled / operatingHours : 0;

        return new ProductionKpiDto
        {
            TargetAchievement = Math.Round(achievement, 2),
            RecoveryRate = Math.Round(avgRecovery, 2),
            Throughput = Math.Round(throughput, 2),
            TonsCrushed = totalTonsCrushed,
            TonsMilled = totalTonsMilled,
            ConcentrateProduced = totalConcentrate
        };
    }

    public async Task<List<ProductionTarget>> GetTargetsAsync(int sectionId, int year)
    {
        return await _context.ProductionTargets
            .Where(pt => pt.SectionId == sectionId && pt.Year == year)
            .OrderBy(pt => pt.Month)
            .ToListAsync();
    }
}