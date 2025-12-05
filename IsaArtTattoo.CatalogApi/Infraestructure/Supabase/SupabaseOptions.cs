namespace IsaArtTattoo.CatalogApi.Infrastructure.Supabase;

public class SupabaseOptions
{
    public const string SectionName = "Supabase";

    public string Url { get; set; } = default!;
    public string Bucket { get; set; } = default!;
    public string ServiceRoleKey { get; set; } = default!;
}
