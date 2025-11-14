using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IsaArtTattoo.IdentityApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
	private readonly UserManager<ApplicationUser> _userManager;
	private readonly IConfiguration _cfg;

	public UsersController(UserManager<ApplicationUser> userManager, IConfiguration cfg)
	{
		_userManager = userManager;
		_cfg = cfg;
	}

	private string? MainAdminEmail =>
		_cfg["AdminUser:Email"];

	// GET api/users
	[HttpGet]
	public async Task<IActionResult> GetAll()
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

		return Ok(list);
	}

	// GET api/users/{id}
	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(string id)
	{
		var user = await _userManager.FindByIdAsync(id);
		if (user is null) return NotFound();

		var roles = await _userManager.GetRolesAsync(user);

		var dto = new UserSummaryDto(
			user.Id,
			user.Email ?? "",
			user.EmailConfirmed,
			roles
		);

		return Ok(dto);
	}

	// POST api/users
	[HttpPost]
	public async Task<IActionResult> Create(CreateUserDto dto)
	{
		var user = new ApplicationUser
		{
			UserName = dto.Email,
			Email = dto.Email,
			EmailConfirmed = true // o false si quieres que confirmen
		};

		var result = await _userManager.CreateAsync(user, dto.Password);
		if (!result.Succeeded) return BadRequest(result.Errors);

		if (dto.Roles is { Count: > 0 })
		{
			var rolesResult = await _userManager.AddToRolesAsync(user, dto.Roles);
			if (!rolesResult.Succeeded) return BadRequest(rolesResult.Errors);
		}

		return CreatedAtAction(nameof(GetById), new { id = user.Id }, new { user.Id, user.Email });
	}

	// PUT api/users/roles
	[HttpPut("roles")]
	public async Task<IActionResult> UpdateRoles(UpdateUserRolesDto dto)
	{
		var user = await _userManager.FindByIdAsync(dto.UserId);
		if (user is null) return NotFound();

		// No permitir quitar el rol Admin al admin principal, si quieres esa regla
		if (!string.IsNullOrEmpty(MainAdminEmail) &&
			string.Equals(user.Email, MainAdminEmail, StringComparison.OrdinalIgnoreCase) &&
			!dto.Roles.Contains("Admin"))
		{
			return BadRequest("No se puede quitar el rol Admin del usuario administrador principal.");
		}

		var currentRoles = await _userManager.GetRolesAsync(user);
		var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
		if (!removeResult.Succeeded) return BadRequest(removeResult.Errors);

		if (dto.Roles is { Count: > 0 })
		{
			var addResult = await _userManager.AddToRolesAsync(user, dto.Roles);
			if (!addResult.Succeeded) return BadRequest(addResult.Errors);
		}

		return Ok("Roles actualizados correctamente.");
	}

	// PUT api/users/password
	[HttpPut("password")]
	public async Task<IActionResult> ChangePassword(ChangeUserPasswordDto dto)
	{
		var user = await _userManager.FindByIdAsync(dto.UserId);
		if (user is null) return NotFound();

		// reset directo (útil solo para admin)
		var token = await _userManager.GeneratePasswordResetTokenAsync(user);
		var result = await _userManager.ResetPasswordAsync(user, token, dto.NewPassword);
		if (!result.Succeeded) return BadRequest(result.Errors);

		return Ok("Contraseña actualizada correctamente.");
	}

	// DELETE api/users/{id}
	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(string id)
	{
		var user = await _userManager.FindByIdAsync(id);
		if (user is null) return NotFound();

		// ❌ No permitir borrar al admin principal
		if (!string.IsNullOrEmpty(MainAdminEmail) &&
			string.Equals(user.Email, MainAdminEmail, StringComparison.OrdinalIgnoreCase))
		{
			return BadRequest("No se puede eliminar el usuario administrador principal.");
		}

		var result = await _userManager.DeleteAsync(user);
		if (!result.Succeeded) return BadRequest(result.Errors);

		return Ok("Usuario eliminado correctamente.");
	}
}
