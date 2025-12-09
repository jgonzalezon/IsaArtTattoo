using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.Shared.Events;
using MassTransit;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace IsaArtTattoo.IdentityApi.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _um;
    private readonly SignInManager<ApplicationUser> _sm;
    private readonly IConfiguration _cfg;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPublishEndpoint _publishEndpoint;

    public AuthService(
        UserManager<ApplicationUser> um,
        SignInManager<ApplicationUser> sm,
        IConfiguration cfg,
        IJwtTokenService jwtTokenService,
        IPublishEndpoint publishEndpoint)
    {
        _um = um;
        _sm = sm;
        _cfg = cfg;
        _jwtTokenService = jwtTokenService;
        _publishEndpoint = publishEndpoint;
    }

    private string GetFrontendBaseUrl()
        => _cfg["Frontend:BaseUrl"] ?? "http://localhost:5173";

    public async Task<RegisterResult> RegisterAsync(RegisterDto dto)
    {
        var user = new ApplicationUser { UserName = dto.Email, Email = dto.Email };
        var result = await _um.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return new RegisterResult(false, result.Errors);

        await _um.AddToRoleAsync(user, "User");

        // Generar token de confirmación
        var token = await _um.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        var frontendBase = GetFrontendBaseUrl();
        var confirmUrl =
            $"{frontendBase}/confirm-email?email={Uri.EscapeDataString(dto.Email)}&token={encodedToken}";

        // Publicar evento para que Notifications envíe el email de confirmación
        await _publishEndpoint.Publish(new SendEmailConfirmationEvent(
            dto.Email,
            confirmUrl
        ));

        // Evento para el welcome mail
        await _publishEndpoint.Publish(new UserCreatedEvent(user.Id, user.Email!));

        return new RegisterResult(true);
    }

    public async Task<ConfirmEmailResult> ConfirmEmailAsync(string email, string token)
    {
        var user = await _um.FindByEmailAsync(email);
        if (user == null)
            return new ConfirmEmailResult(false, "Usuario no encontrado.");

        var decodedToken = Uri.UnescapeDataString(token);

        var result = await _um.ConfirmEmailAsync(user, decodedToken);
        if (!result.Succeeded)
            return new ConfirmEmailResult(false, "Token inválido o expirado.");

        return new ConfirmEmailResult(true);
    }

    public async Task<LoginResult> LoginAsync(LoginDto dto)
    {
        var user = await _um.FindByEmailAsync(dto.Email);
        if (user is null)
            return new LoginResult(false, "Usuario no encontrado.");

        if (!user.EmailConfirmed)
            return new LoginResult(false, "Debe confirmar su cuenta antes de iniciar sesión.");

        var check = await _sm.CheckPasswordSignInAsync(user, dto.Password, false);
        if (!check.Succeeded)
            return new LoginResult(false, "Credenciales incorrectas.");

        var token = await _jwtTokenService.CreateTokenAsync(user);
        return new LoginResult(true, Token: token);
    }

    public async Task<SimpleResult> ResendConfirmationAsync(string email)
    {
        var user = await _um.FindByEmailAsync(email);
        if (user == null)
            return new SimpleResult(false, "Usuario no encontrado.");

        var token = await _um.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        var frontendBase = GetFrontendBaseUrl();
        var confirmUrl =
            $"{frontendBase}/confirm-email?email={Uri.EscapeDataString(email)}&token={encodedToken}";

        await _publishEndpoint.Publish(new SendEmailConfirmationEvent(
            email,
            confirmUrl
        ));

        return new SimpleResult(true);
    }

    public async Task<SimpleResult> ForgotPasswordAsync(string email)
    {
        var user = await _um.FindByEmailAsync(email);
        if (user == null)
            return new SimpleResult(false, "Usuario no encontrado.");

        var token = await _um.GeneratePasswordResetTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token);

        var frontendBase = GetFrontendBaseUrl();
        var resetUrl =
            $"{frontendBase}/reset-password?email={Uri.EscapeDataString(email)}&token={encodedToken}";

        await _publishEndpoint.Publish(new SendPasswordResetEvent(
            email,
            resetUrl
        ));

        return new SimpleResult(true);
    }

    public async Task<ResetPasswordResult> ResetPasswordAsync(NewPasswordDto dto)
    {
        var user = await _um.FindByEmailAsync(dto.Email);
        if (user == null)
            return new ResetPasswordResult(false);

        var decodedToken = Uri.UnescapeDataString(dto.Token);

        var result = await _um.ResetPasswordAsync(user, decodedToken, dto.NewPassword);
        if (!result.Succeeded)
            return new ResetPasswordResult(false, result.Errors);

        return new ResetPasswordResult(true);
    }
}
