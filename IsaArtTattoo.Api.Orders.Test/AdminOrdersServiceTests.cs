using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Domain.Enums;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Orders.Test;

[TestFixture]
public class AdminOrdersServiceTests
{
    private Mock<IOrdersService> _ordersServiceMock = null!;
    private IAdminOrdersService _sut = null!;

    [SetUp]
    public void Setup()
    {
        _ordersServiceMock = new Mock<IOrdersService>();
        _sut = new AdminOrdersService(_ordersServiceMock.Object);
    }

    private static OrderDetailDto CreateSampleOrderDetail(int id = 1)
        => new(
            id,
            $"ORD-{id}",
            "user-123",
            OrderStatus.Pending,
            PaymentStatus.Unpaid,
            100m,
            "EUR",
            DateTime.UtcNow,
            null,
            null,
            null,
            null,
            null,
            new List<OrderItemDto>());

    private static OrderListItemDto CreateSampleOrderListItem(int id = 1)
        => new(
            id,
            $"ORD-{id}",
            DateTime.UtcNow,
            OrderStatus.Pending,
            PaymentStatus.Unpaid,
            100m);

    #region GetAllOrdersAsync

    [Test]
    public async Task GetAllOrdersAsync_ReturnsSucceededWithOrders()
    {
        // Arrange
        var orders = new List<OrderListItemDto>
        {
            CreateSampleOrderListItem(1),
            CreateSampleOrderListItem(2)
        };

        _ordersServiceMock
            .Setup(s => s.GetAllOrdersAsync(null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orders);

        // Act
        var result = await _sut.GetAllOrdersAsync(null, null, null, null, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Orders, Is.EqualTo(orders));
    }

    #endregion

    #region GetOrderByIdAsync

    [Test]
    public async Task GetOrderByIdAsync_WhenOrderExists_ReturnsSucceededWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _ordersServiceMock
            .Setup(s => s.GetOrderByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _sut.GetOrderByIdAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Order, Is.EqualTo(order));
        Assert.That(result.Error, Is.Null);
    }

    [Test]
    public async Task GetOrderByIdAsync_WhenOrderDoesNotExist_ReturnsFailed()
    {
        // Arrange
        _ordersServiceMock
            .Setup(s => s.GetOrderByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await _sut.GetOrderByIdAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Order, Is.Null);
        Assert.That(result.Error, Is.EqualTo("Pedido con id 1 no encontrado."));
    }

    #endregion

    #region ConfirmOrderAsync

    [Test]
    public async Task ConfirmOrderAsync_WhenOrderExists_ReturnsSucceededWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _ordersServiceMock
            .Setup(s => s.ConfirmOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _sut.ConfirmOrderAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Order, Is.EqualTo(order));
    }

    [Test]
    public async Task ConfirmOrderAsync_WhenOrderDoesNotExist_ReturnsFailed()
    {
        // Arrange
        _ordersServiceMock
            .Setup(s => s.ConfirmOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await _sut.ConfirmOrderAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Order, Is.Null);
        Assert.That(result.Error, Does.Contain("no se ha podido confirmar").IgnoreCase
                                .Or.EqualTo("No se ha podido confirmar. Pedido con id 1 no encontrado."));
    }

    #endregion

    #region SetOrderPaidAsync

    [Test]
    public async Task SetOrderPaidAsync_WhenOrderExists_ReturnsSucceededWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _ordersServiceMock
            .Setup(s => s.SetOrderPaidAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _sut.SetOrderPaidAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Order, Is.EqualTo(order));
    }

    [Test]
    public async Task SetOrderPaidAsync_WhenOrderDoesNotExist_ReturnsFailed()
    {
        // Arrange
        _ordersServiceMock
            .Setup(s => s.SetOrderPaidAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await _sut.SetOrderPaidAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Order, Is.Null);
        Assert.That(result.Error, Does.Contain("no se ha podido marcar como pagado").IgnoreCase
                                .Or.EqualTo("No se ha podido marcar como pagado. Pedido con id 1 no encontrado."));
    }

    #endregion

    #region ShipOrderAsync

    [Test]
    public async Task ShipOrderAsync_WhenOrderExists_ReturnsSucceededWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _ordersServiceMock
            .Setup(s => s.ShipOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _sut.ShipOrderAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Order, Is.EqualTo(order));
    }

    [Test]
    public async Task ShipOrderAsync_WhenOrderDoesNotExist_ReturnsFailed()
    {
        // Arrange
        _ordersServiceMock
            .Setup(s => s.ShipOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await _sut.ShipOrderAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Order, Is.Null);
        Assert.That(result.Error, Does.Contain("no se ha podido marcar como enviado").IgnoreCase
                                .Or.EqualTo("No se ha podido marcar como enviado. Pedido con id 1 no encontrado."));
    }

    #endregion

    #region DeliverOrderAsync

    [Test]
    public async Task DeliverOrderAsync_WhenOrderExists_ReturnsSucceededWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _ordersServiceMock
            .Setup(s => s.DeliverOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _sut.DeliverOrderAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Order, Is.EqualTo(order));
    }

    [Test]
    public async Task DeliverOrderAsync_WhenOrderDoesNotExist_ReturnsFailed()
    {
        // Arrange
        _ordersServiceMock
            .Setup(s => s.DeliverOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await _sut.DeliverOrderAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Order, Is.Null);
        Assert.That(result.Error, Does.Contain("no se ha podido marcar como entregado").IgnoreCase
                                .Or.EqualTo("No se ha podido marcar como entregado. Pedido con id 1 no encontrado."));
    }

    #endregion

    #region CancelOrderByAdminAsync

    [Test]
    public async Task CancelOrderByAdminAsync_WhenOrderExists_ReturnsSucceededWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _ordersServiceMock
            .Setup(s => s.CancelOrderByAdminAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await _sut.CancelOrderByAdminAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.True);
        Assert.That(result.Order, Is.EqualTo(order));
    }

    [Test]
    public async Task CancelOrderByAdminAsync_WhenOrderDoesNotExist_ReturnsFailed()
    {
        // Arrange
        _ordersServiceMock
            .Setup(s => s.CancelOrderByAdminAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await _sut.CancelOrderByAdminAsync(1, CancellationToken.None);

        // Assert
        Assert.That(result.Succeeded, Is.False);
        Assert.That(result.Order, Is.Null);
        Assert.That(result.Error, Does.Contain("no se ha podido cancelar").IgnoreCase
                                .Or.EqualTo("No se ha podido cancelar. Pedido con id 1 no encontrado."));
    }

    #endregion
}
