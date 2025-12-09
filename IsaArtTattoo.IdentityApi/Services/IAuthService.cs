using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using Microsoft.AspNetCore.Identity;

namespace IsaArtTattoo.IdentityApi.Services;

public record RegisterResult(bool Succeeded, IEnumerable<IdentityError>? Errors = null);
public record ConfirmEmailResult(bool Succeeded, string? Error = null);
public record LoginResult(bool Succeeded, string? Error = null, string? Token = null);
public record SimpleResult(bool Succeeded, string? Error = null);
public record ResetPasswordResult(bool Succeeded, IEnumerable<IdentityError>? Errors = null);

public interface IAuthService
{
    Task<RegisterResult> RegisterAsync(RegisterDto dto);
    Task<ConfirmEmailResult> ConfirmEmailAsync(string email, string token);
    Task<LoginResult> LoginAsync(LoginDto dto);
    Task<SimpleResult> ResendConfirmationAsync(string email);
    Task<SimpleResult> ForgotPasswordAsync(string email);
    Task<ResetPasswordResult> ResetPasswordAsync(NewPasswordDto dto);
}
