using Asp.Versioning;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.IdentityApi.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/[controller]")]
[Authorize(Roles = "Admin")]
public class RolesController : ControllerBase
{
    private readonly IRolesService _rolesService;

    public RolesController(IRolesService rolesService)
    {
        _rolesService = rolesService;
    }

    // GET: api/v1/roles
    [HttpGet("Listar roles")]
    public IActionResult GetAll()
    {
        var roles = _rolesService.GetAll();
        return Ok(roles);
    }

    // POST: api/v1/roles
    [HttpPost("Crear Rol")]
    public async Task<IActionResult> Create(CreateRoleDto dto)
    {
        var result = await _rolesService.CreateAsync(dto);

        if (!result.Succeeded)
        {
            if (result.Errors is not null)
                return BadRequest(result.Errors);

            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetAll), new { id = result.Role!.Id }, result.Role);
    }

    // DELETE: api/v1/roles/{name}
    [HttpDelete("Borrar Rol {name}")]
    public async Task<IActionResult> Delete(string name)
    {
        var result = await _rolesService.DeleteAsync(name);

        if (!result.Succeeded)
        {
            if (result.Errors is not null)
                return BadRequest(result.Errors);

            // Error de tipo "no encontrado"
            if (result.Error is not null && result.Error.StartsWith("No se encontró"))
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        // ✅ Retornar JSON en lugar de string plano
        return Ok(new { message = $"Rol '{name}' eliminado correctamente." });
    }

    // POST: api/v1/roles/assign
    [HttpPost("Asignar Rol")]
    public async Task<IActionResult> AssignToUser(AssignRoleToUserDto dto)
    {
        var result = await _rolesService.AssignToUserAsync(dto);

        if (!result.Succeeded)
        {
            if (result.Errors is not null)
                return BadRequest(result.Errors);

            if (result.Error is not null && result.Error.StartsWith("No existe el rol"))
                return NotFound(result.Error);

            if (result.Error is not null && result.Error.StartsWith("Usuario no encontrado"))
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        // ✅ Retornar JSON en lugar de string plano
        return Ok(new { message = $"Rol '{dto.RoleName}' asignado correctamente al usuario." });
    }
}
