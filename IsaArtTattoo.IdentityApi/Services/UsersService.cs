using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace IsaArtTattoo.IdentityApi.Services;

public class UsersService : IUsersService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _cfg;

    public UsersService(UserManager<ApplicationUser> userManager, IConfiguration cfg)
    {
        _userManager = userManager;
        _cfg = cfg;
    }

    private string? MainAdminEmail =>
        _cfg["AdminUser:Email"];

    public async Task<IReadOnlyList<UserSummaryDto>> GetAllAsync()
    {
        var users = _userManager.Users.ToList();
        var list = new List<UserSummaryDto>();

        foreach (var u in users)
        {
            var roles = await _userManager.GetRolesAsync(u);
            list.Add(new UserSummaryDto(
                u.Id,
                u.Email ?? "",
                u.EmailConfirmed,
                roles
            ));
        }

        return list;
    }

    public async Task<UserResult> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
            return new UserResult(false, Error: "Usuario no encontrado.");

        var roles = await _userManager.GetRolesAsync(user);

        var dto = new UserSummaryDto(
            user.Id,
            user.Email ?? "",
            user.EmailConfirmed,
            roles
        );

        return new UserResult(true, User: dto);
    }

    public async Task<CreateUserResult> CreateAsync(CreateUserDto dto)
    {
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            EmailConfirmed = true // igual que en el controller original
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return new CreateUserResult(false, Errors: result.Errors);

        if (dto.Roles is { Count: > 0 })
        {
            var rolesResult = await _userManager.AddToRolesAsync(user, dto.Roles);
            if (!rolesResult.Succeeded)
                return new CreateUserResult(false, Errors: rolesResult.Errors);
        }

        return new CreateUserResult(true, Id: user.Id, Email: user.Email);
    }

    public async Task<UpdateRolesResult> UpdateRolesAsync(UpdateUserRolesDto dto)
    {
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user is null)
            return new UpdateRolesResult(false, Error: "Usuario no encontrado.");

        // No permitir quitar el rol Admin al admin principal
        if (!string.IsNullOrEmpty(MainAdminEmail) &&
            string.Equals(user.Email, MainAdminEmail, StringComparison.OrdinalIgnoreCase) &&
            !dto.Roles.Contains("Admin"))
        {
            return new UpdateRolesResult(false,
                Error: "No se puede quitar el rol Admin del usuario administrador principal.");
        }

        var currentRoles = await _userManager.GetRolesAsync(user);
        var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
        if (!removeResult.Succeeded)
            return new UpdateRolesResult(false, Errors: removeResult.Errors);

        if (dto.Roles is { Count: > 0 })
        {
            var addResult = await _userManager.AddToRolesAsync(user, dto.Roles);
            if (!addResult.Succeeded)
                return new UpdateRolesResult(false, Errors: addResult.Errors);
        }

        return new UpdateRolesResult(true);
    }

    public async Task<ChangePasswordResult> ChangePasswordAsync(ChangeUserPasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user is null)
            return new ChangePasswordResult(false, Error: "Usuario no encontrado.");

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
        if (!result.Succeeded)
            return new ChangePasswordResult(false, Errors: result.Errors);

        return new ChangePasswordResult(true);
    }

    public async Task<DeleteUserResult> DeleteAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user is null)
            return new DeleteUserResult(false, Error: "Usuario no encontrado.");

        // No permitir borrar al admin principal
        if (!string.IsNullOrEmpty(MainAdminEmail) &&
            string.Equals(user.Email, MainAdminEmail, StringComparison.OrdinalIgnoreCase))
        {
            return new DeleteUserResult(false,
                Error: "No se puede eliminar el usuario administrador principal.");
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return new DeleteUserResult(false, Errors: result.Errors);

        return new DeleteUserResult(true);
    }
}
