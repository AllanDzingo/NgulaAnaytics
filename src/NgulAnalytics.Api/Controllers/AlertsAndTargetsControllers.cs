using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Models;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly NgulAnalyticsDbContext _db;
    public AlertsController(NgulAnalyticsDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<AlertDto>>> GetAll([FromQuery] bool? unreadOnly)
    {
        var query = _db.Alerts.Include(a => a.Equipment).AsQueryable();
        if (unreadOnly == true) query = query.Where(a => !a.IsRead);

        var alerts = await query.OrderByDescending(a => a.CreatedAt).Take(50).ToListAsync();
        return Ok(alerts.Select(a => new AlertDto(
            a.Id, a.Type, a.Severity.ToString(), a.Title, a.Message,
            a.Equipment?.Name, a.IsRead, a.CreatedAt)).ToList());
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var alert = await _db.Alerts.FindAsync(id);
        if (alert == null) return NotFound();
        alert.IsRead = true;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        await _db.Alerts.Where(a => !a.IsRead).ExecuteUpdateAsync(s => s.SetProperty(a => a.IsRead, true));
        return NoContent();
    }
}

[ApiController]
[Route("api/production-targets")]
[Authorize]
public class ProductionTargetsController : ControllerBase
{
    private readonly NgulAnalyticsDbContext _db;
    public ProductionTargetsController(NgulAnalyticsDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<ProductionTargetDto>>> GetAll(
        [FromQuery] int? sectionId, [FromQuery] int? year)
    {
        var query = _db.ProductionTargets.Include(t => t.Section).AsQueryable();
        if (sectionId.HasValue) query = query.Where(t => t.SectionId == sectionId);
        if (year.HasValue) query = query.Where(t => t.Year == year);

        var targets = await query.OrderBy(t => t.Year).ThenBy(t => t.Month).ToListAsync();
        return Ok(targets.Select(t => new ProductionTargetDto(
            t.Id, t.SectionId, t.Section.Name, t.Year, t.Month,
            t.TargetTonsCrushed, t.TargetTonsMilled, t.TargetRecovery,
            t.TargetGrade, t.TargetTruckloads)).ToList());
    }

    [HttpPost]
    [Authorize(Roles = "Production Manager,Executive Management")]
    public async Task<ActionResult<ProductionTargetDto>> Create([FromBody] ProductionTargetCreateDto dto)
    {
        // Upsert - update if exists
        var existing = await _db.ProductionTargets
            .FirstOrDefaultAsync(t => t.SectionId == dto.SectionId && t.Year == dto.Year && t.Month == dto.Month);

        if (existing != null)
        {
            existing.TargetTonsCrushed = dto.TargetTonsCrushed;
            existing.TargetTonsMilled = dto.TargetTonsMilled;
            existing.TargetRecovery = dto.TargetRecovery;
            existing.TargetGrade = dto.TargetGrade;
            existing.TargetTruckloads = dto.TargetTruckloads;
        }
        else
        {
            existing = new ProductionTarget
            {
                SectionId = dto.SectionId,
                Year = dto.Year,
                Month = dto.Month,
                TargetTonsCrushed = dto.TargetTonsCrushed,
                TargetTonsMilled = dto.TargetTonsMilled,
                TargetRecovery = dto.TargetRecovery,
                TargetGrade = dto.TargetGrade,
                TargetTruckloads = dto.TargetTruckloads
            };
            _db.ProductionTargets.Add(existing);
        }

        await _db.SaveChangesAsync();
        var section = await _db.Sections.FindAsync(dto.SectionId);
        return Ok(new ProductionTargetDto(
            existing.Id, existing.SectionId, section?.Name ?? "", existing.Year,
            existing.Month, existing.TargetTonsCrushed, existing.TargetTonsMilled,
            existing.TargetRecovery, existing.TargetGrade, existing.TargetTruckloads));
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<UserDto>>> GetUsers()
    {
        var users = await _db.Users
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.IsActive)
            .ToListAsync();
        return Ok(users.Select(u => new UserDto(
            u.Id, u.Email, u.FullName,
            u.UserRoles.FirstOrDefault()?.Role.Name ?? "", u.IsActive, u.CreatedAt)).ToList());
    }
}
