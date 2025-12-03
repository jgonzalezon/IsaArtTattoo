using Asp.Versioning;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.IdentityApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public RolesController(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        _roleManager = roleManager;
        _userManager = userManager;
    }

    // GET: api/v1/roles
    [HttpGet("Listar roles")]
    public IActionResult GetAll()
    {
        var roles = _roleManager.Roles
            .Select(r => new RoleDto(r.Id, r.Name ?? string.Empty))
            .ToList();

        return Ok(roles);
    }

    // POST: api/v1/roles
    [HttpPost("Crear Rol")]
    public async Task<IActionResult> Create(CreateRoleDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("El nombre del rol es obligatorio.");

        var exists = await _roleManager.RoleExistsAsync(dto.Name);
        if (exists)
            return BadRequest($"Ya existe un rol con el nombre '{dto.Name}'.");

        var role = new IdentityRole(dto.Name);
        var result = await _roleManager.CreateAsync(role);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        var createdDto = new RoleDto(role.Id, role.Name ?? string.Empty);
        return CreatedAtAction(nameof(GetAll), new { id = role.Id }, createdDto);
    }

    // DELETE: api/v1/roles/{name}
    [HttpDelete("Borrar Rol {name}")]
    public async Task<IActionResult> Delete(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("El nombre del rol es obligatorio.");

        var role = await _roleManager.FindByNameAsync(name);
        if (role is null)
            return NotFound($"No se encontró el rol '{name}'.");

        // Opcional: podrías evitar borrar ciertos roles protegidos (por ejemplo "Admin")

        var result = await _roleManager.DeleteAsync(role);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok($"Rol '{name}' eliminado correctamente.");
    }

    // POST: api/v1/roles/assign
    [HttpPost("Asignar Rol")]
    public async Task<IActionResult> AssignToUser(AssignRoleToUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(dto.UserId);
        if (user is null)
            return NotFound("Usuario no encontrado.");

        var roleExists = await _roleManager.RoleExistsAsync(dto.RoleName);
        if (!roleExists)
            return NotFound($"No existe el rol '{dto.RoleName}'.");

        var alreadyInRole = await _userManager.IsInRoleAsync(user, dto.RoleName);
        if (alreadyInRole)
            return BadRequest($"El usuario ya tiene el rol '{dto.RoleName}'.");

        var result = await _userManager.AddToRoleAsync(user, dto.RoleName);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        return Ok($"Rol '{dto.RoleName}' asignado correctamente al usuario.");
    }
}
