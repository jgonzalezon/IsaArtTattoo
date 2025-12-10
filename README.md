# IsaArtTattoo

## Antiforgery en el catálogo de administración

Las operaciones de `/api/admin/catalog` se consumen exclusivamente con autenticación JWT enviada en el encabezado `Authorization` (sin cookies de sesión). Para evitar exigir tokens CSRF innecesarios en este flujo, la API de catálogo deshabilita explícitamente el antiforgery en todo el grupo de endpoints administrativos y el Api Gateway sigue aplicando únicamente la autorización por rol.

Flujo esperado:

1. El frontend obtiene el JWT tras el login y lo almacena (p. ej. en `localStorage`).
2. En cada petición `POST`/`PUT`/`DELETE` al catálogo admin se incluye `Authorization: Bearer <token>`.
3. No se necesita solicitar ni enviar encabezados como `RequestVerificationToken`, porque los endpoints administrativos no requieren antiforgery mientras se use autenticación por portador.

