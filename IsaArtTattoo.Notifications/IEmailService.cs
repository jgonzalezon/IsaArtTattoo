namespace IsaArtTattoo.Notifications
{
    public interface IEmailService
    {
        Task SendWelcomeMail(string toEmail);
        Task SendConfirmationEmail(string toEmail, string confirmationUrl);
        Task SendPasswordResetEmail(string toEmail, string resetUrl);
    }
}
