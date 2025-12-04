namespace IsaArtTattoo.CatalogApi.Domain.Entities;

public class ProductImage
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public Product Product { get; set; } = default!;

    public string Url { get; set; } = default!;
    public string? AltText { get; set; }
    public int DisplayOrder { get; set; } = 0;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
