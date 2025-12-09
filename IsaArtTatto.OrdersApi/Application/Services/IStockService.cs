namespace IsaArtTattoo.OrdersApi.Application.Services;

public interface IStockService
{
    /// <summary>
    /// Resta stock de los productos indicados.
    /// </summary>
    Task<bool> ReserveStockAsync(
        IEnumerable<(int ProductId, int Quantity)> items,
        CancellationToken ct = default);

    /// <summary>
    /// Devuelve stock (operación inversa).
    /// </summary>
    Task<bool> ReleaseStockAsync(
        IEnumerable<(int ProductId, int Quantity)> items,
        CancellationToken ct = default);
}
