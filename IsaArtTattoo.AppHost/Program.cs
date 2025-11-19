using Aspire.Hosting;
using Aspire.Hosting.Postgres;

var builder = DistributedApplication.CreateBuilder(args);

// ============================================
// PARAMETERS
// ============================================

// Nombres válidos (sin underscores)
var pgUser = builder.AddParameter("pg-user", "postgres");
var pgPass = builder.AddParameter("pg-password", "postgres");
var redisPass = builder.AddParameter("redis-password", "SuperSegura123!");

// ============================================
// INFRASTRUCTURE
// ============================================

// PostgreSQL
var postgres = builder.AddPostgres("pg")
    .WithImageTag("16")
    .WithUserName(pgUser)
    .WithPassword(pgPass)
    .WithDataVolume("pgdata")
    .WithHostPort(5432)
    .WithLifetime(ContainerLifetime.Persistent);

// DB para Identity
var identityDb = postgres.AddDatabase("identitydb");

// Redis - cache para rate limiting / sesiones / etc.
var redis = builder.AddRedis("redis", password: redisPass)
    .WithDataVolume("redisdata")
    .WithHostPort(6379)
    .WithLifetime(ContainerLifetime.Persistent);

// ============================================
// MICROSERVICES
// ============================================

// Identity API (puedes dejar 1 o poner .WithReplicas(2) si quieres balanceo)
var identityApi = builder
    .AddProject<Projects.IsaArtTattoo_IdentityApi>("identity-api")
    .WithReference(identityDb)
    .WaitFor(identityDb); // espera a que la DB esté lista

// ============================================
// API GATEWAY
// ============================================

var gateway = builder
    .AddProject<Projects.IsaArtTattoo_ApiGateWay>("isaarttattoo-apigateway")
    .WithExternalHttpEndpoints()     // expone http://localhost:xxxx (el que ve Aspire)
    .WithReference(identityApi)      // enruta hacia identity-api
    .WithReference(redis)           // usa Redis para cache / rate limit
    .WaitFor(identityApi);          // espera a que identity esté arriba

// ============================================
// FRONTEND (Vite / React)
// ============================================

var frontendPath = Path.Combine(builder.AppHostDirectory, "..", "isaarttattoo-web");

// Ejecutable npm como ya tenías, pero:
//  - referencia al gateway
//  - VITE_API_BASE_URL = endpoint http del gateway
var frontend = builder
    .AddExecutable("isaarttattoo-web", "npm", frontendPath, "run", "dev")
    .WithReference(gateway)
    .WithEnvironment("VITE_API_BASE_URL", gateway.GetEndpoint("http"))
    .WithHttpEndpoint(targetPort: 5173, name: "http")
    .WithExternalHttpEndpoints();

builder.Build().Run();
