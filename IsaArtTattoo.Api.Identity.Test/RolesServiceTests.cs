using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Identity;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Identity.Test;

[TestFixture]
public class RolesServiceTests
{
    private Mock<RoleManager<IdentityRole>> _roleManagerMock = null!;
    private Mock<UserManager<ApplicationUser>> _userManagerMock = null!;

    private RolesService _sut = null!; // System Under Test

    [SetUp]
    public void Setup()
    {
        var roleStoreMock = new Mock<IRoleStore<IdentityRole>>();
        _roleManagerMock = new Mock<RoleManager<IdentityRole>>(
            roleStoreMock.Object,
            null,   // IEnumerable<IRoleValidator<IdentityRole>>
            null,   // ILookupNormalizer
            null,   // IdentityErrorDescriber
            null    // ILogger<RoleManager<IdentityRole>>
        );

        var userStoreMock = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            userStoreMock.Object,
            null,   // IOptions<IdentityOptions>
            null,   // IPasswordHasher<ApplicationUser>
            null,   // IEnumerable<IUserValidator<ApplicationUser>>
            null,   // IEnumerable<IPasswordValidator<ApplicationUser>>
            null,   // ILookupNormalizer
            null,   // IdentityErrorDescriber
            null,   // IServiceProvider
            null    // ILogger<UserManager<ApplicationUser>>
        );

        _sut = new RolesService(_roleManagerMock.Object, _userManagerMock.Object);
    }

    #region GetAll

    [Test]
    public void GetAll_ShouldReturnAllRolesMappedToDto()
    {
        // Arrange
        var roles = new List<IdentityRole>
        {
            new IdentityRole("Admin") { Id = "1" },
            new IdentityRole("User") { Id = "2" }
        }.AsQueryable();

        _roleManagerMock
            .Setup(rm => rm.Roles)
            .Returns(roles);

        // Act
        var result = _sut.GetAll();

        // Assert
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result.Any(r => r.Name == "Admin"), Is.True);
        Assert.That(result.Any(r => r.Name == "User"), Is.True);
    }

    #endregion

    #region Create

    [Test]
    public async Task Create_WhenNameIsEmpty_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new CreateRoleDto("   ");

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("El nombre del rol es obligatorio."));
    }

    [Test]
    public async Task Create_WhenRoleAlreadyExists_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new CreateRoleDto("Admin");

        _roleManagerMock
            .Setup(rm => rm.RoleExistsAsync(dto.Name))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Ya existe un rol con el nombre 'Admin'."));
    }

    [Test]
    public async Task Create_WhenCreateFails_ShouldReturnErrors()
    {
        // Arrange
        var dto = new CreateRoleDto("NewRole");

        _roleManagerMock
            .Setup(rm => rm.RoleExistsAsync(dto.Name))
            .ReturnsAsync(false);

        _roleManagerMock
            .Setup(rm => rm.CreateAsync(It.IsAny<IdentityRole>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task Create_WhenSuccess_ShouldReturnRoleDto()
    {
        // Arrange
        var dto = new CreateRoleDto("NewRole");

        _roleManagerMock
            .Setup(rm => rm.RoleExistsAsync(dto.Name))
            .ReturnsAsync(false);

        _roleManagerMock
            .Setup(rm => rm.CreateAsync(It.IsAny<IdentityRole>()))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Role, Is.Not.Null);
        Assert.That(result.Role!.Name, Is.EqualTo("NewRole"));
    }

    #endregion

    #region Delete

    [Test]
    public async Task Delete_WhenNameIsEmpty_ShouldReturnFailedResult()
    {
        // Act
        var result = await _sut.DeleteAsync("  ");

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("El nombre del rol es obligatorio."));
    }

    [Test]
    public async Task Delete_WhenRoleNotFound_ShouldReturnFailedResult()
    {
        // Arrange
        _roleManagerMock
            .Setup(rm => rm.FindByNameAsync("NoExiste"))
            .ReturnsAsync((IdentityRole?)null);

        // Act
        var result = await _sut.DeleteAsync("NoExiste");

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("No se encontró el rol 'NoExiste'."));
    }

    [Test]
    public async Task Delete_WhenDeleteFails_ShouldReturnErrors()
    {
        // Arrange
        var role = new IdentityRole("ToDelete");

        _roleManagerMock
            .Setup(rm => rm.FindByNameAsync("ToDelete"))
            .ReturnsAsync(role);

        _roleManagerMock
            .Setup(rm => rm.DeleteAsync(role))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

        // Act
        var result = await _sut.DeleteAsync("ToDelete");

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task Delete_WhenSuccess_ShouldReturnSucceeded()
    {
        // Arrange
        var role = new IdentityRole("ToDelete");

        _roleManagerMock
            .Setup(rm => rm.FindByNameAsync("ToDelete"))
            .ReturnsAsync(role);

        _roleManagerMock
            .Setup(rm => rm.DeleteAsync(role))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.DeleteAsync("ToDelete");

        // Assert
        Assert.That(result.Succeeded, Is.True);
    }

    #endregion

    #region AssignToUser

    [Test]
    public async Task AssignToUser_WhenUserNotFound_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.AssignToUserAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task AssignToUser_WhenRoleDoesNotExist_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");
        var user = new ApplicationUser { Id = "user-id", Email = "test@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _roleManagerMock
            .Setup(rm => rm.RoleExistsAsync(dto.RoleName))
            .ReturnsAsync(false);

        // Act
        var result = await _sut.AssignToUserAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("No existe el rol 'Admin'."));
    }

    [Test]
    public async Task AssignToUser_WhenAlreadyInRole_ShouldReturnFailedResult()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");
        var user = new ApplicationUser { Id = "user-id", Email = "test@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _roleManagerMock
            .Setup(rm => rm.RoleExistsAsync(dto.RoleName))
            .ReturnsAsync(true);

        _userManagerMock
            .Setup(um => um.IsInRoleAsync(user, dto.RoleName))
            .ReturnsAsync(true);

        // Act
        var result = await _sut.AssignToUserAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("El usuario ya tiene el rol 'Admin'."));
    }

    [Test]
    public async Task AssignToUser_WhenAddToRoleFails_ShouldReturnErrors()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");
        var user = new ApplicationUser { Id = "user-id", Email = "test@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _roleManagerMock
            .Setup(rm => rm.RoleExistsAsync(dto.RoleName))
            .ReturnsAsync(true);

        _userManagerMock
            .Setup(um => um.IsInRoleAsync(user, dto.RoleName))
            .ReturnsAsync(false);

        _userManagerMock
            .Setup(um => um.AddToRoleAsync(user, dto.RoleName))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

        // Act
        var result = await _sut.AssignToUserAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task AssignToUser_WhenSuccess_ShouldReturnSucceeded()
    {
        // Arrange
        var dto = new AssignRoleToUserDto("user-id", "Admin");
        var user = new ApplicationUser { Id = "user-id", Email = "test@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _roleManagerMock
            .Setup(rm => rm.RoleExistsAsync(dto.RoleName))
            .ReturnsAsync(true);

        _userManagerMock
            .Setup(um => um.IsInRoleAsync(user, dto.RoleName))
            .ReturnsAsync(false);

        _userManagerMock
            .Setup(um => um.AddToRoleAsync(user, dto.RoleName))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.AssignToUserAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);
    }

    #endregion
}
