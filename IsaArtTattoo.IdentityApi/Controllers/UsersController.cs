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
public class UsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public UsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    // GET api/users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _usersService.GetAllAsync();
        return Ok(users);
    }

    // GET api/users/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _usersService.GetByIdAsync(id);
        if (!result.Succeeded || result.User is null) return NotFound();

        return Ok(result.User);
    }

    // POST api/users
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        var result = await _usersService.CreateAsync(dto);

        if (!result.Succeeded)
        {
            if (result.Errors is not null)
                return BadRequest(result.Errors);

            return BadRequest(result.Error);
        }

        return CreatedAtAction(nameof(GetById),
            new { id = result.Id },
            new { result.Id, result.Email });
    }

    // PUT api/users/roles
    [HttpPut("roles")]
    public async Task<IActionResult> UpdateRoles(UpdateUserRolesDto dto)
    {
        var result = await _usersService.UpdateRolesAsync(dto);

        if (!result.Succeeded)
        {
            if (result.Errors is not null)
                return BadRequest(result.Errors);

            if (result.Error == "Usuario no encontrado.")
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return Ok(new { message = "Roles actualizados correctamente." });
    }

    // PUT api/users/password
    [HttpPut("password")]
    public async Task<IActionResult> ChangePassword(ChangeUserPasswordDto dto)
    {
        var result = await _usersService.ChangePasswordAsync(dto);

        if (!result.Succeeded)
        {
            if (result.Errors is not null)
                return BadRequest(result.Errors);

            if (result.Error == "Usuario no encontrado.")
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return Ok(new { message = "Contraseña actualizada correctamente." });
    }

    // DELETE api/users/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _usersService.DeleteAsync(id);

        if (!result.Succeeded)
        {
            if (result.Errors is not null)
                return BadRequest(result.Errors);

            if (result.Error == "Usuario no encontrado.")
                return NotFound(result.Error);

            return BadRequest(result.Error);
        }

        return Ok(new { message = "Usuario eliminado correctamente." });
    }
}
