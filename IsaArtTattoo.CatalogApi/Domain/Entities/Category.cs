namespace IsaArtTattoo.CatalogApi.Domain.Entities;

public class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<Product> Products { get; set; } = new();
}
