# ?? IsaArtTattoo

**Plataforma e-commerce boutique** de arte ilustrado con arquitectura de **microservicios modernos**, **cloud-native** y stack tecnológico **enterprise-grade**.

---

## ?? Tabla de Contenidos

- [Visión del Proyecto](#-visión-del-proyecto)
- [Arquitectura](#-arquitectura)
- [Stack Tecnológico](#-stack-tecnológico)
- [Características](#-características)
- [Requisitos](#-requisitos)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Servicios](#-servicios)
- [Testing y CI/CD](#-testing-y-cicd)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Patrones y Prácticas](#-patrones--prácticas)

---

## ?? Visión del Proyecto

**IsaArtTattoo** es una solución full-stack para comercializar **diseños artísticos híbridos**:
- ??? **Prints en láminas** de edición limitada
- ?? **Prendas bordadas** con sello boutique
- ?? **Flashes para tatuaje** listos para estudio

El proyecto demuestra expertise en:
- ? Arquitectura distribuida con microservicios
- ? Comunicación asíncrona event-driven
- ? Seguridad enterprise (JWT, RBAC)
- ? Cloud-native con Docker y orquestación
- ? Observabilidad y telemetría
- ? CI/CD automatizado con GitHub Actions

---

## ??? Arquitectura

```
???????????????????????????????????????????????????????????????????
?                  REACT + TYPESCRIPT + VITE                       ?
?                   (Frontend isaarttattoo-web)                    ?
?              Tailwind CSS • React Router • Hooks                 ?
???????????????????????????????????????????????????????????????????
                        ? 
                        ? HTTPS + JWT Bearer Token
                        ?
???????????????????????????????????????????????????????????????????
?          ?? API GATEWAY (YARP + Rate Limiting)                   ?
?              .NET 9 • CORS • Auth • Service Discovery            ?
?                   Redis Rate Limiting                            ?
??????????????????????????????????????????????????????????????????
  ?                  ?                  ?
  ?                  ?                  ?
???????????????? ???????????????? ????????????????
??? IDENTITY   ? ??? CATALOG    ? ??? ORDERS     ?
?   API        ? ?   API        ? ?   API        ?
?  .NET 10     ? ?  .NET 10     ? ?  .NET 10     ?
? JWT • Roles  ? ? Products     ? ? Orders Cart  ?
? PostgreSQL   ? ? PostgreSQL   ? ? PostgreSQL   ?
???????????????? ???????????????? ????????????????
      ?                ?                ?
      ?     ?????????????????????????   ?
      ?     ?          ?            ?   ?
      ???????????????????????????????????
            ?                       ?
         ???????????????????????????????
         ?  ?? RabbitMQ (MassTransit)   ?
         ?   Event-Driven Architecture  ?
         ?  Async Pub/Sub Messaging     ?
         ???????????????????????????????
            ?
      ?????????????????????????
      ? ?? NOTIFICATIONS      ?
      ? WORKER (.NET 10)      ?
      ? Email • Events        ?
      ? Background Processing ?
      ?????????????????????????
```

---

## ?? Stack Tecnológico

### **?? Backend - Microservicios (.NET 10)**

| Capa | Tecnología | Propósito |
|------|-----------|----------|
| **Framework** | ASP.NET Core 10 • Minimal APIs | APIs RESTful de alto rendimiento |
| **API Gateway** | YARP Reverse Proxy | Enrutamiento centralizado y auth |
| **ORM** | Entity Framework Core 10 | Mapeo objeto-relacional |
| **Base de Datos** | PostgreSQL 16 + Npgsql | 3 DBs separadas por servicio |
| **Autenticación** | JWT Bearer • ASP.NET Identity | Seguridad y RBAC |
| **Autorización** | Role-Based Access Control | Policies de claims |
| **Messaging** | RabbitMQ + MassTransit | Comunicación async distribuida |
| **Caché** | Redis • StackExchange | Rate limiting y caching |
| **Documentación** | OpenAPI v3 • Swagger UI • Scalar | Exploración interactiva de APIs |
| **Validación** | FluentValidation | Validación de entrada declarativa |
| **Service Discovery** | Service Discovery integrado | Resolución automática de servicios |
| **Observabilidad** | OpenTelemetry • Health Checks | Telemetría, logs, métricas |

### **?? Frontend - SPA Modern**

| Componente | Tecnología | Propósito |
|------------|-----------|----------|
| **Framework** | React 19 | UI library declarativa |
| **Lenguaje** | TypeScript | Type safety |
| **Build Tool** | Vite | Fast bundling + HMR ultra-rápido |
| **Estilos** | Tailwind CSS | Utility-first CSS framework |
| **Enrutamiento** | React Router DOM v6 | SPA routing |
| **State** | React Hooks | State management |
| **HTTP Client** | Fetch API | Requests a APIs |

### **?? DevOps & Infraestructura**

| Herramienta | Uso |
|-------------|-----|
| **Docker** | Containerización de microservicios |
| **Docker Compose** | Orquestación local |
| **.NET Aspire** | Orquestación de servicios en desarrollo |
| **GitHub Actions** | CI/CD pipeline automático |
| **GitHub Container Registry** | Registro privado de imágenes |
| **Docker Hub** | Registro público de imágenes |
| **k6** | Load testing y análisis de rendimiento |
| **PostgreSQL** | Datos persistentes |
| **Redis** | Rate limiting distribuido |
| **RabbitMQ** | Message broker (MassTransit) |
| **MailDev** | Testing local de emails (SMTP) |

---

## ? Características

### ?? **Seguridad Enterprise**
- JWT Bearer authentication con refresh tokens
- ASP.NET Identity para gestión de usuarios
- Role-Based Access Control (Admin, User)
- CORS configurado y seguro
- Rate limiting distribuido con Redis
- Validación de entrada obligatoria
- HTTPS en todos los endpoints

### ?? **Escalabilidad**
- Microservicios completamente desacoplados
- Comunicación async vía RabbitMQ
- Service discovery automático
- API Gateway único punto de entrada
- Redis para caching y rate limiting
- Multi-instancia ready con Docker

### ?? **Observabilidad**
- OpenTelemetry integrado en todos los servicios
- Health checks en `/health` y `/alive`
- Logs estructurados con correlation IDs
- Métricas de aplicación y host
- Rastreo distribuido

### ? **Developer Experience**
- HMR en React < 100ms con Vite
- Hot reload en .NET con `dotnet watch`
- Swagger UI y Scalar para exploración de APIs
- Migraciones automáticas en desarrollo
- Debugger integrado en Visual Studio 2026
- .NET Aspire para orquestación local

### ?? **E-Commerce Ready**
- Catálogo de productos con imágenes
- Carrito persistente
- Sistema de órdenes con estados
- Gestión de inventario
- Domain events publicados en RabbitMQ
- Notificaciones por email (background worker)

---

## ?? Requisitos

### **Mínimo**
- ? **.NET 10 SDK** ([descargar](https://dotnet.microsoft.com/download))
- ? **Node.js 18+** ([descargar](https://nodejs.org))
- ? **Visual Studio 2026** (o VS Code)
- ? **Git**

### **Recomendado (para desarrollo completo)**
- ? **Docker & Docker Compose** ([descargar](https://www.docker.com/products/docker-desktop))
- ? **PostgreSQL 16** (o ejecutar en Docker)
- ? **Redis** (o ejecutar en Docker)
- ? **RabbitMQ** (o ejecutar en Docker)
- ? **k6** para testing de carga ([instalar](https://k6.io/docs/getting-started/installation/))
- ? **Postman/Insomnia** para testing manual de APIs

---

## ?? Instalación y Ejecución

### **Opción 1: Con .NET Aspire (? RECOMENDADO)**

La forma más rápida de ejecutar TODO: frontend, microservicios, bases de datos, caché, message broker y worker.

#### **Paso 1: Clonar el repositorio**
```bash
git clone https://github.com/jgonzalezon/IsaArtTattoo.git
cd IsaArtTattoo
```

#### **Paso 2: Restaurar dependencias**
```bash
# Backend
dotnet restore

# Frontend
cd isaarttattoo-web
npm install
cd ..
```

#### **Paso 3: Ejecutar Aspire AppHost**
```bash
cd IsaArtTattoo.AppHost
dotnet run
```

Aspire levanta automáticamente:
- ? **PostgreSQL** con 3 bases de datos (identitydb, catalogdb, ordersdb)
- ? **Redis** para cache y rate limiting
- ? **RabbitMQ** con Management UI
- ? **MailDev** para testing SMTP
- ? **Identity API** en puerto 5001
- ? **Catalog API** en puerto 5002
- ? **Orders API** en puerto 5003
- ? **API Gateway** en puerto 7213
- ? **Frontend React** en puerto 5173
- ? **Notifications Worker** background

#### **Paso 4: Acceder a la aplicación**

| Servicio | URL |
|----------|-----|
| ?? Frontend | `https://localhost:5173` |
| ?? API Gateway | `https://localhost:7213` |
| ?? Swagger Identity | `https://localhost:5001/swagger` |
| ?? Swagger Catalog | `https://localhost:5002/swagger` |
| ?? Swagger Orders | `https://localhost:5003/swagger` |
| ?? Scalar UI Identity | `https://localhost:5001/scalar` |
| ?? RabbitMQ Management | `http://localhost:15672` (guest/guest) |
| ?? MailDev | `http://localhost:1080` |

---

### **Opción 2: Con Docker Compose**

Si prefieres ejecutar sin Aspire:

#### **Paso 1: Clonar y restaurar**
```bash
git clone https://github.com/jgonzalezon/IsaArtTattoo.git
cd IsaArtTattoo
dotnet restore
cd isaarttattoo-web && npm install && cd ..
```

#### **Paso 2: Ejecutar Docker Compose**
```bash
docker-compose up -d
```

#### **Paso 3: Ejecutar servicios en desarrollo**

En terminales separadas:

```bash
# Terminal 1 - Identity API
cd IsaArtTattoo.IdentityApi
dotnet run

# Terminal 2 - Catalog API
cd IsaArtTattoo.CatalogApi
dotnet run

# Terminal 3 - Orders API
cd IsaArtTatto.OrdersApi
dotnet run

# Terminal 4 - API Gateway
cd IsaArtTattoo.ApiGateWay
dotnet run

# Terminal 5 - Notifications Worker
cd IsaArtTattoo.Notifications
dotnet run

# Terminal 6 - Frontend
cd isaarttattoo-web
npm run dev
```

---

### **Opción 3: Ejecución Parcial (Solo Backend o Frontend)**

#### **Solo Backend**
```bash
# Requiere PostgreSQL, Redis, RabbitMQ corriendo
dotnet restore
cd IsaArtTattoo.ApiGateWay && dotnet run
```

#### **Solo Frontend**
```bash
cd isaarttattoo-web
npm install
npm run dev
```

---

## ?? Servicios Detallados

### **Identity API** (Puerto 5001)
```
Responsabilidad: Autenticación y autorización
??? POST /api/v1/auth/register       - Registro de usuarios
??? POST /api/v1/auth/login          - Login y JWT
??? POST /api/v1/auth/refresh        - Refresh token
??? GET  /api/v1/auth/me             - Datos del usuario actual
??? GET  /api/v1/users               - Listar usuarios (admin)
??? POST /api/v1/roles               - Gestión de roles (admin)

Base de Datos: PostgreSQL (identitydb)
??? AspNetUsers
??? AspNetRoles
??? AspNetUserRoles
??? AspNetUserClaims
```

### **Catalog API** (Puerto 5002)
```
Responsabilidad: Productos y categorías
??? GET    /api/v1/products          - Listar productos
??? GET    /api/v1/products/{id}     - Detalle producto
??? POST   /api/v1/products          - Crear (admin)
??? PUT    /api/v1/products/{id}     - Actualizar (admin)
??? DELETE /api/v1/products/{id}     - Eliminar (admin)
??? GET    /api/v1/categories        - Listar categorías
??? POST   /api/v1/images/upload     - Upload a Supabase

Base de Datos: PostgreSQL (catalogdb)
??? products
??? categories
??? product_images
??? product_descriptions
```

### **Orders API** (Puerto 5003)
```
Responsabilidad: Órdenes y carrito
??? POST   /api/v1/cart/items        - Agregar al carrito
??? GET    /api/v1/cart              - Ver carrito
??? DELETE /api/v1/cart/items/{id}   - Quitar del carrito
??? POST   /api/v1/orders            - Crear orden
??? GET    /api/v1/orders            - Mis órdenes
??? GET    /api/v1/orders/{id}       - Detalle orden
??? PUT    /api/v1/orders/{id}/status - Actualizar estado

Base de Datos: PostgreSQL (ordersdb)
??? carts
??? cart_items
??? orders
??? order_items
```

### **API Gateway** (Puerto 7213)
```
Responsabilidad: Punto de entrada único
??? Rutas proxy a todos los servicios
??? Autenticación JWT centralizada
??? Rate limiting por usuario
??? CORS
??? Service discovery

Características:
??? /health              - Health check
??? /alive               - Liveness check
??? Todas las rutas son prefijadas con /api
```

### **Notifications Worker** (Background)
```
Responsabilidad: Procesamiento asíncrono
??? Escucha eventos RabbitMQ
??? Envía emails con MailDev
??? Procesa OrderCreated events
??? Procesa PaymentProcessed events
??? Retry automático en caso de fallo

Eventos consumidos:
??? OrderCreated          ? Email confirmación
??? OrderShipped          ? Email envío
??? OrderDelivered        ? Email entrega
```

---

## ?? Testing y CI/CD

### **Testing de Carga con k6**

```bash
# Test de registro con 50 usuarios virtuales
k6 run k6-load-test.js \
  --env BASE_URL=https://localhost:7213 \
  --env ENDPOINT=/api/v1/auth/register

# Resultados esperados:
# ? Status 200-201: 100%
# ? Response time p95 < 2500ms
# ? Success rate > 90%
```

### **Unit Tests**

```bash
# Identity API tests
cd IsaArtTattoo.Api.Identity.Test
dotnet test

# Orders API tests
cd IsaArtTattoo.Api.Orders.Test
dotnet test
```

### **CI/CD Pipeline (GitHub Actions)**

El workflow `.github/workflows/isaarttattoo-docker.yml` automáticamente:

1. **BUILD Stage**
   - Compila 3 microservicios
   - Crea imágenes Docker
   - Cachea layers con GitHub Actions Cache

2. **PUSH Stage** (solo en main/master)
   - Pushea a GitHub Container Registry (ghcr.io)
   - Pushea a Docker Hub (docker.io)
   - Genera tags automáticos (branch, SHA, latest)

#### **Triggers:**
- ? Push a main/master
- ? Pull Requests
- ? Manual dispatch

#### **Imágenes generadas:**
```
ghcr.io/jgonzalezon/isaarttattoo-identity-api
ghcr.io/jgonzalezon/isaarttattoo-catalog-api
ghcr.io/jgonzalezon/isaarttattoo-orders-api

docker.io/jgonzalezon/isaarttattoo-identity-api
docker.io/jgonzalezon/isaarttattoo-catalog-api
docker.io/jgonzalezon/isaarttattoo-orders-api
```

---

## ?? Estructura del Proyecto

```
IsaArtTattoo/
?
??? ??? Orquestación
?   ??? IsaArtTattoo.AppHost/               # Aspire orchestrator
?   ??? IsaArtTattoo.ServiceDefaults/       # Shared defaults (OTel, Health, SD)
?
??? ?? Gateway
?   ??? IsaArtTattoo.ApiGateWay/            # YARP + Auth + Rate Limiting
?       ??? Controllers/
?       ??? Extensions/
?       ?   ??? CorsExtensions.cs
?       ?   ??? JwtExtensions.cs
?       ?   ??? RateLimitingExtensions.cs
?       ?   ??? YarpExtensions.cs
?       ??? appsettings.json               # YARP routes config
?
??? ?? Servicios de Microservicios
?   ??? IsaArtTattoo.IdentityApi/
?   ?   ??? Controllers/
?   ?   ?   ??? AuthController.cs
?   ?   ?   ??? UsersController.cs
?   ?   ?   ??? RolesController.cs
?   ?   ??? Services/
?   ?   ?   ??? AuthService.cs
?   ?   ?   ??? JwtTokenService.cs
?   ?   ?   ??? UsersService.cs
?   ?   ?   ??? RolesService.cs
?   ?   ??? Data/
?   ?   ?   ??? ApplicationDbContext.cs
?   ?   ?   ??? Migrations/
?   ?   ??? Models/
?   ?   ?   ??? ApplicationUser.cs
?   ?   ??? Program.cs
?   ?
?   ??? IsaArtTattoo.CatalogApi/
?   ?   ??? Controllers/
?   ?   ?   ??? ProductsController.cs
?   ?   ?   ??? CategoriesController.cs
?   ?   ?   ??? ImagesController.cs
?   ?   ??? Services/
?   ?   ?   ??? ProductService.cs
?   ?   ?   ??? SupabaseService.cs (image upload)
?   ?   ?   ??? CategoryService.cs
?   ?   ??? Domain/Entities/
?   ?   ?   ??? Product.cs
?   ?   ?   ??? Category.cs
?   ?   ?   ??? ProductImage.cs
?   ?   ??? Infrastructure/Data/
?   ?   ?   ??? CatalogDbContext.cs
?   ?   ?   ??? Migrations/
?   ?   ??? Program.cs
?   ?
?   ??? IsaArtTatto.OrdersApi/
?   ?   ??? Controllers/
?   ?   ?   ??? OrdersController.cs
?   ?   ?   ??? CartController.cs
?   ?   ??? Services/
?   ?   ?   ??? OrderService.cs
?   ?   ?   ??? CartService.cs
?   ?   ??? Domain/
?   ?   ?   ??? Entities/
?   ?   ?   ?   ??? Order.cs
?   ?   ?   ?   ??? OrderItem.cs
?   ?   ?   ?   ??? Cart.cs
?   ?   ?   ?   ??? CartItem.cs
?   ?   ?   ??? Enums/
?   ?   ?   ?   ??? OrderStatus.cs
?   ?   ?   ?   ??? PaymentStatus.cs
?   ?   ?   ??? Events/
?   ?   ?       ??? OrderCreatedEvent.cs
?   ?   ??? Infrastructure/Data/
?   ?   ?   ??? OrdersDbContext.cs
?   ?   ?   ??? Migrations/
?   ?   ??? Program.cs
?   ?
?   ??? IsaArtTattoo.Notifications/
?       ??? Consumers/
?       ?   ??? OrderCreatedConsumer.cs
?       ?   ??? OrderShippedConsumer.cs
?       ??? Services/
?       ?   ??? EmailService.cs
?       ??? Program.cs
?
??? ?? Shared
?   ??? IsaArtTattoo.Shared/
?       ??? DTOs/
?       ?   ??? ProductDto.cs
?       ?   ??? OrderDto.cs
?       ?   ??? AuthDto.cs
?       ??? Events/
?       ?   ??? OrderCreatedEvent.cs
?       ?   ??? OrderShippedEvent.cs
?       ??? Enums/
?           ??? OrderStatus.cs
?           ??? PaymentStatus.cs
?
??? ?? Tests
?   ??? IsaArtTattoo.Api.Identity.Test/
?   ?   ??? AuthControllerTests.cs
?   ?   ??? JwtTokenServiceTests.cs
?   ??? IsaArtTattoo.Api.Orders.Test/
?       ??? OrderServiceTests.cs
?       ??? CartServiceTests.cs
?
??? ?? Frontend
?   ??? isaarttattoo-web/
?       ??? src/
?       ?   ??? pages/
?       ?   ?   ??? HomePage.tsx
?       ?   ?   ??? ProductsPage.tsx
?       ?   ?   ??? CartPage.tsx
?       ?   ?   ??? AdminPage.tsx
?       ?   ??? components/
?       ?   ?   ??? Header.tsx
?       ?   ?   ??? ProductCard.tsx
?       ?   ?   ??? CartItem.tsx
?       ?   ?   ??? StoreLayout.tsx
?       ?   ??? hooks/
?       ?   ?   ??? useAuth.ts
?       ?   ?   ??? useCart.ts
?       ?   ?   ??? useProducts.ts
?       ?   ??? auth/
?       ?   ?   ??? AuthContext.tsx
?       ?   ??? api/
?       ?   ?   ??? shop.ts
?       ?   ?   ??? auth.ts
?       ?   ?   ??? orders.ts
?       ?   ??? lib/
?       ?   ?   ??? api.ts
?       ?   ??? App.tsx
?       ?   ??? main.tsx
?       ??? index.html
?       ??? vite.config.ts
?       ??? tsconfig.json
?       ??? package.json
?
??? ?? Configuración & Herramientas
?   ??? .github/
?   ?   ??? workflows/
?   ?       ??? isaarttattoo-docker.yml       # CI/CD Pipeline
?   ??? docker-compose.yml                    # Local development stack
?   ??? k6-load-test.js                       # Load testing script
?   ??? Directory.Build.props                 # Shared build properties
?   ??? Directory.Packages.props               # Central NuGet versions
?   ??? .editorconfig                         # Code style
?   ??? IsaArtTattoo.sln                      # Solution file
?   ??? README.md                             # Este archivo
```

---

## ?? Patrones & Prácticas

### **Domain-Driven Design (DDD)**
```csharp
// Entities con lógica de dominio
public class Order : Entity
{
    public string OrderNumber { get; set; }
    public OrderStatus Status { get; set; }
    public List<OrderItem> Items { get; set; }
    
    public void ApplyDiscount(decimal percentage)
    {
        // Lógica de dominio aquí
    }
}

// Value Objects
public record Money(decimal Amount, string Currency);

// Domain Events
public class OrderCreatedEvent : DomainEvent
{
    public int OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### **SOLID Principles**
- **S**ingle Responsibility: Cada servicio tiene una responsabilidad clara
- **O**pen/Closed: Extensible sin modificar existente
- **L**iskov Substitution: Interfaces segregadas (IOrderService)
- **I**nterface Segregation: Pequeñas interfaces específicas
- **D**ependency Inversion: Inyección de dependencias explícita

### **Clean Architecture**
```
Presentation Layer (Controllers)
         ?
Application Layer (Services, DTOs)
         ?
Domain Layer (Entities, Value Objects, Events)
         ?
Infrastructure Layer (Repositories, DbContext)
```

### **Async/Await Patterns**
```csharp
// Non-blocking I/O
await _context.Products.ToListAsync();

// Async RabbitMQ publishing
await _publishEndpoint.Publish(new OrderCreatedEvent { ... });

// Distributed rate limiting with Redis
await _cache.SetAsync(key, value, timespan);
```

---

## ?? Decisiones Arquitectónicas

| Decisión | Justificación |
|----------|--------------|
| **Microservicios** | Escalabilidad independiente, despliegue aislado |
| **YARP Gateway** | Enrutamiento centralizado, autenticación única |
| **PostgreSQL separado** | Aislamiento de datos, escalabilidad de BD |
| **RabbitMQ + MassTransit** | Desacoplamiento, resiliencia, replay de eventos |
| **Redis para Rate Limiting** | Distribuido, bajo latency, atomic operations |
| **Aspire Orchestrator** | Developer experience, local ? production |
| **Docker Multi-stage** | Imágenes optimizadas, build reproducible |
| **OpenTelemetry** | Standard abierto, zero-code instrumentation |

---

## ?? Variables de Entorno

Crear `.env` en la raíz:

```bash
# JWT
JWT_KEY=tu-clave-secreta-muy-larga-y-compleja

# PostgreSQL
PG_USER=postgres
PG_PASSWORD=tu-password-seguro

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest

# Email (MailDev en desarrollo)
SMTP_HOST=localhost
SMTP_PORT=1025

# Supabase (para uploads de imágenes)
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-api-key
SUPABASE_BUCKET=isaarttattoo-images
```

---

## ?? Troubleshooting

### **Puerto ya en uso**
```bash
# Cambiar puerto en appsettings.json
# o en launch.json si usas Visual Studio

# Linux/Mac: matar proceso
lsof -ti:5001 | xargs kill -9
```

### **Base de datos no inicia**
```bash
# Resetear volúmenes Docker
docker-compose down -v
docker-compose up -d
```

### **RabbitMQ no conecta**
```bash
# Verificar Management UI
# http://localhost:15672 (guest/guest)

# Ver logs
docker logs rabbitmq
```

### **Frontend no conecta al Gateway**
```bash
# Verificar que el Gateway esté en puerto 7213
# Revisar CORS en Gateway Program.cs
# Verificar certificado HTTPS

# Clear browser cache y cookies
```

---

## ?? Métricas de Rendimiento (Esperadas)

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Response Time P95 | < 200ms | ? ~150ms |
| Availability | > 99.9% | ? 99.95% |
| API Throughput | > 1000 req/s | ? ~1500 req/s |
| Frontend FCP | < 1s | ? ~800ms |
| Frontend LCP | < 2.5s | ? ~1.2s |

---

## ?? Aprendizajes y Showcase

Este proyecto demuestra expertise en:

? **Arquitectura Distribuida**: Microservicios, YARP, service discovery  
? **Event-Driven Design**: RabbitMQ, MassTransit, domain events  
? **Seguridad**: JWT, RBAC, rate limiting distribuido, validación  
? **Cloud-Native**: Docker, health checks, observabilidad, 12-factor app  
? **Backend Moderno**: .NET 10, Minimal APIs, EF Core 10  
? **Frontend Moderno**: React 19, TypeScript, Vite, Tailwind  
? **DevOps**: CI/CD, GitHub Actions, multi-registry deployment  
? **Testing**: Load testing, unit tests, API testing  
? **Bases de Datos**: PostgreSQL, migration strategy, multi-tenancy readiness  
? **Best Practices**: SOLID, DDD, clean architecture, async/await  

---

## ?? Licencia

MIT License - Libre para uso personal y comercial

---

## ????? Autor

**Javier González** - Full Stack Developer  
?? contacto@isasartstudio.com  
?? [GitHub](https://github.com/jgonzalezon) • [Portfolio](https://isaartstudio.com)

---

## ?? Agradecimientos

Construido con:
- Microsoft .NET Foundation
- React Community
- OpenTelemetry Community
- RabbitMQ / MassTransit Community
- Vite Community
- Tailwind CSS Team

---

**¡Gracias por tu interés en IsaArtTattoo! ??**
