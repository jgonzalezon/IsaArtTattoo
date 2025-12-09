namespace IsaArtTattoo.OrdersApi.Domain.Enums;

public enum OrderStatus
{
    Pending = 0,   // Creada, pendiente de revisión/confirmación
    Confirmed = 1, // Aceptada, stock reservado/descontado
    Shipped = 2,   // Enviada al cliente (Enviado)
    Delivered = 3, // Entregada al cliente (Recibido)
    Cancelled = 4  // Cancelada
}
