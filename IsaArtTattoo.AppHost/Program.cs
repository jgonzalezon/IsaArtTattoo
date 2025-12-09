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

var pgUser = builder.AddParameter("pg-user", "postgres");
var pgPass = builder.AddParameter("pg-password", "postgres");

var postgres = builder.AddPostgres("pg")
    .WithPgAdmin()
    .WithImageTag("16")
    .WithUserName(pgUser)
    .WithPassword(pgPass)
    .WithDataVolume("pgdata");


var identityDb = postgres.AddDatabase("identitydb");
var catalogDb = postgres.AddDatabase("catalogdb");
var ordersDb = postgres.AddDatabase("ordersdb");



// ========================================================
// RABBITMQ
// ========================================================

var rabbit = builder
    .AddRabbitMQ("rabbitmq")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithDataVolume("rabbitmq-data")
    .WithManagementPlugin();


// ========================================================
// IDENTITY API
// ========================================================

var identityApi = builder
    .AddProject<Projects.IsaArtTattoo_IdentityApi>("identity-api")
    .WaitFor(identityDb)      // espera a Postgres
    .WaitFor(rabbit)          // espera a RabbitMQ
    .WithReference(rabbit)    // le pasa connection string
    .WithReference(identityDb);



var catalogApi = builder
    .AddProject<Projects.IsaArtTattoo_CatalogApi>("catalog-api")
    .WaitFor(catalogDb)
    .WithReference(catalogDb)
    .WithExternalHttpEndpoints();


// ========================================================
// WORKER: NOTIFICATIONS (Consumers de RabbitMQ)
// ========================================================

var notifications = builder
    .AddProject<Projects.IsaArtTattoo_Notifications>("notifications")
    .WaitFor(rabbit)
    .WithReference(rabbit);



// ========================================================
// REDIS
// ========================================================

var redis = builder.AddRedis("cache")
    .WithDataVolume("isaarttattoo-redis-data");


// ========================================================
// MAILDEV (servidor SMTP local para testing)
// ========================================================

var mailServer = builder
    .AddContainer("maildev", "maildev/maildev:latest")
    .WithLifetime(ContainerLifetime.Persistent)
    .WithHttpEndpoint(port: 1080, targetPort: 1080, name: "web")
    .WithEndpoint(port: 1025, targetPort: 1025, name: "smtp");


// ========================================================
// API GATEWAY
// ========================================================

var gateway = builder
    .AddProject<Projects.IsaArtTattoo_ApiGateWay>("isaarttattoo-apigateway")
    .WithReference(redis)
    .WithReference(identityApi)
    .WithExternalHttpEndpoints(); // expone HTTP y HTTPS


// URL HTTPS del gateway para el frontend
var gatewayHttpUrl = gateway
    .GetEndpoint("https")
    .Property(EndpointProperty.Url);


// ========================================================
// FRONTEND (Vite)
// ========================================================

var frontendPath = Path.Combine(builder.AppHostDirectory, "..", "isaarttattoo-web");

var frontend = builder
    .AddExecutable("isaarttattoo-web", "npm", frontendPath, "run", "dev")
    .WithHttpEndpoint(targetPort: 5173, name: "http")
    .WithEnvironment("VITE_API_BASE_URL", gatewayHttpUrl)
    .WithReference(gateway);




// ========================================================
// RUN
// ========================================================

var ordersApi = builder.AddProject<Projects.IsaArtTatto_OrdersApi>("orders-api")
    .WithReference(ordersDb)
    .WaitFor(ordersDb)
    .WaitFor(catalogApi)
    .WithReference(catalogApi)
    .WithExternalHttpEndpoints();

// ========================================================
// RUN
// ========================================================

builder.Build().Run();
