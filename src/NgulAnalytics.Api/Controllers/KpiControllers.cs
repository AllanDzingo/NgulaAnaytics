using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Services;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboard;
    public DashboardController(DashboardService dashboard) => _dashboard = dashboard;

    [HttpGet("executive")]
    public async Task<ActionResult<ExecutiveDashboardDto>> GetExecutive()
        => Ok(await _dashboard.GetExecutiveDashboard());
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductionController : ControllerBase
{
    private readonly ProductionService _production;
    public ProductionController(ProductionService production) => _production = production;

    [HttpGet("kpis")]
    public async Task<ActionResult<ProductionKpiDto>> GetKpis(
        [FromQuery] int? sectionId, [FromQuery] int? days)
        => Ok(await _production.GetKpis(sectionId, days));
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EngineeringController : ControllerBase
{
    private readonly EngineeringService _engineering;
    public EngineeringController(EngineeringService engineering) => _engineering = engineering;

    [HttpGet("kpis")]
    public async Task<ActionResult<EngineeringKpiDto>> GetKpis([FromQuery] int? days)
        => Ok(await _engineering.GetKpis(days));
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MaintenanceController : ControllerBase
{
    private readonly MaintenanceService _maintenance;
    public MaintenanceController(MaintenanceService maintenance) => _maintenance = maintenance;

    [HttpGet("kpis")]
    public async Task<ActionResult<MaintenanceKpiDto>> GetKpis()
        => Ok(await _maintenance.GetKpis());
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SheqController : ControllerBase
{
    private readonly SheqService _sheq;
    public SheqController(SheqService sheq) => _sheq = sheq;

    [HttpGet("kpis")]
    public async Task<ActionResult<SheqKpiDto>> GetKpis([FromQuery] int? days)
        => Ok(await _sheq.GetKpis(days));
}
