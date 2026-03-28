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

    /// <summary>
    /// Returns a page of books sorted by title. sortTitle: "asc" or "desc".
    /// Optional category filters to that category (exact match).
    /// </summary>
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

    /// <summary>
    /// Distinct book categories, sorted alphabetically.
    /// </summary>
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
}
