namespace IsaArtTattoo.CatalogApi.Domain.Entities;

public class Product
{
    public int Id { get; set; }

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    public string Name { get; set; } = default!;
    public string? ShortDescription { get; set; }

    public decimal Price { get; set; }
    public int Stock { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<ProductImage> Images { get; set; } = new();
}
