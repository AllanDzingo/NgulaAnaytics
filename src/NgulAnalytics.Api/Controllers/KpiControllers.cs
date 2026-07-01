using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NgulAnalytics.Api.DTOs;
using NgulAnalytics.Api.Services;
using System.Threading.Tasks;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboard;
    private readonly ProductionService _production;
    private readonly EngineeringService _engineering;
    private readonly SheqService _sheq;

    public DashboardController(
        DashboardService dashboard,
        ProductionService production,
        EngineeringService engineering,
        SheqService sheq)
    {
        _dashboard = dashboard;
        _production = production;
        _engineering = engineering;
        _sheq = sheq;
    }

    [HttpGet("executive")]
    public async Task<ActionResult<ExecutiveSummaryDto>> GetExecutive()
    {
        return Ok(await _dashboard.GetExecutiveSummaryAsync());
    }

    [HttpGet("production")]
    public async Task<ActionResult<ProductionKpiDto>> GetProductionKpis([FromQuery] int? sectionId)
    {
        return Ok(await _production.GetKpisAsync(sectionId));
    }

    [HttpGet("engineering")]
    public async Task<ActionResult<EngineeringKpiDto>> GetEngineeringKpis()
    {
        return Ok(await _engineering.GetKpisAsync());
    }

    [HttpGet("sheq")]
    public async Task<ActionResult<SheqKpiDto>> GetSheqKpis()
    {
        return Ok(await _sheq.GetSheqKpisAsync());
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductionController : ControllerBase
{
    private readonly ProductionService _production;
    public ProductionController(ProductionService production) => _production = production;

    [HttpGet("kpis")]
    public async Task<ActionResult<ProductionKpiDto>> GetKpis([FromQuery] int? sectionId)
    {
        return Ok(await _production.GetKpisAsync(sectionId));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EngineeringController : ControllerBase
{
    private readonly EngineeringService _engineering;
    public EngineeringController(EngineeringService engineering) => _engineering = engineering;

    [HttpGet("kpis")]
    public async Task<ActionResult<EngineeringKpiDto>> GetKpis([FromQuery] int? equipmentId)
    {
        return Ok(await _engineering.GetKpisAsync(equipmentId));
    }
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
    {
        return Ok(await _maintenance.GetKpis());
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SheqController : ControllerBase
{
    private readonly SheqService _sheq;
    public SheqController(SheqService sheq) => _sheq = sheq;

    [HttpGet("kpis")]
    public async Task<ActionResult<SheqKpiDto>> GetKpis()
    {
        return Ok(await _sheq.GetSheqKpisAsync());
    }
}
