using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Controllers;
using IsaArtTattoo.OrdersApi.Domain.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Orders.Test;

[TestFixture]
public class OrdersControllerTests
{
    private Mock<IUserOrdersService> _serviceMock = null!;

    [SetUp]
    public void Setup()
    {
        _serviceMock = new Mock<IUserOrdersService>();
    }

    private OrdersController CreateControllerWithUser(string userId)
    {
        var controller = new OrdersController(_serviceMock.Object);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId)
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext
        {
            User = principal
        };

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };

        return controller;
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

    #region CreateOrder

    [Test]
    public async Task CreateOrder_WhenValid_ReturnsCreatedAtWithOrder()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        var dto = new CreateOrderDto(
            new List<CreateOrderItemDto>
            {
                new CreateOrderItemDto(1, 2)
            });

        var createdOrder = CreateSampleOrderDetail(1, userId);

        _serviceMock
            .Setup(s => s.CreateOrderAsync(userId, dto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(createdOrder);

        // Act
        var result = await controller.CreateOrder(dto, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<CreatedAtActionResult>());
        var created = (CreatedAtActionResult)result.Result!;
        Assert.That(created.ActionName, Is.EqualTo(nameof(OrdersController.GetOrderById)));
        Assert.That(created.RouteValues!["id"], Is.EqualTo(createdOrder.Id));
        Assert.That(created.Value, Is.EqualTo(createdOrder));
    }

    #endregion

    #region GetMyOrders

    [Test]
    public async Task GetMyOrders_ReturnsOkWithOrders()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        var orders = new List<OrderListItemDto>
        {
            CreateSampleOrderListItem(1),
            CreateSampleOrderListItem(2)
        };

        _serviceMock
            .Setup(s => s.GetUserOrdersAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(orders);

        // Act
        var result = await controller.GetMyOrders(CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(orders));
    }

    #endregion

    #region GetOrderById

    [Test]
    public async Task GetOrderById_WhenOrderExists_ReturnsOkWithOrder()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        var order = CreateSampleOrderDetail(1, userId);

        _serviceMock
            .Setup(s => s.GetUserOrderByIdAsync(userId, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await controller.GetOrderById(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task GetOrderById_WhenOrderDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        _serviceMock
            .Setup(s => s.GetUserOrderByIdAsync(userId, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await controller.GetOrderById(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    #endregion

    #region CancelOrder

    [Test]
    public async Task CancelOrder_WhenOrderExists_ReturnsOkWithOrder()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        var order = CreateSampleOrderDetail(1, userId);

        _serviceMock
            .Setup(s => s.CancelOrderByUserAsync(userId, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await controller.CancelOrder(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task CancelOrder_WhenOrderDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        _serviceMock
            .Setup(s => s.CancelOrderByUserAsync(userId, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await controller.CancelOrder(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    #endregion

    #region SetPaid

    [Test]
    public async Task SetPaid_WhenOrderExists_ReturnsOkWithOrder()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        var order = CreateSampleOrderDetail(1, userId);

        _serviceMock
            .Setup(s => s.SetOrderPaidByUserAsync(userId, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(order);

        // Act
        var result = await controller.SetPaid(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task SetPaid_WhenOrderDoesNotExist_ReturnsNotFound()
    {
        // Arrange
        var userId = "user-123";
        var controller = CreateControllerWithUser(userId);

        _serviceMock
            .Setup(s => s.SetOrderPaidByUserAsync(userId, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync((OrderDetailDto?)null);

        // Act
        var result = await controller.SetPaid(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundResult>());
    }

    #endregion
}
