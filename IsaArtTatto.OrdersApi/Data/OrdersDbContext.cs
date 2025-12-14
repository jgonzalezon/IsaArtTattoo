using IsaArtTattoo.OrdersApi.Domain.Entities;
using IsaArtTattoo.OrdersApi.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace IsaArtTattoo.OrdersApi.Infrastructure.Data;

public class OrdersDbContext : DbContext
{
    public OrdersDbContext(DbContextOptions<OrdersDbContext> options)
        : base(options)
    {
    }

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("orders");

            entity.Property(o => o.OrderNumber)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(o => o.OrderNumber)
                .IsUnique();

            entity.Property(o => o.UserId)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(o => o.Status)
                .HasConversion<int>(); // guarda enum como int

            entity.Property(o => o.PaymentStatus)
                .HasConversion<int>();

            entity.Property(o => o.TotalAmount)
                .HasColumnType("numeric(10,2)");

            entity.Property(o => o.Currency)
                .HasMaxLength(3)
                .HasDefaultValue("EUR");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.ToTable("order_items");

            entity.Property(oi => oi.ProductName)
                .IsRequired()
                .HasMaxLength(300);

            entity.Property(oi => oi.UnitPrice)
                .HasColumnType("numeric(10,2)");

            entity.Property(oi => oi.Subtotal)
                .HasColumnType("numeric(10,2)");

            entity.HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ✅ Configurar Cart
        modelBuilder.Entity<Cart>(entity =>
        {
            entity.ToTable("carts");
            entity.HasKey(c => c.UserId);

            entity.Property(c => c.UserId)
                .IsRequired()
                .HasMaxLength(200);

            entity.HasMany(c => c.Items)
                .WithOne(ci => ci.Cart)
                .HasForeignKey(ci => ci.CartUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // ✅ Configurar CartItem
        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.ToTable("cart_items");

            entity.HasKey(ci => new { ci.Id });

            entity.Property(ci => ci.CartUserId)
                .IsRequired()
                .HasMaxLength(200);
        });
    }
}
