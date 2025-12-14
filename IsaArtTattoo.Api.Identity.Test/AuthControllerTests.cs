using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using IsaArtTattoo.IdentityApi.Controllers;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Identity.Test;

[TestFixture]
public class AuthControllerTests
{
    private Mock<IAuthService> _authServiceMock = null!;
    private AuthController _sut = null!; // System Under Test

    [SetUp]
    public void Setup()
    {
        _authServiceMock = new Mock<IAuthService>();
        _sut = new AuthController(_authServiceMock.Object);
    }

    #region Register

    [Test]
    public async Task Register_WhenSuccess_ReturnsOkWithMessage()
    {
        // Arrange
        var dto = new RegisterDto("test@test.com", "123456");

        _authServiceMock
            .Setup(s => s.RegisterAsync(dto))
            .ReturnsAsync(new RegisterResult(true));

        // Act
        var result = await _sut.Register(dto);

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.Not.Null);

        var value = ok.Value!;
        var prop = value.GetType().GetProperty("Message");

        Assert.That(prop, Is.Not.Null,
            "La respuesta de Register no tiene una propiedad pública 'Message'. " +
            "Revisa lo que devuelves en AuthController.Register.");

        var message = prop!.GetValue(value) as string;
        Assert.That(message,
            Is.EqualTo("Usuario creado. Revisa tu email para confirmar la cuenta."));
    }

    [Test]
    public async Task Register_WhenFails_ReturnsBadRequestWithErrors()
    {
        // Arrange
        var dto = new RegisterDto("test@test.com", "123456");
        var errors = new[]
        {
            new IdentityError { Description = "Error1" }
        };

        _authServiceMock
            .Setup(s => s.RegisterAsync(dto))
            .ReturnsAsync(new RegisterResult(false, Errors: errors));

        // Act
        var result = await _sut.Register(dto);

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo(errors));
    }

    #endregion

    #region Confirm

    [Test]
    public async Task Confirm_WhenSuccess_ReturnsOk()
    {
        // Arrange
        var email = "test@test.com";
        var token = "tok";

        _authServiceMock
            .Setup(s => s.ConfirmEmailAsync(email, token))
            .ReturnsAsync(new ConfirmEmailResult(true));

        // Act
        var result = await _sut.Confirm(email, token);

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.Not.Null);

        var value = ok.Value!;
        var prop = value.GetType().GetProperty("message");

        Assert.That(prop, Is.Not.Null, "La respuesta debe tener una propiedad 'message'");

        var message = prop!.GetValue(value) as string;
        Assert.That(message, Is.EqualTo("Correo confirmado correctamente."));
    }

    [Test]
    public async Task Confirm_WhenFails_ReturnsBadRequestWithMessage()
    {
        // Arrange
        var email = "test@test.com";
        var token = "tok";

        _authServiceMock
            .Setup(s => s.ConfirmEmailAsync(email, token))
            .ReturnsAsync(new ConfirmEmailResult(false, Error: "Token inválido o expirado."));

        // Act
        var result = await _sut.Confirm(email, token);

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo("Token inválido o expirado."));
    }

    #endregion

    #region Login

    [Test]
    public async Task Login_WhenSuccess_ReturnsOkWithToken()
    {
        // Arrange
        var dto = new LoginDto("test@test.com", "123456");

        _authServiceMock
            .Setup(s => s.LoginAsync(dto))
            .ReturnsAsync(new LoginResult(true, Error: null, Token: "fake-token"));

        // Act
        var result = await _sut.Login(dto);

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.Not.Null);

        var value = ok.Value!;
        var prop = value.GetType().GetProperty("token")
                   ?? value.GetType().GetProperty("Token"); // por si lo has capitalizado

        Assert.That(prop, Is.Not.Null,
            "La respuesta de Login no tiene una propiedad pública 'token' o 'Token'. " +
            "Revisa lo que devuelves en AuthController.Login.");

        var token = prop!.GetValue(value) as string;
        Assert.That(token, Is.EqualTo("fake-token"));
    }

    [Test]
    public async Task Login_WhenFails_ReturnsUnauthorizedWithError()
    {
        // Arrange
        var dto = new LoginDto("test@test.com", "badpass");

        _authServiceMock
            .Setup(s => s.LoginAsync(dto))
            .ReturnsAsync(new LoginResult(false, Error: "Credenciales incorrectas.", Token: null));

        // Act
        var result = await _sut.Login(dto);

        // Assert
        Assert.That(result, Is.TypeOf<UnauthorizedObjectResult>());
        var unauth = (UnauthorizedObjectResult)result;
        Assert.That(unauth.Value, Is.EqualTo("Credenciales incorrectas."));
    }

    #endregion

    #region ResendConfirmation

    [Test]
    public async Task ResendConfirmation_WhenSuccess_ReturnsOkWithMessage()
    {
        // Arrange
        var dto = new ResendConfirmDto("test@test.com");

        _authServiceMock
            .Setup(s => s.ResendConfirmationAsync(dto.Email))
            .ReturnsAsync(new SimpleResult(true));

        // Act
        var result = await _sut.ResendConfirmation(dto);

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.Not.Null);

        var value = ok.Value!;
        var prop = value.GetType().GetProperty("message");

        Assert.That(prop, Is.Not.Null, "La respuesta debe tener una propiedad 'message'");

        var message = prop!.GetValue(value) as string;
        Assert.That(message, Is.EqualTo("Correo de confirmación reenviado."));
    }

    [Test]
    public async Task ResendConfirmation_WhenFails_ReturnsNotFound()
    {
        // Arrange
        var dto = new ResendConfirmDto("no@test.com");

        _authServiceMock
            .Setup(s => s.ResendConfirmationAsync(dto.Email))
            .ReturnsAsync(new SimpleResult(false, Error: "Usuario no encontrado."));

        // Act
        var result = await _sut.ResendConfirmation(dto);

        // Assert
        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result;
        Assert.That(nf.Value, Is.EqualTo("Usuario no encontrado."));
    }

    #endregion

    #region ForgotPassword

    [Test]
    public async Task ForgotPassword_WhenSuccess_ReturnsOkWithMessage()
    {
        // Arrange
        var dto = new ResetDto("test@test.com");

        _authServiceMock
            .Setup(s => s.ForgotPasswordAsync(dto.Email))
            .ReturnsAsync(new SimpleResult(true));

        // Act
        var result = await _sut.ForgotPassword(dto);

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.Not.Null);

        var value = ok.Value!;
        var prop = value.GetType().GetProperty("message");

        Assert.That(prop, Is.Not.Null, "La respuesta debe tener una propiedad 'message'");

        var message = prop!.GetValue(value) as string;
        Assert.That(message,
            Is.EqualTo("Se ha enviado un correo con las instrucciones para restablecer la contraseña."));
    }

    [Test]
    public async Task ForgotPassword_WhenFails_ReturnsNotFound()
    {
        // Arrange
        var dto = new ResetDto("no@test.com");

        _authServiceMock
            .Setup(s => s.ForgotPasswordAsync(dto.Email))
            .ReturnsAsync(new SimpleResult(false, Error: "Usuario no encontrado."));

        // Act
        var result = await _sut.ForgotPassword(dto);

        // Assert
        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result;
        Assert.That(nf.Value, Is.EqualTo("Usuario no encontrado."));
    }

    #endregion

    #region ResetPassword

    [Test]
    public async Task ResetPassword_WhenSuccess_ReturnsOkWithMessage()
    {
        // Arrange
        var dto = new NewPasswordDto("test@test.com", "tok", "NewPass123!");

        _authServiceMock
            .Setup(s => s.ResetPasswordAsync(dto))
            .ReturnsAsync(new ResetPasswordResult(true));

        // Act
        var result = await _sut.ResetPassword(dto);

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.Not.Null);

        var value = ok.Value!;
        var prop = value.GetType().GetProperty("message");

        Assert.That(prop, Is.Not.Null, "La respuesta debe tener una propiedad 'message'");

        var message = prop!.GetValue(value) as string;
        Assert.That(message, Is.EqualTo("Contraseña restablecida correctamente."));
    }

    [Test]
    public async Task ResetPassword_WhenFails_ReturnsBadRequestWithErrors()
    {
        // Arrange
        var dto = new NewPasswordDto("test@test.com", "tok", "NewPass123!");

        var errors = new[]
        {
            new IdentityError { Description = "Token inválido" }
        };

        _authServiceMock
            .Setup(s => s.ResetPasswordAsync(dto))
            .ReturnsAsync(new ResetPasswordResult(false, Errors: errors));

        // Act
        var result = await _sut.ResetPassword(dto);

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo(errors));
    }

    #endregion

    #region Me

    [Test]
    public void Me_ReturnsOkWithUserName()
    {
        // Arrange
        var userName = "test@test.com";

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, userName)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext
        {
            User = principal
        };

        _sut.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        // Act
        var result = _sut.Me();

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.Not.Null);

        var value = ok.Value!;
        var prop = value.GetType().GetProperty("Name");

        Assert.That(prop, Is.Not.Null,
            "La respuesta de Me no tiene una propiedad pública 'Name'. " +
            "Revisa lo que devuelves en AuthController.Me (por ejemplo: Ok(new { User.Identity!.Name })).");

        var name = prop!.GetValue(value) as string;
        Assert.That(name, Is.EqualTo(userName));
    }

    #endregion
}
