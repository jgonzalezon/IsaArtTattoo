using Aspire.Hosting;
using Aspire.Hosting.Postgres;

var builder = DistributedApplication.CreateBuilder(args);

// Nombres válidos (sin underscores)
var pgUser = builder.AddParameter("pg-user", "postgres"); 
var pgPass = builder.AddParameter("pg-password", "postgres"); 

var postgres = builder.AddPostgres("pg")
    .WithImageTag("16")
    .WithUserName(pgUser)      // acepta ParameterResource
    .WithPassword(pgPass)      // acepta ParameterResource
    .WithDataVolume("pgdata"); // persistencia


var identityDb = postgres.AddDatabase("identitydb");

var identityApi= builder.AddProject<Projects.IsaArtTattoo_IdentityApi>("identity-api")
       .WithReference(identityDb);




var frontendPath = Path.Combine(builder.AppHostDirectory, "..", "isaarttattoo-web");

builder.AddExecutable("isaarttattoo-web", "npm", frontendPath, "run", "dev")
       .WithHttpEndpoint(targetPort: 54395, name: "http")
       .WithReference(identityApi);

builder.Build().Run();
