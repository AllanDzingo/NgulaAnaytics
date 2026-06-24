using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.Models;
using NgulAnalytics.Api.Services;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentController : ControllerBase
{
    private readonly NgulAnalyticsDbContext _context;
    private readonly EngineeringService _engineeringService;

    public EquipmentController(NgulAnalyticsDbContext context, EngineeringService engineeringService)
    {
        _context = context;
        _engineeringService = engineeringService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var equipment = await _context.Equipment
            .Include(e => e.Category)
            .Include(e => e.Section)
            .ToListAsync();
        return Ok(equipment);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var equipment = await _context.Equipment
            .Include(e => e.Category)
            .Include(e => e.Section)
            .Include(e => e.MaintenanceRecords)
            .Include(e => e.Observations)
            .Include(e => e.DowntimeEntries)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (equipment == null) return NotFound();

        var healthScore = await _engineeringService.GetEquipmentHealthScore(id);

        return Ok(new
        {
            equipment,
            healthScore,
            recentObservations = equipment.Observations.OrderByDescending(o => o.Id).Take(5),
            recentDowntime = equipment.DowntimeEntries.OrderByDescending(d => d.Id).Take(5)
        });
    }

    [HttpGet("{id}/health")]
    public async Task<IActionResult> GetHealthScore(int id)
    {
        var score = await _engineeringService.GetEquipmentHealthScore(id);
        return Ok(new { equipmentId = id, healthScore = score });
    }

    [HttpPost]
    [Authorize(Policy = "Engineering")]
    public async Task<IActionResult> Create([FromBody] Equipment equipment)
    {
        _context.Equipment.Add(equipment);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = equipment.Id }, equipment);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Engineering")]
    public async Task<IActionResult> Update(int id, [FromBody] Equipment equipment)
    {
        if (id != equipment.Id) return BadRequest();
        _context.Entry(equipment).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}