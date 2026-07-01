using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NgulAnalytics.Api.Auth;
using NgulAnalytics.Api.Data;
using NgulAnalytics.Api.DTOs;

namespace NgulAnalytics.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly NgulAnalyticsDbContext _context;
    private readonly JwtService _jwtService;

    public AuthController(NgulAnalyticsDbContext context, JwtService jwtService)
    {
        _context = context;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        var token = _jwtService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _context.Users.FindAsync(Guid.Parse(userId));
        if (user == null) return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            FullName = user.FullName,
            Role = user.Role,
            IsActive = user.IsActive
        });
    }
}