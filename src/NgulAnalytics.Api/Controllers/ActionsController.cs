using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Services;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ActionsController : ControllerBase
{
    private readonly ActionService _actionService;

    public ActionsController(ActionService actionService)
    {
        _actionService = actionService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ActionItemDto>>> GetActions(
        [FromQuery] string? status,
        [FromQuery] string? priority,
        [FromQuery] Guid? assignedTo,
        [FromQuery] string? source,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _actionService.GetActionsAsync(status, priority, assignedTo, source, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ActionItemDetailDto>> GetAction(int id)
    {
        var action = await _actionService.GetActionByIdAsync(id);
        if (action == null)
            return NotFound();
        return Ok(action);
    }

    [HttpPost]
    [Authorize(Roles = "Executive,Engineering,Production,SHEQ,Supervisor")]
    public async Task<ActionResult<ActionItemDto>> CreateAction([FromBody] CreateActionDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var action = await _actionService.CreateActionAsync(dto, userId);
        return CreatedAtAction(nameof(GetAction), new { id = action.Id }, action);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<ActionItemDto>> UpdateAction(int id, [FromBody] UpdateActionDto dto)
    {
        var action = await _actionService.UpdateActionAsync(id, dto);
        if (action == null)
            return NotFound();
        return Ok(action);
    }

    [HttpPost("{id}/comments")]
    public async Task<ActionResult<ActionCommentDto>> AddComment(int id, [FromBody] CreateActionCommentDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var comment = await _actionService.AddCommentAsync(id, userId, dto.Comment);
        return Ok(comment);
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<ActionDashboardDto>> GetDashboardStats()
    {
        var stats = await _actionService.GetDashboardStatsAsync();
        return Ok(stats);
    }
}