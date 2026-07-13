using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;

namespace NgulAnalytics.Api.Controllers;

/// <summary>
/// Exposes the client-supplied PGM Concentrator (400 tph) datasets:
/// shift-level plant production and equipment condition-monitoring readings.
/// </summary>
[ApiController]
[Route("api/plant-data")]
[Authorize]
public class PlantDataController : ControllerBase
{
    private readonly NgulAnalyticsDbContext _context;

    public PlantDataController(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    // ------------------------------------------------------------------
    // Production Data
    // ------------------------------------------------------------------
    [HttpGet("production")]
    public async Task<IActionResult> GetProduction(
        [FromQuery] string? shift,
        [FromQuery] string? crew,
        [FromQuery] string? status,
        [FromQuery] int take = 200)
    {
        var query = _context.PlantProductionRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(shift))
            query = query.Where(r => r.Shift == shift);
        if (!string.IsNullOrWhiteSpace(crew))
            query = query.Where(r => r.Crew == crew);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(r => r.ProductionStatus == status);

        var records = await query
            .OrderByDescending(r => r.Timestamp)
            .Take(Math.Clamp(take, 1, 1000))
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("production/summary")]
    public async Task<IActionResult> GetProductionSummary()
    {
        var q = _context.PlantProductionRecords;
        if (!await q.AnyAsync())
            return Ok(new { recordCount = 0 });

        var summary = new
        {
            recordCount = await q.CountAsync(),
            totalRomTonnes = await q.SumAsync(r => r.RomFeedTonnes),
            averageFeedTph = await q.AverageAsync(r => r.PlantFeedTph),
            averageRecovery = await q.AverageAsync(r => r.OverallPgmRecovery),
            averageAvailability = await q.AverageAsync(r => r.Availability),
            totalConcentrateTonnes = await q.SumAsync(r => r.ConcentrateTonnes),
            actionShifts = await q.CountAsync(r => r.ProductionStatus == "Action"),
            watchShifts = await q.CountAsync(r => r.ProductionStatus == "Watch")
        };

        return Ok(summary);
    }

    // ------------------------------------------------------------------
    // Engineering Condition Monitoring Data
    // ------------------------------------------------------------------
    [HttpGet("engineering")]
    public async Task<IActionResult> GetEngineering(
        [FromQuery] string? area,
        [FromQuery] string? equipmentId,
        [FromQuery] string? conditionStatus,
        [FromQuery] int take = 200)
    {
        var query = _context.EquipmentConditionRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(area))
            query = query.Where(r => r.Area == area);
        if (!string.IsNullOrWhiteSpace(equipmentId))
            query = query.Where(r => r.EquipmentId == equipmentId);
        if (!string.IsNullOrWhiteSpace(conditionStatus))
            query = query.Where(r => r.ConditionStatus == conditionStatus);

        var records = await query
            .OrderByDescending(r => r.Timestamp)
            .Take(Math.Clamp(take, 1, 2000))
            .ToListAsync();

        return Ok(records);
    }

    [HttpGet("engineering/summary")]
    public async Task<IActionResult> GetEngineeringSummary()
    {
        var q = _context.EquipmentConditionRecords;
        if (!await q.AnyAsync())
            return Ok(new { cmRecords = 0 });

        var summary = new
        {
            cmRecords = await q.CountAsync(),
            criticalItems = await q.CountAsync(r => r.ConditionStatus == "Critical"),
            alertItems = await q.CountAsync(r => r.ConditionStatus == "Alert"),
            watchItems = await q.CountAsync(r => r.ConditionStatus == "Watch"),
            averageDeVibration = await q.AverageAsync(r => r.DeVibrationMmS),
            averageBearingTemp = await q.AverageAsync(r => r.DeBearingTempC),
            pmDueWithin10Days = await q.CountAsync(r => r.DaysToPm != null && r.DaysToPm <= 10)
        };

        return Ok(summary);
    }

    /// <summary>Latest condition reading per equipment item (fleet health snapshot).</summary>
    [HttpGet("engineering/latest")]
    public async Task<IActionResult> GetEngineeringLatest()
    {
        var latest = await _context.EquipmentConditionRecords
            .GroupBy(r => r.EquipmentId)
            .Select(g => g.OrderByDescending(r => r.Timestamp).First())
            .ToListAsync();

        return Ok(latest.OrderBy(r => r.Area).ThenBy(r => r.EquipmentId));
    }
}
