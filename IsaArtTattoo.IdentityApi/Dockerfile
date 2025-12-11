# Etapa base: runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Etapa build: SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiamos TODO el repo (incluye proyectos, props, etc.)
COPY . .

# Restauramos SOLO el proyecto de Identity
RUN dotnet restore "IsaArtTattoo.IdentityApi/IsaArtTattoo.IdentityApi.csproj"

# Compilamos en Release
WORKDIR "/src/IsaArtTattoo.IdentityApi"
RUN dotnet build "IsaArtTattoo.IdentityApi.csproj" -c Release -o /app/build

# Publicamos
FROM build AS publish
RUN dotnet publish "IsaArtTattoo.IdentityApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagen final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "IsaArtTattoo.IdentityApi.dll"]
