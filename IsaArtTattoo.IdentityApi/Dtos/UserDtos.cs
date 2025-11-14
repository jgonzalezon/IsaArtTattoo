namespace IsaArtTattoo.IdentityApi.Dtos;

public record UserSummaryDto(
    string Id,
    string Email,
    bool EmailConfirmed,
    IList<string> Roles
);

public record CreateUserDto(
    string Email,
    string Password,
    IList<string> Roles
);

public record UpdateUserRolesDto(
    string UserId,
    IList<string> Roles
);

public record ChangeUserPasswordDto(
    string UserId,
    string NewPassword
);
