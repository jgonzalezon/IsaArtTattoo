using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IsaArtTattoo.IdentityApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace IsaArtTattoo.IdentityApi.Services;

public class JwtTokenService : IJwtTokenService
{
	private readonly IConfiguration _cfg;
	private readonly UserManager<ApplicationUser> _userManager;

	public JwtTokenService(IConfiguration cfg, UserManager<ApplicationUser> userManager)
	{
		_cfg = cfg;
		_userManager = userManager;
	}

	public async Task<string> CreateTokenAsync(ApplicationUser user)
	{
		var jwt = _cfg.GetSection("Jwt");
		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));

		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, user.Id),
			new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
			new(ClaimTypes.Name, user.UserName ?? "")
		};

		var roles = await _userManager.GetRolesAsync(user);
		claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
		var token = new JwtSecurityToken(
			issuer: jwt["Issuer"],
			audience: jwt["Audience"],
			claims: claims,
			expires: DateTime.UtcNow.AddHours(8),
			signingCredentials: creds);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
