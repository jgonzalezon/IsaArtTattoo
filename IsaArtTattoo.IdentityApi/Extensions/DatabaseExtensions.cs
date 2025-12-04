using IsaArtTattoo.IdentityApi.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace IsaArtTattoo.IdentityApi.Extensions;

public static class DatabaseExtensions
{

    public static void AddIdentityDatabase(this WebApplicationBuilder builder)  
    {
        builder.AddNpgsqlDbContext<ApplicationDbContext>("identitydb");

    }
}
