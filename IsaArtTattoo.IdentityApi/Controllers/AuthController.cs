using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.IdentityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _um;
    private readonly SignInManager<ApplicationUser> _sm;
    private readonly IConfiguration _cfg;
    private readonly IEmailSender _emailSender;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(
        UserManager<ApplicationUser> um,
        SignInManager<ApplicationUser> sm,
        IConfiguration cfg,
        IEmailSender emailSender,
        IJwtTokenService jwtTokenService)
    {
        _um = um;
        _sm = sm;
        _cfg = cfg;
        _emailSender = emailSender;
        _jwtTokenService = jwtTokenService;
    }

    //  Registro con envío de mail
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email };
        var result = await _um.CreateAsync(user, dto.Password);

        if (!result.Succeeded) return BadRequest(result.Errors);
        // Asignar rol USER por defecto
        await _um.AddToRoleAsync(user, "User");

        var token = await _um.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        var frontendBase = _cfg["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var confirmUrl =
            $"{frontendBase}/confirm-email?email={Uri.EscapeDataString(dto.Email)}&token={encodedToken}";

         _emailSender.SendEmailAsync(dto.Email, "Confirma tu cuenta",
            $"""
            <p>Gracias por registrarte en <b>IsaArtTattoo</b>.</p>
            <p>Haz clic <a href="{confirmUrl}">aquí</a> para confirmar tu correo.</p>
            """);

        return Ok(new { Message = "Usuario creado. Revisa tu email para confirmar la cuenta." });
    }

    // Confirmar email
    [HttpGet("confirm")]
    public async Task<IActionResult> Confirm(string email, string token)
    {
        var user = await _um.FindByEmailAsync(email);
        if (user == null) return BadRequest("Usuario no encontrado.");

        var decodedToken = Uri.UnescapeDataString(token);

        var result = await _um.ConfirmEmailAsync(user, decodedToken);
        if (!result.Succeeded) return BadRequest("Token inválido o expirado.");

        return Ok("Correo confirmado correctamente.");
    }

    // Login solo si confirmado
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _um.FindByEmailAsync(dto.Email);
        if (user is null) return Unauthorized("Usuario no encontrado.");
        if (!user.EmailConfirmed)
            return Unauthorized("Debe confirmar su cuenta antes de iniciar sesión.");

        var check = await _sm.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!check.Succeeded) return Unauthorized("Credenciales incorrectas.");

        var token = await _jwtTokenService.CreateTokenAsync(user);
        return Ok(new { token });
    }

    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendConfirmation([FromBody] ResendConfirmDto dto)
    {
        var user = await _um.FindByEmailAsync(dto.Email);
        if (user == null) return NotFound();

        var token = await _um.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        var frontendBase = _cfg["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var confirmUrl =
            $"{frontendBase}/confirm-email?email={Uri.EscapeDataString(dto.Email)}&token={encodedToken}";

        await _emailSender.SendEmailAsync(dto.Email, "Confirma tu cuenta",
            $"""<p>Haz clic <a href="{confirmUrl}">aquí</a> para confirmar tu correo.</p>""");

        return Ok("Correo de confirmación reenviado.");
    }

    // Solicitar reset de contraseña
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ResetDto dto)
    {
        var user = await _um.FindByEmailAsync(dto.Email);
        if (user == null) return NotFound();

        var token = await _um.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        var frontendBase = _cfg["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var resetUrl =
            $"{frontendBase}/reset-password?email={Uri.EscapeDataString(dto.Email)}&token={encodedToken}";

        await _emailSender.SendEmailAsync(dto.Email, "Restablece tu contraseña",
            $"""<p>Para restablecer tu contraseña haz clic <a href="{resetUrl}">aquí</a>.</p>""");

        return Ok("Se ha enviado un correo con las instrucciones para restablecer la contraseña.");
    }

    // Restablecer contraseña
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(NewPasswordDto dto)
    {
        var user = await _um.FindByEmailAsync(dto.Email);
        if (user == null) return NotFound();

        var decodedToken = Uri.UnescapeDataString(dto.Token);

        var result = await _um.ResetPasswordAsync(user, decodedToken, dto.NewPassword);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok("Contraseña restablecida correctamente.");

    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new { User.Identity!.Name });
}
