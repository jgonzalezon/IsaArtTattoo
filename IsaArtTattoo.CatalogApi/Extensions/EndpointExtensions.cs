using IsaArtTattoo.CatalogApi.Application.Dto;
using IsaArtTattoo.CatalogApi.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Antiforgery;

namespace IsaArtTattoo.CatalogApi.Extensions;

public static class EndpointExtensions
{
    /// <summary>
    /// Mapea los endpoints Minimal API del catálogo.
    /// </summary>
    public static void MapCatalogEndpoints(this WebApplication app)
    {
        // ---------- ZONA PÚBLICA ----------

        var publicGroup = app.MapGroup("/api/catalog")
            .WithTags("Catalog.Public");

        // GET /api/catalog/categories
        publicGroup.MapGet("/categories", async (
            ICatalogService service,
            CancellationToken ct) =>
        {
            var categories = await service.GetCategoriesAsync(ct);
            return Results.Ok(categories);
        })
        .WithSummary("Obtiene todas las categorías")
        .WithDescription("Devuelve la lista de categorías visibles para el catálogo.");


        // GET /api/catalog/products/{id}/images
        publicGroup.MapGet("/products/{id:int}/images", async (
            int id,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var images = await service.GetProductImagesAsync(id, ct);
            return images is null ? Results.NotFound() : Results.Ok(images);
        })
        .WithSummary("Imágenes de un producto")
        .WithDescription("Devuelve todas las imágenes asociadas al producto, ordenadas por displayOrder.");
        // GET /api/catalog/categories/{id}
        publicGroup.MapGet("/categories/{id:int}", async (
            int id,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var category = await service.GetCategoryByIdAsync(id, ct);
            return category is null ? Results.NotFound() : Results.Ok(category);
        })
        .WithSummary("Detalle de una categoría")
        .WithDescription("Devuelve la categoría y sus productos activos.");

        // GET /api/catalog/categories/{id}/products
        publicGroup.MapGet("/categories/{id:int}/products", async (
            int id,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var products = await service.GetProductsAsync(categoryId: id, search: null, onlyActive: true, ct);
            return Results.Ok(products);
        })
        .WithSummary("Productos de una categoría")
        .WithDescription("Devuelve los productos activos pertenecientes a la categoría indicada.");

        // GET /api/catalog/products
        publicGroup.MapGet("/products", async (
            int? categoryId,
            string? search,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var products = await service.GetProductsAsync(categoryId, search, onlyActive: true, ct);
            return Results.Ok(products);
        })
        .WithSummary("Lista de productos")
        .WithDescription("Permite filtrar por categoría y texto de búsqueda.");

        // GET /api/catalog/products/{id}
        publicGroup.MapGet("/products/{id:int}", async (
            int id,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var product = await service.GetProductByIdAsync(id, ct);
            return product is null ? Results.NotFound() : Results.Ok(product);
        })
        .WithSummary("Detalle de producto")
        .WithDescription("Devuelve el detalle del producto, incluyendo imágenes y stock.");

        // ---------- ZONA ADMIN ----------

        var adminGroup = app.MapGroup("/api/admin/catalog")
            .WithTags("Catalog.Admin")
            .RequireAuthorization("admin");

        // ------ Categorías ------


        // PUT /api/admin/catalog/products/{productId}/images/{imageId}
        adminGroup.MapPut("/products/{productId:int}/images/{imageId:int}", async (
            int productId,
            int imageId,
            UpdateProductImageDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var img = await service.UpdateProductImageAsync(productId, imageId, dto, ct);
            return img is null ? Results.NotFound() : Results.Ok(img);
        })
        .WithSummary("Actualiza una imagen de producto")
        .WithDescription("Permite cambiar el orden, el altText y marcar una imagen como principal.");

        // POST /api/admin/catalog/categories
        adminGroup.MapPost("/categories", async (
            CreateCategoryDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var created = await service.CreateCategoryAsync(dto, ct);
            return Results.Created($"/api/catalog/categories/{created.Id}", created);
        })
        .WithSummary("Crea una nueva categoría")
        .WithDescription("Solo administradores. Crea una categoría para agrupar productos.");

        // PUT /api/admin/catalog/categories/{id}
        adminGroup.MapPut("/categories/{id:int}", async (
            int id,
            UpdateCategoryDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var updated = await service.UpdateCategoryAsync(id, dto, ct);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        })
        .WithSummary("Actualiza una categoría")
        .WithDescription("Permite cambiar nombre, descripción y orden de una categoría.");

        // DELETE /api/admin/catalog/categories/{id}
        adminGroup.MapDelete("/categories/{id:int}", async (
            int id,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var ok = await service.DeleteCategoryAsync(id, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        })
        .WithSummary("Elimina una categoría")
        .WithDescription("No permite eliminar categorías que aún tienen productos asociados.");

        // ------ Productos ------

        // DELETE /api/admin/catalog/products/{productId}/images/{imageId}
        adminGroup.MapDelete("/products/{productId:int}/images/{imageId:int}", async (
            int productId,
            int imageId,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var ok = await service.DeleteProductImageAsync(productId, imageId, ct);
            return ok ? Results.NoContent() : Results.NotFound();
        })
        .WithSummary("Elimina una imagen de producto")
        .WithDescription("Elimina la imagen de la base de datos. (Opcionalmente se puede borrar también del storage de Supabase).");


        // POST /api/admin/catalog/products
        adminGroup.MapPost("/products", async (
            CreateProductDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var created = await service.CreateProductAsync(dto, ct);
            return Results.Created($"/api/catalog/products/{created.Id}", created);
        })
        .WithSummary("Crea un nuevo producto")
        .WithDescription("Crea un producto con precio, stock inicial, categoría e indicador de activo.");

        // PUT /api/admin/catalog/products/{id}
        adminGroup.MapPut("/products/{id:int}", async (
            int id,
            UpdateProductDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var updated = await service.UpdateProductAsync(id, dto, ct);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        })
        .WithSummary("Actualiza un producto")
        .WithDescription("Permite modificar cualquier característica del producto de forma parcial.");

        // POST /api/admin/catalog/products/{id}/stock
        adminGroup.MapPost("/products/{id:int}/stock", async (
            int id,
            AdjustStockDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var updated = await service.AdjustStockAsync(id, dto, ct);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        })
        .WithSummary("Ajusta el stock de un producto")
        .WithDescription("Suma o resta unidades al stock actual del producto.");

        // POST /api/admin/catalog/products/{id}/images
        adminGroup.MapPost("/products/{id:int}/images", async (
            int id,
            AddProductImageDto dto,
            ICatalogService service,
            CancellationToken ct) =>
        {
            var img = await service.AddProductImageAsync(id, dto, ct);
            return img is null ? Results.NotFound() : Results.Ok(img);
        })
        .WithSummary("Añade una imagen al producto")
        .WithDescription("Asocia una imagen (URL, altText y orden) a un producto existente.");
        // POST /api/admin/catalog/products/{id}/images/upload
        adminGroup.MapPost("/products/{id:int}/images/upload", async (
            int id,
            IFormFile file,
            string? altText,
            int? displayOrder,
            IImageStorageService storage,
            ICatalogService service,
            CancellationToken ct) =>
        {
            if (file is null || file.Length == 0)
                return Results.BadRequest("No se ha enviado ningún archivo.");

            await using var stream = file.OpenReadStream();

            // 1) Subir a Supabase
            var publicUrl = await storage.UploadProductImageAsync(
                id,
                file.FileName,
                stream,
                file.ContentType ?? "application/octet-stream",
                ct);

            // 2) Guardar en Postgres
            var dto = new AddProductImageDto(
                publicUrl,
                altText,
                displayOrder ?? 0);

            var img = await service.AddProductImageAsync(id, dto, ct);

            return img is null
                ? Results.NotFound("Producto no encontrado.")
                : Results.Ok(img);
        })
        .DisableAntiforgery()

        .WithSummary("Sube una imagen desde archivo y la asocia al producto")
        .WithDescription("Recibe un archivo (multipart/form-data), lo sube a Supabase Storage y guarda la URL pública en la tabla product_images. Solo administradores.");
        // POST /api/admin/catalog/products-with-image
        adminGroup.MapPost("/products-with-image", async (
            // ✅ Agregar [FromForm] para que OpenAPI entienda que vienen del formulario
            [FromForm] string name,
            [FromForm] string? shortDescription,
            [FromForm] decimal price,
            [FromForm] int? categoryId,
            [FromForm] int initialStock,
            [FromForm] bool isActive,
            // Campos de la imagen
            [FromForm] IFormFile file,
            [FromForm] string? altText,
            [FromForm] int? displayOrder,
            IImageStorageService storage,
            ICatalogService service,
            CancellationToken ct) =>
        {
            if (file is null || file.Length == 0)
                return Results.BadRequest("Debes adjuntar un archivo de imagen.");

            // 1) Crear el producto
            var createDto = new CreateProductDto(
                name,
                shortDescription,
                price,
                categoryId,
                initialStock,
                isActive
            );

            var product = await service.CreateProductAsync(createDto, ct);

            // 2) Subir la imagen a Supabase
            await using var stream = file.OpenReadStream();

            var publicUrl = await storage.UploadProductImageAsync(
                product.Id,
                file.FileName,
                stream,
                file.ContentType ?? "application/octet-stream",
                ct);

            // 3) Guardar la imagen en Postgres
            var imgDto = new AddProductImageDto(
                publicUrl,
                altText,
                displayOrder ?? 0
            );

            await service.AddProductImageAsync(product.Id, imgDto, ct);

            // 4) Devolver el producto recargado (con imágenes incluidas)
            var fullProduct = await service.GetProductByIdAsync(product.Id, ct);

            return Results.Created($"/api/catalog/products/{product.Id}", fullProduct);
        })
        .DisableAntiforgery()
        .WithSummary("Crea un producto con imagen")
        .WithDescription("Crea un nuevo producto y sube en la misma petición una imagen (multipart/form-data). Solo administradores.");
    }


}
