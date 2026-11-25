using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MangaTracker.Api;

[ApiController]
[Route("api/[controller]")]
public class MangaController(AppDbContext db) : ControllerBase
{
    // GET api/manga?search=chainsaw&status=Reading&minRating=7
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MangaDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] ReadingStatus? status,
        [FromQuery] int? minRating)
    {
        var query = db.MangaTitles.Include(m => m.Notes).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m => m.Title.Contains(search) || m.Author.Contains(search));

        if (status.HasValue)
            query = query.Where(m => m.Status == status.Value);

        if (minRating.HasValue)
            query = query.Where(m => m.Rating >= minRating.Value);

        var items = await query
            .Select(m => new MangaDto(m.Id, m.Title, m.Author, m.Status, m.Rating, m.Notes.Count))
            .ToListAsync();

        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<MangaTitle>> GetById(int id)
    {
        var item = await db.MangaTitles.Include(m => m.Notes).FirstOrDefaultAsync(m => m.Id == id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<MangaDto>> Create(CreateMangaDto dto)
    {
        var entity = new MangaTitle
        {
            Title = dto.Title,
            Author = dto.Author,
            Status = dto.Status,
            Rating = dto.Rating
        };
        db.MangaTitles.Add(entity);
        await db.SaveChangesAsync();

        var result = new MangaDto(entity.Id, entity.Title, entity.Author, entity.Status, entity.Rating, 0);
        return CreatedAtAction(nameof(GetById), new { id = entity.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateMangaDto dto)
    {
        var entity = await db.MangaTitles.FindAsync(id);
        if (entity is null) return NotFound();

        entity.Title = dto.Title;
        entity.Author = dto.Author;
        entity.Status = dto.Status;
        entity.Rating = dto.Rating;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MangaTitles.FindAsync(id);
        if (entity is null) return NotFound();

        db.MangaTitles.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Вторая модель: добавление заметки к главе
    [HttpPost("{mangaId:int}/notes")]
    public async Task<ActionResult<ChapterNote>> AddNote(int mangaId, CreateNoteDto dto)
    {
        var exists = await db.MangaTitles.AnyAsync(m => m.Id == mangaId);
        if (!exists) return NotFound();

        var note = new ChapterNote
        {
            MangaTitleId = mangaId,
            ChapterNumber = dto.ChapterNumber,
            Text = dto.Text
        };
        db.ChapterNotes.Add(note);
        await db.SaveChangesAsync();
        return Ok(note);
    }
}