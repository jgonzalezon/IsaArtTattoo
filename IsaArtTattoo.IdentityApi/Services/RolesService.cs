using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using Microsoft.AspNetCore.Identity;

namespace IsaArtTattoo.IdentityApi.Services;

public class RolesService : IRolesService
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RolesService(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public IReadOnlyList<RoleDto> GetAll()
    {
        var roles = _roleManager.Roles
            .Select(r => new RoleDto(r.Id, r.Name ?? string.Empty))
            .ToList();

        return roles;
    }

    public async Task<RoleCreateResult> CreateAsync(CreateRoleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return new RoleCreateResult(false, Error: "El nombre del rol es obligatorio.");

        var exists = await _roleManager.RoleExistsAsync(dto.Name);
        if (exists)
            return new RoleCreateResult(false, Error: $"Ya existe un rol con el nombre '{dto.Name}'.");

        var role = new IdentityRole(dto.Name);
        var result = await _roleManager.CreateAsync(role);

        if (!result.Succeeded)
            return new RoleCreateResult(false, Errors: result.Errors);

        var createdDto = new RoleDto(role.Id, role.Name ?? string.Empty);
        return new RoleCreateResult(true, Role: createdDto);
    }

    public async Task<RoleDeleteResult> DeleteAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return new RoleDeleteResult(false, Error: "El nombre del rol es obligatorio.");

        var role = await _roleManager.FindByNameAsync(name);
        if (role is null)
            return new RoleDeleteResult(false, Error: $"No se encontró el rol '{name}'.");

        var result = await _roleManager.DeleteAsync(role);
        if (!result.Succeeded)
            return new RoleDeleteResult(false, Errors: result.Errors);

        return new RoleDeleteResult(true);
    }

    public async Task<AssignRoleResult> AssignToUserAsync(AssignRoleToUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user is null)
            return new AssignRoleResult(false, Error: "Usuario no encontrado.");

        var roleExists = await _roleManager.RoleExistsAsync(dto.RoleName);
        if (!roleExists)
            return new AssignRoleResult(false, Error: $"No existe el rol '{dto.RoleName}'.");

        var alreadyInRole = await _userManager.IsInRoleAsync(user, dto.RoleName);
        if (alreadyInRole)
            return new AssignRoleResult(false, Error: $"El usuario ya tiene el rol '{dto.RoleName}'.");

        var result = await _userManager.AddToRoleAsync(user, dto.RoleName);
        if (!result.Succeeded)
            return new AssignRoleResult(false, Errors: result.Errors);

        return new AssignRoleResult(true);
    }
}
