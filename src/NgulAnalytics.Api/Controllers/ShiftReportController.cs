using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Models;
using NgulAnalytics.Api.Services;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShiftReportController : ControllerBase
{
    private readonly NgulAnalyticsDbContext _context;
    private readonly ActionService _actionService;
    private readonly AlertService _alertService;

    public ShiftReportController(NgulAnalyticsDbContext context, ActionService actionService, AlertService alertService)
    {
        _context = context;
        _actionService = actionService;
        _alertService = alertService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? sectionId, [FromQuery] DateTime? date)
    {
        var query = _context.ShiftReports
            .Include(sr => sr.Supervisor)
            .Include(sr => sr.Section)
            .AsQueryable();

        if (sectionId.HasValue) query = query.Where(sr => sr.SectionId == sectionId.Value);
        if (date.HasValue) query = query.Where(sr => sr.Date == date.Value.Date);

        var reports = await query.OrderByDescending(sr => sr.Date).ToListAsync();
        return Ok(reports);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var report = await _context.ShiftReports
            .Include(sr => sr.Supervisor)
            .Include(sr => sr.Section)
            .Include(sr => sr.ProductionEntries)
            .Include(sr => sr.DowntimeEntries).ThenInclude(de => de.Equipment)
            .Include(sr => sr.EquipmentObservations).ThenInclude(eo => eo.Equipment)
            .Include(sr => sr.SheqObservations)
            .Include(sr => sr.UndergroundReadings)
            .Include(sr => sr.ShiftHandover)
            .Include(sr => sr.Actions)
            .FirstOrDefaultAsync(sr => sr.Id == id);

        if (report == null) return NotFound();
        return Ok(report);
    }

    [HttpPost]
    [Authorize(Policy = "Supervisor")]
    public async Task<IActionResult> Create([FromBody] CreateShiftReportDto request)
    {
        var supervisorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var report = new ShiftReport
        {
            Date = request.Date,
            Shift = request.Shift,
            SupervisorId = supervisorId,
            SectionId = request.SectionId,
            Status = "Submitted",
            SubmittedAt = DateTime.UtcNow
        };

        _context.ShiftReports.Add(report);
        await _context.SaveChangesAsync();

        // Add production entry
        if (request.ProductionEntry != null)
        {
            _context.ProductionEntries.Add(new ProductionEntry
            {
                ShiftReportId = report.Id,
                TonsCrushed = request.ProductionEntry.TonsCrushed,
                TonsMilled = request.ProductionEntry.TonsMilled,
                FeedGrade = request.ProductionEntry.FeedGrade,
                RecoveryPercentage = request.ProductionEntry.RecoveryPercentage,
                ConcentrateProduced = request.ProductionEntry.ConcentrateProduced,
                Comments = request.ProductionEntry.Comments ?? string.Empty
            });
        }

        // Add downtime entries
        if (request.DowntimeEntries != null)
        {
            foreach (var dto in request.DowntimeEntries)
            {
                var downtime = new DowntimeEntry
                {
                    ShiftReportId = report.Id,
                    EquipmentId = dto.EquipmentId,
                    StartTime = dto.StartTime,
                    EndTime = dto.EndTime,
                    DurationHours = (decimal)(dto.EndTime - dto.StartTime).TotalHours,
                    Reason = dto.Reason,
                    RootCause = dto.RootCause,
                    CorrectiveAction = dto.CorrectiveAction
                };
                _context.DowntimeEntries.Add(downtime);

                // Auto-generate action for extended downtime
                if (downtime.DurationHours > 4)
                {
                    await _actionService.AutoGenerateFromDowntimeAsync(downtime);
                }
            }
        }

        // Add equipment observations
        if (request.EquipmentObservations != null)
        {
            foreach (var dto in request.EquipmentObservations)
            {
                var observation = new EquipmentObservation
                {
                    ShiftReportId = report.Id,
                    EquipmentId = dto.EquipmentId,
                    NoiseLevel = dto.NoiseLevel,
                    VibrationObservation = dto.VibrationObservation,
                    TemperatureObservation = dto.TemperatureObservation,
                    GeneralCondition = dto.GeneralCondition
                };
                _context.EquipmentObservations.Add(observation);

                // Auto-generate actions based on observations
                await _actionService.AutoGenerateFromObservationAsync(observation);

                // Generate alerts
                if (dto.NoiseLevel > 85)
                {
                    await _alertService.CreateAlertAsync("Safety", "Warning",
                        $"High noise level on equipment {dto.EquipmentId}",
                        $"Noise level: {dto.NoiseLevel} dB", dto.EquipmentId);
                }
            }
        }

        // Add SHEQ observation
        if (request.SheqObservation != null)
        {
            _context.SheqObservations.Add(new SheqObservation
            {
                ShiftReportId = report.Id,
                Incidents = request.SheqObservation.Incidents,
                NearMisses = request.SheqObservation.NearMisses,
                SafetyObservations = request.SheqObservation.SafetyObservations ?? string.Empty,
                EnvironmentalObservations = request.SheqObservation.EnvironmentalObservations ?? string.Empty,
                AirQualityScore = request.SheqObservation.AirQualityScore,
                DustLevel = request.SheqObservation.DustLevel,
                HeatIndex = request.SheqObservation.HeatIndex
            });

            if (request.SheqObservation.Incidents > 0)
            {
                await _alertService.CreateAlertAsync("Safety", "Critical",
                    "Safety incident reported",
                    $"{request.SheqObservation.Incidents} incident(s) reported");
            }
        }

        // Add underground readings
        if (request.UndergroundReading != null)
        {
            _context.UndergroundReadings.Add(new UndergroundReading
            {
                ShiftReportId = report.Id,
                TruckloadsExcavated = request.UndergroundReading.TruckloadsExcavated,
                OxygenLevelStart = request.UndergroundReading.OxygenLevelStart,
                OxygenLevelMidshift = request.UndergroundReading.OxygenLevelMidshift,
                OxygenLevelFinish = request.UndergroundReading.OxygenLevelFinish,
                DustLevel = request.UndergroundReading.DustLevel,
                Visibility = Enum.TryParse<Visibility>(request.UndergroundReading.Visibility, true, out var vis) ? vis : Visibility.Good,
                Incidents = request.UndergroundReading.Incidents,
                IncidentDescriptions = request.UndergroundReading.IncidentDescriptions
            });

            // Auto-generate critical action for low oxygen
            if (request.UndergroundReading.OxygenLevelStart < 19.5m ||
                request.UndergroundReading.OxygenLevelMidshift < 19.5m ||
                request.UndergroundReading.OxygenLevelFinish < 19.5m)
            {
                var reading = await _context.UndergroundReadings
                    .Include(ur => ur.ShiftReport)
                    .ThenInclude(sr => sr.Supervisor)
                    .FirstAsync(ur => ur.ShiftReportId == report.Id);

                await _actionService.AutoGenerateFromUndergroundAsync(reading);

                await _alertService.CreateAlertAsync("Safety", "Critical",
                    "CRITICAL: Low oxygen in Underground",
                    $"Oxygen levels below 19.5%");
            }
        }

        // Add handover
        if (request.Handover != null)
        {
            _context.ShiftHandovers.Add(new ShiftHandover
            {
                ShiftReportId = report.Id,
                MajorEvents = request.Handover.MajorEvents,
                EquipmentIssues = request.Handover.EquipmentIssues,
                SafetyConcerns = request.Handover.SafetyConcerns,
                ProductionConcerns = request.Handover.ProductionConcerns,
                OutstandingActions = request.Handover.OutstandingActions,
                GeneralNotes = request.Handover.GeneralNotes
            });
        }

        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = report.Id }, report);
    }
}