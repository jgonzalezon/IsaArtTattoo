using IsaArtTattoo.IdentityApi.Dtos;
using Microsoft.AspNetCore.Identity;

namespace IsaArtTattoo.IdentityApi.Services;

public record RoleCreateResult(
    bool Succeeded,
    RoleDto? Role = null,
    IEnumerable<IdentityError>? Errors = null,
    string? Error = null);

public record RoleDeleteResult(
    bool Succeeded,
    string? Error = null,
    IEnumerable<IdentityError>? Errors = null);

public record AssignRoleResult(
    bool Succeeded,
    string? Error = null,
    IEnumerable<IdentityError>? Errors = null);

public interface IRolesService
{
    IReadOnlyList<RoleDto> GetAll();
    Task<RoleCreateResult> CreateAsync(CreateRoleDto dto);
    Task<RoleDeleteResult> DeleteAsync(string name);
    Task<AssignRoleResult> AssignToUserAsync(AssignRoleToUserDto dto);
}
