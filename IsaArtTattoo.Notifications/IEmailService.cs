namespace IsaArtTattoo.Notifications
{
    public interface IEmailService
    {
        Task SendWelcomeMail(string toEmail);
    }
}
