using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using IsaArtTattoo.OrdersApi.Application.Dto;
using IsaArtTattoo.OrdersApi.Application.Services;
using IsaArtTattoo.OrdersApi.Controllers;
using IsaArtTattoo.OrdersApi.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Moq;
using NUnit.Framework;

namespace IsaArtTattoo.Api.Orders.Test;

[TestFixture]
public class AdminOrdersControllerTests
{
    private Mock<IAdminOrdersService> _serviceMock = null!;
    private AdminOrdersController _sut = null!;

    [SetUp]
    public void Setup()
    {
        _serviceMock = new Mock<IAdminOrdersService>();
        _sut = new AdminOrdersController(_serviceMock.Object);
    }

    private static OrderDetailDto CreateSampleOrderDetail(int id = 1)
        => new(
            id,
            $"ORD-{id}",
            "user-123",
            OrderStatus.Pending,
            PaymentStatus.Unpaid,
            100m,      // SubtotalAmount
            21m,       // TaxAmount
            121m,      // TotalAmount
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
            100m,      // SubtotalAmount
            21m,       // TaxAmount
            121m);     // TotalAmount

    #region GetAll

    [Test]
    public async Task GetAll_ReturnsOkWithOrders()
    {
        // Arrange
        var resultList = new List<OrderListItemDto>
        {
            CreateSampleOrderListItem(1),
            CreateSampleOrderListItem(2)
        };

        _serviceMock
            .Setup(s => s.GetAllOrdersAsync(null, null, null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderListResult(true, Orders: resultList));

        // Act
        var result = await _sut.GetAll(null, null, null, null, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(resultList));
    }

    #endregion

    #region GetById

    [Test]
    public async Task GetById_WhenFound_ReturnsOkWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _serviceMock
            .Setup(s => s.GetOrderByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(true, Order: order));

        // Act
        var result = await _sut.GetById(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task GetById_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.GetOrderByIdAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(false, Order: null, Error: "Pedido no encontrado."));

        // Act
        var result = await _sut.GetById(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result.Result!;
        Assert.That(nf.Value, Is.EqualTo("Pedido no encontrado."));
    }

    #endregion

    #region Confirm

    [Test]
    public async Task Confirm_WhenFound_ReturnsOkWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _serviceMock
            .Setup(s => s.ConfirmOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(true, Order: order));

        // Act
        var result = await _sut.Confirm(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task Confirm_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.ConfirmOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(false, Order: null, Error: "Pedido no encontrado."));

        // Act
        var result = await _sut.Confirm(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result.Result!;
        Assert.That(nf.Value, Is.EqualTo("Pedido no encontrado."));
    }

    #endregion

    #region SetPaid

    [Test]
    public async Task SetPaid_WhenFound_ReturnsOkWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _serviceMock
            .Setup(s => s.SetOrderPaidAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(true, Order: order));

        // Act
        var result = await _sut.SetPaid(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task SetPaid_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.SetOrderPaidAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(false, Order: null, Error: "Pedido no encontrado."));

        // Act
        var result = await _sut.SetPaid(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result.Result!;
        Assert.That(nf.Value, Is.EqualTo("Pedido no encontrado."));
    }

    #endregion

    #region Ship

    [Test]
    public async Task Ship_WhenFound_ReturnsOkWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _serviceMock
            .Setup(s => s.ShipOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(true, Order: order));

        // Act
        var result = await _sut.Ship(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task Ship_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.ShipOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(false, Order: null, Error: "Pedido no encontrado."));

        // Act
        var result = await _sut.Ship(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result.Result!;
        Assert.That(nf.Value, Is.EqualTo("Pedido no encontrado."));
    }

    #endregion

    #region Deliver

    [Test]
    public async Task Deliver_WhenFound_ReturnsOkWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _serviceMock
            .Setup(s => s.DeliverOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(true, Order: order));

        // Act
        var result = await _sut.Deliver(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task Deliver_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.DeliverOrderAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(false, Order: null, Error: "Pedido no encontrado."));

        // Act
        var result = await _sut.Deliver(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result.Result!;
        Assert.That(nf.Value, Is.EqualTo("Pedido no encontrado."));
    }

    #endregion

    #region Cancel

    [Test]
    public async Task Cancel_WhenFound_ReturnsOkWithOrder()
    {
        // Arrange
        var order = CreateSampleOrderDetail(1);

        _serviceMock
            .Setup(s => s.CancelOrderByAdminAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(true, Order: order));

        // Act
        var result = await _sut.Cancel(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<OkObjectResult>());
        var ok = (OkObjectResult)result.Result!;
        Assert.That(ok.Value, Is.EqualTo(order));
    }

    [Test]
    public async Task Cancel_WhenNotFound_ReturnsNotFound()
    {
        // Arrange
        _serviceMock
            .Setup(s => s.CancelOrderByAdminAsync(1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminOrderResult(false, Order: null, Error: "Pedido no encontrado."));

        // Act
        var result = await _sut.Cancel(1, CancellationToken.None);

        // Assert
        Assert.That(result.Result, Is.TypeOf<NotFoundObjectResult>());
        var nf = (NotFoundObjectResult)result.Result!;
        Assert.That(nf.Value, Is.EqualTo("Pedido no encontrado."));
    }

    #endregion
}
