using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.Models;
using System.Threading.Tasks;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductionTargetsController : ControllerBase
{
    private readonly NgulAnalyticsDbContext _context;

    public ProductionTargetsController(NgulAnalyticsDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? sectionId, [FromQuery] int? year)
    {
        var query = _context.ProductionTargets
            .Include(pt => pt.Section)
            .AsQueryable();

        if (sectionId.HasValue)
            query = query.Where(pt => pt.SectionId == sectionId.Value);

        if (year.HasValue)
            query = query.Where(pt => pt.Year == year.Value);

        var targets = await query.OrderByDescending(pt => pt.Year).ThenBy(pt => pt.Month).ToListAsync();
        return Ok(targets);
    }

    [HttpPost]
    [Authorize(Policy = "Executive,Production,Supervisor")]
    public async Task<IActionResult> Create([FromBody] ProductionTarget target)
    {
        _context.ProductionTargets.Add(target);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = target.Id }, target);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Executive,Production,Supervisor")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductionTarget target)
    {
        if (id != target.Id) return BadRequest();

        _context.Entry(target).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var target = await _context.ProductionTargets
            .Include(pt => pt.Section)
            .FirstOrDefaultAsync(pt => pt.Id == id);

        if (target == null) return NotFound();
        return Ok(target);
    }
}