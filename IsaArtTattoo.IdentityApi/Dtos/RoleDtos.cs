namespace IsaArtTattoo.IdentityApi.Dtos;

public record RoleDto(
    string Id,
    string Name
);

public record CreateRoleDto(
    string Name
);

public record AssignRoleToUserDto(
    string UserId,
    string RoleName
);
