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
public class UserOrdersServiceTests
{
    private Mock<IOrdersService> _ordersServiceMock = null!;
    private IUserOrdersService _sut = null!;

    [SetUp]
    public void Setup()
    {
        _ordersServiceMock = new Mock<IOrdersService>();
        _sut = new UserOrdersService(_ordersServiceMock.Object);
    }

    private static OrderDetailDto CreateSampleOrderDetail(int id = 1, string userId = "user-123")
        => new(
            id,
            $"ORD-{id}",
            userId,
            OrderStatus.Pending,
            PaymentStatus.Unpaid,
            100m,
            "EUR",
            System.DateTime.UtcNow,
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
            System.DateTime.UtcNow,
            OrderStatus.Pending,
            PaymentStatus.Unpaid,
            100m);

    #region CreateOrderAsync

    [Test]
    public async Task CreateOrderAsync_DelegatesToIOrdersService()
    {
        // Arrange
        var userId = "user-123";
        var dto = new CreateOrderDto(
            new List<CreateOrderItemDto> { new CreateOrderItemDto(1, 2) });
        var expected = CreateSampleOrderDetail(1, userId);

        _ordersServiceMock
            .Setup(s => s.CreateOrderAsync(userId, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        // Act
        var result = await _sut.CreateOrderAsync(userId, dto, CancellationToken.None);

        // Assert
        Assert.That(result, Is.EqualTo(expected));
        _ordersServiceMock.Verify(s =>
            s.CreateOrderAsync(userId, dto, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetUserOrdersAsync

    [Test]
    public async Task GetUserOrdersAsync_DelegatesToIOrdersService()
    {
        // Arrange
        var userId = "user-123";
        var expected = new List<OrderListItemDto>
        {
            CreateSampleOrderListItem(1),
            CreateSampleOrderListItem(2)
        };

        _ordersServiceMock
            .Setup(s => s.GetUserOrdersAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        // Act
        var result = await _sut.GetUserOrdersAsync(userId, CancellationToken.None);

        // Assert
        Assert.That(result, Is.EqualTo(expected));
        _ordersServiceMock.Verify(s =>
            s.GetUserOrdersAsync(userId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region GetUserOrderByIdAsync

    [Test]
    public async Task GetUserOrderByIdAsync_DelegatesToIOrdersService()
    {
        // Arrange
        var userId = "user-123";
        var orderId = 1;
        var expected = CreateSampleOrderDetail(orderId, userId);

        _ordersServiceMock
            .Setup(s => s.GetUserOrderByIdAsync(userId, orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        // Act
        var result = await _sut.GetUserOrderByIdAsync(userId, orderId, CancellationToken.None);

        // Assert
        Assert.That(result, Is.EqualTo(expected));
        _ordersServiceMock.Verify(s =>
            s.GetUserOrderByIdAsync(userId, orderId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region CancelOrderByUserAsync

    [Test]
    public async Task CancelOrderByUserAsync_DelegatesToIOrdersService()
    {
        // Arrange
        var userId = "user-123";
        var orderId = 1;
        var expected = CreateSampleOrderDetail(orderId, userId);

        _ordersServiceMock
            .Setup(s => s.CancelOrderByUserAsync(userId, orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        // Act
        var result = await _sut.CancelOrderByUserAsync(userId, orderId, CancellationToken.None);

        // Assert
        Assert.That(result, Is.EqualTo(expected));
        _ordersServiceMock.Verify(s =>
            s.CancelOrderByUserAsync(userId, orderId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion

    #region SetOrderPaidByUserAsync

    [Test]
    public async Task SetOrderPaidByUserAsync_DelegatesToIOrdersService()
    {
        // Arrange
        var userId = "user-123";
        var orderId = 1;
        var expected = CreateSampleOrderDetail(orderId, userId);

        _ordersServiceMock
            .Setup(s => s.SetOrderPaidByUserAsync(userId, orderId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        // Act
        var result = await _sut.SetOrderPaidByUserAsync(userId, orderId, CancellationToken.None);

        // Assert
        Assert.That(result, Is.EqualTo(expected));
        _ordersServiceMock.Verify(s =>
            s.SetOrderPaidByUserAsync(userId, orderId, It.IsAny<CancellationToken>()), Times.Once);
    }

    #endregion
}
