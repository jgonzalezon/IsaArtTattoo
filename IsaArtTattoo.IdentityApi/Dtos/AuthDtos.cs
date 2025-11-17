namespace IsaArtTattoo.IdentityApi.Dtos;

//Validaciones en los DTOs

public record RegisterDto(string Email, string Password);
public record LoginDto(string Email, string Password);
public record ResetDto(string Email);
public record NewPasswordDto(string Email, string Token, string NewPassword);
public record ResendConfirmDto(string Email);
