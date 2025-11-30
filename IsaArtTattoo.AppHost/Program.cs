using Aspire.Hosting;
using Aspire.Hosting.Postgres;
using Aspire.Hosting.Redis;

var builder = DistributedApplication.CreateBuilder(args);

// -----------------------
// Postgres
// -----------------------
var pgUser = builder.AddParameter("pg-user", "postgres");
var pgPass = builder.AddParameter("pg-password", "postgres");

var postgres = builder.AddPostgres("pg")
    .WithImageTag("16")
    .WithUserName(pgUser)
    .WithPassword(pgPass)
    .WithDataVolume("pgdata");

var identityDb = postgres.AddDatabase("identitydb");

var identityApi = builder
    .AddProject<Projects.IsaArtTattoo_IdentityApi>("identity-api")
    .WithReference(identityDb);

// -----------------------
// Redis (cache / rate limit)
// -----------------------
var redis = builder.AddRedis("cache")
    .WithDataVolume("isaarttattoo-redis-data");

// -----------------------
// Api Gateway
// -----------------------
var gateway = builder
    .AddProject<Projects.IsaArtTattoo_ApiGateWay>("isaarttattoo-apigateway")
    .WithReference(redis)
    .WithReference(identityApi)
    .WithExternalHttpEndpoints(); // expone http y https

//  Cogemos la URL HTTP del gateway para el front

var gatewayHttpUrl = gateway
    .GetEndpoint("https")
    .Property(EndpointProperty.Url);

// -----------------------
// Frontend (Vite)
// -----------------------
var frontendPath = Path.Combine(builder.AppHostDirectory, "..", "isaarttattoo-web");

var frontend = builder
    .AddExecutable("isaarttattoo-web", "npm", frontendPath, "run", "dev")
    .WithHttpEndpoint(targetPort: 5173, name: "http")
    .WithEnvironment("VITE_API_BASE_URL", gatewayHttpUrl) //  CLAVE
    .WithReference(gateway);

builder.Build().Run();
