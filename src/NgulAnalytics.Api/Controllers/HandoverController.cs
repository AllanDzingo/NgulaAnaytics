using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Services;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Supervisor,Executive,Production,Engineering,SHEQ")]
public class HandoverController : ControllerBase
{
    private readonly HandoverService _handoverService;

    public HandoverController(HandoverService handoverService)
    {
        _handoverService = handoverService;
    }

    [HttpGet("current/{sectionId}")]
    public async Task<ActionResult<ShiftHandoverDto>> GetCurrentHandover(int sectionId)
    {
        var handover = await _handoverService.GetCurrentHandoverAsync(sectionId);
        if (handover == null)
            return NotFound(new { message = "No recent handover found for this section" });
        return Ok(handover);
    }

    [HttpGet("history/{sectionId}")]
    public async Task<ActionResult<List<ShiftHandoverDto>>> GetHandoverHistory(int sectionId, [FromQuery] int days = 7)
    {
        var history = await _handoverService.GetHandoverHistoryAsync(sectionId, days);
        return Ok(history);
    }

    [HttpPost]
    [Authorize(Roles = "Supervisor")]
    public async Task<ActionResult<ShiftHandoverDto>> CreateHandover([FromBody] CreateShiftHandoverDto dto)
    {
        var handover = await _handoverService.CreateHandoverAsync(dto);
        return CreatedAtAction(nameof(GetCurrentHandover), new { sectionId = handover.SectionId }, handover);
    }
}