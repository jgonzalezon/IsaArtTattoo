using System.Collections.Generic;
using System.Threading.Tasks;
using IsaArtTattoo.IdentityApi.Controllers;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Identity.Test;

[TestFixture]
public class RolesControllerTests
{
    private Mock<IRolesService> _rolesServiceMock = null!;
    private RolesController _sut = null!; // System Under Test

    [SetUp]
    public void Setup()
    {
        _rolesServiceMock = new Mock<IRolesService>();
        _sut = new RolesController(_rolesServiceMock.Object);
    }

    #region GetAll

    [Test]
    public void GetAll_ShouldReturnOkWithRoles()
    {
        // Arrange
        var roles = new List<RoleDto>
        {
            new RoleDto("1", "Admin"),
            new RoleDto("2", "User")
        };

        _rolesServiceMock
            .Setup(s => s.GetAll())
            .Returns(roles);

        // Act
        var result = _sut.GetAll();

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result;
        Assert.That(ok.Value, Is.EqualTo(roles));
    }

    #endregion

    #region Create

    [Test]
    public async Task Create_WhenSuccess_ShouldReturnCreatedAtAction()
    {
        // Arrange
        var dto = new CreateRoleDto("NewRole");
        var created = new RoleDto("123", "NewRole");

        _rolesServiceMock
            .Setup(s => s.CreateAsync(dto))
            .ReturnsAsync(new RoleCreateResult(true, Role: created));

        // Act
        var result = await _sut.Create(dto);

        // Assert
        Assert.That(result, Is.TypeOf<CreatedAtActionResult>());
        var createdResult = (CreatedAtActionResult)result;
        Assert.That(createdResult.Value, Is.EqualTo(created));
        Assert.That(createdResult.ActionName, Is.EqualTo(nameof(RolesController.GetAll)));
    }

    [Test]
    public async Task Create_WhenErrorMessage_ShouldReturnBadRequestWithMessage()
    {
        // Arrange
        var dto = new CreateRoleDto("NewRole");

        _rolesServiceMock
            .Setup(s => s.CreateAsync(dto))
            .ReturnsAsync(new RoleCreateResult(false, Error: "Error X"));

        // Act
        var result = await _sut.Create(dto);

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo("Error X"));
    }

    [Test]
    public async Task Create_WhenIdentityErrors_ShouldReturnBadRequestWithErrors()
    {
        // Arrange
        var dto = new CreateRoleDto("NewRole");
        var errors = new[]
        {
            new IdentityError { Description = "Error1" }
        };

        _rolesServiceMock
            .Setup(s => s.CreateAsync(dto))
            .ReturnsAsync(new RoleCreateResult(false, Errors: errors));

        // Act
        var result = await _sut.Create(dto);

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo(errors));
    }

    #endregion

    #region Delete

    [Test]
    public async Task Delete_WhenSuccess_ShouldReturnOk()
    {
        // Arrange
        _rolesServiceMock
            .Setup(s => s.DeleteAsync("Admin"))
            .ReturnsAsync(new RoleDeleteResult(true));

        // Act
        var result = await _sut.Delete("Admin");

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task Delete_WhenRoleNotFound_ShouldReturnNotFound()
    {
        // Arrange
        _rolesServiceMock
            .Setup(s => s.DeleteAsync("NoExiste"))
            .ReturnsAsync(new RoleDeleteResult(false, Error: "No se encontró el rol 'NoExiste'."));

        // Act
        var result = await _sut.Delete("NoExiste");

        // Assert
        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result;
        Assert.That(nf.Value, Is.EqualTo("No se encontró el rol 'NoExiste'."));
    }

    [Test]
    public async Task Delete_WhenErrorMessageNotNotFound_ShouldReturnBadRequest()
    {
        // Arrange
        _rolesServiceMock
            .Setup(s => s.DeleteAsync("Admin"))
            .ReturnsAsync(new RoleDeleteResult(false, Error: "Otro error"));

        // Act
        var result = await _sut.Delete("Admin");

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo("Otro error"));
    }

    [Test]
    public async Task Delete_WhenIdentityErrors_ShouldReturnBadRequest()
    {
        // Arrange
        var errors = new[]
        {
            new IdentityError { Description = "Error1" }
        };

        _rolesServiceMock
            .Setup(s => s.DeleteAsync("Admin"))
            .ReturnsAsync(new RoleDeleteResult(false, Errors: errors));

        // Act
        var result = await _sut.Delete("Admin");

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo(errors));
    }

    #endregion

    #region AssignToUser

    [Test]
    public async Task AssignToUser_WhenSuccess_ShouldReturnOk()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");

        _rolesServiceMock
            .Setup(s => s.AssignToUserAsync(dto))
            .ReturnsAsync(new AssignRoleResult(true));

        // Act
        var result = await _sut.AssignToUser(dto);

        // Assert
        Assert.That(result, Is.TypeOf<OkObjectResult>());
    }

    [Test]
    public async Task AssignToUser_WhenUserNotFound_ShouldReturnNotFound()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");

        _rolesServiceMock
            .Setup(s => s.AssignToUserAsync(dto))
            .ReturnsAsync(new AssignRoleResult(false, Error: "Usuario no encontrado."));

        // Act
        var result = await _sut.AssignToUser(dto);

        // Assert
        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result;
        Assert.That(nf.Value, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task AssignToUser_WhenRoleDoesNotExist_ShouldReturnNotFound()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");

        _rolesServiceMock
            .Setup(s => s.AssignToUserAsync(dto))
            .ReturnsAsync(new AssignRoleResult(false, Error: "No existe el rol 'Admin'."));

        // Act
        var result = await _sut.AssignToUser(dto);

        // Assert
        Assert.That(result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result;
        Assert.That(nf.Value, Is.EqualTo("No existe el rol 'Admin'."));
    }

    [Test]
    public async Task AssignToUser_WhenGenericError_ShouldReturnBadRequest()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");

        _rolesServiceMock
            .Setup(s => s.AssignToUserAsync(dto))
            .ReturnsAsync(new AssignRoleResult(false, Error: "Otro error"));

        // Act
        var result = await _sut.AssignToUser(dto);

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo("Otro error"));
    }

    [Test]
    public async Task AssignToUser_WhenIdentityErrors_ShouldReturnBadRequest()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");
        var errors = new[]
        {
            new IdentityError { Description = "Error1" }
        };

        _rolesServiceMock
            .Setup(s => s.AssignToUserAsync(dto))
            .ReturnsAsync(new AssignRoleResult(false, Errors: errors));

        // Act
        var result = await _sut.AssignToUser(dto);

        // Assert
        Assert.That(result, Is.TypeOf<BadRequestObjectResult>());
        var bad = (BadRequestObjectResult)result;
        Assert.That(bad.Value, Is.EqualTo(errors));
    }

    #endregion
}
