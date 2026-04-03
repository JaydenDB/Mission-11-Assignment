using BookstoreApi.Data;
using BookstoreApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookstoreApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreDbContext _db;

    public BooksController(BookstoreDbContext db)
    {
        _db = db;
    }

    // Paged list of books, optional category filter, sorted by title A–Z or Z–A.
    [HttpGet]
    public async Task<ActionResult<PagedBooksResponse>> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortTitle = "asc",
        [FromQuery] string? category = null,
        CancellationToken cancellationToken = default)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 5;
        if (pageSize > 100) pageSize = 100;

        var descending = string.Equals(sortTitle, "desc", StringComparison.OrdinalIgnoreCase);
        sortTitle = descending ? "desc" : "asc";

        var categoryFilter = string.IsNullOrWhiteSpace(category) ? string.Empty : category.Trim();

        var query = _db.Books.AsNoTracking();
        if (categoryFilter.Length > 0)
        {
            query = query.Where(b => b.Category == categoryFilter);
        }

        query = descending
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var books = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return Ok(new PagedBooksResponse
        {
            Books = books,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            SortTitle = sortTitle,
            CategoryFilter = categoryFilter
        });
    }

    // One entry per category for the dropdown on the frontend.
    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCategories(
        CancellationToken cancellationToken = default)
    {
        var categories = await _db.Books
            .AsNoTracking()
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(cancellationToken);

        return Ok(categories);
    }

    // Full list for the admin screen (edit / delete).
    [HttpGet("all")]
    public async Task<ActionResult<IReadOnlyList<Book>>> GetAllBooks(
        CancellationToken cancellationToken = default)
    {
        var books = await _db.Books
            .AsNoTracking()
            .OrderBy(b => b.Title)
            .ToListAsync(cancellationToken);

        return Ok(books);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Book>> GetBook(int id, CancellationToken cancellationToken = default)
    {
        var book = await _db.Books.AsNoTracking().FirstOrDefaultAsync(b => b.BookId == id, cancellationToken);
        if (book is null) return NotFound();
        return Ok(book);
    }

    [HttpPost]
    public async Task<ActionResult<Book>> CreateBook(
        [FromBody] BookWriteDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var book = new Book
        {
            Title = dto.Title.Trim(),
            Author = dto.Author.Trim(),
            Publisher = dto.Publisher.Trim(),
            ISBN = dto.ISBN.Trim(),
            Classification = dto.Classification.Trim(),
            Category = dto.Category.Trim(),
            PageCount = dto.PageCount,
            Price = dto.Price,
        };

        _db.Books.Add(book);
        await _db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<Book>> UpdateBook(
        int id,
        [FromBody] BookWriteDto dto,
        CancellationToken cancellationToken = default)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);

        var book = await _db.Books.FirstOrDefaultAsync(b => b.BookId == id, cancellationToken);
        if (book is null) return NotFound();

        book.Title = dto.Title.Trim();
        book.Author = dto.Author.Trim();
        book.Publisher = dto.Publisher.Trim();
        book.ISBN = dto.ISBN.Trim();
        book.Classification = dto.Classification.Trim();
        book.Category = dto.Category.Trim();
        book.PageCount = dto.PageCount;
        book.Price = dto.Price;

        await _db.SaveChangesAsync(cancellationToken);

        return Ok(book);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id, CancellationToken cancellationToken = default)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.BookId == id, cancellationToken);
        if (book is null) return NotFound();

        _db.Books.Remove(book);
        await _db.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
