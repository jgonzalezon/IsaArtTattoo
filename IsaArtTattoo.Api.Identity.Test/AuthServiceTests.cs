using System.Collections.Generic;
using System.Threading.Tasks;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Services;
using IsaArtTattoo.Shared.Events;
using MassTransit;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Identity.Test;

[TestFixture]
public class AuthServiceTests
{
    private Mock<UserManager<ApplicationUser>> _userManagerMock = null!;
    private Mock<SignInManager<ApplicationUser>> _signInManagerMock = null!;
    private Mock<IJwtTokenService> _jwtTokenServiceMock = null!;
    private Mock<IPublishEndpoint> _publishEndpointMock = null!;
    private IConfiguration _config = null!;

    private AuthService _sut = null!; // System Under Test

    [SetUp]
    public void Setup()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();

        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            store.Object,
            null,   // IOptions<IdentityOptions>
            null,   // IPasswordHasher<ApplicationUser>
            null,   // IEnumerable<IUserValidator<ApplicationUser>>
            null,   // IEnumerable<IPasswordValidator<ApplicationUser>>
            null,   // ILookupNormalizer
            null,   // IdentityErrorDescriber
            null,   // IServiceProvider
            null    // ILogger<UserManager<ApplicationUser>>
        );

        var httpContextAccessor = new Mock<IHttpContextAccessor>();
        var claimsFactory = new Mock<IUserClaimsPrincipalFactory<ApplicationUser>>();

        _signInManagerMock = new Mock<SignInManager<ApplicationUser>>(
            _userManagerMock.Object,
            httpContextAccessor.Object,
            claimsFactory.Object,
            null,   // IOptions<IdentityOptions>
            null,   // ILogger<SignInManager<ApplicationUser>>
            null,   // IAuthenticationSchemeProvider
            null    // IUserConfirmation<ApplicationUser>
        );

        _jwtTokenServiceMock = new Mock<IJwtTokenService>();
        _publishEndpointMock = new Mock<IPublishEndpoint>();

        var settings = new Dictionary<string, string?>
        {
            { "Frontend:BaseUrl", "http://frontend.test" }
        };

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(settings!)
            .Build();

        _sut = new AuthService(
            _userManagerMock.Object,
            _signInManagerMock.Object,
            _config,
            _jwtTokenServiceMock.Object,
            _publishEndpointMock.Object
        );
    }

    #region LOGIN

    [Test]
    public async Task Login_WhenUserDoesNotExist_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new LoginDto("noexiste@test.com", "123456");

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(dto.Email))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.LoginAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task Login_WhenEmailNotConfirmed_ShouldReturnFailedResult()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Email = "test@test.com",
            UserName = "test",
            EmailConfirmed = false
        };
        var dto = new LoginDto(user.Email!, "123456");

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.LoginAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Debe confirmar su cuenta antes de iniciar sesión."));
    }

    [Test]
    public async Task Login_WhenPasswordInvalid_ShouldReturnFailedResult()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Email = "test@test.com",
            UserName = "test",
            EmailConfirmed = true
        };
        var dto = new LoginDto(user.Email!, "wrongpass");

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _signInManagerMock
            .Setup(sm => sm.CheckPasswordSignInAsync(user, dto.Password, false))
            .ReturnsAsync(SignInResult.Failed);

        // Act
        var result = await _sut.LoginAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Credenciales incorrectas."));
    }

    [Test]
    public async Task Login_WhenCredentialsCorrect_ShouldReturnToken()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Email = "test@test.com",
            UserName = "test",
            EmailConfirmed = true
        };
        var dto = new LoginDto(user.Email!, "123456");

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(dto.Email))
            .ReturnsAsync(user);

        _signInManagerMock
            .Setup(sm => sm.CheckPasswordSignInAsync(user, dto.Password, false))
            .ReturnsAsync(SignInResult.Success);

        _jwtTokenServiceMock
            .Setup(jwt => jwt.CreateTokenAsync(user))
            .ReturnsAsync("fake-jwt-token");

        // Act
        var result = await _sut.LoginAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Token, Is.EqualTo("fake-jwt-token"));
    }

    #endregion

    #region REGISTER

    [Test]
    public async Task Register_WhenCreateFails_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new RegisterDto("test@test.com", "123456");

        _userManagerMock
            .Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

        // Act
        var result = await _sut.RegisterAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task Register_WhenSuccess_ShouldPublishEvents()
    {
        // Arrange
        var dto = new RegisterDto("test@test.com", "123456");

        _userManagerMock
            .Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(um => um.AddToRoleAsync(It.IsAny<ApplicationUser>(), "User"))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(um => um.GenerateEmailConfirmationTokenAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync("token123");

        // Act
        var result = await _sut.RegisterAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);

        _publishEndpointMock.Verify(
            x => x.Publish(It.IsAny<SendEmailConfirmationEvent>(), default),
            Times.Once);

        _publishEndpointMock.Verify(
            x => x.Publish(It.IsAny<UserCreatedEvent>(), default),
            Times.Once);
    }

    #endregion

    #region CONFIRM EMAIL

    [Test]
    public async Task ConfirmEmail_WhenUserNotFound_ShouldReturnFailedResult()
    {
        // Arrange
        var email = "no@test.com";
        var token = "tok";

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.ConfirmEmailAsync(email, token);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task ConfirmEmail_WhenTokenInvalid_ShouldReturnFailedResult()
    {
        // Arrange
        var email = "test@test.com";
        var token = "tok";
        var user = new ApplicationUser { Email = email };

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.ConfirmEmailAsync(user, It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed());

        // Act
        var result = await _sut.ConfirmEmailAsync(email, token);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Token inválido o expirado."));
    }

    [Test]
    public async Task ConfirmEmail_WhenSuccess_ShouldReturnSucceeded()
    {
        // Arrange
        var email = "test@test.com";
        var token = "tok";
        var user = new ApplicationUser { Email = email };

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.ConfirmEmailAsync(user, It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.ConfirmEmailAsync(email, token);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Error, Is.Null);
    }

    #endregion

    #region RESEND CONFIRMATION

    [Test]
    public async Task ResendConfirmation_WhenUserNotFound_ShouldReturnFailedResult()
    {
        // Arrange
        var email = "no@test.com";

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.ResendConfirmationAsync(email);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
        _publishEndpointMock.Verify(
            x => x.Publish(It.IsAny<SendEmailConfirmationEvent>(), default),
            Times.Never);
    }

    [Test]
    public async Task ResendConfirmation_WhenSuccess_ShouldPublishEvent()
    {
        // Arrange
        var email = "test@test.com";
        var user = new ApplicationUser { Email = email };

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GenerateEmailConfirmationTokenAsync(user))
            .ReturnsAsync("token123");

        // Act
        var result = await _sut.ResendConfirmationAsync(email);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Error, Is.Null);
        _publishEndpointMock.Verify(
            x => x.Publish(It.IsAny<SendEmailConfirmationEvent>(), default),
            Times.Once);
    }

    #endregion

    #region FORGOT PASSWORD

    [Test]
    public async Task ForgotPassword_WhenUserNotFound_ShouldReturnFailedResult()
    {
        // Arrange
        var email = "no@test.com";

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.ForgotPasswordAsync(email);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
        _publishEndpointMock.Verify(
            x => x.Publish(It.IsAny<SendPasswordResetEvent>(), default),
            Times.Never);
    }

    [Test]
    public async Task ForgotPassword_WhenSuccess_ShouldPublishEvent()
    {
        // Arrange
        var email = "test@test.com";
        var user = new ApplicationUser { Email = email };

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GeneratePasswordResetTokenAsync(user))
            .ReturnsAsync("reset-token");

        // Act
        var result = await _sut.ForgotPasswordAsync(email);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Error, Is.Null);
        _publishEndpointMock.Verify(
            x => x.Publish(It.IsAny<SendPasswordResetEvent>(), default),
            Times.Once);
    }

    #endregion

    #region RESET PASSWORD

    [Test]
    public async Task ResetPassword_WhenUserNotFound_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new NewPasswordDto("no@test.com", "tok", "NewPass123!");

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(dto.Email))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.ResetPasswordAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Null);
    }

    [Test]
    public async Task ResetPassword_WhenResetFails_ShouldReturnErrors()
    {
        // Arrange
        var email = "test@test.com";
        var user = new ApplicationUser { Email = email };
        var dto = new NewPasswordDto(email, "tok", "NewPass123!");

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.ResetPasswordAsync(user, It.IsAny<string>(), dto.NewPassword))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Invalid token" }));

        // Act
        var result = await _sut.ResetPasswordAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task ResetPassword_WhenSuccess_ShouldReturnSucceeded()
    {
        // Arrange
        var email = "test@test.com";
        var user = new ApplicationUser { Email = email };
        var dto = new NewPasswordDto(email, "tok", "NewPass123!");

        _userManagerMock
            .Setup(um => um.FindByEmailAsync(email))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.ResetPasswordAsync(user, It.IsAny<string>(), dto.NewPassword))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.ResetPasswordAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Errors, Is.Null);
    }

    #endregion
}
