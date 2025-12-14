namespace IsaArtTattoo.OrdersApi.Domain.Entities;

public class Cart
{
    public string UserId { get; set; } = default!;
    public List<CartItem> Items { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CartItem
{
    public int Id { get; set; }
    public string CartUserId { get; set; } = default!;
    public Cart Cart { get; set; } = default!;
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}
