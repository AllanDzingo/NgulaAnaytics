using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Services;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlertsController : ControllerBase
{
    private readonly AlertService _alertService;

    public AlertsController(AlertService alertService)
    {
        _alertService = alertService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AlertDto>>> GetAlerts([FromQuery] bool unreadOnly = false)
    {
        var alerts = await _alertService.GetAlertsAsync(unreadOnly);
        return Ok(alerts);
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        var count = await _alertService.GetUnreadCountAsync();
        return Ok(count);
    }

    [HttpPatch("{id}/mark-read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var success = await _alertService.MarkAsReadAsync(id);
        if (!success)
            return NotFound();
        return NoContent();
    }

    [HttpPatch("mark-all-read")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        await _alertService.MarkAllAsReadAsync();
        return NoContent();
    }
}