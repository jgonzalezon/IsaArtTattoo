using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Identity.Test;

[TestFixture]
public class JwtTokenServiceTests
{
    private IConfiguration _config = null!;
    private Mock<UserManager<ApplicationUser>> _userManagerMock = null!;
    private JwtTokenService _sut = null!; // System Under Test

    [SetUp]
    public void Setup()
    {
        // Configuración en memoria para la sección Jwt
        var settings = new Dictionary<string, string?>
        {
            { "Jwt:Key", "SuperSecretKeyForJwtTesting1234567890" },
            { "Jwt:Issuer", "TestIssuer" },
            { "Jwt:Audience", "TestAudience" }
        };

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(settings!)
            .Build();

        var userStoreMock = new Mock<IUserStore<ApplicationUser>>();

        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            userStoreMock.Object,
            null, null, null, null, null, null, null, null
        );

        _sut = new JwtTokenService(_config, _userManagerMock.Object);
    }

    [Test]
    public async Task CreateTokenAsync_GeneratesValidJwt_WithExpectedClaimsAndSettings()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = "user-id-123",
            Email = "user@test.com",
            UserName = "user-name"
        };

        var roles = new List<string> { "Admin", "User" };

        _userManagerMock
            .Setup(um => um.GetRolesAsync(user))
            .ReturnsAsync(roles);

        // Act
        var tokenString = await _sut.CreateTokenAsync(user);

        // Assert básicos
        Assert.That(tokenString, Is.Not.Null.And.Not.Empty);

        var handler = new JwtSecurityTokenHandler();
        Assert.That(handler.CanReadToken(tokenString), Is.True);

        var keyBytes = Encoding.UTF8.GetBytes(_config["Jwt:Key"]!);
        var signingKey = new SymmetricSecurityKey(keyBytes);

        var validationParameters = new TokenValidationParameters
        {
            ValidIssuer = _config["Jwt:Issuer"],
            ValidAudience = _config["Jwt:Audience"],
            IssuerSigningKey = signingKey,
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        var principal = handler.ValidateToken(
            tokenString,
            validationParameters,
            out var validatedToken);

        var jwtToken = validatedToken as JwtSecurityToken;
        Assert.That(jwtToken, Is.Not.Null);

        // Algoritmo, issuer, audience
        Assert.That(jwtToken!.Header.Alg, Is.EqualTo(SecurityAlgorithms.HmacSha256));
        Assert.That(jwtToken.Issuer, Is.EqualTo("TestIssuer"));
        Assert.That(jwtToken.Audiences, Contains.Item("TestAudience"));

        // ✅ Claims leídos directamente del token, no del principal
        var sub = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
        var email = jwtToken.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Email)?.Value;
        var name = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value;

        Assert.That(sub, Is.EqualTo(user.Id));
        Assert.That(email, Is.EqualTo(user.Email));
        Assert.That(name, Is.EqualTo(user.UserName));

        // Roles: aquí sí podemos tirar del principal
        var roleClaims = principal.FindAll(ClaimTypes.Role);
        var roleValues = roleClaims.Select(rc => rc.Value).ToList();

        Assert.That(roleValues, Does.Contain("Admin"));
        Assert.That(roleValues, Does.Contain("User"));

        // Expira en el futuro
        Assert.That(jwtToken.ValidTo, Is.GreaterThan(DateTime.UtcNow));
    }
}
