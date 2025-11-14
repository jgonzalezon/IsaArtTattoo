using IsaArtTattoo.IdentityApi.Models;

namespace IsaArtTattoo.IdentityApi.Services;

public interface IJwtTokenService
{
    Task<string> CreateTokenAsync(ApplicationUser user);
}