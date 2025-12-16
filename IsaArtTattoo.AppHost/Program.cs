using Aspire.Hosting;
using Aspire.Hosting.Postgres;
using Aspire.Hosting.Redis;
using Aspire.Hosting.RabbitMQ;
using Projects;
using System.IO;

var builder = DistributedApplication.CreateBuilder(args);

// ========================================================
// POSTGRES
// ========================================================
var jwtSecret = builder.AddParameter("jwt-key", secret: true);
var pgUser = builder.AddParameter("pg-user", secret: true);
var pgPass = builder.AddParameter("pg-password", secret: true);

var postgres = builder.AddPostgres("pg")
    .WithPgAdmin()
    .WithImageTag("16")
    .WithUserName(pgUser)
    .WithPassword(pgPass)
    .WithDataVolume("pgdata")
    .WithLifetime(ContainerLifetime.Persistent);


var identityDb = postgres.AddDatabase("identitydb");
var catalogDb = postgres.AddDatabase("catalogdb");
var ordersDb = postgres.AddDatabase("ordersdb");

// ========================================================
// REDIS
// ========================================================

var redis = builder.AddRedis("cache")
    .WithDataVolume("isaarttattoo-redis-data")
    .WithLifetime(ContainerLifetime.Persistent);

// ========================================================
// RABBITMQ
// ========================================================

var rabbit = builder
    .AddRabbitMQ("rabbitmq")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("rabbitmq-data")
    .WithManagementPlugin();



// ========================================================
// MAILDEV (servidor SMTP local para testing)
// ========================================================

var mailServer = builder
    .AddContainer("maildev", "maildev/maildev:latest")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithHttpEndpoint(port: 1080, targetPort: 1080, name: "web")
    .WithEndpoint(port: 1025, targetPort: 1025, name: "smtp")
    .WithLifetime(ContainerLifetime.Persistent);



// ========================================================
// IDENTITY API (INTERNAL ONLY - no external endpoints)
// ========================================================

var identityApi = builder
    .AddProject<Projects.IsaArtTattoo_IdentityApi>("identity-api")
    .WaitFor(identityDb)      // espera a Postgres
    .WaitFor(rabbit)          // espera a RabbitMQ
    .WithEnvironment("Jwt:Key", jwtSecret)
    .WithReference(rabbit)    // le pasa connection string
    .WithReference(identityDb);
    // NO añadimos WithExternalHttpEndpoints() - solo accesible vía Gateway



// ========================================================
// CATALOG API (INTERNAL ONLY - no external endpoints)
// ========================================================

var catalogApi = builder
    .AddProject<Projects.IsaArtTattoo_CatalogApi>("catalog-api")
    .WithEnvironment("Jwt:Key", jwtSecret)
    .WaitFor(catalogDb)
    .WithReference(catalogDb);
    // NO añadimos WithExternalHttpEndpoints() - solo accesible vía Gateway


// ========================================================
// WORKER: NOTIFICATIONS (Consumers de RabbitMQ)
// ========================================================

var notifications = builder
    .AddProject<Projects.IsaArtTattoo_Notifications>("notifications")
    .WaitFor(rabbit)
    .WithReference(rabbit);


// ========================================================
// ORDERS API (INTERNAL ONLY - no external endpoints)
// ========================================================

var ordersApi = builder.AddProject<Projects.IsaArtTatto_OrdersApi>("orders-api")
    .WithReference(ordersDb)
    .WithEnvironment("Jwt:Key", jwtSecret)
    .WaitFor(ordersDb)
    .WaitFor(catalogApi)
    .WithReference(catalogApi);
    // NO añadimos WithExternalHttpEndpoints() - solo accesible vía Gateway


// ========================================================
// API GATEWAY (ONLY EXTERNAL ENDPOINT FOR FRONTEND)
// ========================================================

var gateway = builder
    .AddProject<Projects.IsaArtTattoo_ApiGateWay>("isaarttattoo-apigateway")
    .WithEnvironment("Jwt:Key", jwtSecret)
    .WithReference(redis)
    .WithReference(identityApi)
    .WithReference(catalogApi)
    .WithReference(ordersApi)
    .WithExternalHttpEndpoints(); // ? SOLO el Gateway expone endpoints al frontend


// ========================================================
// FRONTEND (Vite)
// ========================================================

var frontendPath = Path.Combine(builder.AppHostDirectory, "..", "isaarttattoo-web");

var frontend = builder
    .AddExecutable("isaarttattoo-web", "npm", frontendPath, "run", "dev")
    .WithHttpEndpoint(targetPort: 5173, name: "http")
    // ? FORZAR URL del Gateway a puerto 7213 (desarrollo)
    .WithEnvironment("VITE_API_BASE_URL", "https://localhost:7213")
    .WithReference(gateway);

// ========================================================
// RUN
// ========================================================

builder.Build().Run();
