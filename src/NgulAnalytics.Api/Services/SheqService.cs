using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;

namespace NgulAnalytics.Api.Services;

public class SheqService
{
    private readonly NgulAnalyticsDbContext _context;

    public SheqService(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    public async Task<Dictionary<string, decimal>> GetUndergroundKpisAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.UndergroundReadings
            .Include(ur => ur.ShiftReport)
            .AsQueryable();

        if (startDate.HasValue)
            query = query.Where(ur => ur.ShiftReport.Date >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(ur => ur.ShiftReport.Date <= endDate.Value);

        var readings = await query.ToListAsync();

        if (!readings.Any())
            return new Dictionary<string, decimal>();

        // Oxygen Compliance: Readings >= 19.5%
        var oxygenCompliant = readings.Count(r => r.OxygenLevelStart >= 19.5m && r.OxygenLevelMidshift >= 19.5m && r.OxygenLevelFinish >= 19.5m);
        var oxygenCompliance = (oxygenCompliant / (decimal)readings.Count) * 100;

        // Dust Compliance: Readings <= 0.5 mg/m³
        var dustCompliant = readings.Count(r => r.DustLevel <= 0.5m);
        var dustCompliance = (dustCompliant / (decimal)readings.Count) * 100;

        // Excavation Rate
        var totalTruckloads = readings.Sum(r => r.TruckloadsExcavated);
        var excavationRate = readings.Count > 0 ? totalTruckloads / (decimal)readings.Count : 0;

        return new Dictionary<string, decimal>
        {
            ["OxygenCompliance"] = Math.Round(oxygenCompliance, 2),
            ["DustCompliance"] = Math.Round(dustCompliance, 2),
            ["ExcavationRate"] = Math.Round(excavationRate, 2),
            ["TotalTruckloads"] = totalTruckloads
        };
    }

    public async Task<int> GetTotalIncidentsAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var query = _context.SheqObservations.AsQueryable();

        if (startDate.HasValue)
            query = query.Where(so => so.ShiftReport.Date >= startDate.Value);
        if (endDate.HasValue)
            query = query.Where(so => so.ShiftReport.Date <= endDate.Value);

        return await query.SumAsync(so => (int?)so.Incidents) ?? 0;
    }

    public async Task<SheqKpiDto> GetSheqKpisAsync(DateTime? startDate = null, DateTime? endDate = null)
    {
        var underKpis = await GetUndergroundKpisAsync(startDate, endDate);
        var incidents = await GetTotalIncidentsAsync(startDate, endDate);
        
        var shiftReports = await _context.ShiftReports.ToListAsync();
        var totalFuel = shiftReports.Sum(s => s.FuelUsageLiters);
        var totalEnergy = shiftReports.Sum(s => s.EnergyKwh);
        var totalWater = shiftReports.Sum(s => s.WaterKl);
        
        var prodEntries = await _context.ProductionEntries.ToListAsync();
        var yieldTons = prodEntries.Sum(p => p.TonsMilled);
        if (yieldTons == 0) yieldTons = 1;

        return new SheqKpiDto
        {
            OxygenCompliance = underKpis.TryGetValue("OxygenCompliance", out var o2) ? o2 : 100,
            DustCompliance = underKpis.TryGetValue("DustCompliance", out var dust) ? dust : 100,
            ExcavationRate = underKpis.TryGetValue("ExcavationRate", out var exc) ? exc : 0,
            TotalTruckloads = underKpis.TryGetValue("TotalTruckloads", out var tl) ? tl : 0,
            TotalIncidents = incidents,
            FuelPerYield = Math.Round(totalFuel / yieldTons, 2),
            EnergyPerYield = Math.Round(totalEnergy / yieldTons, 2),
            WaterPerYield = Math.Round(totalWater / yieldTons, 2)
        };
    }
}