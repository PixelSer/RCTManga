using Microsoft.EntityFrameworkCore;

namespace MangaTracker.Api;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<MangaTitle> MangaTitles => Set<MangaTitle>();
    public DbSet<ChapterNote> ChapterNotes => Set<ChapterNote>();
}