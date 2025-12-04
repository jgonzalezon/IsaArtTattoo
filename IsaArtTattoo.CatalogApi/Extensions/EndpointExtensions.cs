using IsaArtTattoo.CatalogApi.Application.Dto;
using IsaArtTattoo.CatalogApi.Application.Services;
using Microsoft.AspNetCore.Authorization;

namespace IsaArtTattoo.CatalogApi.Extensions;

public static class EndpointExtensions
{
    /// <summary>
    /// Mapea los endpoints Minimal API del catálogo.
    /// </summary>
    public static void MapCatalogEndpoints(this WebApplication app)
    {
        // 🔹 Zona pública: catálogo
        var publicGroup = app.MapGroup("/api/catalog")
            .WithTags("Catalog.Public");

        // GET /api/catalog/products
        publicGroup.MapGet("/products", async (
            int? categoryId,
            string? search,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var products = await service.GetProductsAsync(categoryId, search, onlyActive: true, ct);
            return Results.Ok(products);
        });

        // GET /api/catalog/products/{id}
        publicGroup.MapGet("/products/{id:int}", async (
            int id,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var product = await service.GetProductByIdAsync(id, ct);
            return product is null ? Results.NotFound() : Results.Ok(product);
        });

        // 🔹 Zona admin: gestión de catálogo
        var adminGroup = app.MapGroup("/api/admin/catalog")
            .WithTags("Catalog.Admin")
            .RequireAuthorization("admin"); // policy definida en AddCatalogJwtAuth

        // POST /api/admin/catalog/products
        adminGroup.MapPost("/products", async (
            CreateProductDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var created = await service.CreateProductAsync(dto, ct);
            return Results.Created($"/api/catalog/products/{created.Id}", created);
        });

        // POST /api/admin/catalog/products/{id}/stock
        adminGroup.MapPost("/products/{id:int}/stock", async (
            int id,
            AdjustStockDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var updated = await service.AdjustStockAsync(id, dto, ct);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        });

        // POST /api/admin/catalog/products/{id}/images
        // De momento recibimos solo la URL (ya subida a Supabase)
        adminGroup.MapPost("/products/{id:int}/images", async (
            int id,
            AddProductImageDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var img = await service.AddProductImageAsync(id, dto, ct);
            return img is null ? Results.NotFound() : Results.Ok(img);
        });
    }
}
