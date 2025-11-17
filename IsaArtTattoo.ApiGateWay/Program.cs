var builder = WebApplication.CreateBuilder(args);

// 1) Registrar YARP y cargar la config desde appsettings.json (sección "ReverseProxy")
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// 2) (Opcional) CORS, etc. si hace falta
// app.UseCors(...);

// 3) Mapear el reverse proxy (todas las rutas definidas en la config)
app.MapReverseProxy();

app.Run();
