using IsaArtTattoo.IdentityApi.Data;
using IsaArtTattoo.IdentityApi.Models;
using IsaArtTattoo.IdentityApi.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.OpenApi;
using Scalar.AspNetCore;
using System.Text;
using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);

// -----------------------------------------
// DATABASE (Aspire inyecta ConnectionStrings:DefaultConnection)
// -----------------------------------------
builder.Services.AddDbContext<ApplicationDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// -----------------------------------------
// IDENTITY (sin UI)
// -----------------------------------------
builder.Services.AddIdentityCore<ApplicationUser>(o =>
{
    o.User.RequireUniqueEmail = true;
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddSignInManager<SignInManager<ApplicationUser>>()
.AddDefaultTokenProviders();

// -----------------------------------------
// JWT
// -----------------------------------------
var jwtSection = builder.Configuration.GetSection("Jwt");
var keyBytes = Encoding.UTF8.GetBytes(jwtSection["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSection["Issuer"],
            ValidAudience = jwtSection["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// -----------------------------------------
// CORS PARA EL FRONT
// -----------------------------------------
var allowWeb = "AllowWeb";

builder.Services.AddCors(opt =>
{
    opt.AddPolicy(allowWeb, p =>
        p.AllowAnyOrigin()
         .AllowAnyHeader()
         .AllowAnyMethod()
    );
});

// -----------------------------------------
// API VERSIONING
// -----------------------------------------
builder.Services
    .AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
        options.ApiVersionReader = new UrlSegmentApiVersionReader();
    })
    .AddApiExplorer(options =>
    {
        options.GroupNameFormat = "'v'VVV";
        options.SubstituteApiVersionInUrl = true;
    });

// -----------------------------------------
// SERVICIOS
// -----------------------------------------
builder.Services.AddControllers();
builder.Services.AddHostedService<SeedHostedService>();
builder.Services.AddTransient<IEmailSender, EmailSender>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.AddServiceDefaults();

// -----------------------------------------
// OPENAPI + JWT EN EL DOCUMENTO
// -----------------------------------------
builder.Services.AddOpenApi("v1", options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new OpenApiInfo
        {
            Title = "IsaArtTattoo Identity API",
            Version = "v1",
            Description = "Identity API para IsaArtTattoo (JWT Bearer)"
        };

        document.Components ??= new OpenApiComponents();

        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Introduce: Bearer {token}"
        };

        document.SecurityRequirements ??= new List<OpenApiSecurityRequirement>();
        document.SecurityRequirements.Add(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });

        return Task.CompletedTask;
    });
});

var app = builder.Build();

// -----------------------------------------
// AUTO-MIGRACIONES (entorno dev)
// -----------------------------------------
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

// -----------------------------------------
// PIPELINE
// -----------------------------------------
if (app.Environment.IsDevelopment())
{
    // 1. OpenAPI JSON estándar
    app.MapOpenApi(); // /openapi/v1.json

    // 2. COMPATIBILIDAD: redirigir /swagger/v1/swagger.json -> /openapi/v1.json
    app.MapGet("/swagger/v1/swagger.json", context =>
    {
        context.Response.Redirect("/openapi/v1.json");
        return Task.CompletedTask;
    });

    // 3. Scalar UI
    app.MapScalarApiReference("/scalar", options =>
    {
        options
            .WithTitle("IsaArtTattoo Identity API")
            .AddDocument("v1", "IsaArtTattoo Identity API v1", "/openapi/v1.json", isDefault: true);
    });

    // 4. Swagger UI leyendo el mismo OpenAPI
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/openapi/v1.json", "IsaArtTattoo.IdentityApi v1");
        options.RoutePrefix = "swagger";
    });
}


app.UseHttpsRedirection();
app.UseCors(allowWeb);
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.Run();
