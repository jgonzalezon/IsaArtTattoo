using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// CORS para React
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("frontend");

// Endpoint de prueba
app.MapGet("/whoami", (HttpContext ctx) =>
{
    return Results.Json(new { path = ctx.Request.Path.ToString(), viaGateway = true });
});

// Proxy
app.MapReverseProxy();

app.Run();