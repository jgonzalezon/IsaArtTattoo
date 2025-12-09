using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using IsaArtTattoo.IdentityApi.Dtos;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Identity.Test;

[TestFixture]
public class UsersServiceTests
{
    private Mock<UserManager<ApplicationUser>> _userManagerMock = null!;
    private IConfiguration _config = null!;
    private UsersService _sut = null!; // System Under Test

    [SetUp]
    public void Setup()
    {
        var userStoreMock = new Mock<IUserStore<ApplicationUser>>();

        _userManagerMock = new Mock<UserManager<ApplicationUser>>(
            userStoreMock.Object,
            null, null, null, null, null, null, null, null
        );

        var settings = new Dictionary<string, string?>
        {
            { "AdminUser:Email", "admin@site.com" }
        };

        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(settings!)
            .Build();

        _sut = new UsersService(_userManagerMock.Object, _config);
    }

    #region GetAll

    [Test]
    public async Task GetAll_ReturnsMappedUsersWithRoles()
    {
        // Arrange
        var users = new List<ApplicationUser>
        {
            new ApplicationUser { Id = "1", Email = "user1@test.com", EmailConfirmed = true },
            new ApplicationUser { Id = "2", Email = "user2@test.com", EmailConfirmed = false }
        }.AsQueryable();

        _userManagerMock
            .Setup(um => um.Users)
            .Returns(users);

        _userManagerMock
            .Setup(um => um.GetRolesAsync(It.Is<ApplicationUser>(u => u.Id == "1")))
            .ReturnsAsync(new List<string> { "Admin" });

        _userManagerMock
            .Setup(um => um.GetRolesAsync(It.Is<ApplicationUser>(u => u.Id == "2")))
            .ReturnsAsync(new List<string> { "User" });

        // Act
        var result = await _sut.GetAllAsync();

        // Assert
        Assert.That(result.Count, Is.EqualTo(2));
        Assert.That(result.Any(u => u.Id == "1" && u.Roles.Contains("Admin")), Is.True);
        Assert.That(result.Any(u => u.Id == "2" && u.Roles.Contains("User")), Is.True);
    }

    #endregion

    #region GetById

    [Test]
    public async Task GetById_WhenUserNotFound_ReturnsFailed()
    {
        // Arrange
        _userManagerMock
            .Setup(um => um.FindByIdAsync("1"))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.GetByIdAsync("1");

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task GetById_WhenFound_ReturnsUserSummaryDto()
    {
        // Arrange
        var user = new ApplicationUser
        {
            Id = "1",
            Email = "user@test.com",
            EmailConfirmed = true
        };

        _userManagerMock
            .Setup(um => um.FindByIdAsync("1"))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "Admin", "User" });

        // Act
        var result = await _sut.GetByIdAsync("1");

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.User, Is.Not.Null);
        Assert.That(result.User!.Email, Is.EqualTo("user@test.com"));
        Assert.That(result.User.Roles.Count, Is.EqualTo(2));
    }

    #endregion

    #region Create

    [Test]
    public async Task Create_WhenCreateFails_ReturnsErrors()
    {
        // Arrange
        var dto = new CreateUserDto("user@test.com", "Pass123!", new List<string>());

        _userManagerMock
            .Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task Create_WhenRolesAssignedAndFail_ReturnsErrors()
    {
        // Arrange
        var dto = new CreateUserDto("user@test.com", "Pass123!", new List<string> { "Admin" });

        _userManagerMock
            .Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(um => um.AddToRolesAsync(It.IsAny<ApplicationUser>(), dto.Roles))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error roles" }));

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task Create_WhenSuccess_ReturnsIdAndEmail()
    {
        // Arrange
        var dto = new CreateUserDto("user@test.com", "Pass123!", new List<string>());

        _userManagerMock
            .Setup(um => um.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.CreateAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Id, Is.Not.Null);
        Assert.That(result.Email, Is.EqualTo("user@test.com"));
    }

    #endregion

    #region UpdateRoles

    [Test]
    public async Task UpdateRoles_WhenUserNotFound_ReturnsFailed()
    {
        // Arrange
        var dto = new UpdateUserRolesDto("1", new List<string> { "Admin" });

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.UpdateRolesAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task UpdateRoles_WhenMainAdminWithoutAdminRole_ReturnsError()
    {
        // Arrange
        var dto = new UpdateUserRolesDto("1", new List<string> { "User" });

        var user = new ApplicationUser
        {
            Id = "1",
            Email = "admin@site.com"
        };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.UpdateRolesAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error,
            Is.EqualTo("No se puede quitar el rol Admin del usuario administrador principal."));
    }

    [Test]
    public async Task UpdateRoles_WhenRemoveFails_ReturnsErrors()
    {
        // Arrange
        var dto = new UpdateUserRolesDto("1", new List<string> { "Admin" });
        var user = new ApplicationUser { Id = "1", Email = "other@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "User" });

        _userManagerMock
            .Setup(um => um.RemoveFromRolesAsync(user, It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error remove" }));

        // Act
        var result = await _sut.UpdateRolesAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task UpdateRoles_WhenAddFails_ReturnsErrors()
    {
        // Arrange
        var dto = new UpdateUserRolesDto("1", new List<string> { "Admin" });
        var user = new ApplicationUser { Id = "1", Email = "other@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "User" });

        _userManagerMock
            .Setup(um => um.RemoveFromRolesAsync(user, It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(um => um.AddToRolesAsync(user, dto.Roles))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error add" }));

        // Act
        var result = await _sut.UpdateRolesAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task UpdateRoles_WhenSuccess_ReturnsSucceeded()
    {
        // Arrange
        var dto = new UpdateUserRolesDto("1", new List<string> { "Admin" });
        var user = new ApplicationUser { Id = "1", Email = "other@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GetRolesAsync(user))
            .ReturnsAsync(new List<string> { "User" });

        _userManagerMock
            .Setup(um => um.RemoveFromRolesAsync(user, It.IsAny<IEnumerable<string>>()))
            .ReturnsAsync(IdentityResult.Success);

        _userManagerMock
            .Setup(um => um.AddToRolesAsync(user, dto.Roles))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.UpdateRolesAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);
    }

    #endregion

    #region ChangePassword

    [Test]
    public async Task ChangePassword_WhenUserNotFound_ReturnsFailed()
    {
        // Arrange
        var dto = new ChangeUserPasswordDto("1", "Pass!");

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.ChangePasswordAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task ChangePassword_WhenResetFails_ReturnsErrors()
    {
        // Arrange
        var dto = new ChangeUserPasswordDto("1", "Pass!");
        var user = new ApplicationUser { Id = "1", Email = "user@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GeneratePasswordResetTokenAsync(user))
            .ReturnsAsync("token");

        _userManagerMock
            .Setup(um => um.ResetPasswordAsync(user, "token", dto.NewPassword))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

        // Act
        var result = await _sut.ChangePasswordAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task ChangePassword_WhenSuccess_ReturnsSucceeded()
    {
        // Arrange
        var dto = new ChangeUserPasswordDto("1", "Pass!");
        var user = new ApplicationUser { Id = "1", Email = "user@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync(dto.UserId))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.GeneratePasswordResetTokenAsync(user))
            .ReturnsAsync("token");

        _userManagerMock
            .Setup(um => um.ResetPasswordAsync(user, "token", dto.NewPassword))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.ChangePasswordAsync(dto);

        // Assert
        Assert.That(result.Succeeded, Is.True);
    }

    #endregion

    #region Delete

    [Test]
    public async Task Delete_WhenUserNotFound_ReturnsFailed()
    {
        // Arrange
        _userManagerMock
            .Setup(um => um.FindByIdAsync("1"))
            .ReturnsAsync((ApplicationUser?)null);

        // Act
        var result = await _sut.DeleteAsync("1");

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error, Is.EqualTo("Usuario no encontrado."));
    }

    [Test]
    public async Task Delete_WhenMainAdmin_ReturnsError()
    {
        // Arrange
        var user = new ApplicationUser { Id = "1", Email = "admin@site.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync("1"))
            .ReturnsAsync(user);

        // Act
        var result = await _sut.DeleteAsync("1");

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Error,
            Is.EqualTo("No se puede eliminar el usuario administrador principal."));
    }

    [Test]
    public async Task Delete_WhenDeleteFails_ReturnsErrors()
    {
        // Arrange
        var user = new ApplicationUser { Id = "1", Email = "user@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync("1"))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.DeleteAsync(user))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Error" }));

        // Act
        var result = await _sut.DeleteAsync("1");

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Errors, Is.Not.Empty);
    }

    [Test]
    public async Task Delete_WhenSuccess_ReturnsSucceeded()
    {
        // Arrange
        var user = new ApplicationUser { Id = "1", Email = "user@test.com" };

        _userManagerMock
            .Setup(um => um.FindByIdAsync("1"))
            .ReturnsAsync(user);

        _userManagerMock
            .Setup(um => um.DeleteAsync(user))
            .ReturnsAsync(IdentityResult.Success);

        // Act
        var result = await _sut.DeleteAsync("1");

        // Assert
        Assert.That(result.Succeeded, Is.True);
    }

    #endregion
}
