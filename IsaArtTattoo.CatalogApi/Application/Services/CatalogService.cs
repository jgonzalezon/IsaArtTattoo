using IsaArtTattoo.CatalogApi.Application.Dto;
using IsaArtTattoo.CatalogApi.Domain.Entities;
using IsaArtTattoo.CatalogApi.Infraestructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.CatalogApi.Application.Services;

public class CatalogService : ICatalogService
{
    private readonly CatalogDbContext _db;

    public CatalogService(CatalogDbContext db)
    {
        _db = db;
    }

    // ---------- Público: categorías ----------

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        var categories = await _db.Categories
            .Include(c => c.Products)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(ct);

        return categories
            .Select(c => new CategoryDto(
                c.Id,
                c.Name,
                c.Description,
                c.DisplayOrder,
                c.Products.Count(p => p.IsActive)))
            .ToList();
    }

    public async Task<CategoryDetailDto?> GetCategoryByIdAsync(int id, CancellationToken ct = default)
    {
        var category = await _db.Categories
            .Include(c => c.Products)
                .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category is null) return null;

        var products = category.Products
            .Where(p => p.IsActive)
            .OrderBy(p => p.Name)
            .Select(p =>
            {
                var mainImage = p.Images
                    .OrderBy(i => i.DisplayOrder)
                    .FirstOrDefault();

                return new ProductListItemDto(
                    p.Id,
                    p.Name,
                    p.ShortDescription,
                    p.Price,
                    mainImage?.Url,
                    category.Name
                );
            })
            .ToList();

        return new CategoryDetailDto(
            category.Id,
            category.Name,
            category.Description,
            category.DisplayOrder,
            products
        );
    }

    // ---------- Público: productos ----------

    public async Task<IReadOnlyList<ProductListItemDto>> GetProductsAsync(
        int? categoryId = null,
        string? search = null,
        bool onlyActive = true,
        CancellationToken ct = default)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsQueryable();

        if (onlyActive)
            query = query.Where(p => p.IsActive);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(p =>
                p.Name.Contains(term) ||
                (p.ShortDescription != null && p.ShortDescription.Contains(term)));
        }

        query = query.OrderBy(p => p.Name);

        var products = await query.ToListAsync(ct);

        return products.Select(p =>
        {
            var mainImage = p.Images
                .OrderBy(i => i.DisplayOrder)
                .FirstOrDefault();

            return new ProductListItemDto(
                p.Id,
                p.Name,
                p.ShortDescription,
                p.Price,
                mainImage?.Url,
                p.Category?.Name
            );
        }).ToList();
    }

    public async Task<ProductDetailDto?> GetProductByIdAsync(int id, CancellationToken ct = default)
    {
        var p = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (p is null) return null;

        return MapToDetailDto(p);
    }

    // ---------- Admin: categorías ----------

    public async Task<CategoryDetailDto> CreateCategoryAsync(CreateCategoryDto dto, CancellationToken ct = default)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            DisplayOrder = dto.DisplayOrder
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);

        return await GetCategoryByIdAsync(category.Id, ct)
               ?? throw new InvalidOperationException("Error al recargar la categoría recién creada.");
    }

    public async Task<CategoryDetailDto?> UpdateCategoryAsync(int id, UpdateCategoryDto dto, CancellationToken ct = default)
    {
        var category = await _db.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category is null) return null;

        if (dto.Name is not null)
            category.Name = dto.Name;

        if (dto.Description is not null)
            category.Description = dto.Description;

        if (dto.DisplayOrder.HasValue)
            category.DisplayOrder = dto.DisplayOrder.Value;

        category.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return await GetCategoryByIdAsync(category.Id, ct);
    }

    public async Task<bool> DeleteCategoryAsync(int id, CancellationToken ct = default)
    {
        var category = await _db.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (category is null) return false;

        if (category.Products.Any())
        {
            // En vez de borrar, podrías lanzar excepción o mover productos a "Sin categoría"
            throw new InvalidOperationException("No se puede eliminar una categoría con productos.");
        }

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(ct);

        return true;
    }

    // ---------- Admin: productos ----------

    public async Task<ProductDetailDto> CreateProductAsync(CreateProductDto dto, CancellationToken ct = default)
    {
        var product = new Product
        {
            Name = dto.Name,
            ShortDescription = dto.ShortDescription,
            Price = dto.Price,
            CategoryId = dto.CategoryId,
            Stock = dto.InitialStock,
            IsActive = dto.IsActive
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        await _db.Entry(product).Reference(p => p.Category).LoadAsync(ct);
        await _db.Entry(product).Collection(p => p.Images).LoadAsync(ct);

        return MapToDetailDto(product);
    }

    public async Task<ProductDetailDto?> UpdateProductAsync(int id, UpdateProductDto dto, CancellationToken ct = default)
    {
        var product = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null) return null;

        if (dto.Name is not null)
            product.Name = dto.Name;

        if (dto.ShortDescription is not null)
            product.ShortDescription = dto.ShortDescription;

        if (dto.Price.HasValue)
            product.Price = dto.Price.Value;

        if (dto.CategoryId.HasValue)
            product.CategoryId = dto.CategoryId.Value;

        if (dto.Stock.HasValue)
            product.Stock = dto.Stock.Value;

        if (dto.IsActive.HasValue)
            product.IsActive = dto.IsActive.Value;

        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(product);
    }

    public async Task<ProductDetailDto?> AdjustStockAsync(int id, AdjustStockDto dto, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (product is null) return null;

        product.Stock += dto.Quantity;
        if (product.Stock < 0)
            product.Stock = 0;

        // ✅ Si el stock llega a 0, marcar como inactivo
        if (product.Stock == 0)
            product.IsActive = false;

        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        await _db.Entry(product).Reference(p => p.Category).LoadAsync(ct);
        await _db.Entry(product).Collection(p => p.Images).LoadAsync(ct);

        return MapToDetailDto(product);
    }

    public async Task<ProductImageDto?> AddProductImageAsync(int productId, AddProductImageDto dto, CancellationToken ct = default)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == productId, ct);
        if (product is null) return null;

        var img = new ProductImage
        {
            ProductId = productId,
            Url = dto.Url,
            AltText = dto.AltText,
            DisplayOrder = dto.DisplayOrder
        };

        _db.ProductImages.Add(img);
        await _db.SaveChangesAsync(ct);

        return new ProductImageDto(img.Id, img.Url, img.AltText, img.DisplayOrder);
    }

    // ✅ Nuevo método público: cambiar estado activo/inactivo
    public async Task<ProductDetailDto?> SetProductActiveStatusAsync(int id, bool isActive, CancellationToken ct = default)
    {
        var product = await _db.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id, ct);

        if (product is null) return null;

        product.IsActive = isActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return MapToDetailDto(product);
    }

    // ---------- Helpers ----------

    private static ProductDetailDto MapToDetailDto(Product p)
    {
        var images = p.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto(i.Id, i.Url, i.AltText, i.DisplayOrder))
            .ToList();

        return new ProductDetailDto(
            p.Id,
            p.Name,
            p.ShortDescription,
            p.Price,
            p.Stock,
            p.IsActive,
            p.Category?.Name,
            images
        );
    }

    // ---------- Imágenes de producto ----------

    public async Task<IReadOnlyList<ProductImageDto>?> GetProductImagesAsync(int productId, CancellationToken ct = default)
    {
        var product = await _db.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == productId, ct);

        if (product is null) return null;

        return product.Images
            .OrderBy(i => i.DisplayOrder)
            .Select(i => new ProductImageDto(i.Id, i.Url, i.AltText, i.DisplayOrder))
            .ToList();
    }

    public async Task<ProductImageDto?> UpdateProductImageAsync(
        int productId,
        int imageId,
        UpdateProductImageDto dto,
        CancellationToken ct = default)
    {
        var images = _db.ProductImages.Where(i => i.ProductId == productId);
        var image = await images.FirstOrDefaultAsync(i => i.Id == imageId, ct);

        if (image is null) return null;

        // 1) Actualizar altText si viene
        if (dto.AltText is not null)
            image.AltText = dto.AltText;

        // 2) Actualizar displayOrder si viene
        if (dto.DisplayOrder.HasValue)
            image.DisplayOrder = dto.DisplayOrder.Value;

        // 3) Marcar como principal usando DisplayOrder = 0
        if (dto.IsPrimary == true)
        {
            // Poner esta a 0 y desplazar el resto +1
            var otherImages = await images
                .Where(i => i.Id != imageId)
                .ToListAsync(ct);

            foreach (var other in otherImages)
            {
                if (other.DisplayOrder <= image.DisplayOrder)
                    other.DisplayOrder++;
            }

            image.DisplayOrder = 0;
        }

        await _db.SaveChangesAsync(ct);

        return new ProductImageDto(image.Id, image.Url, image.AltText, image.DisplayOrder);
    }

    public async Task<bool> DeleteProductImageAsync(int productId, int imageId, CancellationToken ct = default)
    {
        var image = await _db.ProductImages
            .FirstOrDefaultAsync(i => i.ProductId == productId && i.Id == imageId, ct);

        if (image is null) return false;

        _db.ProductImages.Remove(image);
        await _db.SaveChangesAsync(ct);

        // Opcional: podrías también borrar el fichero en Supabase,
        // pero eso ya requiere guardar la ruta interna y no solo la URL pública.

        return true;
    }

}
