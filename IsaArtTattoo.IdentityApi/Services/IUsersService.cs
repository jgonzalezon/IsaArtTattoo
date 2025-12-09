using IsaArtTattoo.IdentityApi.Dtos;
using Microsoft.AspNetCore.Identity;

namespace IsaArtTattoo.IdentityApi.Services;

public record UserResult(
    bool Succeeded,
    UserSummaryDto? User = null,
    string? Error = null);

public record CreateUserResult(
    bool Succeeded,
    string? Id = null,
    string? Email = null,
    IEnumerable<IdentityError>? Errors = null,
    string? Error = null);

public record UpdateRolesResult(
    bool Succeeded,
    string? Error = null,
    IEnumerable<IdentityError>? Errors = null);

public record ChangePasswordResult(
    bool Succeeded,
    string? Error = null,
    IEnumerable<IdentityError>? Errors = null);

public record DeleteUserResult(
    bool Succeeded,
    string? Error = null,
    IEnumerable<IdentityError>? Errors = null);

public interface IUsersService
{
    Task<IReadOnlyList<UserSummaryDto>> GetAllAsync();
    Task<UserResult> GetByIdAsync(string id);
    Task<CreateUserResult> CreateAsync(CreateUserDto dto);
    Task<UpdateRolesResult> UpdateRolesAsync(UpdateUserRolesDto dto);
    Task<ChangePasswordResult> ChangePasswordAsync(ChangeUserPasswordDto dto);
    Task<DeleteUserResult> DeleteAsync(string id);
}
