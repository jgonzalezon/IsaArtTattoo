// Services/SeedHostedService.cs
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.IdentityApi.Services;
public class SeedHostedService : IHostedService
{
    private readonly IServiceProvider _sp;
    public SeedHostedService(IServiceProvider sp) => _sp = sp;

    public async Task StartAsync(CancellationToken ct)
    {
        using var scope = _sp.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var um = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var rm = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var cfg = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await db.Database.MigrateAsync(ct);

        foreach (var role in new[] { "Admin", "User" })
            if (!await rm.RoleExistsAsync(role))
                await rm.CreateAsync(new IdentityRole(role));

        var email = cfg["Seed:Admin:Email"];
        var pass = cfg["Seed:Admin:Password"];
        if (!string.IsNullOrWhiteSpace(email) && !string.IsNullOrWhiteSpace(pass))
        {
            var user = await um.FindByEmailAsync(email);
            if (user is null)
            {
                user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
                var res = await um.CreateAsync(user, pass);
                if (res.Succeeded)
                {
                    await um.AddToRolesAsync(user, new[] { "Admin", "User" });
                }
            }
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
