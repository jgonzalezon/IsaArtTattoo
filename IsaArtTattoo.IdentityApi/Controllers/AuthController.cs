using Asp.Versioning;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.IdentityApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // Registro con envío de mail a través de evento
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok(new { Message = "Usuario creado. Revisa tu email para confirmar la cuenta." });
    }

    // Confirmar email
    [HttpGet("confirm")]
    public async Task<IActionResult> Confirm(string email, string token)
    {
        var result = await _authService.ConfirmEmailAsync(email, token);

        if (!result.Succeeded)
            return BadRequest(result.Error);

        return Ok("Correo confirmado correctamente.");
    }

    // Login solo si confirmado
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (!result.Succeeded)
            return Unauthorized(result.Error);

        return Ok(new { token = result.Token });
    }

    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmDto dto)
    {
        var result = await _authService.ResendConfirmationAsync(dto.Email);

        if (!result.Succeeded)
            return NotFound(result.Error);

        return Ok("Correo de confirmación reenviado.");
    }

    // Solicitar reset de contraseña
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ResetDto dto)
    {
        var result = await _authService.ForgotPasswordAsync(dto.Email);

        if (!result.Succeeded)
            return NotFound(result.Error);

        return Ok("Se ha enviado un correo con las instrucciones para restablecer la contraseña.");
    }

    // Restablecer contraseña
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(NewPasswordDto dto)
    {
        var result = await _authService.ResetPasswordAsync(dto);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok("Contraseña restablecida correctamente.");
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new { User.Identity!.Name });
}
