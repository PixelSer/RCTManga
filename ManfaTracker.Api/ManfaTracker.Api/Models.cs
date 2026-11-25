namespace MangaTracker.Api;

public enum ReadingStatus { Reading, Completed, Dropped }

public class MangaTitle
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public ReadingStatus Status { get; set; } = ReadingStatus.Reading;
    public int Rating { get; set; }
    public List<ChapterNote> Notes { get; set; } = [];
}

public class ChapterNote
{
    public int Id { get; set; }
    public int MangaTitleId { get; set; }
    public int ChapterNumber { get; set; }
    public string Text { get; set; } = string.Empty;
}

public record MangaDto(int Id, string Title, string Author, ReadingStatus Status, int Rating, int NotesCount);
public record CreateMangaDto(string Title, string Author, ReadingStatus Status, int Rating);
public record UpdateMangaDto(string Title, string Author, ReadingStatus Status, int Rating);
public record CreateNoteDto(int ChapterNumber, string Text);